import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('resumeFile') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF, DOC, or DOCX file.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'resumes');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${session.user.id}_${timestamp}_${file.name}`;
    const filePath = join(uploadsDir, fileName);

    // Save file to disk (optional, if you need to persist the file)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer as any);

    // Extract text from PDF using pdf2json
    let extractedText = '';

    if (file.type === 'application/pdf') {
      try {
        console.log('Starting PDF parsing with pdf2json...');

        // Use pdf2json which is already in package.json
        const PDFParser = (await import('pdf2json')).default;
        const pdfParser = new PDFParser(null, true);

        // Parse PDF
        extractedText = await new Promise<string>((resolve, reject) => {
          pdfParser.on('pdfParser_dataError', (errData: any) => {
            console.error('PDF Parser Error:', errData.parserError);
            reject(new Error(errData.parserError));
          });

          pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
            try {
              // Extract text from all pages
              let text = '';
              if (pdfData.Pages) {
                pdfData.Pages.forEach((page: any) => {
                  if (page.Texts) {
                    page.Texts.forEach((textItem: any) => {
                      if (textItem.R) {
                        textItem.R.forEach((run: any) => {
                          if (run.T) {
                            // Decode URI component (pdf2json encodes text)
                            text += decodeURIComponent(run.T) + ' ';
                          }
                        });
                      }
                    });
                    text += '\n'; // Add newline after each page
                  }
                });
              }
              resolve(text.trim());
            } catch (error) {
              reject(error);
            }
          });

          // Parse the buffer
          pdfParser.parseBuffer(buffer);
        });

        console.log('PDF parsing successful!');
        console.log('Extracted text length:', extractedText.length);
        console.log('Extracted text preview:', extractedText.substring(0, 200));

        // If no text was extracted, provide a helpful fallback
        if (!extractedText || extractedText.trim().length === 0) {
          console.warn('WARNING: No text extracted from PDF. The PDF might be image-based or encrypted.');

          // Return a response indicating the PDF couldn't be read
          return NextResponse.json({
            success: true,
            fileName,
            extractedText: '',
            fileSize: file.size,
            warning: 'no_text_extracted',
            message: 'Your PDF appears to be image-based or does not contain extractable text. Please try one of the following:\n\n1. Export your CV as a new PDF with "text" option enabled\n2. Use a different PDF viewer to save/export your CV\n3. Manually enter your information below'
          });
        }
      } catch (error) {
        console.error('Error parsing PDF with pdf2json:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        // Return a more helpful error message
        return NextResponse.json(
          {
            error: 'Failed to parse PDF file content. Error: ' + (error instanceof Error ? error.message : 'Unknown error'),
            details: 'Please ensure your PDF is not password-protected or corrupted.'
          },
          { status: 500 }
        );
      }
    } else {
      // For DOC/DOCX files, return error for now
      return NextResponse.json(
        { error: 'Currently only PDF files are supported. Please convert your document to PDF.' },
        { status: 400 }
      );
    }

    // Return extracted text for AI processing
    return NextResponse.json({
      success: true,
      fileName,
      extractedText: extractedText.trim(),
      fileSize: file.size
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}