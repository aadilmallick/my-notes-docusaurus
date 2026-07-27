## AI Engineering basics

### LLM hyperparameters

These are the important LLM hyperparameters you can tweak:

- **temperature**: the "randomness" of the model, a value between 0-2. The higher this vallue, the more random the model will be, and the lower the value, the less random.
	- If temperature is set to 0, you will get back the same output every single time.
- **top k**: Used to configure that the LLM will only choose from the top `k` candidates with the highest probability of being the next token.
	- The lower this value, like 1 (the lowest it can be), the more deterministic the LLM is, selecting only the most likely token every single time.
- **top p**: a value between 0-1 representing the percentage of cumulative probability you need in the candidate pool. The higher this value, the more tokens will be considered. The lower this value, the less tokens will be considered as candidates.
	- For example, if you set top p to 90%, then the LLM will consider as many tokens as it takes until their cumulative likeliness probability for being the next token reaches the threshold of 90%.
### History management techniques

How do you stop an AI chat from running out of context in a long-term chat? Well there are three main techniques:

- **window sliding**: Only include the most recent `n` messages. 
	- This technique prioritizes new context over old context, completely discarding the old.
- **summarization**: Summarize all past messages and put it in a system prompt.
- **context-specific summarization**: Summarize all past messages but partition them into summaries of new content, old content, and primordial content.

The best kind of technique is a combination of window sliding and summarization, where you summarize all past messages except the `n` most recent, and then use window sliding for the rest.

Here are a few important things to keep in mind when implementing these techniques:

- Don't include tool calls in message history.

### Tool calling and agent capabilities

The basic idea of tool calling is where you describe functions you create in terms of their intended purpose, the arguments (types, description) that the function takes in, and what it returns, and that is a **tool**.

You then pass these tools to the AI, and based on your prompt, it will decide if it's suitable for using tools. If so, then it will follow these three steps:

1. Choose a tool whose description would most closely match the prompt
2. Extract the parameters from the prompt, using structured output to get back the parameters in a format that's easy to call the tool with. 
3. Returns the tool name, and the args to pass in

The onus is now on you to parse those arguments, call your tool programmatically, and then add to the chat history a tool result message, where you s

The basic steps of exposing tools to any openai compatible API is as follows:

1. Generate a list of tools via tools schema, and provide that to the model when generating a response from a prompt.
2. Access the specific tool called by checking the `tool_calls` property on the response, parse the arguments, and run the function that was called with the arguments provided from the LLM.
3. Pass in the results of you calling your function as a special tool message in this format:

```ts
{
	role: "assistant"
	content: `Tool call: ${toolCallName}, Tool result: ${toolCallResult}`
}
```

An agentic loop is based on constantly calling tools in a loop until the ai decides on a final response. 

Here is a pseudocode example:

```ts
while (!taskComplete) {
  // 1. Get LLM response
  const response = await llm.chat(messages)

  // 2. If LLM wants to call a function
  if (response.tool_calls) {
    const result = await executeFunction(response.tool_calls)
    messages.push(toolResponse(result))
    continue
  }

  // 3. If LLM gives final answer
  if (isTaskComplete(response)) {
    taskComplete = true
  }
}
```
## OpenAI API

You can use the open ai sdk like so, where it needs the `OPENAI_API_KEY` environment variable set.

```ts
import OpenAI from "npm:openai";

const openai = new OpenAI();
```

#### Basic text prompting

Text prompting with the CLI is based on messages which represent memory, which is an array of objects that represents messages of 4 types:

- `"user"`: message by a user
- `"assistant"`: message by the chatbot
- `"system"`: system message for the AI to get preliminary instructions on its task and purpose.
- `"tool"`: for tool calls

```ts
export class OpenAiChat<
  T extends {
    createdAt: Date;
  } = {
    createdAt: Date;
  }
> {
  private openai: OpenAI;
  private messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  constructor(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
    this.openai = new OpenAI();
    this.messages = messages || this.messages
  }



  addSystemMessage(message: string) {
    this.messages.push({ role: "system", content: message });
  }

  async prompt(prompt: string) {
    this.messages.push({ role: "user", content: prompt });

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      messages: this.messages,
    });

    const text = response.choices[0].message.content;

    this.messages.push({
      role: "assistant",
      content: text,
    });

    return text;
  }
}
```

#### Tool calling

**manual way**

You would define your tools in a structured output sort of format so you can deterministically get valid parameter inputs, which then let you programmatically execute the function binded to a tool call.

A tool definition would look like this:

- We define two tools here, one called `get_weather` and the other called `get_stock_price`.

```ts
const functions = [
  {
    name: 'get_weather',
    description: 'Get current weather for a city',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name'
        }
      },
      required: ['location']
    }
  },
  {
    name: 'get_stock_price',
    description: 'Get current stock price',
    parameters: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol'
        }
      },
      required: ['symbol']
    }
  }
];
```

The basic flow of tool calling via the OpenAI API is as follows:

1. Send a chat completion prompt, passing the tools available.
2. Get back the llm response and parse the extracted tool name the LLM decides to use, and any args it passes through the `response.tool_calls` array.
3. Use the args and tool name to execute a function programmatically with those arguments. Return the result of the function execution as a `'tool'` role message, passing in the the tool call id and the return value.
4. The LLM then returns a response based on the tool result.

> [!IMPORTANT]
> Whatever tool result you pass to the tool message must be a string.

```ts
// 1. User Message
{
  role: 'user',
  content: 'What's the weather like in London?'
}

// 2. LLM Response with Function Call
{
  role: 'assistant',
  content: null,
  tool_calls: [{
    id: 'call_abc123',
    type: 'function',
    function: {
      name: 'get_weather',
      arguments: '{"location":"London"}'
    }
  }]
}

// 3. Function Execution Result
{
  role: 'tool',
  content: '{"temperature": 18, "condition": "cloudy"}',
  tool_call_id: 'call_abc123'
}

// 4. Final LLM Response
{
  role: 'assistant',
  content: 'The weather in London is currently cloudy with a temperature of 18°C.'
}
```

The most important thing to understand is that a `role: "tool"` message must ALWAYS be provided after a `tool_calls` is provided by the assistant, even if you don't decide to call the tool.

**tool approval**

In your app logic, you can make an agent have to manually approve a tool trhough a human in the loop sort of structure, skipping executing the tool if permission is not given. The basic flow is like so:

1. Agent wants to call tool, push message with `tool_calls` to history.
2. If tool that is being called is in list of sensitive permission tools, have some sort of permission validation logic requiring human input that returns a boolean whether to approve or not. 
3. If approved, invoke the tool function with the args and add the tool result content to a new `role: "tool"` message, add that to history
4. If not approved, add a `role: "tool"` message to history with content being something like "executing tool was not approved"


**new way**

The new of using tools is to create tools from zod schemas using the `zodFunction` helper.

First, you have to create the tool:

```ts
export class Tool<T extends z.ZodObject<any>> {
  constructor(
    public name: string,
    public description: string,
    public parameters: T,
    public cb: (args: z.infer<T>) => Record<string, any>
  ) {}

  execute(args: z.infer<T>) {
    return JSON.stringify(this.cb(args));
  }
}
```

And this is how you can create tools from zod schema definitions and pass them to openai.

```ts
import { zodFunction } from "npm:openai/helpers/zod";

  async promptWithTools<R extends z.ZodObject<any>>(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    tools: readonly Tool<R>[]
  ) {
    const newMessages = [...messages];
    let response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      messages: newMessages,
      tools: tools.map(zodFunction),
      tool_choice: "auto",
      parallel_tool_calls: false,
    });

    let result = {
      tool_calls: response.choices[0].message.tool_calls,
      content: response.choices[0].message.content,
      toolWasRun: (response.choices[0].message.tool_calls?.length ?? 0) > 0,
    };
    newMessages.push(response.choices[0].message);

    const maxDepth = 10;
    let depth = 0;

    while (result.toolWasRun && depth < maxDepth) {
      depth++;
      const toolCall = result.tool_calls![0];
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);
      const tool = tools.find((t) => t.name === toolName);
      if (tool) {
        console.log("Executing tool:", toolName);
        const functionResultContent = tool.execute(toolArgs);
        // 1. push tool execution
        newMessages.push({
          role: "tool",
          content: functionResultContent,
          tool_call_id: toolCall.id,
        });
        // 2. get back response
        response = await this.openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.1,
          messages: newMessages,
        });
        result = {
          tool_calls: response.choices[0].message.tool_calls,
          content: response.choices[0].message.content,
          toolWasRun: (response.choices[0].message.tool_calls?.length ?? 0) > 0,
        };
        // if rsponse is asking for more tools, repeat
        newMessages.push(response.choices[0].message);
      }
    }

    return {
      content: result.content,
      messages: newMessages,
    };
  }
```

Then this is how you would use the tool:

```ts
const openAi = OpenAiModel.createBasicOpenAI(Deno.env.get("OPENAI_API_KEY")!);
// const response = await ollamaModel.prompt("how are you?", []);
// console.log(response);

const weatherTool = new OpenAITool(
  "weather_tool",
  "gets the current weather in a specific city",
  z.object({
    city: z.string().describe("the city to get the weather for"),
  }),
  async (args) => {
    return {
      weatherResult: `the weather in ${args.city} is super sunny!`,
    };
  }
);

const response = await openAi.promptWithTools(
  [
    {
      role: "system",
      content:
        "you are a friendly assisant who has access to these tools: weather_tool. Based on the chat history, which may include tool calls & results, answer the prompts appropriately.",
    },
    {
      role: "user",
      content: "what is the current weather in Chicago?",
    },
  ],
  [weatherTool]
);

console.log(response);
```

#### Creating images

```ts
export class OpenAiModel {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI();
  }

  async createImage(
    prompt: string,
    size: "1024x1024" | "512x512" | "256x256" = "1024x1024"
  ) {
    const response = await this.openai.images.generate({
      n: 1,
      size: size,
      prompt: prompt,
      model: "dall-e-3",
    });
    return response.data?.[0]?.url; // returns url
  }
```

#### Complete abstraction

```ts
import OpenAI from "npm:openai";
import { z } from "npm:zod";
import { zodFunction } from "npm:openai/helpers/zod";

export class OpenAiModel {
  constructor(public openai: OpenAI, public readonly modelName: string) {}

  static createBasicOpenAI(apiKey: string, modelName = "gpt-4o-mini") {
    return new OpenAiModel(
      new OpenAI({
        apiKey,
      }),
      modelName
    );
  }

  static createOllamaAI(modelName: string) {
    return new OpenAiModel(
      new OpenAI({
        baseURL: "http://localhost:11434/v1",
        apiKey: "ollama",
      }),
      modelName
    );
  }

  async createImage(
    prompt: string,
    size: "1024x1024" | "512x512" | "256x256" = "1024x1024"
  ) {
    const response = await this.openai.images.generate({
      n: 1,
      size: size,
      prompt: prompt,
      model: "dall-e-3",
    });
    return response.data?.[0]?.url;
  }

  async prompt(
    prompt: string,
    history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []
  ) {
    const response = await this.openai.chat.completions.create({
      model: this.modelName,
      temperature: 0.1,
      messages: [...history, { role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  }

  async promptWithMessages(
    history: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  ) {
    const response = await this.openai.chat.completions.create({
      model: this.modelName,
      temperature: 0.1,
      messages: history,
    });

    return {
      history: [
        ...history,
        {
          role: "assistant",
          content: response.choices[0].message.content,
        },
      ] as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      content: response.choices[0].message.content,
    };
  }

  async promptWithTools<R extends z.ZodObject<any>>(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    tools: readonly OpenAITool<R>[]
  ) {
    const newMessages = [...messages];
    let response = await this.openai.chat.completions.create({
      model: this.modelName,
      temperature: 0.1,
      messages: newMessages,
      tools: tools.map(zodFunction),
      tool_choice: "auto",
      parallel_tool_calls: false,
    });

    let result = {
      tool_calls: response.choices[0].message.tool_calls,
      content: response.choices[0].message.content,
      toolWasRun: (response.choices[0].message.tool_calls?.length ?? 0) > 0,
    };
    newMessages.push(response.choices[0].message);

    const maxDepth = 5;
    let depth = 0;

    while (result.toolWasRun && depth < maxDepth) {
      depth++;
      const toolCall = result.tool_calls![0];
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);
      const tool = tools.find((t) => t.name === toolName);
      if (tool) {
        console.log("Executing tool:", toolName);
        const functionResultContent = await tool.execute(toolArgs);
        // 1. push tool execution
        newMessages.push({
          role: "tool",
          content: functionResultContent,
          tool_call_id: toolCall.id,
        });
        // 2. get back response
        response = await this.openai.chat.completions.create({
          model: this.modelName,
          temperature: 0.1,
          messages: newMessages,
        });
        result = {
          tool_calls: response.choices[0].message.tool_calls,
          content: response.choices[0].message.content,
          toolWasRun: (response.choices[0].message.tool_calls?.length ?? 0) > 0,
        };
        // if rsponse is asking for more tools, repeat
        newMessages.push(response.choices[0].message);
      }
    }

    return {
      content: result.content,
      messages: newMessages,
    };
  }
}

interface MemoryStrategy {
  modifyMessages: (
    messages: OpenAI.Chat.ChatCompletionMessageParam[]
  ) =>
    | OpenAI.Chat.ChatCompletionMessageParam[]
    | Promise<OpenAI.Chat.ChatCompletionMessageParam[]>;
}

export class WindowSlidingStrategy implements MemoryStrategy {
  constructor(public readonly n: number, private systemMessage?: string) {}
  modifyMessages(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
    return [
      {
        role: "system",
        content: this.systemMessage,
      },
      ...messages.slice(-this.n),
    ] as OpenAI.Chat.ChatCompletionMessageParam[];
  }
}

export class SummarizationStrategy implements MemoryStrategy {
  constructor(
    public openaiModel: OpenAiModel,
    private systemMessage?: string
  ) {}
  async modifyMessages(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
    const summary = await this.openaiModel.prompt(
      "Your task is to summarize the entire chat history. Just return the summary, and nothing else.",
      messages
    );
    return [
      {
        role: "system",
        content: `${
          this.systemMessage || "you are a helpful assistant"
        }. This is the summary of the entire conversation history up till now:\n\n${summary}`,
      },
    ] as OpenAI.Chat.ChatCompletionMessageParam[];
  }
}

export class SummarizationAndSlidingStrategy implements MemoryStrategy {
  constructor(
    public openaiModel: OpenAiModel,
    public readonly n: number,
    private systemMessage?: string
  ) {}
  async modifyMessages(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
    const summary = await this.openaiModel.prompt(
      "Your task is to summarize the entire chat history. Just return the summary, and nothing else.",
      messages
    );
    return [
      {
        role: "system",
        content: `${
          this.systemMessage || "you are a helpful assistant"
        }. This is the summary of older messages in the conversation history:\n\n${summary}`,
      },
      ...messages.slice(-this.n),
    ] as OpenAI.Chat.ChatCompletionMessageParam[];
  }
}

export class OpenAiChat<T extends Record<string, any>> {
  private messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  private storedMessages: (OpenAI.Chat.ChatCompletionMessageParam & T)[] = [];
  private metadataSetter?: () => T;
  private strategy?: MemoryStrategy;
  private systemMessage?: string;
  private openAiModel: OpenAiModel;
  constructor(public openai: OpenAI, public readonly modelName: string) {
    this.openAiModel = new OpenAiModel(openai, modelName);
  }

  isChatEmpty() {
    return this.messages.length === 0;
  }

  setMetadata(cb: () => T) {
    this.metadataSetter = cb;
  }

  getSystemMessage() {
    return this.systemMessage;
  }

  setStrategy(strategy: MemoryStrategy) {
    this.strategy = strategy;
  }

  private async implementStrategy() {
    if (this.strategy) {
      this.messages = await this.strategy.modifyMessages(this.messages);
    }
  }

  private get metadata() {
    return {
      ...this.metadataSetter?.(),
    };
  }

  async saveToFile(filePath: string) {
    if (filePath.endsWith(".json")) {
      await Deno.writeTextFile(
        filePath,
        JSON.stringify(this.storedMessages, null, 2)
      );
    } else if (filePath.endsWith(".md")) {
      await Deno.writeTextFile(
        filePath,
        this.storedMessages
          .map((message) => `**${message.role}**\n${message.content}`)
          .join("\n\n")
      );
    }
  }

  async loadFromFile(filePath: string) {
    const content = await Deno.readTextFile(filePath);
    this.storedMessages = JSON.parse(content);
    // @ts-ignore
    this.messages = this.storedMessages.map((message) => {
      const base = {
        role: message.role,
        content: message.content,
      };
      if ("name" in message && message.name) {
        // @ts-expect-error: name is only valid for some roles
        base["name"] = message.name;
      }
      return base;
    });
    this.systemMessage = this.messages.find(
      (message) => message.role === "system"
    )?.content as string | undefined;
  }

  addSystemMessage(message: string) {
    if (this.systemMessage) {
      return;
    }
    this.messages.push({ role: "system", content: message });
    this.storedMessages.push({
      role: "system",
      content: message,
      ...this.metadata,
    });
    this.systemMessage = message;
  }

  private addMessageToHistory(role: "user" | "assistant", content: string) {
    this.messages.push({
      role,
      content,
    });
    this.storedMessages.push({
      role,
      content,
      ...this.metadata,
    });
  }

  private async runLLM() {
    const response = await this.openAiModel.promptWithMessages(this.messages);

    const text = response.content;

    this.addMessageToHistory("assistant", text!);
    this.implementStrategy();

    return text!;
  }

  async prompt(prompt: string) {
    this.addMessageToHistory("user", prompt);

    const response = await this.openai.chat.completions.create({
      model: this.modelName,
      temperature: 0.1,
      messages: this.messages,
    });

    const text = response.choices[0].message.content;

    this.addMessageToHistory("assistant", text!);
    this.implementStrategy();

    return text;
  }

  private async handleToolApprovals<R extends z.ZodObject<any>>(
    tools: readonly OpenAITool<R>[],
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
    onAskPermission?: (tool: OpenAITool<R>) => Promise<boolean>
  ) {
    if (!onAskPermission) {
      return true;
    }
    const toolApprovals = tools.filter(
      (tool) =>
        tool.needsPermission &&
        toolCalls.some((call) => call.function.name === tool.name)
    );
    if (toolApprovals.length > 0) {
      const permission = await onAskPermission(toolApprovals[0]);
      return permission;
    }
    return true;
  }

  async promptWithTools<R extends z.ZodObject<any>>(
    prompt: string,
    tools: readonly OpenAITool<R>[],
    onAskPermission?: (tool: OpenAITool<R>) => Promise<boolean>
  ) {
    this.addMessageToHistory("user", prompt);

    const mappedTools = tools.map(zodFunction);

    let response = await this.openai.chat.completions.create({
      model: this.modelName,
      temperature: 0.1,
      messages: this.messages,
      tools: mappedTools,
      tool_choice: "auto",
      parallel_tool_calls: false,
    });

    let result = {
      tool_calls: response.choices[0].message.tool_calls,
      content: response.choices[0].message.content,
      toolWasRun: (response.choices[0].message.tool_calls?.length ?? 0) > 0,
    };

    if (!result.toolWasRun) {
      this.addMessageToHistory("assistant", result.content!);
    } else {
      const toolUseIsApproved = await this.handleToolApprovals(
        tools,
        result.tool_calls!,
        onAskPermission
      );
      if (toolUseIsApproved) {
        this.messages.push(response.choices[0].message);
      } else {
        this.messages.push(response.choices[0].message);
        this.messages.push({
          role: "tool",
          content: "tool use was not approved",
          tool_call_id: response.choices[0].message.tool_calls![0].id,
        });
        return this.runLLM();
      }
    }

    const maxDepth = 5;
    let depth = 0;

    console.log(this.messages);

    while (result.toolWasRun && depth < maxDepth) {
      depth++;
      const toolCall = result.tool_calls![0];
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);
      const tool = tools.find((t) => t.name === toolName);
      if (tool) {
        console.log("Executing tool:", toolName);
        const functionResultContent = await tool.execute(toolArgs);
        // 1. push tool execution
        this.messages.push({
          role: "tool",
          content: functionResultContent,
          tool_call_id: toolCall.id,
        });
        // this.storedMessages.push({
        //     role: "tool",
        //     content: functionResultContent,
        //     tool_call_id: toolCall.id,
        //     ...this.
        //   });
        // 2. get back response
        response = await this.openai.chat.completions.create({
          model: this.modelName,
          temperature: 0.1,
          messages: this.messages,
          tools: mappedTools,
          tool_choice: "auto",
          parallel_tool_calls: false,
        });
        result = {
          tool_calls: response.choices[0].message.tool_calls,
          content: response.choices[0].message.content,
          toolWasRun: (response.choices[0].message.tool_calls?.length ?? 0) > 0,
        };
        if (!result.toolWasRun) {
          this.addMessageToHistory("assistant", result.content!);
        } else {
          const toolUseIsApproved = await this.handleToolApprovals(
            tools,
            result.tool_calls!,
            onAskPermission
          );
          if (toolUseIsApproved) {
            this.messages.push(response.choices[0].message);
          } else {
            this.messages.push(response.choices[0].message);
            this.messages.push({
              role: "tool",
              content: "tool use was not approved",
              tool_call_id: response.choices[0].message.tool_calls![0].id,
            });
            return this.runLLM();
          }
        }
      }
    }

    this.implementStrategy();

    return result.content;
  }
}

export class OpenAITool<T extends z.ZodObject<any>> {
  constructor(
    public name: string,
    public description: string,
    public parameters: T,
    public cb: (args: z.infer<T>) => Promise<Record<string, any>>
  ) {}

  public needsPermission: boolean = false;
  public setNeedsPermission(permission: boolean) {
    this.needsPermission = permission;
  }

  async execute(args: z.infer<T>) {
    try {
      return JSON.stringify(await this.cb(args));
    } catch {
      return `error: tool ${this.name} not able to be called`;
    }
  }
}
```

### OpenAI Compatibility API

Using the open ai compatibility API, you can connnect different models and use the same exact openAI syntax for all of them, except some may not be able to to use tools or have multimodality.

#### Google connection

```ts
const openai = new OpenAI({
  apiKey: GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
});

const response = await openai.chat.completions.create({
  model: 'gemini-2.0-flash',
  messages: [
    {role: 'system', content: 'You are a helpful assistant.'},
    {
      role: 'user',
      content: 'Explain to me how AI works',
    },
  ],
});

```
## Google Genai

#### Intro

1. Install with `npm install @google/generative-ai`
2. Instantiate model like so:

```ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Get model instance
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Popular models:
// - gemini-pro: Best for text tasks
// - gemini-pro-vision: For image + text tasks
// - gemini-1.5-pro: Latest with larger context
// - gemini-1.5-flash: Faster, more efficient

// get model instance with configuration
const model2 = genAI.getGenerativeModel({
  model: "gemini-pro",
  generationConfig: {
    temperature: 0.7,        // Creativity (0.0-1.0)
    topK: 40,               // Top-K sampling
    topP: 0.95,             // Top-P sampling
    maxOutputTokens: 1024,   // Max response length
    stopSequences: ["END"]   // Stop generation at these sequences
  }
});
```

#### Basic model calling

- `model.generateContent(prompt)`: returns the AI response
- `model.generateContentStream(prompt)`: returns the AI response as a stream

```ts
async function generateText() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = "Write a short poem about AI";
  const result = await model.generateContent(prompt);
  
  console.log(result.response.text());
}

async function streamText() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = "Tell me a long story about space exploration";
  const result = await model.generateContentStream(prompt);
  
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
  }
}
```

#### chat session

Google genai package offers their own class for keeping track of message history in memory.

```ts
async function chatExample() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  // Start chat with optional history
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello, I'm interested in learning about AI." }]
      },
      {
        role: "model",
        parts: [{ text: "Hello! I'd be happy to help you learn about AI. What specific aspect interests you most?" }]
      }
    ]
  });
  
  // Send message
  const result = await chat.sendMessage("Tell me about machine learning");
  console.log(result.response.text());
  
  // Continue conversation
  const result2 = await chat.sendMessage("What are some practical applications?");
  console.log(result2.response.text());
}
```

You can also stream chat responses like so:

```ts
async function streamingChat() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const chat = model.startChat();
  
  const result = await chat.sendMessageStream("Explain quantum computing in detail");
  
  for await (const chunk of result.stream) {
    process.stdout.write(chunk.text());
  }
}
```

#### Structured outputs

Here is how you can use structured outputs:

```ts
async function structuredOutput() {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          recipes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                ingredients: {
                  type: "array",
                  items: { type: "string" }
                },
                instructions: {
                  type: "array",
                  items: { type: "string" }
                },
                prep_time: { type: "string" },
                difficulty: {
                  type: "string",
                  enum: ["easy", "medium", "hard"]
                }
              },
              required: ["name", "ingredients", "instructions"]
            }
          }
        }
      }
    }
  });
  
  const prompt = "Give me 2 easy pasta recipes";
  const result = await model.generateContent(prompt);
  
  const jsonResponse = JSON.parse(result.response.text());
  console.log(jsonResponse);
}
```

#### Image generation

```ts
async function generateImage() {
  const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });
  
  const prompt = "A serene mountain landscape with a crystal-clear lake reflecting snow-capped peaks";
  
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });
  
  // Get image data
  const imageData = result.response.candidates[0].content.parts[0].inlineData;
  
  // Save image
  const fs = require('fs');
  const buffer = Buffer.from(imageData.data, 'base64');
  fs.writeFileSync('generated_image.png', buffer);
}
```

#### Image and file analysis

By pass in a message with `inlineData` property, you can send binary data of any mime type to the AI.

```ts
async function analyzeImage() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  
  // Read image file
  const fs = require('fs');
  const imageBuffer = fs.readFileSync('path/to/image.jpg');
  const imageBase64 = imageBuffer.toString('base64');
  
  const prompt = "Describe this image in detail and identify any objects, people, or activities";
  
  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64
      }
    }
  ]);
  
  console.log(result.response.text());
}
```

#### Embeddings

```ts
async function getTextEmbeddings() {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  
  const texts = [
    "The quick brown fox jumps over the lazy dog",
    "Machine learning is a subset of artificial intelligence",
    "Python is a popular programming language for data science"
  ];
  
  const embeddings = [];
  
  for (const text of texts) {
    const result = await model.embedContent(text);
    embeddings.push({
      text: text,
      embedding: result.embedding.values
    });
  }
  
  return embeddings;
}
```

```ts
function calculateCosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function findSimilarDocuments(query, documentEmbeddings) {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  
  // Get query embedding
  const queryResult = await model.embedContent(query);
  const queryEmbedding = queryResult.embedding.values;
  
  // Calculate similarities
  const similarities = documentEmbeddings.map(doc => ({
    ...doc,
    similarity: calculateCosineSimilarity(queryEmbedding, doc.embedding)
  }));
  
  // Sort by similarity
  return similarities.sort((a, b) => b.similarity - a.similarity);
}
```

#### Model info

```ts
async function countTokens() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = "Tell me about the history of artificial intelligence";
  const result = await model.countTokens(prompt);
  
  console.log('Total tokens:', result.totalTokens);
  console.log('Prompt tokens:', result.promptTokens);
}

async function getModelInfo() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const info = await model.getModel();
  console.log('Model name:', info.name);
  console.log('Version:', info.version);
  console.log('Input token limit:', info.inputTokenLimit);
  console.log('Output token limit:', info.outputTokenLimit);
}
```

#### Best practices

**messaging queue**

Here is a reusable way to generate AI messages through a messaging queue:

```ts
// Implement proper resource management
class GeminiClient {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.requestQueue = [];
    this.processing = false;
  }
  
  async generateContent(prompt, options = {}) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ prompt, options, resolve, reject });
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.processing || this.requestQueue.length === 0) return;
    
    this.processing = true;
    const { prompt, options, resolve, reject } = this.requestQueue.shift();
    
    try {
      const model = this.genAI.getGenerativeModel(options);
      const result = await model.generateContent(prompt);
      resolve(result.response.text());
    } catch (error) {
      reject(error);
    } finally {
      this.processing = false;
      // Process next item
      setTimeout(() => this.processQueue(), 100);
    }
  }
}
```
## Vercel AI

The great thing about the `ai` npm package from vercel is that it is **model-agnostic**, meaning it's just plug and play with different models and no need to learn different APIs for google, claude, OpenAI, etc.

You can create a simple model like so:

```ts
import { openai } from "@ai-sdk/openai";

const model = openai("gpt-4o-mini")

const { text } = await generateText({
  model: model,
  prompt: "What is the diameter of the sun?",
  system: "you are a friendly AI assistant",
});
```

#### Text features

Here is a class wrapper around the AI library, providing abstractions over these different text generation methods from the `ai` package.

- `generateText(options)`: takes in an object of options and returns the AI's response, complete with finish reason, tool calls, etc.
- `streamText(options)`: takes in an object of options and streams back the AI's response.

#### Structured outputs

```ts
  // 3. JSON example:
  const colorSchema = z.object({
    color: z
      .string()
      .describe("The hex color code") // for prompt engineering
      .refine((color) => color.match(/^#([0-9a-fA-F]{6})$/)),
  });
  const ai = new VercelAI(model);
  const { color } = await ai.getJSONFromPrompt(
    "You are a helpful assistant that generates colors in hexadecimal format as string, like #000000",
    "Generate a random color",
    colorSchema
  );
  console.log("Color: ", color);
```

Here is an example of using structured outputs with the vercel API:

```ts
async function structuredOutputObjectGeneration() {
  const systemPrompt = Deno.readTextFileSync("./structuredoutput.txt");
  const prompt = `
  z.Object({ name: z.string(), age: z.number() }) /nothink
  `;
  const response = await localModel.generateText(prompt, systemPrompt);
  const parsedResponse = response
    .replace("```json", "")
    .replace("```", "")
    .trim();
  console.log(JSON.parse(parsedResponse));
}
```

#### enums

```ts
  const enumValues = [
    "red",
    "very light blue",
    "green",
    "yellow",
    "purple",
  ] as const;
  const ai = new VercelAI(model);
  const classification = await ai.getClassificationFromPrompt(
    "You are a helpful assistant that classifies colors.",
    "What is the color of the sky?",
    enumValues as unknown as string[]
  );
  console.log("Classification: ", classification); // prints "very light blue"
```


#### tOol calls

Tool calls are pretty simple in vercel, but don't work with some providers, like google.

The first step is to create a tool:

```ts
  const addNumbersTool = tool({
    description: "Add two numbers together",
    parameters: z.object({
      a: z.number().describe("The first number to add"),
      b: z.number().describe("The second number to add"),
    }),
    execute: async ({ a, b }) => {
      return a + b;
    },
  });
```

Then you can use it like so, passing in `tools` to the generate text method, and specifying a `maxSteps` so that the AI can recurse on itself and print out actual text from the tool call.

```ts
  static createTool<T extends z.ZodSchema>(
    description: string,
    parameters: T,
    execute: (args: z.infer<T>) => Promise<any>
  ) {
    return tool({
      description,
      parameters,
      execute: async (args) => {
        const result = await execute(args);
        return JSON.stringify(result, null, 2);
      },
    });
  }
  
async callWithTools(prompt: string, systemPrompt: string, tools: ToolSet) {
    const { text, toolCalls, toolResults, steps } = await generateText({
      model: this.model,
      prompt,
      system: systemPrompt,
      tools,
      toolChoice: "auto",
      maxSteps: 3,
    });
    if (toolCalls.length > 0) {
      console.log("tools called");
      const lastToolResult = steps.at(-1);
      if (!lastToolResult) {
        return { text };
      }
      const { toolResults: results } = lastToolResult;
      return {
        text,
        finalToolResult: (results.at(-1) as unknown as any)?.result,
        toolCalls,
        toolResults,
      };
    }
    return { text };
  }
```

You can then use it like so:

```ts
const vercelAI = new VercelAI(model, modelOptions);

async function callWithTools(query: string) {
  const movieSearchTool = VercelAI.createTool(
    "A tool to get the top 5 movies that are most similar to the user's query",
    z.object({
      query: z.string(),
    }),
    async (args) => {
      const results = await vectorStore.similaritySearch(args.query, 5);
      return results;
    }
  );
  const results = await vercelAI.callWithTools({
    prompt: query,
    systemPrompt:
      "You are a helpful assistant that can answer questions about the movie database. You have access to the following tools: movieSearch.",
    tools: {
      movieSearch: movieSearchTool,
    },
  });
  console.log(results.text);
}

await callWithTools("What are some good sci fi movies with aliens?");
```

#### Embeddings

You can use any embeddings model with vercel ai, and use these three important functions from the `ai` package:

- `embed(options)`: Takes in a string and returns its embedding
- `embedMany(options)`: Takes in an array of strings and returns their embeddings
- `cosineSimilarity(emb1, emb2)`: runs a cosine similarity check between two embeddings

```ts
export const embeddingModels = {
  get_lmstudio: (modelName: string) => {
  // 1. create LM studio model
    const model = createOpenAICompatible({
      name: "lmstudio",
      baseURL: `http://localhost:1234/v1`,
      apiKey: "1234567890",
    });

// 2. render text embedding model
    return {
      model: model.textEmbeddingModel(modelName),
      modelOptions: {
        maxRetries: 0,
      },
    };
  },
};
```

Here is the abstraction:

```ts
export class VercelAIEmbedding {
  constructor(
    public readonly model: EmbeddingModel<string>,
  ) {}

  async embedOne(text: string) {
    const response = await embed({
      model: this.model,
      value: text,
    });
    return response.embedding;
  }

  async embedMany(texts: string[]) {
    const response = await embedMany({
      model: this.model,
      values: texts,
    });
    return {
      embeddings: response.embeddings,
      createVectorStore: () => {
        const vectorDatabase = response.embeddings.map((embedding, index) => ({
          value: texts[index],
          embedding,
        }));
        return vectorDatabase;
      },
    };
  }

  async getNearestNeighbors(
    text: string,
    k: number,
    vectorDatabase: {
      value: string;
      embedding: Embedding;
    }[]
  ) {
    const response = await this.embedOne(text);
    const entries = vectorDatabase
      .map((entry) => {
        return {
          value: entry.value,
          similarity: cosineSimilarity(entry.embedding, response),
        };
      })
      .sort((a, b) => b.similarity - a.similarity);
    return entries.slice(0, Math.min(k, entries.length));
  }
}
```

ANd you can use it like so:

```ts
const { model: embeddingModel, modelOptions: embeddingModelOptions } =
  embeddingModels.get_lmstudio("text-embedding-nomic-embed-text-v1.5");
const lmStudioEmbeddings = new VercelAIEmbedding(embeddingModel);

async function getNearestNeighbors() {
  const { createVectorStore, embeddings } = await lmStudioEmbeddings.embedMany([
    "dog",
    "cat",
    "bird",
    "fish",
    "horse",
    "rabbit",
    "snake",
    "tiger",
  ]);
  const vectorDatabase = createVectorStore();
  const nearestNeighbors = await lmStudioEmbeddings.getNearestNeighbors(
    "eagle",
    3,
    vectorDatabase
  );
  console.log(nearestNeighbors);
}
```

#### FIles and images

This is how you can add images and files to your messages, by passing them in as base 64.

```ts
export const describeImage = async (imageUrl: string) => {
  const base64 = await fetch(imageUrl)
    .then((res) => res.arrayBuffer())
    .then((buffer) => Buffer.from(buffer).toString("base64"));
  const { text } = await generateText({
    model: localModel.model,
    system:
      `You will receive an image. ` +
      `Please create an alt text for the image. ` +
      `Be concise. ` +
      `Use adjectives only when necessary. ` +
      `Do not pass 160 characters. ` +
      `Use simple language. `,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            image: base64,
          },
        ],
      },
    ],
  });

  return text;
};
```

#### Text abstraction

```ts
export class VercelAI {
  constructor(
    public readonly model: LanguageModelV1,
    private modelOptions?: VercelAIOptions
  ) {}

  async generateText(prompt: string, systemPrompt?: string) {
    const response = await generateText({
      model: this.model,
      prompt,
      system: systemPrompt,
      maxRetries: this.modelOptions?.maxRetries,
    });
    return this.modelOptions
      ? transformResponse(response.text, this.modelOptions)
      : response.text;
  }

  async callWithTools({
    prompt,
    systemPrompt,
    tools,
  }: {
    prompt: string;
    systemPrompt?: string;
    tools: ToolSet;
  }) {
    const { text, toolCalls, toolResults, steps } = await generateText({
      model: this.model,
      prompt,
      system: systemPrompt,
      tools,
      toolChoice: "auto",
      maxSteps: 3,
      maxRetries: this.modelOptions?.maxRetries,
    });
    if (toolCalls.length > 0) {
      console.log("tools called");
      const lastToolResult = steps.at(-1);
      if (!lastToolResult) {
        return { text };
      }
      const { toolResults: results } = lastToolResult;
      return {
        text,
        finalToolResult: (results.at(-1) as unknown as any)?.result,
        toolCalls,
        toolResults,
      };
    }
    return { text };
  }

  generateTextStream(prompt: string) {
    const { textStream } = streamText({
      model: this.model,
      prompt,
      maxRetries: this.modelOptions?.maxRetries,
    });
    return textStream;
  }

  async getJSONFromPrompt<T extends z.ZodSchema>({
    systemPrompt,
    prompt,
    schema,
  }: {
    systemPrompt?: string;
    prompt: string;
    schema: T;
  }) {
    const response = await generateObject({
      model: this.model,
      system: systemPrompt,
      prompt,
      schema,
      maxRetries: this.modelOptions?.maxRetries,
    });
    return response.object as z.infer<T>;
  }

  async getClassificationFromPrompt<T extends any[]>({
    systemPrompt,
    prompt,
    enumValues,
  }: {
    systemPrompt?: string;
    prompt: string;
    enumValues: T;
  }) {
    const response = await generateObject({
      model: this.model,
      system: systemPrompt,
      prompt,
      enum: enumValues,
      output: "enum",
      maxRetries: this.modelOptions?.maxRetries,
    });
    return response.object as T[number];
  }
}
```

#### Chat abstraction

This is an abstraction over text chat, where it has the concept of persistent messages:

```ts
export class VercelAIChat {
  constructor(
    public readonly model: LanguageModelV1,
    private messages: CoreMessage[] = []
  ) {}

  addSystemMessage(message: string) {
    this.messages.push({
      role: "system",
      content: message,
    });
  }

  async chat(message: string) {
    this.messages.push({
      role: "user",
      content: message,
    });
    const response = await generateText({
      model: this.model,
      messages: this.messages,
    });
    this.messages.push({
      role: "assistant",
      content: response.text,
    });
    return response.text;
  }

  async chatWithTools(
    message: string,
    tools: ToolSet
  ): Promise<{ text: string; toolResult?: any | undefined }> {
    this.messages.push({
      role: "user",
      content: message,
    });
    const { text, toolCalls, steps } = await generateText({
      model: this.model,
      messages: this.messages,
      tools,
      maxSteps: 3,
    });
    // tool was called
    if (toolCalls.length > 0) {
      const lastToolResult = steps.at(-1);
      if (!lastToolResult) {
        return { text };
      }
      const { text: stepText, toolCalls, toolResults } = lastToolResult;
      this.messages.push({
        role: "assistant",
        content: stepText,
      });
      return {
        text: stepText,
        toolResult: (toolResults.at(-1) as unknown as any)?.result,
      };
    }

    return { text };
  }

  async streamChat(message: string, onChunk: (chunk: string) => Promise<void>) {
    this.messages.push({
      role: "user",
      content: message,
    });
    const { textStream, text } = streamText({
      model: this.model,
      messages: this.messages,
    });
    for await (const chunk of textStream) {
      await onChunk(chunk);
    }
    const finalText = await text;
    this.messages.push({
      role: "assistant",
      content: finalText,
    });
    return finalText;
  }

  async saveChat(path: string) {
    const newPath = z
      .string()
      .regex(/^.*\.(json|md)$/)
      .parse(path);
    const extension = newPath.split(".").pop();
    const type = extension === "json" ? "json" : "markdown";
    if (type === "json") {
      await fs.writeFile(path, JSON.stringify(this.messages, null, 2));
    } else {
      await fs.writeFile(
        path,
        this.messages.map((m) => `\n**${m.role}**: \n\n${m.content}`).join("\n")
      );
    }
  }
}
```

#### Complete abstraction

```ts
import {
  generateText,
  LanguageModelV1,
  streamText,
  CoreMessage,
  generateObject,
  tool,
  Tool,
  ToolSet,
  Output,
  TextPart,
  ImagePart,
  FilePart,
  EmbeddingModel,
  cosineSimilarity,
  embed,
  embedMany,
  Embedding,
} from "npm:ai";
import { google } from "npm:@ai-sdk/google";
import { xai } from "npm:@ai-sdk/xai";
import { openai } from "npm:@ai-sdk/openai";
import fs from "node:fs/promises";
import { z } from "npm:zod";
import { Buffer } from "node:buffer";
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible";

const checkEnv = (key: string) => {
  if (!Deno.env.get(key)) {
    throw new Error(`${key} is not set`);
  }
};

export const embeddingModels = {
  get_lmstudio: (modelName: string, dimensions: number = 1536) => {
    const model = createOpenAICompatible({
      name: "lmstudio",
      baseURL: `http://localhost:1234/v1`,
      apiKey: "1234567890",
    });
    return {
      model: model.textEmbeddingModel(modelName, {
        dimensions,
      }),
      modelOptions: {
        maxRetries: 0,
      },
    };
  },
};

export const models = {
  get_openai: () => {
    checkEnv("OPENAI_API_KEY");
    return openai("gpt-4o-mini");
  },
  get_lmstudio: (modelName: string = "qwen/qwen3-1.7b") => {
    const model = createOpenAICompatible({
      name: "lmstudio",
      baseURL: `http://localhost:1234/v1`,
      apiKey: "1234567890",
    });
    return {
      model: model(modelName),
      modelOptions: {
        maxRetries: 0,
      },
    };
  },
  get_ollama: (modelName: string) => {
    const model = createOpenAICompatible({
      name: "ollama",
      baseURL: `http://localhost:11434/v1`,
      apiKey: "1234567890",
    });
    return {
      model: model(modelName),
      modelOptions: {
        maxRetries: 0,
      },
    };
  },
  get_google: (
    modelType:
      | "gemini-2.5-flash-preview-04-17"
      | "gemini-2.5-flash-lite-preview-06-17"
      | "gemma-3n-e4b-it"
      | "gemma-3-27b-it"
      | "gemma-3-12b-it" = "gemini-2.5-flash-preview-04-17"
  ) => {
    checkEnv("GOOGLE_GENERATIVE_AI_API_KEY");
    // console.log("Tool calling does not work with Google models");
    return google(modelType);
  },
  get_xai: () => {
    checkEnv("XAI_API_KEY");
    return xai("grok-3-beta");
  },
};

interface VercelAIOptions {
  maxRetries?: number;
  noThink?: boolean;
  hideThinking?: boolean;
}

function transformResponse(response: string, options: VercelAIOptions) {
  if (options.hideThinking) {
    return response.replace("<think>", "").replace("</think>", "");
  }
  return response;
}

export class VercelAIEmbedding {
  constructor(
    public readonly model: EmbeddingModel<string>,
    private modelOptions?: VercelAIOptions
  ) {}

  async embedOne(text: string) {
    const response = await embed({
      model: this.model,
      value: text,
      maxRetries: this.modelOptions?.maxRetries,
    });
    return response.embedding;
  }

  async embedMany(texts: string[]) {
    const response = await embedMany({
      model: this.model,
      values: texts,
      maxRetries: this.modelOptions?.maxRetries,
    });
    return {
      embeddings: response.embeddings,
      createVectorStore: () => {
        const vectorDatabase = response.embeddings.map((embedding, index) => ({
          value: texts[index],
          embedding,
        }));
        return vectorDatabase;
      },
    };
  }

  async getNearestNeighbors(
    text: string,
    k: number,
    vectorDatabase: {
      value: string;
      embedding: Embedding;
    }[]
  ) {
    const response = await this.embedOne(text);
    const entries = vectorDatabase
      .map((entry) => {
        return {
          value: entry.value,
          similarity: cosineSimilarity(entry.embedding, response),
        };
      })
      .sort((a, b) => b.similarity - a.similarity);
    return entries.slice(0, Math.min(k, entries.length));
  }
}

export class VercelAI {
  constructor(
    public readonly model: LanguageModelV1,
    private modelOptions?: VercelAIOptions
  ) {}

  async generateText(prompt: string, systemPrompt?: string) {
    const response = await generateText({
      model: this.model,
      prompt,
      system: systemPrompt,
      maxRetries: this.modelOptions?.maxRetries,
    });
    return this.modelOptions
      ? transformResponse(response.text, this.modelOptions)
      : response.text;
  }

  async callWithTools({
    prompt,
    systemPrompt,
    tools,
  }: {
    prompt: string;
    systemPrompt?: string;
    tools: ToolSet;
  }) {
    const { text, toolCalls, toolResults, steps } = await generateText({
      model: this.model,
      prompt,
      system: systemPrompt,
      tools,
      toolChoice: "auto",
      maxSteps: 3,
      maxRetries: this.modelOptions?.maxRetries,
    });
    if (toolCalls.length > 0) {
      console.log("tools called");
      const lastToolResult = steps.at(-1);
      if (!lastToolResult) {
        return { text };
      }
      const { toolResults: results } = lastToolResult;
      return {
        text,
        finalToolResult: (results.at(-1) as unknown as any)?.result,
        toolCalls,
        toolResults,
      };
    }
    return { text };
  }

  static createTool<T extends z.ZodSchema>(
    description: string,
    parameters: T,
    execute: (args: z.infer<T>) => Promise<any>
  ) {
    return tool({
      description,
      parameters,
      execute: async (args) => {
        try {
          const result = await execute(args);
          return JSON.stringify(result, null, 2);
        } catch (error) {
          console.error(error);
          return "Error occurred when trying to execute tool";
        }
      },
    });
  }

  generateTextStream(prompt: string) {
    const { textStream } = streamText({
      model: this.model,
      prompt,
      maxRetries: this.modelOptions?.maxRetries,
    });
    return textStream;
  }

  async getJSONFromPrompt<T extends z.ZodSchema>({
    systemPrompt,
    prompt,
    schema,
  }: {
    systemPrompt?: string;
    prompt: string;
    schema: T;
  }) {
    const response = await generateObject({
      model: this.model,
      system: systemPrompt,
      prompt,
      schema,
      maxRetries: this.modelOptions?.maxRetries,
    });
    return response.object as z.infer<T>;
  }

  async getClassificationFromPrompt<T extends any[]>({
    systemPrompt,
    prompt,
    enumValues,
  }: {
    systemPrompt?: string;
    prompt: string;
    enumValues: T;
  }) {
    const response = await generateObject({
      model: this.model,
      system: systemPrompt,
      prompt,
      enum: enumValues,
      output: "enum",
      maxRetries: this.modelOptions?.maxRetries,
    });
    return response.object as T[number];
  }
}

export class VercelAIChat {
  constructor(
    public readonly model: LanguageModelV1,
    private messages: CoreMessage[] = [],
    private modelOptions?: VercelAIOptions
  ) {}

  addSystemMessage(message: string) {
    this.messages.push({
      role: "system",
      content: message,
    });
  }

  loadChat(content: string) {
    try {
      const data = JSON.parse(content);
      this.messages = data.map((m: any) => ({
        role: m.role,
        content: m.content,
      }));
    } catch (error) {
      throw new Error("Invalid chat format");
    }
  }

  async chat(message: string) {
    this.messages.push({
      role: "user",
      content: message,
    });
    const response = await generateText({
      model: this.model,
      messages: this.messages,
    });
    this.messages.push({
      role: "assistant",
      content: response.text,
    });
    return response.text;
  }

  async chatWithMessage(message: CoreMessage) {
    this.messages.push(message);
    const response = await generateText({
      model: this.model,
      messages: this.messages,
    });
    this.messages.push({
      role: "assistant",
      content: response.text,
    });
    return response.text;
  }

  async chatWithTools(
    message: string,
    tools: ToolSet
  ): Promise<{ text: string; toolResult?: any | undefined }> {
    this.messages.push({
      role: "user",
      content: message,
    });
    const { text, toolCalls, steps } = await generateText({
      model: this.model,
      messages: this.messages,
      tools,
      maxSteps: 3,
    });
    // tool was called
    if (toolCalls.length > 0) {
      const lastToolResult = steps.at(-1);
      if (!lastToolResult) {
        return { text };
      }
      const { text: stepText, toolCalls, toolResults } = lastToolResult;
      this.messages.push({
        role: "assistant",
        content: stepText,
      });
      return {
        text: stepText,
        toolResult: (toolResults.at(-1) as unknown as any)?.result,
      };
    }

    return { text };
  }

  async streamChat(message: string, onChunk: (chunk: string) => Promise<void>) {
    this.messages.push({
      role: "user",
      content: message,
    });
    const { textStream, text } = streamText({
      model: this.model,
      messages: this.messages,
    });
    for await (const chunk of textStream) {
      await onChunk(chunk);
    }
    const finalText = await text;
    this.messages.push({
      role: "assistant",
      content: finalText,
    });
    return finalText;
  }

  async saveChat(path: string) {
    const newPath = z
      .string()
      .regex(/^.*\.(json|md)$/)
      .parse(path);
    const extension = newPath.split(".").pop();
    const type = extension === "json" ? "json" : "markdown";
    if (type === "json") {
      await fs.writeFile(path, JSON.stringify(this.messages, null, 2));
    } else {
      await fs.writeFile(
        path,
        this.messages.map((m) => `\n**${m.role}**: \n\n${m.content}`).join("\n")
      );
    }
  }
}

export class VercelAIFileCompletions {
  constructor(
    public readonly model: LanguageModelV1,
    private modelOptions?: VercelAIOptions
  ) {}

  static createFileMessage(
    prompt: string,
    parts: (
      | {
          type: "file";
          file: Uint8Array | ArrayBuffer | Buffer;
          filename: string;
          mimeType: string;
        }
      | { type: "image"; image: Uint8Array | ArrayBuffer | URL }
    )[]
  ): CoreMessage {
    return {
      role: "user",
      content: prompt,
      parts: parts.map((part) => {
        if (part.type === "file") {
          return {
            type: "file",
            data: part.file,
            filename: part.filename,
            mimeType: part.mimeType,
          };
        } else {
          return {
            type: "image",
            image: part.image,
          };
        }
      }),
    } as CoreMessage;
  }

  async generateTextWithFile(message: CoreMessage) {
    const response = await generateText({
      model: this.model,
      messages: [message],
      maxRetries: this.modelOptions?.maxRetries,
    });
    return this.modelOptions
      ? transformResponse(response.text, this.modelOptions)
      : response.text;
  }
}

```

## Langchain

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






