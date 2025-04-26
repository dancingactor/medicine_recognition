import json
import get_image_from_s3

def test_lambda_function():
    """
    Test the Lambda function locally by providing a test event
    """
    # Replace with your test values
    test_event = {
        "bucket": "your-bucket-name",
        "key": "path/to/your/image.jpg"
    }
    
    # Invoke the Lambda handler directly
    response = get_image_from_s3.lambda_handler(test_event, None)
    
    # Print the response status code
    print(f"Status Code: {response['statusCode']}")
    
    # Parse and print the response body
    if response['statusCode'] == 200:
        body = json.loads(response['body'])
        # Print partial base64 string to avoid flooding the console
        image_preview = body['image'][:30] + "..." if body.get('image') else None
        print(f"Image Preview: {image_preview}")
        print(f"Content Type: {body.get('contentType')}")
        print(f"Key: {body.get('key')}")
    else:
        print(f"Error: {response['body']}")

if __name__ == "__main__":
    test_lambda_function() 