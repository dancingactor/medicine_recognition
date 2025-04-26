import os, json, boto3
from statistics import mean

s3  = boto3.client("s3")
brt = boto3.client("bedrock-agent-runtime")

BUCKET = os.environ["BUCKET"]
PREFIX = os.environ["RESULT_PREFIX"]
THRESHOLD = float(os.environ["THRESHOLD"])

def handler(event, _ctx):
    # 1. List and pick the newest batch_result.json
    resp = s3.list_objects_v2(Bucket=BUCKET, Prefix=PREFIX)
    files = [o for o in resp.get("Contents", []) if o["Key"].endswith("batch_result.json")]
    if not files:
        return {"error": "no batch_result.json found"}
    latest = max(files, key=lambda o: o["LastModified"])
    key = latest["Key"]

    # 2. Read and parse
    body = s3.get_object(Bucket=BUCKET, Key=key)["Body"].read()
    try:
        records = json.loads(body)
        last = records[-1]
    except (ValueError, IndexError):
        # handle newline-delimited JSON
        lines = body.decode().splitlines()
        last = json.loads(lines[-1])

    defect_rate = float(last.get("DR") or last.get("defect_rate") or 0)

    # 3. Check threshold
    if defect_rate <= THRESHOLD:
        return {"status":"OK", "latest_rate": defect_rate}

    # 4. Fetch description
    folder = key.rsplit("/", 1)[0]
    desc_key = f"{folder}/description.txt"
    description = s3.get_object(Bucket=BUCKET, Key=desc_key)["Body"].read().decode()

    # 5. Prepare prompt & invoke flow
    prompt = (
        "You are a factory QA assistant. The latest batch exceeded the "
        f"defect threshold of {THRESHOLD:.2f}. Defect rate: {defect_rate:.2f}. "
        "Batch notes:\n\n" + description
    )
    resp = brt.invoke_flow(
        flowIdentifier=os.environ["FLOW_ID"],
        flowAliasIdentifier=os.environ["FLOW_ALIAS"],
        inputs=[{
          "content": {"document": prompt},
          "nodeName": "FlowInput",
          "nodeOutputName": "document"
        }],
        enableTrace=True
    )

    # 6. Collect & save summary
    transcript = []
    for evt in resp["responseStream"]:
        if "flowOutputEvent" in evt:
            transcript.append(evt["flowOutputEvent"]["content"]["document"])
    final_txt = "".join(transcript)

    out_key = f"events/{folder.split('/')[-1]}.txt"
    s3.put_object(Bucket=BUCKET, Key=out_key, Body=final_txt.encode())

    return {"status":"OVER_THRESHOLD", "saved_to": out_key}
