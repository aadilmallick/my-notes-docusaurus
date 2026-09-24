## Local LLMs basics

You can use local LLMs in a chat interface either with LMStudio desktop app or the Ollama CLI. 

You can download quantized models off of hugging face or in LM Studio itself.

### Theory

#### Quantization

**quantization** is the idea of precision in model parameters, either letting each parameter have a floating point precision (more precise) or an integer precision (less precise). 

Although it sounds like being more precise would lead to better results - which it does - it also adds up more space to download local models and requires more RAM. To use a model for inference, it has to get loaded into memory, and even the smallest LLM has over 1 billion parameters. Higher precision leads to higher RAM requirements:

- A model with float32 quantization for parameters means each parameter is 32 bits, or 4 bytes, meaning a model with 2 billion parameters would need 8GB of RAM.

Thus quantization allows us to mathematically round the floating point precision parameters to integers, either int4 (4 bit) or int8 (8 bit) to cut down the RAM usage of a model:

- A model quantized with int4 quantization for parameters means each parameter is 4 bits, or 0.5 bytes, meaning a model with 2 billion parameters would only need 1GB of RAM.

> [!TIP]
> quantization allows us to achieve up to 1/2 or 1/4 cutting of RAM usage, while still having only a negligible difference in performance from the more precise unquantized models.

#### Offloading

**offloading** is the technique of loading a model's parameters between CPU, GPU, and RAM, in order to efficiently load a model in memory. 

A main drawback of offloading is that model performance becomes worse, even if memoyr use is more efficient. 
## Lm studio

#### CLI

- `lms ls`: lists all downloaded models
- `lms ps`: lists all currently loaded models in memory
- `lms load <model-id>`: loads a specific model
- `lms unload <model-id>`: unloads a specific model

**listing models**

Show all downloaded models using the `lms ls` command. You have 4 options to consider:

- `--llm`: lists only llm models
- `--json`: lists info in JSON
- `--detailed`: lists details info
- `--embeddings`: prints only embedding models

```
lms ls
```

Example output:

```
You have 47 models, taking up 160.78 GB of disk space.

LLMs (Large Language Models)                       PARAMS      ARCHITECTURE           SIZE
lmstudio-community/meta-llama-3.1-8b-instruct          8B         Llama            4.92 GB
hugging-quants/llama-3.2-1b-instruct                   1B         Llama            1.32 GB
mistral-7b-instruct-v0.3                                         Mistral           4.08 GB
zeta                                                   7B         Qwen2            4.09 GB

... (abbreviated in this example) ...

Embedding Models                                   PARAMS      ARCHITECTURE           SIZE
text-embedding-nomic-embed-text-v1.5@q4_k_m                     Nomic BERT        84.11 MB
text-embedding-bge-small-en-v1.5                     33M           BERT           24.81 MB
```


List only LLM models:

```
lms ls --llm
```

List only embedding models:

```
lms ls --embedding
```

Get detailed information about models:

```
lms ls --detailed
```

Output in JSON format:

```
lms ls --json
```

You can show all currently loaded models with `lms ps`.

Get the list in machine-readable format:

```
lms ps --json
```


**loading into memory**

Load a model into memory by running the following command:

```
lms load <model_key>
```

You can find the `model_key` by first running [`lms ls`](https://lmstudio.ai/docs/cli/ls) to list your locally downloaded models. You also have access to these options:


![](https://i.imgur.com/v3faHML.jpeg)

**unloading from memory**

Unload a single model from memory by running:

```
lms unload <model_key>
```

If no model key is provided, you will be prompted to select from currently loaded models.

To unload all currently loaded models at once:

```
lms unload --all
```

**Server CLI**

You use the `lms server start` command to start the LM studio server

- `lms server start`: starts server with default settings on port 1234
- `lms server start --port <port>`: starts server on specific port
- `lms server start --cors`: opens CORS for all web apps to access

You can use the `lms server stop` command to stop the LM studio server.

You use the `lms server status` command to see the status of the LM studio server

```bash
lms server start # start server
lms server status # get status
lms server stop # stop server
```

You also have these options:

![](https://i.imgur.com/EcHQo7l.png)

Get the status in machine-readable JSON format:

```
lms server status --json --quiet
```

Example output:

```json
{"running":true,"port":1234}
```

**seeing logs**

`lms log stream` allows you to inspect the exact input string that goes to the model.

```
lms log stream
```

Here would be the example output:


![](https://i.imgur.com/yr5QsPH.jpeg)


#### Programming

You can hit API endpoints for models that your load onto the LM studio server, which runs on `localhost:1234`.

There are three different ways to run the LMS studio server and hit up the endpoints:

1. Basic rest API
2. Open AI SDK (compatibility version)
3. LM studio Python SDK
4. LM studio TS SDK

##### Open AI Compatibility

Using models with LM studio is completely compatible with the openAI sdk. All you have to do is to pass the `base_url` parameter and point that to the LM studio server endpoint, like so:

```python
from openai import OpenAI

client = OpenAI(
  base_url="http://localhost:1234/v1", # LM Studio endpoint on port 1234
  api_key="something-doesnt-matter", # doesn't matter, but should pass value
)
```

And here is an example showing just how simple and compatible the OpenAI SDK is to use with LM studio models

```python
from openai import OpenAI

client = OpenAI(
  base_url="http://localhost:1234/v1",
  api_key="something-doesnt-matter",
)

response = client.chat.completions.create(
  model="gemma-3-12b-it-qat",
  messages=[
    {
      "role": "system",
      "content": "You are a helpful and friendly assistant."
    },
    {
      "role": "user",
      "content": "What is the meaning of life?"
    }
  ],
  temperature=0.7,
)

print(response.choices[0].message.content)
```

##### LM studio TS sdk

fIrst install with this:

```bash
npm install @lmstudio/sdk --save
```

And here's a quickstart:

```ts
import { LMStudioClient } from "@lmstudio/sdk";
const client = new LMStudioClient();

const model = await client.llm.model("llama-3.2-1b-instruct");
const result = await model.respond("What is the meaning of life?");

console.info(result.content);
```

## OLlama

OLLama is a CLI tool for installing and running local models. Here is an example that automatically installs and runs llama 3.2

```bash
ollama run llama3.2
```

In fact, here's a list of all CLI commands you can run:

![](https://i.imgur.com/acwfO9j.jpeg)

#### rUnning models

When chatting with ollama models, you have access to these slash commands:

```
Available Commands:
  /set            Set session variables
  /show           Show model information
  /load <model>   Load a session or model
  /save <model>   Save your current session
  /clear          Clear session context
  /bye            Exit
  /?, /help       Help for a command
  /? shortcuts    Help for keyboard shortcuts
```

Since you have to chat using the CLI in a purely text based ways, there are a few caveats to keep iin mind when trying to chat with OLLama:

- **multiline text**: ANy multiline text needs to be encased in triple double quotes
- **images**: To refer to images or files, you just write out the relative path to that file in your prompt. Any filepaths you refer to MUST MUST MUST be at the end of your prompt, after any text.
- **system message**: run the `/set system <message>` command to change the model's system message for the chat duration

**saving chats**

To save chats, you can use the `/save <chat-name>` and `/load <chat-name>` to load a chat. These commands save and load the chat respectively with the hyperparameters, chat history, and system message all set and saved.

**/show command**

```
Available Commands:
  /show info         Show details for this model
  /show license      Show model license
  /show modelfile    Show Modelfile for this model
  /show parameters   Show parameters for this model
  /show system       Show system message
  /show template     Show prompt template
```

If you run the `/show system` command, you can see the system message for the model.

**/set command**

```
>>> /set
Available Commands:
  /set parameter ...     Set a parameter
  /set system <string>   Set system message
  /set history           Enable history
  /set nohistory         Disable history
  /set wordwrap          Enable wordwrap
  /set nowordwrap        Disable wordwrap
  /set format json       Enable JSON mode
  /set noformat          Disable formatting
  /set verbose           Show LLM stats
  /set quiet             Disable LLM stats
  /set think             Enable thinking
  /set nothink           Disable thinking
```

- `/set system <message>` : changes the model's system message for the chat duration
- `/set parameter`: shows the parameters of the model you can change

#### managing models

- `ollama list`: lists all models you have installed.
- `ollama ps`: lists all currently running models.
- `ollama rm <model-name>`: deletes a model by its name.
- `ollama show <model-name>`: shows more info on the specified model.

> [!TIP]
> You can find the parameters for a model on the ollama page for a model or through `ollama show` command.

#### Model env vars

These are the env vars you should set on a model in order to make OLLAMA more efficient:


![](https://i.imgur.com/aq94hHQ.jpeg)
 
#### Modelfiles

**Modelfiles** are essentially the Dockerfile version of creating LLMs, blueprinting them with system prompts, hyperparameter values, and message history.

Here are the directives you can use:

| Instruction                                                                                     | Description                                                    |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [`FROM`](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#from-required) (required) | Defines the base model to use.                                 |
| [`PARAMETER`](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#parameter)           | Sets the parameters for how Ollama will run the model.         |
| [`TEMPLATE`](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#template)             | The full prompt template to be sent to the model.              |
| [`SYSTEM`](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#system)                 | Specifies the system message that will be set in the template. |
| [`ADAPTER`](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#adapter)               | Defines the (Q)LoRA adapters to apply to the model.            |
| [`LICENSE`](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#license)               | Specifies the legal license.                                   |
| [`MESSAGE`](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#message)               | Specify message history.                                       |
Here is an example modelfile:

```dockerfile
FROM llama3.2
# sets the temperature to 1 [higher is more creative, lower is more coherent]
PARAMETER temperature 1
# sets the context window size to 4096, this controls how many tokens the LLM can use as context to generate the next token
PARAMETER num_ctx 4096

# sets a custom system message to specify the behavior of the chat assistant
SYSTEM You are Mario from super mario bros, acting as an assistant.

# adds message history
MESSAGE user "Hi mario, what's up?"
MESSAGE assistant "whats a up mamma mia you piece of shit!"
```


To use this:

1. Save it as a file (e.g. `Modelfile`)
2. `ollama create choose-a-model-name -f <location of the file e.g. ./Modelfile>`
3. `ollama run choose-a-model-name`
4. Start using the model!

```bash
# 1. create the modelfile and use it
ollama create <new-model-name> -f ./Modelfile
ollama run <new-model-name>
```

To view the Modelfile of a given model, use the `ollama show --modelfile` command.

#### Ollama server

Run `ollama serve` to start the server, but ollama runs on `localhost:11434` automatically when you start it.

#### Ollama API

**API fetching**

**open ai compatible**

You can use the openAI compatibility API through setting the `baseUrl` property to `localhost:11434/v1` endpoint.

```
```

**vercel ai**

Through the openAI compatibility endpoint, you can use ollama models on vercel AI.

```ts
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible";

 function get_ollama(modelName: string) {
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
```

**python sdk**

**js sdk**

The JS sdk is super easy to use through the `ollama` package:

```ts
import ollama from 'ollama'

const response = await ollama.chat({
  model: 'llama3.1',
  messages: [{ role: 'user', content: 'Why is the sky blue?' }],
})
console.log(response.message.content)
```

You can also stream messages:

```ts
import ollama from 'ollama'

const message = { role: 'user', content: 'Why is the sky blue?' }
const response = await ollama.chat({
  model: 'llama3.1',
  messages: [message],
  stream: true,
})
for await (const part of response) {
  process.stdout.write(part.message.content)
}
```

**custom sdk**

Made with the power of gemini

```ts
import { z } from "npm:zod";

// Base URL for the Ollama API
const OLLAMA_API_BASE_URL = "http://localhost:11434/api";

// Zod Schemas for API validation

const ModelDetailsSchema = z.object({
  parent_model: z.string(),
  format: z.string(),
  family: z.string(),
  families: z.array(z.string()).nullable(),
  parameter_size: z.string(),
  quantization_level: z.string(),
});

const ModelSchema = z.object({
  name: z.string(),
  model: z.string(),
  modified_at: z.string(),
  size: z.number(),
  digest: z.string(),
  details: ModelDetailsSchema,
});

const ListModelsResponseSchema = z.object({
  models: z.array(ModelSchema),
});

const GenerateCompletionOptionsSchema = z
  .object({
    temperature: z.number().optional(),
    seed: z.number().optional(),
    top_k: z.number().optional(),
    top_p: z.number().optional(),
    min_p: z.number().optional(),
    repeat_last_n: z.number().optional(),
    repeat_penalty: z.number().optional(),
    presence_penalty: z.number().optional(),
    frequency_penalty: z.number().optional(),
    stop: z.array(z.string()).optional(),
  })
  .partial();

const GenerateCompletionRequestSchema = z.object({
  model: z.string(),
  prompt: z.string(),
  suffix: z.string().optional(),
  images: z.array(z.string()).optional(),
  think: z.boolean().optional(),
  format: z.union([z.literal("json"), z.any()]).optional(),
  options: GenerateCompletionOptionsSchema.optional(),
  stream: z.boolean().optional(),
  raw: z.boolean().optional(),
  keep_alive: z.string().optional(),
});

const GenerateCompletionResponseSchema = z.object({
  model: z.string(),
  created_at: z.string(),
  response: z.string(),
  done: z.boolean(),
  context: z.array(z.number()).optional(),
  total_duration: z.number().optional(),
  load_duration: z.number().optional(),
  prompt_eval_count: z.number().optional(),
  prompt_eval_duration: z.number().optional(),
  eval_count: z.number().optional(),
  eval_duration: z.number().optional(),
});

const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string(),
  images: z.array(z.string()).optional(),
});

const GenerateChatRequestSchema = z.object({
  model: z.string(),
  messages: z.array(MessageSchema),
  tools: z.array(z.any()).optional(),
  think: z.boolean().optional(),
  format: z.union([z.literal("json"), z.any()]).optional(),
  options: GenerateCompletionOptionsSchema.optional(),
  stream: z.boolean().optional(),
  keep_alive: z.string().optional(),
});

const GenerateChatResponseSchema = z.object({
  model: z.string(),
  created_at: z.string(),
  message: MessageSchema,
  done: z.boolean(),
  total_duration: z.number().optional(),
  load_duration: z.number().optional(),
  prompt_eval_count: z.number().optional(),
  prompt_eval_duration: z.number().optional(),
  eval_count: z.number().optional(),
  eval_duration: z.number().optional(),
});

const GenerateEmbeddingsRequestSchema = z.object({
  model: z.string(),
  input: z.union([z.string(), z.array(z.string())]),
  truncate: z.boolean().optional(),
  options: GenerateCompletionOptionsSchema.optional(),
  keep_alive: z.string().optional(),
});

const GenerateEmbeddingsResponseSchema = z.object({
  model: z.string(),
  embeddings: z.array(z.array(z.number())),
  total_duration: z.number().optional(),
  load_duration: z.number().optional(),
  prompt_eval_count: z.number().optional(),
});

// Type Definitions from Zod Schemas
type ListModelsResponse = z.infer<typeof ListModelsResponseSchema>;
type GenerateCompletionRequest = z.infer<
  typeof GenerateCompletionRequestSchema
>;
type GenerateCompletionResponse = z.infer<
  typeof GenerateCompletionResponseSchema
>;
type GenerateChatRequest = z.infer<typeof GenerateChatRequestSchema>;
type GenerateChatResponse = z.infer<typeof GenerateChatResponseSchema>;
type GenerateEmbeddingsRequest = z.infer<
  typeof GenerateEmbeddingsRequestSchema
>;
type GenerateEmbeddingsResponse = z.infer<
  typeof GenerateEmbeddingsResponseSchema
>;

/**
 * A TypeScript class to interact with the Ollama API in a typesafe way.
 */
export class OllamaAPI {
  private baseUrl: string;

  constructor(baseUrl: string = OLLAMA_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.json();
  }

  private async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return response.json();
  }

  /**
   * Lists all models available locally.
   */
  async listModels(): Promise<ListModelsResponse> {
    const response = await this.get("/tags");
    return ListModelsResponseSchema.parse(response);
  }

  /**
   * Generates a completion for a given prompt.
   * @param request The request object for generating a completion.
   * @returns The generated completion.
   */
  async generateCompletion(
    request: GenerateCompletionRequest
  ): Promise<GenerateCompletionResponse> {
    const validatedRequest = GenerateCompletionRequestSchema.parse(request);
    const response = await this.post("/generate", validatedRequest);
    return GenerateCompletionResponseSchema.parse(response);
  }

  /**
   * Generates the next message in a chat.
   * @param request The request object for generating a chat completion.
   * @returns The generated chat message.
   */
  async generateChat(
    request: GenerateChatRequest
  ): Promise<GenerateChatResponse> {
    const validatedRequest = GenerateChatRequestSchema.parse(request);
    const response = await this.post("/chat", validatedRequest);
    return GenerateChatResponseSchema.parse(response);
  }

  /**
   * Generates embeddings for a given input.
   * @param request The request object for generating embeddings.
   * @returns The generated embeddings.
   */
  async generateEmbeddings(
    request: GenerateEmbeddingsRequest
  ): Promise<GenerateEmbeddingsResponse> {
    const validatedRequest = GenerateEmbeddingsRequestSchema.parse(request);
    const response = await this.post("/embed", validatedRequest);
    return GenerateEmbeddingsResponseSchema.parse(response);
  }
}

```

## Important local models
### OpenAI Whisper

#### Python

Here is how you can use open ai whisper to transcribe or translate audio files:

```ts
import whisper

model = whisper.load_model("base.en")

filepath = os.path.join(pathlib.Path.home(), "Downloads", "totranscribe.webm")
result = model.transcribe(filepath)

print(result["text"])
```

Here are the different models you have access to, all unquantized.

- `"tiny.en"`: the smallest english version, at 39M params
- `"base.en"`: the smallest english version, at 74M params

#### Command line

- `whisper <audio-file-path>`: transcribes the audio file with auto detecting the language

Here are the different options you have
- `--model <model>`: chooses the specific model
- `--language <language-code>`: specifies the language the audio file is in. Pass in a language code, like `en` or `es`.

### TranslateGemma

This is an Ollama LLM that excels at translation.


