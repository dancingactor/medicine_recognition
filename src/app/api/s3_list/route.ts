import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export async function GET() {
  // Validate environment variables
  const region = process.env.AWS_DEFAULT_REGION; 
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = process.env.AWS_S3_BUCKET;
  const sessionToken = process.env.AWS_SESSION_TOKEN; // Optional
  // console.log(region, accessKeyId, secretAccessKey, bucketName, sessionToken)
  // Check if required environment variables are set
  
  if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
    console.error('Missing required AWS environment variables:', {
      region: !!region,
      accessKeyId: !!accessKeyId,
      secretAccessKey: !!secretAccessKey,
      bucketName: !!bucketName
    });
    return NextResponse.json(
      { error: 'Missing required AWS configuration. Please check environment variables.' },
      { status: 500 }
    );
  }

  // Create S3 client with explicit credentials
  const client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
      sessionToken, // Will be undefined if not provided
    },
    // Force path style for compatibility with some S3-compatible services
    forcePathStyle: true,
  });

  const key = 'test1.txt';
  console.log(`Attempting to fetch object: ${key} from bucket: ${bucketName}`);

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    console.log('Sending request to S3...');
    const data = await client.send(command);
    
    if (!data.Body) {
      console.error('S3 response missing Body');
      return NextResponse.json({ error: 'S3 response missing Body' }, { status: 500 });
    }
    
    console.log('Successfully received S3 response');
    
    // Get file content
    const bodyContents = await data.Body.transformToString();
    console.log('Successfully transformed body to string', bodyContents);
    return NextResponse.json({ 
      content: bodyContents,
      metadata: {
        contentType: data.ContentType,
        lastModified: data.LastModified,
        contentLength: data.ContentLength
      }
    });
  } catch (err: any) {
    console.error('Error fetching from S3:', err);
    
    // Enhanced error response with more details
    return NextResponse.json({
      error: err.message,
      code: err.Code || err.name,
      requestId: err.$metadata?.requestId,
      details: 'Failed to retrieve file from S3. Check credentials, bucket name, and permissions.'
    }, { status: 500 });
  }
}

