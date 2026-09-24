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
