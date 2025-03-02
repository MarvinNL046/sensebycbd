import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// The secret token to validate requests
// This should be set in your environment variables
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Check if the secret is provided and matches
    if (!body.secret || body.secret !== REVALIDATION_SECRET) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid token' 
        },
        { 
          status: 401 
        }
      );
    }
    
    // Check if the path is provided
    if (!body.path) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Path is required' 
        },
        { 
          status: 400 
        }
      );
    }
    
    // Revalidate the path
    revalidatePath(body.path);
    
    // Return success response
    return NextResponse.json({
      success: true,
      revalidated: true,
      path: body.path,
      date: new Date().toISOString(),
    });
  } catch (error: any) {
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'An error occurred during revalidation' 
      },
      { 
        status: 500 
      }
    );
  }
}
