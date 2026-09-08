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

Strands was developed by AWS as an agentic harness that works well with good models, treating models as the main driver and trying to avoid overengineering as models become more capable.

> [!NOTE]
> Strands follows one simple idea: let the model drive, while the developer handles declaratively defining boundaries, human-in-the-loop, and guardrails.




Strands offer these features:

- **orchestration**: handles the agentic loop and orchestration layer
- **Tool + MCP integration**: easily add custom tools or MCPs for use, with many built-in tools
- **session/memory integration**
- **multi-agent collaboration**
- **observability**
- **evals**


### AWS agent toolkit

The AWS Agent Toolkit is a set of MCP servers, skills, and Claude Code plugins that give your AI agents access to the AWS docs for better AWS development. 

#### Plugins


![](https://i.imgur.com/zgjt2EK.jpeg)

#### MCP server

```json
{
  "mcpServers": {
    "aws-mcp": {
      "command": "uvx",
      "args": [
        "mcp-proxy-for-aws@latest",
        "https://api.aws",
        "--metadata", "AWS_REGION=us-east-1"
      ]
    }
  }
}

```
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

### Agent basics

#### Connection with bedrock

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

#### Viewing agent messages

All the messages stored in an agent conversation are in the `agent.messages` property.

#### Model providers

The default model provider is bedrock, specifically a `BedrockModel` instance using claude-sonnet 4.6 in the us-east-2 region.

Here are a list of the supported providers:

| Provider              | Setup Required                           |
| --------------------- | ---------------------------------------- |
| **Bedrock** (default) | AWS credentials configured               |
| **Anthropic**         | `ANTHROPIC_API_KEY` environment variable |
| **OpenAI**            | `OPENAI_API_KEY` environment variable    |
| **Ollama**            | Ollama running locally (`ollama serve`)  |

##### BedrockModel


To find out all possible model IDs on Bedrock, just run this command:

```bash
aws bedrock list-foundation-models | jq
```

This is a standard use case of the bedrock model.

```py
agent = Agent(
    model=models.bedrock.BedrockModel(
        model_id="amazon.nova-micro-v1:0",
    )
)
```

To use with localstack, follow these steps:

1. Start the localstack emulator with `lstk start`

```bash
lstk start
```

2. Export these environment variables into the current shell session or set them dynamically in Python

```py
export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
export AWS_DEFAULT_REGION="us-east-1"
export AWS_REGION="us-east-1"
export AWS_ENDPOINT_URL="http://localhost:4566"
```

3. Override the `endpoint_url` and `region_name` and `streaming` kwargs in the `BedrockModel` instatiation:

```py
AWS_ENDPOINT_URL = "http://localhost:4566"  # LocalStack endpoint
AWS_ACCESS_KEY_ID = "test"
AWS_SECRET_ACCESS_KEY = "test"
AWS_DEFAULT_REGION = "us-east-1"
AWS_PROFILE = "localstack"
os.environ = {
	"AWS_ACCESS_KEY_ID": AWS_ACCESS_KEY_ID,
	"AWS_SECRET_ACCESS_KEY": AWS_SECRET_ACCESS_KEY,
	"AWS_DEFAULT_REGION": AWS_DEFAULT_REGION,
	"AWS_ENDPOINT_URL": AWS_ENDPOINT_URL,
	"AWS_PROFILE": AWS_PROFILE,
}
agent = Agent(
	system_prompt=input.system_prompt,
	model=models.bedrock.BedrockModel(
		model_id=input.model_id,
		endpoint_url=AWS_ENDPOINT_URL,
		region_name=AWS_DEFAULT_REGION,
		streaming=False, #  required for localstack
	),
	tools=input.tools,
	name=input.name,
)
```
##### OpenAIModel

```py
openai_model = OpenAIModel(
    client_args={"api_key": os.environ["OPENAI_API_KEY"]},
    model_id="gpt-4o",
    params={"max_tokens": 1000, "temperature": 0.7},
)
```

##### OllamaModel

```py
# Local with Ollama (no cloud APIs needed)
ollama_model = OllamaModel(
    host="http://localhost:11434",
    model_id="gemma4:latest",
)

# Use any provider — agent code stays identical
agent = Agent(model=ollama_model)
```

##### All together


```py
import os

# represents a small subset of environment variables you want to control the lifecycle of.
class Env:
    @staticmethod
    def get_var(key: str, default: str = None) -> str:
        return os.environ.get(key, default)

    @staticmethod
    def set_var(key: str, value: str):
        os.environ[key] = value

    def __init__(self, env_vars: dict = None):
        if env_vars is not None:
            self.env_vars = env_vars
        else:
            self.env_vars = dict(os.environ)
        os.environ.update(self.env_vars)

    def unset(self, key: str):
        if key in self.env_vars:
            del self.env_vars[key]
            os.environ.pop(key, None)

    def unset_all(self):
        for key in list(self.env_vars.keys()):
            self.unset(key)
```

```py
from dataclasses import dataclass, field
from typing import List
from strands.models.ollama import OllamaModel
from strands.models.openai import OpenAIModel, Client

@dataclass
class ModelInput:
   model_id: str
   name: str
   system_prompt: str = "You are a helpful assistant."
   tools: List[any] = field(default_factory=list)

@dataclass
class ModelReturn:
    agent: Agent
    env: Env | None = None


def create_bedrock_model(input: ModelInput) -> ModelReturn:
    """
    Create a Bedrock model instance.
    """
    
    agent = Agent(
        system_prompt=input.system_prompt,
        model=models.bedrock.BedrockModel(
            model_id=input.model_id,
        ),
        tools=input.tools,
        name=input.name,
    )
    return ModelReturn(agent=agent)

def create_local_bedrock_model(input: ModelInput) -> ModelReturn:
    """
    Create a Bedrock model instance using localstack
    """
    AWS_ENDPOINT_URL = "http://localhost:4566"  # LocalStack endpoint
    AWS_ACCESS_KEY_ID = "test"
    AWS_SECRET_ACCESS_KEY = "test"
    AWS_DEFAULT_REGION = "us-east-1"
    AWS_PROFILE = "localstack"
    env = Env({
        "AWS_ACCESS_KEY_ID": AWS_ACCESS_KEY_ID,
        "AWS_SECRET_ACCESS_KEY": AWS_SECRET_ACCESS_KEY,
        "AWS_DEFAULT_REGION": AWS_DEFAULT_REGION,
        "AWS_ENDPOINT_URL": AWS_ENDPOINT_URL,
        "AWS_PROFILE": AWS_PROFILE,
    })
    agent = Agent(
        system_prompt=input.system_prompt,
        model=models.bedrock.BedrockModel(
            model_id=input.model_id,
            endpoint_url=AWS_ENDPOINT_URL,
            region_name=AWS_DEFAULT_REGION,
            streaming=False,
        ),
        tools=input.tools,
        name=input.name,
        
    )
    return ModelReturn(agent=agent, env=env)

def create_ollama_model(input: ModelInput) -> ModelReturn:
    """
    Create an Ollama model instance.
    """
    agent = Agent(
        system_prompt=input.system_prompt,
        model=OllamaModel(
            model_id=input.model_id,
            host="http://localhost:11434"
        ),
        tools=input.tools,
        name=input.name,
    )
    return ModelReturn(agent=agent)
```
### Tools

#### Custom tools


![](https://i.imgur.com/CwdmcH9.jpeg)


You can create a custom tool from a simple python function decorated with the `@tool` decorator. There are two things you should keep in mind when creating a custom tool:

- **tool description**: the tool description is extracted from the docstring of the function. 
- **tool input and return types**: The tool input schema is parsed from the parameter type-hinting and the return schema is parsed from the return type-hinting/

```py
@tool
def query_product_database(query: str) -> str:
    """Query the internal product database for inventory and pricing information.

    Args:
        query: Search query for products (e.g., "wireless headphones", "USB-C hub")
    """
    products = {
        "wireless headphones": "SKU-WH100: Wireless Headphones Pro — $79.99, 142 in stock, 4.5★ rating, launched 2025-03",
        "usb-c hub": "SKU-UC200: USB-C Hub 7-in-1 — $45.00, 89 in stock, 4.2★ rating, launched 2024-11",
        "mechanical keyboard": "SKU-MK300: Mechanical Keyboard RGB — $149.99, 23 in stock, 4.8★ rating, launched 2025-01",
        "noise cancelling": "SKU-NC400: Noise Cancelling Earbuds — $129.99, 67 in stock, 4.6★ rating, launched 2025-05",
    }
    key = query.lower()
    matches = [info for product_key, info in products.items() if product_key in key]
    if matches:
        return "\n".join(matches)
    return f"No products found matching '{query}'. Available: wireless headphones, usb-c hub, mechanical keyboard, noise cancelling"

SYSTEM_PROMPT = """You are a product research analyst. You help the team understand
market positioning by comparing competitor pricing with our internal catalog.

When given a research task:
1. Use http_request to gather public market data
2. Use query_product_database to check our internal pricing and inventory
3. Write a brief competitive analysis and save it using file_write"""
   
agent = Agent(
    tools=[http_request, file_write, query_product_database],
    system_prompt=SYSTEM_PROMPT,
)

result = agent("""Research what wireless headphones are trending on the market and compare it against our offerings.Write a short competitive positioning summary and save it to report.md""")
```

#### Changing tool execution behavior

You can specify that an agent should execute tools sequentially by passing in a `SequentialToolExecutor` instance for the `tool_executor=` kwarg when creating an agent:

```py
from strands import Agent, tool
from strands.tools.executors import SequentialToolExecutor


@tool
def step_one() -> str:
    """Perform the first step of the workflow."""
    return "Step one complete — file created."


@tool
def step_two() -> str:
    """Perform the second step that depends on step one."""
    return "Step two complete — file processed."


agent = Agent(
    tools=[step_one, step_two],
    tool_executor=SequentialToolExecutor(),
)
agent("Run step one and then step two.")
```
#### Adding MCP

1. Create an MCP client

```py
import os
from mcp import stdio_client, StdioServerParameters
from mcp.client.streamable_http import streamablehttp_client
from strands import Agent
from strands.tools.mcp import MCPClient

aws_mcp = MCPClient(
    lambda: streamablehttp_client("https://aws-mcp.us-east-1.api.aws/mcp")
)
```

2. Add the MCP client as a tool of the agent.

```py
agent = Agent(
	tools=[aws_mcp], 
	system_prompt=SYSTEM_PROMPT
)
```

Here's the simplest example:

```py
"""
Coding assistant enhanced with the AWS MCP server.
Connects to the managed AWS MCP server via streamable HTTP
to give the agent access to AWS capabilities.
"""

from mcp.client.streamable_http import streamablehttp_client
from strands import Agent
from strands.tools.mcp import MCPClient
from strands_tools import file_read, editor, shell

# Connect to the AWS MCP server (streamable HTTP)
aws_mcp = MCPClient(
    lambda: streamablehttp_client("https://aws-mcp.us-east-1.api.aws/mcp")
)

SYSTEM_PROMPT = """You are a coding assistant with AWS expertise.
Use the AWS MCP tools to look up documentation, architecture patterns,
and service details when answering questions about building on AWS.
Be concise and actionable in your recommendations."""

agent = Agent(
    tools=[aws_mcp, file_read, editor, shell],
    system_prompt=SYSTEM_PROMPT,
)

agent("I need to build a serverless FastAPI backend with authentication "
      "and file uploads. What AWS services should I use and how should "
      "I architect this?")
```

##### STDIO and HTTP servers

Here's a complete example of how we connect to one remote MCP server and one local MCP server:

```py
import os
from mcp import stdio_client, StdioServerParameters
from mcp.client.streamable_http import streamablehttp_client
from strands import Agent
from strands.tools.mcp import MCPClient

SYSTEM_PROMPT = """You are an AWS Solutions Architect. You help users design and build 
well-architected solutions on AWS. Use the available tools to provide accurate, up-to-date 
guidance on AWS services, architecture patterns, and pricing. When users ask about costs, 
use the pricing tools to give real numbers. Always cite relevant documentation when possible."""

# Remote MCP server (Streamable HTTP) — AWS docs, best practices, architecture guidance
aws_knowledge = MCPClient(
    lambda: streamablehttp_client("https://knowledge-mcp.global.api.aws"),
    prefix="knowledge"
)

# Local MCP server (stdio via uvx) — real-time AWS pricing data
aws_pricing = MCPClient(
    lambda: stdio_client(StdioServerParameters(
        command="uvx",
        args=["awslabs.aws-pricing-mcp-server@latest"],
        env={
            "FASTMCP_LOG_LEVEL": "ERROR",
            "AWS_PROFILE": os.environ.get("AWS_PROFILE", "default"),
            "AWS_REGION": os.environ.get("AWS_REGION", "us-east-1"),
        }
    )),
    prefix="pricing"
)

agent = Agent(tools=[aws_knowledge, aws_pricing], system_prompt=SYSTEM_PROMPT)

print("AWS Architect Agent (type 'quit' to exit)")
print("-" * 45)

while True:
    user_input = input("\nYou: ").strip()
    if user_input.lower() in ("quit", "exit", "q"):
        print("Goodbye!")
        break
    if not user_input:
        continue
    print()
    agent(user_input)
```

##### Adding tool filters

```py
"""
Demonstrates tool filtering — listing all tools from an MCP server
and then filtering down to only the ones you need.
"""

import logging
logging.getLogger("mcp").setLevel(logging.CRITICAL)

from mcp.client.streamable_http import streamablehttp_client
from strands import Agent
from strands.tools.mcp import MCPClient

# Connect to the AWS MCP server
aws_mcp = MCPClient(
    lambda: streamablehttp_client("https://aws-mcp.us-east-1.api.aws/mcp")
)

with aws_mcp:
    # List all available tools from the server
    print("=" * 60)
    print("ALL TOOLS FROM AWS MCP SERVER:")
    print("=" * 60)
    for tool in aws_mcp.list_tools_sync():
        desc = (tool.mcp_tool.description or '')[:80]
        print(f"  - {tool.tool_name}: {desc}")

    print(f"\nTotal tools: {len(aws_mcp.list_tools_sync())}")

    # Now filter to only the tools we need
    print("\n" + "=" * 60)
    print("FILTERED TOOLS (allowed list):")
    print("=" * 60)

# Create a new client with filtering (outside the with block)
filtered_mcp = MCPClient(
    lambda: streamablehttp_client("https://aws-mcp.us-east-1.api.aws/mcp"),
    tool_filters={
        "allowed": ["aws___search_documentation", "aws___read_documentation"]
    },
)

agent = Agent(
    tools=[filtered_mcp],
    system_prompt="You are an AWS documentation assistant. Only use documentation tools.",
)

print("Agent created with filtered tool set.")
print(f"Available tools: {agent.tool_names}")
```

#### Strands shell

If you want to give bash, third-party MCPs, or filesystem tool access to Strands Agents, then it's imperative you sandbox your agent.

Strands Agents offers a built-in sandbox solution called Strands Shells to make sure that any potentially sensitive destructive actions via Bash are sandboxed. 

For sandboxed execution, check out [Strands Shell](https://github.com/strands-agents/shell) which gives agents isolated filesystem and network access.


![](https://i.imgur.com/Nlu0SsU.jpeg)

### Harness capabilities

Strands also ships preconfigured defaults that give you a capable agent out of the box:

- **Built-in tools** — file operations, shell, search, web access
- **Automatic context management** — proactive compression when the window fills
- **Sub-agent delegation** — spawn child agents for subtasks

```py
from strands import Agent
from strands.models import BedrockModel
from strands.agent.conversation_manager import SummarizingConversationManager
from strands.vended_plugins.context_offloader import ContextOffloader, FileStorage
from strands_tools import file_read, file_write, editor, shell, http_request, use_agent

agent = Agent(
    model=BedrockModel(
        model_id="us.anthropic.claude-sonnet-4-20250514-v1:0",
    ),
    # Built-in tools for file ops, shell, web, and subagent delegation
    tools=[file_read, file_write, editor, shell, http_request, use_agent],
    # Proactive compression — summarizes context before hitting the limit
    conversation_manager=SummarizingConversationManager(
        proactive_compression={"compression_threshold": 0.9},
    ),
    # Offloads large tool results externally, keeps a preview in context
    plugins=[
        ContextOffloader(
            storage=FileStorage("./offloaded"),
            max_result_tokens=8_000,
            preview_tokens=2_000,
        ),
    ],
)

# Give it a research task
agent("Research the current state of AI agent deployment patterns in production, including common architectures, challenges teams face, and best practices. Write a summary to report.md")

```

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
### Callbacks

You can use callbacks to hook into lifecycle events of the agent and run logic based on that. Similar to hooks but the main purpose of a callback is to control how an agent's output surfaces into a user interface. 

These events include:

- **Text chunks** as they are generated 
- **Tool calls** 
- **Life cycle signals** 
- **The final result** 

> [!NOTE]
> Every agent we've built so far streams text to the terminal as the model generates it. That's the default callback handler — a function that gets called for every event the agent produces. You can replace it with your own.


![](https://i.imgur.com/csCmVL1.jpeg)

> [!NOTE]
> Callback handlers by default are synchronous, so if you want to make them async, use the async iterator pattern instead.

- **Callback handlers**: Intercept streaming events (text chunks, tool starts/ends, errors) and decide what to do with them. Great for CLI tools.
- **Async iterators**: Consume agent events as a structured stream - better for integrating into larger applications where you need programmatic control.
- **SSE streaming**: Server-Sent Events let web clients consume agent output incrementally over HTTP, giving users real-time feedback.
- **Suppressing output**: Use `callback_handler=None` on agents that should run silently (like sub-agents) so only the orchestrator streams to the user.


#### Basic callback handler

A callback handler is a function that accepts `**kwargs`. It fires for every agent event (text chunks, tool calls, complete messages):

```py
def buffered_handler(**kwargs):
    # "data" events are individual text chunks as they stream in.
    # We ignore them here (no printing) so nothing appears mid-generation.

    # "message" fires when a complete message is ready.
    if "message" in kwargs and kwargs["message"].get("role") == "assistant":
        # Extract just the text content from the complete message
        content = kwargs["message"].get("content", [])
        for block in content:
            if "text" in block:
                print(block["text"])


agent = Agent(
    tools=[calculator],
    callback_handler=buffered_handler,
)

agent("What is 2 to the power of 16, minus 1?")
```

#### Silent callback handler


Set `callback_handler=None` when instantiating the agent to make sure that nothing is streamed to stdout.

The agent runs and returns a result you can use programmatically:

```python
agent = Agent(tools=[calculator], callback_handler=None)
result = agent("What is 42 * 42?")
print(f"Captured result: {result}")
```

#### Async callback handlers

Async callback handlers force you to opt out of supplying a callback handler lambda and instead hook into the agent loop itself and print logs based on each event in the agent loop, of which there are 4 events.

For async servers, use `agent.stream_async()` — an async generator that yields events:

- `"data"`: text chunk is produced
- `"current_tool_use"`: agent is trying to use a tool
- `"result"`: agent finished response.

```py
"""
Async Streaming with stream_async

Same events as the callback handler, but as an async generator.
This is what you'd use in FastAPI, aiohttp, or any async server
where you need to stream responses to clients.
"""

import asyncio
from strands import Agent
from strands_tools import calculator

# callback_handler=None so the default handler doesn't also print
agent = Agent(
    tools=[calculator],
    callback_handler=None,
)


async def main():
    last_tool_printed = None
    async for event in agent.stream_async("What is 256 + 256?"):
        if "data" in event:
            print(event["data"], end="", flush=True)
        elif "current_tool_use" in event and event["current_tool_use"].get("name"):
            tool_name = event["current_tool_use"]["name"]
            if tool_name != last_tool_printed:
                last_tool_printed = tool_name
                print(f"\n🔧 [{tool_name}]", end=" ", flush=True)
        elif "result" in event:
            print("\n✅ Stream complete")


asyncio.run(main())
```

Here's a FastAPI example:

```py
"""
FastAPI Streaming Endpoint

A real streaming AI endpoint in ~20 lines. Run with:
    uvicorn fastapi_streaming:app --reload

Test with:
    curl -X POST http://localhost:8000/stream \
        -H "Content-Type: application/json" \
        -d '{"prompt": "What is 1024 * 768?"}'
"""

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from strands import Agent
from strands_tools import calculator

app = FastAPI()


class PromptRequest(BaseModel):
    prompt: str


@app.post("/stream")
async def stream_response(request: PromptRequest):
    async def generate():
        agent = Agent(tools=[calculator], callback_handler=None)
        async for event in agent.stream_async(request.prompt):
            if "data" in event:
                yield event["data"]

    return StreamingResponse(generate(), media_type="text/plain")
```



### Hooks

Hooks are like the middleware for the agent lifecycle, which lets you deterministically inject logic into the lifecycle at specific points to either block or allow certain actions to happen. 


![](https://i.imgur.com/cJ3qqML.jpeg)


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

#### Custom hooks

If you want to create custom hooks, then you can create custom classes that inherit from the `HookProvider` class.

### Policies and self-steering

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


```ts
const classifyEntry = strands.tool({
  name: 'classify_entry',
  description:
    'Classify an OpenAI changelog entry into one of four categories: ' +
    '"ignore" (not relevant to SDK), "docs-only" (just needs a docs update), ' +
    '"probably-supported" (SDK likely handles this already), or ' +
    '"repo-change-needed" (requires new SDK code or a GitHub issue). ' +
    'A new model slug alone is NOT repo-change-needed. Only classify as ' +
    'repo-change-needed when the model is unavailable via Chat Completions, ' +
    'needs new adapter behavior, or should change the documented default.',
  inputSchema: z.object({
    title: z.string().describe('Title or summary of the changelog entry'),
    details: z.string().describe('Full description of the change'),
  }),
  callback: async ({ title, details }) => {
    // The model's reasoning handles classification. This tool
    // structures the decision so it can be referenced later.
    return JSON.stringify({ title, details, classified: true })
  },
})

```


```ts
const githubSearchIssues = strands.tool({
  name: 'github_search_issues',
  description:
    'Search open GitHub issues in strands-agents/sdk-typescript for duplicates.' +
    '\n' +
    'Use this BEFORE creating a new issue to check if one already exists.',
  inputSchema: z.object({
    query: z.string().describe('Search terms, e.g. "Responses API" or "Chat Completions API"'),
  }),
  callback: async ({ query }) => {
    const q = encodeURIComponent(`${query} repo:strands-agents/sdk-typescript is:issue is:open`)
    const res = await fetch(`https://github.com{q}&per_page=10`)
    const { items = [] } = await res.json()
    return JSON.stringify(items.map((i: any) => ({ number: i.number, title: i.title, url: i.html_url })))
  },
})

```

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

```ts
import { BeforeToolCallEvent, AfterToolCallEvent } from '@strands-agents/sdk'

function beforeTool(event: BeforeToolCallEvent): void {
  console.log(`\n[TOOL] Model chose: ${event.toolUse.name}`)
  console.log(`  With inputs: ${JSON.stringify(event.toolUse.input)}`)
}

function afterTool(event: AfterToolCallEvent): void {
  console.log(`  [OK] Result received\n`)
}

const agent = new strands.Agent({
  tools: [fetchChangelog, classifyEntry, githubSearchIssues],
  callbacks: { beforeToolCall: beforeTool, afterToolCall: afterTool },
})
```

1. You specify a list of hooks to use in the `callbacks` property param when instantiating an agent.
2. Type-hint hook event callbacks with hook event instances like `AfterToolCallEvent`

```ts
import { BeforeToolCallEvent, AfterToolCallEvent } from '@strands-agents/sdk'

type HookEvent = BeforeToolCallEvent | AfterToolCallEvent

function hook<T extends HookEvent>(event: T) {
	const toolName = event.toolUse.name
	const input = event.toolUse.input
}
```

Here are a list of hook events available:

- `AfterToolCallEvent`: type for a post-tool use hook
- `BeforeToolCallEvent`: type for a pre-tool use hook

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