# S3 Image Fetcher Lambda Function

This Lambda function fetches images from an S3 bucket and returns them as base64-encoded strings.

## Prerequisites

- AWS account with appropriate permissions
- AWS CLI installed and configured
- Python 3.8 or later

## Deployment

### Manual Deployment

1. Install the required dependencies:
   ```
   pip install boto3 -t .
   ```

2. Zip the function code and dependencies:
   ```
   zip -r function.zip .
   ```

3. Deploy to AWS Lambda using AWS CLI:
   ```
   aws lambda create-function \
     --function-name get-image-from-s3 \
     --runtime python3.8 \
     --handler get_image_from_s3.lambda_handler \
     --role arn:aws:iam::<ACCOUNT_ID>:role/lambda-s3-role \
     --zip-file fileb://function.zip
   ```

### Using AWS SAM or Serverless Framework

Alternatively, you can use AWS SAM or Serverless Framework for easier deployment.

## IAM Permissions

The Lambda function requires the following permissions:
- s3:GetObject

Create an IAM role with a policy that includes these permissions.

## Usage

Invoke the Lambda function with the following event payload:

```json
{
  "bucket": "your-bucket-name",
  "key": "path/to/image.jpg"
}
```

The function returns:

```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "image": "<base64-encoded-image>",
    "contentType": "image/jpeg",
    "key": "path/to/image.jpg"
  }
}
``` 