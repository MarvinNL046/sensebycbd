import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    // This would typically use your existing auth mechanisms
    
    // Get the action parameter
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 }
      );
    }
    
    // Define the commands to run
    const commands: Record<string, string> = {
      theme: 'npm run config:theme',
      env: 'npm run config:setup',
      all: 'npm run config:apply',
    };
    
    // Check if the action is valid
    if (!commands[action]) {
      return NextResponse.json(
        { error: `Invalid action: ${action}` },
        { status: 400 }
      );
    }
    
    // Execute the command
    const { stdout, stderr } = await execPromise(commands[action], {
      cwd: process.cwd(),
    });
    
    // Check for errors
    if (stderr && !stderr.includes('npm WARN')) {
      console.error('Error applying configuration:', stderr);
      return NextResponse.json(
        { error: 'Error applying configuration', details: stderr },
        { status: 500 }
      );
    }
    
    // Return success
    return NextResponse.json({
      success: true,
      action,
      message: `Configuration ${action === 'all' ? 'changes' : action} applied successfully`,
      output: stdout,
    });
  } catch (error) {
    console.error('Error in apply-config API:', error);
    return NextResponse.json(
      { error: 'Failed to apply configuration changes' },
      { status: 500 }
    );
  }
}
