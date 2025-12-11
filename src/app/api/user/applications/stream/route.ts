import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Create a TransformStream for SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      let isClosed = false;

      // Safe controller close function
      const safeClose = () => {
        if (!isClosed) {
          try {
            controller.close();
            isClosed = true;
          } catch (error) {
            console.log('Controller close error:', error instanceof Error ? error.message : 'Unknown error');
          }
        }
      };

      // Send initial connection message
      const data = {
        type: 'connected',
        message: 'Application Pulse connected',
        timestamp: new Date().toISOString()
      };

      try {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        console.log('Controller enqueue error:', error instanceof Error ? error.message : 'Unknown error');
        safeClose();
        return;
      }

      // Function to send updates using direct database call
      const sendUpdate = async () => {
        if (isClosed) return;

        try {
          // Direct database call to avoid fetch timeout issues
          const userId = session.user.id;

          const applications = await prisma.jobApplication.findMany({
            where: { userId },
            include: {
              job: {
                select: {
                  title: true,
                  companyName: true,
                  location: true,
                  type: true,
                  salary: true,
                  salaryMin: true,
                  salaryMax: true
                }
              }
            },
            orderBy: { appliedAt: 'desc' },
            take: 10
          });

          const total = await prisma.jobApplication.count({
            where: { userId }
          });

          const update = {
            type: 'applications_update',
            applications: applications || [],
            total: total || 0,
            timestamp: new Date().toISOString()
          };

          if (!isClosed) {
            try {
              controller.enqueue(`data: ${JSON.stringify(update)}\n\n`);
            } catch (error) {
              console.log('Controller enqueue error during update:', error instanceof Error ? error.message : 'Unknown error');
              safeClose();
            }
          }

        } catch (error) {
          let errorMessage = 'Unknown error occurred';
          let errorType = 'database_error';

          if (error instanceof Error) {
            if (error.message.includes('database') || error.message.includes('prisma')) {
              errorMessage = 'Database connection error - unable to fetch applications';
              errorType = 'database_error';
            } else {
              errorMessage = error.message;
              errorType = 'unknown_error';
            }
          }

          console.error(`Error fetching application updates [${errorType}]:`, errorMessage);

          // Send error update to client
          const errorUpdate = {
            type: 'error',
            message: errorMessage,
            error_type: errorType,
            timestamp: new Date().toISOString()
          };

          if (!isClosed) {
            try {
              controller.enqueue(`data: ${JSON.stringify(errorUpdate)}\n\n`);
            } catch (error) {
              console.log('Controller enqueue error during error update:', error instanceof Error ? error.message : 'Unknown error');
              safeClose();
            }
          }
        }
      };

      // Send initial data
      sendUpdate();

      // Set up periodic updates every 30 seconds
      const intervalId = setInterval(sendUpdate, 30000);

      // Keep connection alive with periodic heartbeats
      const heartbeatId = setInterval(() => {
        if (isClosed) return;

        const heartbeat = {
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        };

        try {
          controller.enqueue(`data: ${JSON.stringify(heartbeat)}\n\n`);
        } catch (error) {
          console.log('Controller heartbeat error:', error instanceof Error ? error.message : 'Unknown error');
          safeClose();
        }
      }, 15000);

      // Single cleanup function for disconnect
      const cleanup = () => {
        clearInterval(heartbeatId);
        clearInterval(intervalId);
        safeClose();
      };

      // Set up the abort event listener once
      request.signal.addEventListener('abort', cleanup);
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}