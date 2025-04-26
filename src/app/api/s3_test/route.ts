import { NextResponse } from 'next/server';

export async function GET() {
  // Test environment variables
  const envVars = {
    AWS_REGION: process.env.AWS_REGION || 'not set',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'set (hidden)' : 'not set',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'set (hidden)' : 'not set',
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'not set',
    AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN ? 'set (hidden)' : 'not set',
    NODE_ENV: process.env.NODE_ENV || 'not set'
  };

  return NextResponse.json({
    message: 'Environment variables check',
    environment: process.env.NODE_ENV,
    variables: envVars,
    timestamp: new Date().toISOString()
  });
}