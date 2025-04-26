import json
import boto3
import base64
from botocore.exceptions import ClientError

s3_client = boto3.client('s3')

def lambda_handler(event, context):
    """
    Lambda function to fetch an image from S3 bucket
    
    Parameters:
    - event: Contains information about the bucket and key
        Example: {
            "bucket": "your-bucket-name",
            "key": "path/to/image.jpg"
        }
    - context: Lambda context object
    
    Returns:
    - Response with the image encoded in base64 or error message
    """
    try:
        # Get bucket and key from event
        bucket = event.get('bucket')
        key = event.get('key')
        
        if not bucket or not key:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': 'Missing required parameters: bucket and key'
                })
            }
        
        # Fetch the object from S3
        response = s3_client.get_object(Bucket=bucket, Key=key)
        image_content = response['Body'].read()
        
        # Encode image to base64 for transmission
        base64_encoded_image = base64.b64encode(image_content).decode('utf-8')
        
        # Get content type
        content_type = response.get('ContentType', 'application/octet-stream')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'image': base64_encoded_image,
                'contentType': content_type,
                'key': key
            })
        }
        
    except ClientError as e:
        # Handle S3 client errors
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        error_message = e.response.get('Error', {}).get('Message', str(e))
        
        status_code = 404 if error_code == 'NoSuchKey' else 500
        
        return {
            'statusCode': status_code,
            'body': json.dumps({
                'error': error_message,
                'errorCode': error_code
            })
        }
    
    except Exception as e:
        # Handle any other exceptions
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        } 