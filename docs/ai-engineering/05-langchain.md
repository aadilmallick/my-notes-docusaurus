## Langchain Python

### Installation

1. Set up the `requirements.txt`

```bash title="requirements.txt"
langchain
langchain_community
langchain-openai
langchain-groq
python-dotenv
langchain-google-genai
```

2. Install within a virtual environment

```bash
uv init .
uv venv
source venv/bin/activate
uv add -r requirements.txt
```

### Basics

#### Initializing models

To create an LLM in langchain used to be painful, but now it's a single factory function call to `langchain.chat_models.init_chat_model()`, passing in these kwargs:

```python
from langchain.chat_models import init_chat_model

model = init_chat_model(**kwargs)
```

- `model`: the model tag identifier
- `model_provider`: the inference provider, like groq, openai, etc., check [list of providers here](https://docs.langchain.com/oss/python/integrations/chat).


The `init_chat_model()` method returns a `BaseChatModel` concrete instance, which is a provider-agnostic representation of an LLM.

So let's go over the steps to initialize our first model:

1. Set the appropriate env var so langchain can get the API key

```py
import os
from dotenv import load_dotenv

load_dotenv()

groq_api_key = os.getenv('GROQ_API_KEY')
if not groq_api_key:
    raise ValueError("GROQ_API_KEY is not set")

os.environ['GROQ_API_KEY'] = groq_api_key
```

2. Create the model, specifying model provider and model tag:

```python
from langchain.chat_models import init_chat_model

model = init_chat_model(
    model="openai/gpt-oss-120b",
    model_provider="groq",
)
```

#### Prompt templates

```py
# Your code goes here
from langchain.chat_models import init_chat_model
from langchain_core.prompts import PromptTemplate

# 1. create a prompt
prompt_template_str = """
Your task is to explain the concept of **{concept}** to me in a way that is:

1. Clear and intuitive
2. Concise (in under 100 words)
3. Tailored specifically to me and what I already know

Use the following information about me to personalize your explanation:

- Background: AI engineering, combining deep ML fundamentals with agentic AI applications and workflows
- Professional Interests: Building autonomous agents with computer use, browser tools, web search, deep research, and GTM automation
- Technical Level: Advanced — comfortable with Python, software engineering, and ML fundamentals

The personalization should be subtle and natural. Avoid forced references to my background that don't genuinely enhance understanding.
"""

# 2. create prompt template and inject variables to get final prompt
prompt_template = PromptTemplate.from_template(prompt_template_str)
concept = "agent memory management systems"
prompt = prompt_template.format(concept=concept)

# 3. invoke the model and pass the prompt
model = init_chat_model("gpt-4o-mini", model_provider="openai")
response = model.invoke(prompt)
print(response.text)
```


### Model providers

#### `ChatGroq`

The `ChatGroq` requires the `GROQ_API_KEY` env var to be set in the environment.

There are two ways to instantiate a model using the groq provider:

- **method 1 - using `init_chat_model()`**:
- **method 2 - instantiating `ChatGroq`**:

```python
from langchain_groq import ChatGroq

llm = ChatGroq(
    model="qwen/qwen3-32b",
    temperature=0,
    max_tokens=None,
    reasoning_format="parsed",
    timeout=None,
    max_retries=2,
    # other params...
)
```

Groq supports vision capabilities with select models, allowing you to send images along with text prompts.

```py
from langchain_groq import ChatGroq
from langchain.messages import HumanMessage

llm = ChatGroq(model="meta-llama/llama-4-scout-17b-16e-instruct")

message = HumanMessage(
    content=[
        {"type": "text", "text": "Describe this image in detail."},
        {
            "type": "image_url",
            "image_url": {"url": "https://example.com/image.jpg"},
        },
    ]
)

response = llm.invoke([message])
print(response.content)
```

### Agents

#### Creating an agent

An agent is defined by a model with tools, so here's the most basic way to create that agent:

```py
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
import os
from dotenv import load_dotenv

load_dotenv()


def get_groq_model(model_name: str):
    # 1. Load the GROQ API key from the environment variables.
    groq_api_key = os.getenv('GROQ_API_KEY')
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY is not set")
    os.environ['GROQ_API_KEY'] = groq_api_key

    # 2. create the BaseChatModel instance from groq provider
    return init_chat_model(
        model=model_name,
        model_provider="groq",
    )
```

You define tools as normal python functions, where the parameter and return type hinting is type hinting for the tool, and the docstring is the description.

```py
import datetime
from langchain.agents import create_agent

def get_date_and_time():
    """Get the current date and time in ISO 8601 format."""
    return datetime.datetime.now().isoformat()


model = get_groq_model("openai/gpt-oss-120b")
agent = create_agent(
    model=model,
    system_prompt="you are a helpful assistant",
    tools=[get_date_and_time]
)
```

#### Message invoking

You can then invoke the agent using the messages convention:

```py
response = agent.invoke({
    "messages": [
        {
            "role": "user",
            "content": "What is the current date and time?"
        }
    ]
})
print(response["messages"][-1].content)
```

## Langchain TS

### Basics

Langchain provides the following

- **Provider abstraction** — swap between OpenAI, Anthropic, and others without changing your application code
- **First-class primitives** — prompt templates, structured output, chains, and more, all with a consistent interface
- **Active ecosystem** — frequent updates and a large community building extensions on top of it

#### Creating models

The nice thing about langchain models is that they all expose the same APIs, creating an abstraction over the different implementation details behind different LLMs.

**llama model**

Here is how you can configure an llm from an ollama model:

```ts
import { ChatOllama } from "npm:@langchain/ollama";

// 1. Set up the Ollama LLM
const llm = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "llama3.2",
  temperature: 0,
  maxRetries: 0,
});

const result = await llm.invoke("What is the capital of France?");
console.log(result);
```

#### invoke + prompt template

There are essentially three ways to query an LLM in langchain:

1. Using `llm.invoke()` and passing in a one time promtp
2. Using `llm.invoke()` and passing in an array of tuples, where each 2-element string tuple represents a message in the chat history.

- `llm.invoke(prompt)`: takes in a prompt and returns the result along with its metadata.
- `llm.invoke(messages)`: takes in an array of chat messages, each message a tuple, and returns the result along with its metadata.

You can also use chat prompt templates with message history:

Here is an example of how to use chat prompt templates to simplify the pipeline of injecting variables into chat history, making it configurable for each invocation.

```ts
import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a helpful assistant that translates {input_language} to {output_language}.",
  ],
  ["human", "{input}"],
]);

const chain = prompt.pipe(llm);
await chain.invoke({
  input_language: "English",
  output_language: "German",
  input: "I love programming.",
});
```

And here is a complete class put together:

```ts
import { ChatOllama, ChatOllamaCallOptions } from "npm:@langchain/ollama";
import { ChatPromptTemplate } from "npm:@langchain/core/prompts";

export class OllamaLangchain {
  private llm: ChatOllama;

  constructor(model: string, options: ChatOllamaCallOptions = {}) {
    this.llm = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: model,
      maxRetries: 0,
      ...options,
    });
  }

  async invoke(prompt: string) {
    return await this.llm.invoke(prompt);
  }

  async invokeWithMessages(messageTuples: [string, string][]) {
    return await this.llm.invoke(messageTuples);
  }

  createChain<T extends Record<string, unknown>>(
    messageTuples: [string, string][]
  ) {
    const prompt = ChatPromptTemplate.fromMessages(messageTuples);
    const chain = prompt.pipe(this.llm);
    return {
      chain,
      invokeChain: async (data: T) => {
        return await chain.invoke(data);
      },
    };
  }
}

export class MessageCreator {
  static createMessage(
    role: "user" | "assistant" | "system" | "tool",
    content: string
  ) {
    return [role, content];
  }

  static createSystemMessage(content: string) {
    return this.createMessage("system", content);
  }

  static createUserMessage(content: string) {
    return this.createMessage("user", content);
  }

  static createAssistantMessage(content: string) {
    return this.createMessage("assistant", content);
  }

  static createToolMessage(content: string) {
    return this.createMessage("tool", content);
  }
}
```

#### Tool use

Here is how you can easily create tools based on a zod schema, bind that to a langchain LLM:

```ts
import { tool } from "@langchain/core/tools";
import { ChatOllama } from "@langchain/ollama";
import { z } from "zod";

// 1. create the tool
const weatherTool = tool(
  ({ location }) => {
    return `The weather in ${location} is sunny`;
  },
  {
    name: "get_current_weather",
    description: "Get the current weather in a given location",
    schema: z.object({
      location: z
        .string()
        .describe("The city and state, e.g. San Francisco, CA"),
    }),
  }
);

// 2. ollama
const llmForTool = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "llama3.2",
  maxRetries: 0,
});

// 3. Bind the tool to the model, returns a new model with those tools
const llmWithTools = llmForTool.bindTools([weatherTool]);

const resultFromTool = await llmWithTools.invoke(
  "What's the weather like today in San Francisco? Ensure you use the 'get_current_weather' tool."
);

console.log(resultFromTool);
```

This is what the tool response looks like:

```ts
AIMessage {
  "content": "",
  "additional_kwargs": {},
  "response_metadata": {
    "model": "llama3-groq-tool-use",
    "created_at": "2024-08-01T18:43:13.2181Z",
    "done_reason": "stop",
    "done": true,
    "total_duration": 2311023875,
    "load_duration": 1560670292,
    "prompt_eval_count": 177,
    "prompt_eval_duration": 263603000,
    "eval_count": 30,
    "eval_duration": 485582000
  },
  "tool_calls": [
    {
      "name": "get_current_weather",
      "args": {
        "location": "San Francisco, CA"
      },
      "id": "c7a9d590-99ad-42af-9996-41b90efcf827",
      "type": "tool_call"
    }
  ],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "input_tokens": 177,
    "output_tokens": 30,
    "total_tokens": 207
  }
}
```

And here is my abstraction over using tools:

```ts
import { ChatOllama, ChatOllamaCallOptions } from "npm:@langchain/ollama";
import { ChatPromptTemplate } from "npm:@langchain/core/prompts";
import { tool, DynamicStructuredTool } from "npm:@langchain/core/tools";
import { z } from "npm:zod";

export class OllamaLangchain {
  private llm: ChatOllama;

  static createTool = tool;

  constructor(model: string, options: ChatOllamaCallOptions = {}) {
    this.llm = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: model,
      maxRetries: 0,
      ...options,
    });
  }

  addTools(tools: DynamicStructuredTool[]) {
    const toolLLM = this.llm.bindTools(tools);
    return toolLLM;
  }

 // ... rest of tools
}
```

```ts
import { ChatOllama } from "npm:@langchain/ollama";
import { OllamaLangchain } from "./OllamaLangchain.ts";
import { z } from "npm:zod";

const ollamaLangchain = new OllamaLangchain("llama3.2:latest");

const weatherTool = OllamaLangchain.createTool(
  ({ location }) => {
    return `The weather in ${location} is sunny`;
  },
  {
    name: "get_current_weather",
    description: "Get the current weather in a given location",
    schema: z.object({
      location: z
        .string()
        .describe("The city and state, e.g. San Francisco, CA"),
    }),
  }
);

const newLlm = ollamaLangchain.addTools([weatherTool]);

const response = await newLlm.invoke(
  "What is the current weather in San Francisco? Use the weather tool to get the weather. Ensure you use the 'get_current_weather' tool."
);
console.log(response);
```

#### Adding images

The `HumanMessage` and `AIMessage` classes are encapsulated ways around providing conversions to message history format.

In this example, it shows how to pass in an image as a user message:

```ts
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";
import * as fs from "node:fs/promises";

const imageData = await fs.readFile("../../../../../examples/hotdog.jpg");
const llmForMultiModal = new ChatOllama({
  model: "llava",
  baseUrl: "http://127.0.0.1:11434",
});
const multiModalRes = await llmForMultiModal.invoke([
  new HumanMessage({
    content: [
      {
        type: "text",
        text: "What is in this image?",
      },
      {
        type: "image_url",
        image_url: `data:image/jpeg;base64,${imageData.toString("base64")}`,
      },
    ],
  }),
]);
console.log(multiModalRes);
```

#### Structured outputs

Llama models have a thing called `"json"` mode which forces all responses to be structured outputs in JSON format. Unfortunately, they do not follow the structured output spec of zod converting to structured output JSON, but you can get similar results by passing in the `"format": "json"` option when instantiating the model:

```ts
const ollamaLangchain = new OllamaLangchain("llama3.2:latest", {
  format: "json",
});

const promptForJsonMode = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an expert translator. Format all responses as JSON objects with two keys: "original" and "translated".`,
  ],
  ["human", `Translate "{input}" into {language}.`],
]);

const chainForJsonMode = promptForJsonMode.pipe(ollamaLangchain.llm);

const resultFromJsonMode = await chainForJsonMode.invoke({
  input: "I love programming",
  language: "German",
});

console.log(JSON.parse(resultFromJsonMode.content as string));
```






