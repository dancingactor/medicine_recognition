import os, json, boto3
from statistics import mean   # you may not need mean if only one file

s3  = boto3.client("s3")
brt = boto3.client("bedrock-agent-runtime")

BUCKET      = os.environ["BUCKET"]
RESULT_KEY  = os.environ["RESULT_KEY"]   # e.g. "inference/2025/04/26/batch_result.json"
THRESHOLD   = float(os.environ["THRESHOLD"])
FLOW_ID     = os.environ["FLOW_ID"]
FLOW_ALIAS  = os.environ["FLOW_ALIAS"]

def handler(event, _ctx):
    # 1. Read the single batch_result.json
    resp = s3.get_object(Bucket=BUCKET, Key=RESULT_KEY)
    record = json.loads(resp["Body"].read())
    defect_rate = record["defect_rate"]

    # 2. If it's below or equal to threshold, we're done
    if defect_rate <= THRESHOLD:
        return {"status": "OK", "defect_rate": defect_rate}

    # 3. Build the batch folder prefix by stripping off the filename
    #    e.g. "inference/2025/04/26/batch_result.json" → "inference/2025/04/26"
    batch_prefix = RESULT_KEY.rsplit("/", 1)[0]

    # 4. Fetch the corresponding description.txt
    desc_key = f"{batch_prefix}/description.txt"
    desc_body = s3.get_object(Bucket=BUCKET, Key=desc_key)["Body"].read().decode("utf-8")

    # 5. Build the prompt
    prompt = (
        "You are a factory QA assistant.  Batch at "
        f"{batch_prefix} has defect rate {defect_rate:.2f}, "
        f"which exceeds the threshold {THRESHOLD:.2f}.\n\n"
        "Here is the batch’s description of issues:\n\n"
        f"{desc_body}\n\n"
        "Please summarise the root-causes and suggest how to reduce defects."
    )

    # 6. Invoke the Bedrock Flow
    flow_resp = brt.invoke_flow(
        flowIdentifier=FLOW_ID,
        flowAliasIdentifier=FLOW_ALIAS,
        inputs=[{
            "content": {"document": prompt},
            "nodeName": "FlowInput",
            "nodeOutputName": "document"
        }],
        enableTrace=True
    )

    # 7. Collect the streamed response
    summary_chunks = []
    for evt in flow_resp["responseStream"]:
        if "flowOutputEvent" in evt:
            summary_chunks.append(evt["flowOutputEvent"]["content"]["document"])
    summary = "".join(summary_chunks)

    # 8. Write the summary back to S3
    out_key = f"reports/{batch_prefix.split('/')[-1]}_summary.txt"
    s3.put_object(Bucket=BUCKET, Key=out_key, Body=summary.encode("utf-8"))

    return {"status": "OVER_THRESHOLD", "saved_to": out_key}
