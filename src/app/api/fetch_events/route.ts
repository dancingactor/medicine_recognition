import { S3Client, ListObjectsV2Command, GetObjectCommand, ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('id');
    console.log("dick", key)

    const region = process.env.AWS_DEFAULT_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = "medicine-recognition-system";
    const sessionToken = process.env.AWS_SESSION_TOKEN; 

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

    const client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken,
      },
      forcePathStyle: true,
    });
    if(key === null){
        const directoryPrefix = 'events/'; 
        
        const results: any[] = [];
        const batch_record: any[] = [];

        async function downloadAllFiles() {
          try {


            let isTruncated = true;
            let continuationToken = undefined;
            
            while (isTruncated) {
              const listResponse: ListObjectsV2CommandOutput = await client.send(
                new ListObjectsV2Command({
                  Bucket: bucketName,
                  Prefix: directoryPrefix,
                  ContinuationToken: continuationToken,
                })
              );
              // console.log('List response:', listResponse);
              
              for (const item of listResponse.Contents || []) {
                const key = item.Key;
                // console.log(`Downloading: ${key}`);
                
                if (!key || key == directoryPrefix) {
                  console.warn('Skipping file with undefined key');
                  continue;
                }

                const getCommand = new GetObjectCommand({
                  Bucket: bucketName,
                  Key: key,
                });
                
                const { Body } = await client.send(getCommand);
                
                if (Body) {
                  
                  const bodyContents = await Body.transformToString();
                  const jsonData = JSON.parse(bodyContents);
                  results.push(jsonData);

                  const batchMatch = key.match(/events\/batch(\d+)\.json/);
                  const batchNumber = batchMatch ? batchMatch[1] : null;    
                  batch_record.push(batchNumber);
                  
                  console.log(`Downloaded: ${batchNumber}`);
                }
              }
              
              isTruncated = listResponse.IsTruncated || false;
              continuationToken = listResponse.NextContinuationToken;
            }
            
            const transformedData = {
              conversations: results.map((item, index) => ({
                  id: `batch${batch_record[index]}`,
                  ...item
              }))
          };
            console.log('Transformed data:', transformedData);
            // console.log(JSON.stringify(transformedData) )
            return NextResponse.json({ 
                success: true, 
                content: JSON.stringify(transformedData) 
            });

            
          } catch (error) {
            console.error('error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
          }
        }
        
        return await downloadAllFiles();
    } else {
        if (key === null) {
          return NextResponse.json(
            { error: 'Key parameter is missing or invalid.' },
            { status: 400 }
          );
        }

        const target = `events/${key}.json`;
        const getCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: target,
        });

        const data = await client.send(getCommand);
        
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
    }
}