## The state of AI in AWS

### Bedrock + Strands + Agentcore

- **bedrock**: provides inference for models on AWS
- **strands**: agent library for orchestrating agents, agentic loop, and subagents.
- **agentcore**: CLI tool that reads from a strands agent project to create a containerized API for it, and then deploy it to your AWS account as real containerized infra via S3, CodeBuild, ECR to store the image, and Agentcore to run the agent.

#### Agentcore

![](https://i.imgur.com/GIaCV88.jpeg)

Agentcore providers users a front-facing abstraction over API gateway for running inference on LLM models. It has these properties:

- **serverless**: agents on an Agent Core API run on serverless micro VMs managed by AWS. 
- **monitoring**: out-of-the-box AI observability 
- **MCP**: convert any Lambda or APIs into MCP
- **authorization add-ons**: integrates with Cognito to have protected authenticated access.

#### Strands

Strands is a Python and TypeScript agent framework that is AWS-native and provider-agnostic.


![](https://i.imgur.com/fUcUo3F.jpeg)

## Bedrock fundamentals

### Knowledge base

CHeck it out!

```embed
title: "Amazon Bedrock: A Complete Guide to Building AI Applications"
image: "https://media.datacamp.com/cms/ad_4nxeexjqxjvl-ur5bxg_6kt7w1myac5klczgpjt-wn1rdwzxo9lg5urdoakjczvpndb0s8ayhjwlacdruy0wfnjatxulftpkacmywrqqolhjbkgnvyr7gwteszgvgyx6mkloo-d23.png"
description: "Learn how to use Amazon Bedrock to build generative AI applications. This step-by-step guide covers features, setup, and best practices for success."
url: "https://www.datacamp.com/tutorial/aws-bedrock"
favicon: ""
aspectRatio: "102.33196159122085"
```


Knowledge bases in Bedrock allow you to put file data into an S3 bucket and then create a knowledge base of objects from that S3 bucket to use for RAG:

1. Navigate to the Amazon Bedrock Console and select Knowledge Bases under the Builder tools section
2. Click Create Knowledge Base and fill out the following details:
	- Knowledge Base name: Enter a unique name (e.g., `knowledge-base-quick-start`).
	- Knowledge Base description: (Optional) Briefly describe the knowledge base.

3. Fill out the IAM permissions section:
	- Choose “Create and use a new service role” or “Use an existing service role”.
	- Ensure the service role has the necessary permissions for Bedrock access.
	- Example Service Role: `AmazonBedrockExecutionRoleForKnowledgeBase`.

4. Click Next to proceed with configuring the data source.

![](https://media.datacamp.com/cms/ad_4nxfbvv-yd2jr2wzwgfhuyb2lxoe5eipt6xowhyyncfwydqxa47n5czhjj7bv8gsr0hqkwrb4_bo_qkndtjhgom8x4kt8rcrhlmp081hsf0ecygxc3cjxmer5tetymjbuvoc9uv13lw.png)


## Bedrock in Python

### Basics

#### Installation and setup

Use `boto3`:

1. Install `boto3`

```
pip install boto3
```

2. Initialize the `boto3` bedrock client:

```python
import boto3
import json
from botocore.exceptions import ClientError

# Set the AWS Region
region = "us-east-1"

# Initialize the Bedrock Runtime client
client = boto3.client("bedrock-runtime", region_name=region)
```

#### Basic inference

Basic inference involves supply the following info to `client.invoke_model()` function:

- **inference parameters**: the input text, system prompt, and any hyperparameters
- **model Id**: the specific model identifier to use
- **request and response content type**

```python
# Define the model ID for Amazon Titan Express v1
model_id = "amazon.titan-text-express-v1"

# Define the input prompt
prompt = """
Command: Compose an email from Tom, Customer Service Manager, to the customer "Nancy" 
who provided negative feedback on the service provided by our customer support 
Engineer"""

# Configure inference parameters
inference_parameters = {
   "inputText": prompt,
   "textGenerationConfig": {
       "maxTokenCount": 512,  # Limit the response length
       "temperature": 0.5,    # Control the randomness of the output
   },
}

# Convert the request payload to JSON
request_payload = json.dumps(inference_parameters)

try:
   # Invoke the model
   response = client.invoke_model(
       modelId=model_id,
       body=request_payload,
       contentType="application/json",
       accept="application/json"
   )

   # Decode the response body
   response_body = json.loads(response["body"].read())

   # Extract and print the generated text
   generated_text = response_body["results"][0]["outputText"]
   print("Generated Text:\n", generated_text)

except ClientError as e:
   print(f"ClientError: {e.response['Error']['Message']}")
except Exception as e:
   print(f"An error occurred: {e}")
```

**inference parameters**

To fine-tune the behavior of the model output, you can adjust parameters like `temperature` and `maxTokenCount`:

- `temperature`: This parameter controls the randomness of the output. Lower values increase the determination of the output, and higher values increase the variability.
- `MaxTokenCount`: Sets the maximum length of the generated output.

```python
inference_parameters = {
   "inputText": prompt,
   "textGenerationConfig": {
       "maxTokenCount": 256,  # Limit the response length
       "temperature": 0.7,    # Control the randomness of the output
   },
}
```

## Bedrock in JavaScript

## Strands Python

## Strands TypeScript