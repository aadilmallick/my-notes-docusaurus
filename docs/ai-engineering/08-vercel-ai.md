### Vercel AI SDK

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

