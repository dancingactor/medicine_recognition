import os
import json
import boto3
from datetime import datetime

s3  = boto3.client("s3")
brt = boto3.client("bedrock-agent-runtime")

BUCKET    = os.environ["BUCKET"]
PREFIX    = os.environ["RESULT_PREFIX"]
THRESHOLD = float(os.environ["THRESHOLD"])

def handler(event, _ctx):
    # 1. Pick the newest batch_result.json file
    resp   = s3.list_objects_v2(Bucket=BUCKET, Prefix=PREFIX)
    files  = [o for o in resp.get("Contents", []) if o["Key"].endswith("batch_result.json")]
    if not files:
        return {"error": "no batch_result.json found"}
    latest = max(files, key=lambda o: o["LastModified"])
    key    = latest["Key"]

    # 2. Read JSON and grab the batch with the latest start_time
    body    = s3.get_object(Bucket=BUCKET, Key=key)["Body"].read()
    records = json.loads(body)

    def parse_time(b):  # helper to convert string → datetime
        return datetime.strptime(b["start_time"], "%Y-%m-%d %H:%M:%S")

    batch_name, batch = max(records.items(), key=lambda kv: parse_time(kv[1]))

    defect_rate = float(batch["DR"])
    temperature = batch["T"]
    humidity    = batch["humidity"]
    start_time  = batch["start_time"]

    # 3. If below threshold, finish early
    if defect_rate <= THRESHOLD:
        return {
            "status": "OK",
            "batch":  batch_name,
            "defect_rate": defect_rate
        }

    # 4. Build prompt
    prompt = (
        "The defect-rate threshold is {:.2f}%. "
        "Batch **{}** has:\n"
        "• Defect rate: {:.2f}%\n"
        "• Temperature: {} °C\n"
        "• Humidity   : {} %\n"
        "• Start time : {}\n\n"
        "How can we adjust temperature or humidity to reduce defects?"
    ).format(THRESHOLD, batch_name, defect_rate, temperature, humidity, start_time)

    # 5. Invoke Bedrock Flow
    resp = brt.invoke_flow(
        flowIdentifier=os.environ["FLOW_ID"],
        flowAliasIdentifier=os.environ["FLOW_ALIAS"],
        inputs=[{
            "content": {"document": prompt},
            "nodeName": "FlowInputNode",
            "nodeOutputName": "document"
        }],
        enableTrace=True
    )

    # 6. Collect LLM response
    chunks = []
    for evt in resp["responseStream"]:
        if "flowOutputEvent" in evt:
            chunks.append(evt["flowOutputEvent"]["content"]["document"])
    llm_answer = "".join(chunks)

    # 7. Save prompt & answer as batchX.json under events/
    out_key   = f"events/{batch_name}.json"
    out_body  = json.dumps({
        "lambda": prompt,
        "LLM":    llm_answer,
        "time":   start_time.replace(" ", "_")  # e.g. 2023-11-08_00:10:00
    }, ensure_ascii=False, indent=2).encode()

    s3.put_object(Bucket=BUCKET, Key=out_key, Body=out_body)

    return {
        "status":       "OVER_THRESHOLD",
        "saved_to":     out_key,
        "batch":        batch_name,
        "defect_rate":  defect_rate
    }
