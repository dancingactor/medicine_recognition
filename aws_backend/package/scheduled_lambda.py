import os, json, boto3, io, gzip
from statistics import mean

s3  = boto3.client("s3")
brt = boto3.client("bedrock-agent-runtime")

THRESHOLD = float(os.environ["THRESHOLD"])

def handler(event, _ctx):
    # 1 List every batch_result.json created since the last run
    objects = s3.list_objects_v2(
        Bucket=os.environ["BUCKET"],
        Prefix=os.environ["RESULT_PREFIX"],
    )["Contents"]                                    # :contentReference[oaicite:5]{index=5}

    # 2 Read each JSON, accumulate defect flags
    defect_rates = []
    batches_over  = []
    for obj in objects:
        if not obj["Key"].endswith("batch_result.json"):
            continue
        body = s3.get_object(                       # :contentReference[oaicite:6]{index=6}
            Bucket=os.environ["BUCKET"], Key=obj["Key"]
        )["Body"].read()
        record = json.loads(body)
        defect_rate = record["defect_rate"]
        defect_rates.append(defect_rate)

        if defect_rate > THRESHOLD:
            batches_over.append(obj["Key"].rsplit("/", 1)[0])  # folder path

    # 3 If no batch exceeds threshold -- exit
    if not batches_over:
        return {"status": "OK", "overall": mean(defect_rates)}

    # 4 Gather descriptions from each offending batch folder
    descriptions = []
    for prefix in batches_over:
        desc_key = f"{prefix}/description.txt"
        desc_body = s3.get_object(
            Bucket=os.environ["BUCKET"], Key=desc_key
        )["Body"].read().decode("utf-8")
        descriptions.append(desc_body)

    # 5 Summarise descriptions (simple join; you can improve later)
    joined = "\n---\n".join(descriptions)

    prompt = (
        "You are a factory QA assistant.  The following batches exceeded "
        f"the defect-rate threshold of {THRESHOLD:.2f}.  Summarise the issues "
        "and suggest how to reduce defects:\n\n" + joined
    )

    # 6 Invoke the Bedrock Flow
    resp = brt.invoke_flow(                          # :contentReference[oaicite:7]{index=7}
        flowIdentifier=os.environ["FLOW_ID"],
        flowAliasIdentifier=os.environ["FLOW_ALIAS"],
        inputs=[{
            "content": { "document": prompt },
            "nodeName": "FlowInput",
            "nodeOutputName": "document"
        }],
        enableTrace=True
    )

    # 7 Stream the result and write to reports/
    transcript = []
    for evt in resp["responseStream"]:
        if "flowOutputEvent" in evt:
            chunk = evt["flowOutputEvent"]["content"]["document"]
            transcript.append(chunk)

    final_txt = "".join(transcript)
    out_key = f"reports/{prefix.split('/')[-2]}_summary.txt"
    s3.put_object(Bucket=os.environ["BUCKET"],
                  Key=out_key,
                  Body=final_txt.encode())

    return {"status": "OVER_THRESHOLD",
            "saved_to": out_key}
