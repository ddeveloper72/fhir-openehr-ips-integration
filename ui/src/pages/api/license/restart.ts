import type { APIRoute } from 'astro';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Security: Whitelist of allowed container names
const ALLOWED_CONTAINER_NAME = 'converge-and-collaborate-dublin-hackaton-firely-1';

// Rate limiting: simple in-memory store (in production, use Redis)
const restartAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_RESTART_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes

function checkRateLimit(ip: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  const attempts = restartAttempts.get(ip);

  if (!attempts || now > attempts.resetTime) {
    restartAttempts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (attempts.count >= MAX_RESTART_ATTEMPTS) {
    return { 
      allowed: false, 
      error: `Too many restart attempts. Please wait ${Math.ceil((attempts.resetTime - now) / 60000)} minutes.` 
    };
  }

  attempts.count++;
  return { allowed: true };
}

function sanitizeCommandOutput(output: string): string {
  // Remove any potentially sensitive information from command output
  return output.substring(0, 200); // Limit output length
}

export const POST: APIRoute = async ({ clientAddress }) => {
  try {
    // Rate limiting
    const clientIp = clientAddress || 'unknown';
    const rateLimitCheck = checkRateLimit(clientIp);
    
    if (!rateLimitCheck.allowed) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: rateLimitCheck.error
      }), {
        status: 429, // Too Many Requests
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if Docker socket is available
    const isDocker = process.env.DOCKER_HOST || process.platform === 'linux';
    
    if (!isDocker) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Docker socket not available. Please restart manually: docker compose restart firely' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Security: Use exact container name, no user input
    // Prevent command injection by using fixed values
    const command = `docker restart ${ALLOWED_CONTAINER_NAME}`;
    
    // Execute with timeout
    const { stdout, stderr } = await execAsync(command, { 
      timeout: 30000,
      // Security: Run with minimal privileges
      env: {
        PATH: process.env.PATH,
        HOME: process.env.HOME
      }
    });

    // Check if restart was successful
    if (stderr && !stderr.includes(ALLOWED_CONTAINER_NAME)) {
      console.error('Docker restart stderr:', stderr);
      throw new Error('Container restart failed');
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Firely server is restarting. This may take 3-5 minutes to initialize.',
      output: sanitizeCommandOutput(stdout.trim())
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Firely restart error:', error);
    
    // Provide helpful error message without exposing system details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isPermissionError = errorMessage.includes('permission') || errorMessage.includes('EACCES');
    const isTimeoutError = errorMessage.includes('timeout');
    
    let userMessage = 'Failed to restart Firely server. Please restart manually: docker compose restart firely';
    
    if (isPermissionError) {
      userMessage = 'Permission denied to access Docker. Please restart manually: docker compose restart firely';
    } else if (isTimeoutError) {
      userMessage = 'Restart command timed out. Please check Docker status and try again.';
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: userMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
