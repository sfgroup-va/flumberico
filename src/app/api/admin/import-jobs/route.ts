import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { enhanceJobDescriptionWithHTML } from '@/lib/google-ai-html-enhanced';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('csvFile') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (file.type !== 'text/csv') {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a CSV file.' },
        { status: 400 }
      );
    }

    // Parse CSV
    const csvText = await file.text();
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const rows = parseResult.data as any[];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty or invalid' },
        { status: 400 }
      );
    }

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        // Validate required fields
        if (!row.title || !row.companyName || !row.description) {
          errors.push(`Row ${i + 1}: Missing required fields (title, companyName, description)`);
          failCount++;
          continue;
        }

        // Generate unique slug
        const baseSlug = `${row.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')}-${row.companyName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')}`;

        const slug = `${baseSlug}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        // Parse salary with validation and range handling
        let salary = 0;
        if (row.salary) {
          const salaryStr = row.salary.toString().trim();

          // Remove dollar signs and extra spaces for easier parsing
          const cleanStr = salaryStr.replace(/\$/g, '').replace(/\s+/g, ' ').trim();

          // Check if it's a range (e.g., "80,000-100,000" or "80000-100000")
          const rangeMatch = cleanStr.match(/(\d[\d,]*)\s*[-–—]\s*(\d[\d,]*)/);

          if (rangeMatch) {
            // It's a range - calculate average
            const min = parseInt(rangeMatch[1].replace(/,/g, ''));
            const max = parseInt(rangeMatch[2].replace(/,/g, ''));

            if (!isNaN(min) && !isNaN(max)) {
              const avgSalary = Math.floor((min + max) / 2);

              // Cap salary at 2 billion (INT4 max is ~2.1 billion)
              salary = Math.min(avgSalary, 2000000000);

              console.log(`Row ${i + 1}: Salary range "${salaryStr}" -> Min: $${min.toLocaleString()}, Max: $${max.toLocaleString()}, Average: $${avgSalary.toLocaleString()}`);

              if (avgSalary > 2000000000) {
                console.warn(`Row ${i + 1}: Salary ${avgSalary} exceeds maximum, capped at 2,000,000,000`);
              }
            }
          } else {
            // Single value - extract first number found
            const numberMatch = cleanStr.match(/(\d[\d,]*)/);

            if (numberMatch) {
              const parsedSalary = parseInt(numberMatch[1].replace(/,/g, ''));

              if (!isNaN(parsedSalary)) {
                // Cap salary at 2 billion (INT4 max is ~2.1 billion)
                salary = Math.min(parsedSalary, 2000000000);

                console.log(`Row ${i + 1}: Salary "${salaryStr}" -> $${parsedSalary.toLocaleString()}`);

                if (parsedSalary > 2000000000) {
                  console.warn(`Row ${i + 1}: Salary ${parsedSalary} exceeds maximum, capped at 2,000,000,000`);
                }
              }
            }
          }
        }

        // Enhance description with AI (HTML output)
        let enhancedDescription = '';
        try {
          enhancedDescription = await enhanceJobDescriptionWithHTML(
            row.description.toString(),
            row.title.toString(),
            row.companyName.toString(),
            row.location?.toString() || '',
            salary > 0 ? `$${(salary / 12).toLocaleString()}/month` : '',
            row.type?.toString() || ''
          );
        } catch (aiError) {
          console.warn(`Row ${i + 1}: AI enhancement failed, using original description:`, aiError instanceof Error ? aiError.message : 'Unknown error');
          // Use original description if AI enhancement fails
          enhancedDescription = `<div class="job-description">${row.description.toString()}</div>`;
        }

        // Create job in database
        await prisma.job.create({
          data: {
            slug,
            title: row.title.toString(),
            type: row.type?.toString() || 'Full-time',
            locationType: row.locationType?.toString() || 'On-site',
            location: row.location?.toString() || null,
            description: row.description.toString(),
            aiEnhancedDescription: enhancedDescription,
            salary,
            companyName: row.companyName.toString(),
            applicationEmail: row.applicationEmail?.toString() || null,
            applicationUrl: row.applicationUrl?.toString() || null,
            companyLogoUrl: row.companyLogoUrl?.toString() || null,
            approved: false, // Jobs need admin approval
          },
        });

        successCount++;

        // Add a small delay to avoid overwhelming the AI API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        failCount++;
      }
    }

    return NextResponse.json({
      success: successCount,
      failed: failCount,
      errors,
    });

  } catch (error) {
    console.error('Error importing jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}