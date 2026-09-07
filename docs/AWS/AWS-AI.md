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


![](https://i.imgur.com/hmkgMsO.jpeg)

Strands offer these features:

- **orchestration**: handles the agentic loop and orchestration layer
- **Tool + MCP integration**: easily add custom tools or MCPs for use, with many built-in tools
- **session/memory integration**
- **multi-agent collaboration**
- **observability**
- **evals**
## Bedrock fundamentals

Amazon Bedrock offers a range of powerful capabilities for building AI applications, including:  
  

- **Foundation Model Service:** Access and interact with large-scale pretrained models from providers like Anthropic, Amazon, and Mistral through a unified API.
- **Model Inference and Prompts:** Generate outputs from inputs using structured prompts, with control over parameters like token limits and response temperature to optimize behavior.
- **Embeddings and Knowledge Bases:** Create vector-based representations of text and images to support advanced search and retrieval, enhancing accuracy with Retrieval-Augmented Generation (RAG) to ground AI responses in specific data.
- **Orchestration and Agents:** Coordinate models with enterprise systems to automate tasks such as code fixing, testing, and decision-making workflows.
- **Model Customization and Evaluation:** Fine-tune models, perform pre-training, optimize hyperparameters, and define custom evaluation metrics to tailor AI performance.
- **Throughput Provisioning:** Allocate dedicated capacity for token input/output to ensure efficient processing.

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


Knowledge bases in Bedrock allow you to put file data into an S3 bucket and then create a knowledge base of objects from that S3 bucket to use for RAG with bedrock inference.

- **What you manage**: what data sources to select and feed into the knowledge base
- **What AWS manages**: creating the vector store from data sources like S3, and similarity search for AI to retrieve content from the knowledge basevia RAG. 

> [!NOTE]
> Knowledge Bases are useful because they automate the process of indexing and retrieving the data to ease RAG implementations. 

You can then programmatically run inference of a bedrock model against a knowledge base using the CLI or SDK.



![](https://i.imgur.com/uWvW9lm.jpeg)

#### Creating a knowledge base

1. Create an S3 bucket and upload your files to it.
2. Navigate to the Amazon Bedrock Console and select Knowledge Bases under the Builder tools section
3. Click **Create Knowledge Base with Vector Store** and give it a unique name


![](https://i.imgur.com/s5NKoyI.jpeg)


4. Choose S3 as the data source, click "next"

![](https://i.imgur.com/MXlITPt.jpeg)

5. Select an embeddings model



![](https://i.imgur.com/Bt1tt9R.jpeg)


6. Select Amazon S3 vectors as the vector store of choice because it's cost-effective.


![](https://i.imgur.com/XGRVngi.jpeg)


7. Fill out the IAM permissions section:
	- Choose “Create and use a new service role” or “Use an existing service role”.
	- Ensure the service role has the necessary permissions for Bedrock access.

8. Grab the knowledge base ID so you can programmatically access the knowledge base.



### Bedrock agents

Bedrock agents offer lightweight orchestration systems to orchestrate different subagents with one main inference provider.


![](https://i.imgur.com/EmIqNyn.jpeg)

Here are the different tools a bedrock agent has access to:

- **code interpreter**: using Python to create and execute code to achieve the goal
- **knowledge base retrieval**: attach a knowledge base and allow the agent to use RAG to retrieve data from that knowledge base

### Bedrock Guardrails

Bedrock Guardrails is a security feature that helps organizations implement safeguards for their AI inference by defining custom content policies and safety moderation logic.



![](https://i.imgur.com/W0Jdwaz.jpeg)

THese are the differnet types of guardrails you ahve:


![](https://i.imgur.com/00KDLvM.jpeg)

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

#### Converse API

The converse API uses messages format:

```py
import boto3
import json
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
model_id = "us.amazon.nova-lite-v1:0"

def invoke(system_prompt: str, prompt: str):
	response = bedrock_runtime.converse(
		modelId=model_id,
		system=system_prompt,
		messages=[
			{
				"role": "user",
				"content": [{"text": prompt}]
			}
		],
		inferenceConfig={
			"temperature": 0.7,
			"maxTokens": 2000
		}
	)
	output_text = response['output']['message']['content'][0]['text']
	return output_text
```

Here's a complete example


```py
import boto3
import json

def use_converse_api():
    bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
    model_id = "us.amazon.nova-lite-v1:0"

    # Define a system prompt to set model behavior
    system_prompt = [
        {
            "text": "You are a helpful technical assistant who explains concepts clearly and concisely."
        }
    ]

    # User message
    user_message = "What is serverless computing?"

    print("Using Bedrock Converse API")
    print("=" * 60)
    print(f"System Prompt: {system_prompt[0]['text']}")
    print(f"User Message: {user_message}\n")

    try:
        # Use the Converse API
        response = bedrock_runtime.converse(
            modelId=model_id,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": [{"text": user_message}]
                }
            ],
            inferenceConfig={
                "temperature": 0.7,
                "maxTokens": 2000
            }
        )

        # Extract the response
        output_text = response['output']['message']['content'][0]['text']

        print("Assistant Response:")
        print(output_text)

        # Display token usage
        usage = response.get('usage', {})
        print(f"\nToken Usage:")
        print(f"  Input tokens: {usage.get('inputTokens', 'N/A')}")
        print(f"  Output tokens: {usage.get('outputTokens', 'N/A')}")
        print(f"  Total tokens: {usage.get('totalTokens', 'N/A')}")

        print(f"\nStop Reason: {response['stopReason']}")

        return response

    except Exception as e:
        print(f"Error using Converse API: {e}")
        raise

if __name__ == "__main__":
    use_converse_api()
```

### Using tools

```python
import json
import boto3

# ---------------------------------------------------------------------------
# Step 1: Define your local Python functions
# ---------------------------------------------------------------------------
# These are regular Python functions. The model will never call them directly.
# Instead, the model will ASK us to call them by returning a tool_use block.

def get_weather(location, unit="fahrenheit"):
    """
    Simulate fetching weather data for a location.
    In a real app, this would call a weather API like OpenWeatherMap.
    """
    # Fake weather data for the demo
    weather_data = {
        "location": location,
        "temperature": 58 if unit == "fahrenheit" else 14,
        "unit": unit,
        "condition": "Partly cloudy",
        "humidity": "72%",
        "wind": "8 mph NW",
    }
    return weather_data


# ---------------------------------------------------------------------------
# Step 2: Describe your functions as "tools" for the model
# ---------------------------------------------------------------------------
# The model needs a description of each tool so it knows:
#   - What the tool does (description)
#   - What inputs it expects (inputSchema)
#
# This is like writing documentation so someone else can use your function.

TOOL_CONFIG = {
    "tools": [
        {
            "toolSpec": {
                "name": "get_weather",
                "description": "Get the current weather for a given location.",
                "inputSchema": {
                    "json": {
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "The city and state, e.g. 'San Francisco, CA'",
                            },
                            "unit": {
                                "type": "string",
                                "enum": ["fahrenheit", "celsius"],
                                "description": "Temperature unit (default: fahrenheit)",
                            },
                        },
                        "required": ["location"],
                    }
                },
            }
        }
    ]
}


# ---------------------------------------------------------------------------
# Step 3: Map tool names to actual Python functions
# ---------------------------------------------------------------------------
# When the model asks to use a tool, we look up the function by name here.

TOOL_FUNCTIONS = {
    "get_weather": get_weather,
}


def run_tool(tool_name, tool_input):
    """
    Look up a tool by name and call it with the provided input.
    Returns the result as a dictionary.
    """
    func = TOOL_FUNCTIONS.get(tool_name)
    if func is None:
        return {"error": f"Unknown tool: {tool_name}"}

    # ** unpacks the dict into keyword arguments:
    #   get_weather(**{"location": "Seattle"})  →  get_weather(location="Seattle")
    return func(**tool_input)


# ---------------------------------------------------------------------------
# Step 4: The main tool use loop
# ---------------------------------------------------------------------------

def tool_use_demo():
    # Create the Bedrock client
    bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")
    model_id = "us.amazon.nova-lite-v1:0"

    user_message = "What's the weather like in Seattle right now?"

    print("Bedrock Tool Use Demo")
    print("=" * 60)
    print(f"User: {user_message}\n")

    # Start the conversation with the user's message
    messages = [
        {
            "role": "user",
            "content": [{"text": user_message}],
        }
    ]

    # --- First API call ---
    # Send the message AND the tool definitions to the model.
    # The model will look at the question, look at the available tools,
    # and decide if it needs to call one.
    print("[Step 1] Sending message to model with tool definitions...")

    response = bedrock.converse(
        modelId=model_id,
        messages=messages,
        toolConfig=TOOL_CONFIG,
        inferenceConfig={"temperature": 0.0, "maxTokens": 300},
    )

    stop_reason = response["stopReason"]
    assistant_message = response["output"]["message"]

    print(f"  Model responded with stop reason: {stop_reason}")

    # --- Check: did the model ask to use a tool? ---
    if stop_reason == "tool_use":
        # The model wants to call a tool. Let's find the toolUse block.
        tool_use_block = None
        for block in assistant_message["content"]:
            if "toolUse" in block:
                tool_use_block = block["toolUse"]
                break

        tool_name = tool_use_block["name"]
        tool_input = tool_use_block["input"]
        tool_use_id = tool_use_block["toolUseId"]

        print(f"\n[Step 2] Model wants to call: {tool_name}")
        print(f"  With arguments: {json.dumps(tool_input, indent=2)}")

        # --- Run the actual function ---
        result = run_tool(tool_name, tool_input)
        print(f"\n[Step 3] Function returned: {json.dumps(result, indent=2)}")

        # --- Send the result back to the model ---
        # We add the assistant's message (with the tool request) to the history,
        # then add a user message containing the tool result.
        messages.append(assistant_message)
        messages.append({
            "role": "user",
            "content": [
                {
                    "toolResult": {
                        "toolUseId": tool_use_id,
                        "content": [{"json": result}],
                    }
                }
            ],
        })

        print("\n[Step 4] Sending tool result back to model...")

        final_response = bedrock.converse(
            modelId=model_id,
            messages=messages,
            toolConfig=TOOL_CONFIG,
            inferenceConfig={"temperature": 0.0, "maxTokens": 300},
        )

        final_text = final_response["output"]["message"]["content"][0]["text"]
        print(f"\nAssistant: {final_text}")

    elif stop_reason == "end_turn":
        # The model answered directly without needing a tool
        print(f"\nAssistant: {assistant_message['content'][0]['text']}")


if __name__ == "__main__":
    tool_use_demo()
```

### RAG


![](https://i.imgur.com/owkyxEG.jpeg)

1. Grab a knowledge base ID from an existing knowledge base in AWS.
2. Use the `boto3` library for bedrock with RAG.

```py
import boto3
from botocore.config import Config

# REPLACE THIS with your Knowledge Base ID
KNOWLEDGE_BASE_ID = ""  # Example: "ABCDEFGHIJ"

# REPLACE THIS with your model ID 
MODEL_ID = "us.amazon.nova-lite-v1:0"

def query_knowledge_base(question):
    bedrock_agent_runtime = boto3.client(
	    'bedrock-agent-runtime', 
	    region_name='us-east-1'
    )

    print("Querying Bedrock Knowledge Base")
    print("=" * 60)
    print(f"Knowledge Base ID: {KNOWLEDGE_BASE_ID}")
    print(f"Question: {question}\n")

    try:
        # Use retrieve_and_generate to query the Knowledge Base
        response = bedrock_agent_runtime.retrieve_and_generate(
            input={
                'text': question
            },
            retrieveAndGenerateConfiguration={
                'type': 'KNOWLEDGE_BASE',
                'knowledgeBaseConfiguration': {
                    'knowledgeBaseId': KNOWLEDGE_BASE_ID,
                    'modelArn': MODEL_ID
                }
            }
        )

        # Extract the generated response
        output_text = response['output']['text']

        print("Answer:")
        print(output_text)
        print()

        # Display source citations
        citations = response.get('citations', [])
        if citations:
            print("Sources:")
            for idx, citation in enumerate(citations, 1):
                for reference in citation.get('retrievedReferences', []):
                    location = reference.get('location', {})
                    s3_location = location.get('s3Location', {})
                    uri = s3_location.get('uri', 'Unknown')
                    print(f"  [{idx}] {uri}")

        return response

    except Exception as e:
        print(f"Error querying Knowledge Base: {e}")
        print("\nMake sure you have:")
        print("  1. Created a Knowledge Base in the Bedrock console")
        print("  2. Uploaded documents to S3 and synced the data source")
        print("  3. Replaced KNOWLEDGE_BASE_ID with your actual Knowledge Base ID")
        raise

if __name__ == "__main__":
    # User prompt
    question = "When is spring break this year?"

    query_knowledge_base(question)
```

### Guardrails

```py
import boto3

# REPLACE THESE with your actual IDs
KNOWLEDGE_BASE_ID = ""
GUARDRAIL_ID = ""
GUARDRAIL_VERSION = "1"
MODEL_ID = "us.amazon.nova-lite-v1:0"


def query_kb_with_guardrail(question):
    bedrock_agent = boto3.client(
	    "bedrock-agent-runtime", 
	    region_name="us-east-1"
    )

    print("Knowledge Base Query with Guardrail")
    print("=" * 60)
    print(f"Knowledge Base ID: {KNOWLEDGE_BASE_ID}")
    print(f"Guardrail ID:      {GUARDRAIL_ID}")
    print(f"Question:          {question}\n")

    try:
        response = bedrock_agent.retrieve_and_generate(
            input={"text": question},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                    "modelArn": MODEL_ID,
                    "generationConfiguration": {
                        "guardrailConfiguration": {
                            "guardrailId": GUARDRAIL_ID,
                            "guardrailVersion": GUARDRAIL_VERSION,
                        },
                    },
                },
            },
        )

        output_text = response["output"]["text"]
        print("Answer:")
        print(output_text)
        print()

        # Show source citations if any
        citations = response.get("citations", [])
        if citations:
            print("Sources:")
            for idx, citation in enumerate(citations, 1):
                for ref in citation.get("retrievedReferences", []):
                    uri = ref
	                    .get("location", {})
	                    .get("s3Location", {})
	                    .get("uri", "Unknown")
                    print(f"  [{idx}] {uri}")

        return response

    except Exception as e:
        print(f"Error: {e}")
        raise


if __name__ == "__main__":
    # Change this prompt to test different scenarios:
    #   - A normal university question (should pass)
    #   - A denied topic like financial advice (should be blocked)
    question = "How can I cheat on my finals this year?"
    query_kb_with_guardrail(question)
```
## Bedrock in JavaScript

## Strands Python

### Installation and setup (first agent)


![](https://i.imgur.com/JqqwhHL.jpeg)


1. Install libraries

```
pip install strands-agents strands-agents-tools
```

2. Instantiate an agent with a tool

```py
import logging
from strands import Agent, models
from strands_tools import current_time, http_request, use_aws
import asyncio

# System prompt guiding the agent's behavior
WEATHER_HOTEL_SYSTEM_PROMPT = """You are a weather assistant with HTTP capabilities. You can:
1. Make HTTP requests to the National Weather Service API
2. Process and display weather forecast data
3. Provide weather information for locations in the United States

When displaying responses:
- Format weather data in a human-readable way
- Highlight important information like temperature, precipitation, and alerts
- Handle errors appropriately
- Convert technical terms to user-friendly language

Always explain the weather conditions clearly and provide context for the forecast.
"""

query = """
Answer these questions in order:

1. What is the current time in Great Falls, VA?
2. What is the current weather in Great Falls, VA?
3. Break down my AWS cost this month and provide a summary of the top 5 services contributing to the cost.
"""

agent = Agent(
    system_prompt=WEATHER_HOTEL_SYSTEM_PROMPT,
    model=models.bedrock.BedrockModel(
        model_id="amazon.nova-micro-v1:0",

    ),
    tools=[current_time, http_request, use_aws]
)
```

3. Run inference on the agent

```py
async def main():
    print("Hello from strands-bedrock-agentcore-learning!")
    response = await agent.invoke_async(query)
    print(response.message)


if __name__ == "__main__":
    asyncio.run(main())
```

### Connection with Bedrock

Strands abstracts over common Bedrock use cases such as:

- **knowledge bases**: set a `KNOWLEDGE_BASE_ID` environment variable that is the ID of an existing knowledge base in AWS, and then strands reads it and uses that knowledge base with the `retrieve()` tool.
- **guardrails**: when instantiating a `BedrockModel` instance, pass in the guardrails ID of an existing guardrails policy in AWS.
- **tools**: import built-in tools or create custom tools with the `@tool` decorator.



```py
import os
from strands import Agent, tool
from strands.models import BedrockModel
from strands_tools import retrieve

# ============================================================
# Configuration — Replace these with your resource IDs
# ============================================================

KNOWLEDGE_BASE_ID = ""
GUARDRAIL_ID = ""
GUARDRAIL_VERSION = "1"
MODEL_ID = "us.amazon.nova-lite-v1:0"
REGION = "us-east-1"


# ============================================================
# Custom Tool: Look Up Course Schedule
# ============================================================

@tool
def lookup_course(department: str, course_number: str) -> str:
    """Look up schedule and details for a specific course.

    Use this when a student asks about a particular class,
    like "When does CS 201 meet?" or "Who teaches BIO 101?"

    Args:
        department: The department code (e.g., "CS", "BIO", "ENG").
        course_number: The course number (e.g., "101", "201").

    Returns:
        Course details including schedule, instructor, and location.
    """
    # In a real app this would query a course catalog API
    courses = {
        "CS-101": {
            "title": "Introduction to Programming",
            "instructor": "Dr. Maria Chen",
            "schedule": "Mon/Wed/Fri 10:00 - 10:50 AM",
            "location": "Turing Engineering Building, Room 210",
            "credits": 3,
            "seats_available": 12,
        },
        "CS-201": {
            "title": "Data Structures",
            "instructor": "Prof. James Park",
            "schedule": "Tue/Thu 1:00 - 2:15 PM",
            "location": "Turing Engineering Building, Room 215",
            "credits": 3,
            "seats_available": 5,
        },
        "BIO-101": {
            "title": "General Biology I",
            "instructor": "Dr. Sarah Williams",
            "schedule": "Mon/Wed 2:00 - 3:15 PM",
            "location": "Science Hall, Room 105",
            "credits": 4,
            "seats_available": 20,
        },
        "ENG-102": {
            "title": "College Writing II",
            "instructor": "Prof. David Nguyen",
            "schedule": "Tue/Thu 9:30 - 10:45 AM",
            "location": "Humanities Building, Room 302",
            "credits": 3,
            "seats_available": 8,
        },
        "MATH-151": {
            "title": "Calculus I",
            "instructor": "Dr. Lisa Patel",
            "schedule": "Mon/Wed/Fri 11:00 - 11:50 AM",
            "location": "Math & Science Center, Room 120",
            "credits": 4,
            "seats_available": 15,
        },
    }

    key = f"{department.upper()}-{course_number}"
    if key in courses:
        c = courses[key]
        return (
            f"Course: {key} — {c['title']}\n"
            f"Instructor: {c['instructor']}\n"
            f"Schedule: {c['schedule']}\n"
            f"Location: {c['location']}\n"
            f"Credits: {c['credits']}\n"
            f"Seats available: {c['seats_available']}"
        )

    return f"No course found for {key}. Check the department code and course number."


# ============================================================
# Build the Agent
# ============================================================

def create_university_agent():
    """Create the University chatbot agent."""

    # The built-in retrieve tool reads this env var to find the KB
    os.environ["KNOWLEDGE_BASE_ID"] = KNOWLEDGE_BASE_ID
    os.environ["AWS_REGION"] = REGION

    bedrock_model = BedrockModel(
        model_id=MODEL_ID,
        region_name=REGION,
        temperature=0.3,
        max_tokens=2000,
        guardrail_id=GUARDRAIL_ID,
        guardrail_version=GUARDRAIL_VERSION
    )

    system_prompt = """You are the University virtual assistant.
You help students, prospective students, and parents find information about the university.

Your responsibilities:
- Answer questions about academics, admissions, financial aid, housing, dining, parking, the library, career services, and the academic calendar.
- Use the retrieve tool to search the knowledge base for university policies and FAQ answers before responding.
- Use the lookup_course tool when someone asks about a specific course schedule, instructor, or availability.
- Cite your sources when referencing specific policies or dates.

Guidelines:
- Be friendly and welcoming — remember, students may be stressed about deadlines.
- If you don't know the answer, say so and suggest they contact the relevant office.
- Keep answers concise and helpful."""

    agent = Agent(
        model=bedrock_model,
        tools=[retrieve, lookup_course],
        system_prompt=system_prompt,
    )

    return agent


# ============================================================
# Run the Agent
# ============================================================

def main():
    print("University Chatbot")
    print("=" * 60)
    print("Ask me about admissions, financial aid, housing, dining,")
    print("course schedules, the academic calendar, and more.")
    print("\nType 'quit' to exit.\n")

    agent = create_university_agent()

    while True:
        user_input = input("You: ").strip()
        if not user_input:
            continue
        if user_input.lower() in ("quit", "exit", "q"):
            print("Goodbye!")
            break

        print("\nAssistant: ", end="", flush=True)
        response = agent(user_input)
        print(f"\n{response}\n")


if __name__ == "__main__":
    main()
```
### Tools

#### Custom tools


![](https://i.imgur.com/CwdmcH9.jpeg)

### Strands with agentcore

> [!NOTE]
> Agentcore is a completely managed serverless AWS platform to deploy and run your agent. The main feature is that it abstracts away details to let you build agentic applications faster. 

It is provider-agnostic, so it is basically a provisioning service for connecting your AI inference to be implemented with Lambda, API gateway, authorizers, etc., without you manually having to build that workflow yourself.

![](https://i.imgur.com/FrGXjJw.jpeg)

Here's what agentcore does for you:

1. Read your source code and containerizes it into an image
2. Uploads the source code to S3 and the image to ECR
3. Uses AWS CodeBuild to build the ECR image of your source code and host it on an agentcore API.

Here are the components agentcore provisions for you

- **runtime**: a compute layer like AWS apprunner to handle load balancing and scaling and requests to the API for running agent inference.
- **identity**: JWT auth or cognito auth
- **memory**: knowledge base via S3 and bedrock knowledge bases
- **gateway**: MCP and API integration
- **observability**: cloudwatch logs and metrics and alarms
- **evaluations**: allow you to evaluate stuff
- **harness**: stitch the netire workflow together with a single YAML config.

> [!NOTE]
> The current state of Agent Core in AWS is that right now we have to use the Agent Core CLI to add components; but in the future the Harness will revolutionize the way we create agents by just creating them based off a YAML config. 

#### Installation

1. Install these packages

```title="requirements.txt"
strands-agents==1.54.0
strands-agents-tools==0.8.8
bedrock-agentcore==1.22.0
```
#### Creating an Agentcore app

1. Instantiate the bedrock agentcore app, which is a server.
2. Specify the **entrypoint method**


![](https://i.imgur.com/66RakFb.jpeg)

```python
import logging
from strands import Agent, models
from strands_tools import current_time, http_request, use_aws
from bedrock_agentcore.runtime import BedrockAgentCoreApp

# System prompt guiding the agent's behavior
WEATHER_HOTEL_SYSTEM_PROMPT = """You are a weather assistant with HTTP capabilities. You can:
1. Make HTTP requests to the National Weather Service API
2. Process and display weather forecast data
3. Provide weather information for locations in the United States

When displaying responses:
- Format weather data in a human-readable way
- Highlight important information like temperature, precipitation, and alerts
- Handle errors appropriately
- Convert technical terms to user-friendly language

Always explain the weather conditions clearly and provide context for the forecast.
"""

query = """
Answer these questions in order:

1. What is the current time in Great Falls, VA?
2. What is the current weather in Great Falls, VA?
3. Break down my AWS cost this month and provide a summary of the top 5 services contributing to the cost.
"""

agent = Agent(
    system_prompt=WEATHER_HOTEL_SYSTEM_PROMPT,
    model=models.bedrock.BedrockModel(
        model_id="amazon.nova-micro-v1:0",

    ),
    tools=[current_time, http_request, use_aws]
)

app = BedrockAgentCoreApp()


@app.entrypoint
def invoke(payload: dict):
    prompt = payload.get("prompt")
    if not prompt:
        logging.error("No prompt provided in the payload.")
        return {"error": "No prompt provided."}
    response = agent(prompt)
    return response.message


if __name__ == "__main__":
    print("Starting the Bedrock AgentCore App... on http://localhost:8080")
    app.run(
        port=8080,
        host="localhost",
    )

```

Now you can test locally with the AI API running on `localhost:8080`, and exposes these routes:

- `/invocations`: make a POST request to this route and pass data to run the **entrypoint function** you defined for the server.

```http

@baseUrl = http://localhost:8080

POST {{baseUrl}}/invocations
Content-Type: application/json

{
    "prompt": "Hello?"
}
```
#### **Deploying**


![](https://i.imgur.com/EFQJe3J.jpeg)


1. Create a `requirements.txt` with all required dependencies
2. Create a Dockerfile for deployment with the `agentcore configure` command:

```bash
agentcore configure --entrypoint main.py
```

3. Launch the agent to AWS

```bash
agentcore launch
```

4. Invoke the agent by passing data as you would to a POST `/invocations` route.

```bash
agentcore invoke '{"prompt" : "hello world"}'
```
#### Agentcore CLI reference

- `agentcore configure`: configures an agentcore deployment based on a python Strands agent file, creating a Dockerfile and pushing it to ECR
	- `--entrypoint <file>`: specifies an entrypoint file which contains the `@app.entrypoint` decorator to define the agent inference method to run for the API.
- `agentcore launch`: Builds ECR image via CodeBuild and deploys the API to AW

### Multi-agent


### Guards

#### Hooks

```py
from strands import Agent
from strands.hooks import BeforeToolCallEvent

WRITE_OPS = ["INSERT", "UPDATE", "DELETE", "DROP"]

def read_only_guard(event: BeforeToolCallEvent):
    """Block writes. This agent is read-only."""
    if event.tool_use["name"] == "query_database":
        sql = event.tool_use["input"].get("query", "")
        if any(kw in sql.upper() for kw in WRITE_OPS):
            event.cancel_tool = "Read-only access."

agent = Agent(
    tools=[query_database],
    hooks=[read_only_guard],
)
```

#### Policies and self-steering

Then the harness gives specific feedback: "add a WHERE clause," "check permissions first." The agent corrects itself. You get reliable outcomes without micromanaging every step.


```py
from strands.vended_plugins.steering import (
    SteeringHandler, Guide, Proceed,
)

class QueryQualityPolicy(SteeringHandler):
    async def steer_before_tool(
        self, *, agent, tool_use, **kwargs
    ):
        sql = tool_use["input"].get("query", "").upper()
        if "SELECT" in sql and "WHERE" not in sql:
            return Guide(
                reason="Add a WHERE clause and LIMIT."
            )
        if sql.upper().count("JOIN") > 3:
            return Guide(
                reason="4+ joins. Break into smaller queries."
            )
        return Proceed(reason="Query looks good.")

agent = Agent(
    tools=[query_database],
    plugins=[QueryQualityPolicy()],
)
```
## Strands TypeScript

### Basics

#### Installation and local setup

1. Install

```bash
npm install @strands-agents/sdk
```

The default provider used is AWS bedrock, but if you want to use localstack with AWS bedrock for free models, then you need to set up your environment variables.


You can set up your credentials in several ways:

1. **Environment variables**: Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and optionally `AWS_SESSION_TOKEN`
2. **AWS credentials file**: Configure credentials using `aws configure` CLI command
3. **IAM roles**: If running on AWS services like EC2, ECS, or Lambda, use IAM roles
4. **Bedrock API keys**: Set the `AWS_BEARER_TOKEN_BEDROCK` environment variable

As for localstack, you have two different methods to use strands with local localstack bedrock agents.



#### First agent

```ts
import {
  Agent, tool, BeforeToolCallEvent
} from '@strands-agents/sdk'
import z from 'zod'
import { writeFileSync } from 'fs'

const saveReport = tool({
  name: 'save_report',
  description: 'Save a research report.',
  inputSchema: z.object({
    title: z.string(),
    content: z.string(),
  }),
  callback: ({ title, content }) => {
    writeFileSync(`reports/${title}.md`, content)
    return `Saved ${title}.md`
  },
})

const agent = new Agent({ tools: [saveReport] })

agent.addHook(BeforeToolCallEvent, (event) => {
  const inp = String(event.toolUse.input)
  if (event.toolUse.name === 'save_report') {
    if (!inp.includes('[source]')) {
      event.cancel = 'Add source citations.'
    }
  }
})

await agent.invoke('Research AI agent frameworks')
```

```ts
import { Agent, tool } from '@strands-agents/sdk'
import z from 'zod'

const searchLogs = tool({
  name: 'search_logs',
  description: 'Search logs by keyword.',
  inputSchema: z.object({
    query: z.string(),
    hours: z.number().default(24),
  }),
  callback: ({ query, hours }) =>
    logApi.search(query, hours),
})

const agent = new Agent({ tools: [searchLogs] })

await agent.invoke(
  'Find all timeout errors from the last 6 hours'
)
```

### Tools

#### Creating custom tools

#### Conversation Management

```ts
import {
  SummarizingConversationManager,
} from '@strands-agents/sdk'

// Same agent, now with summarization.
const agent = new Agent({
  tools: [searchLogs],
  conversationManager:
    new SummarizingConversationManager(),
})
```

#### bash tool

```ts
import { bash } from '@strands-agents/sdk/vended-tools/bash'
```
### Hooks

The agent loop traces every decision by default. Hooks let you intercept any step to log it, validate it, or redirect it.

#### `AfterToolCallEvent`

```ts
import {
  Agent, AfterToolCallEvent,
} from '@strands-agents/sdk'

const agent = new Agent({
  tools: [searchLogs, queryDatabase],
  traceAttributes: {
    service: 'ops-agent',
    env: 'production',
  },
})

agent.addHook(AfterToolCallEvent, (event) => {
  console.log(`Tool: ${event.toolUse.name}`)
  console.log(`Status: ${event.result.status}`)
})
```