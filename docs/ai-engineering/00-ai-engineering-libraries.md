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

## Rag and Cag

RAG stands for **retrieval augmented generation** while **CAG** stands for **cache-augmented generation**.

- **RAG**: search documents related to query, and then inject most similar documents into query.
	- More complex and prone to error, but allows for smaller context window.
- **CAG**: fetch all possibly relevant documents and then inject into prompt. 
	- Needs a large context window but less complex

### Upstash

The most basic way to get started with using usptash vector stores is to first create an index online, and then access that indes programmatically through the upstash API:

```ts
const index = new Index({
  url: "https://allowing-gazelle-54329-us1-vector.upstash.io",
  token: apiKey,
});
```

You can then use these methods on the index:

-  `index.upsert(options)`: takes in an object of options that represents the embedding and its metadata and pushes it to the cloud vector store. here are the options:
	- `vector`: the embedding. This must match the dimension you set on the index previously. **required**.
	- `data`: the plain text representation of the embedding.
	- `metadata`: an object of metadata used for filtering via in-app logic.
	- `id`: a unique identifier for the embedding.
- `index.query(options)`: performs similarity search of a query embedding against a vector database. Here are the options:
	- `includeVector`: a boolean of whether to return the entire embedding or not in the object of returned info
	- `includeData`: a boolean of whether to return the initial text data or not in the object of returned info
	- `includeMetadata`: a boolean of whether to return the metadata or not in the object of returned info
	- `vector`: the embedding version of the query
	- `topK`: the number of documents to return


```ts
import { Index } from "npm:@upstash/vector";
import { parse } from "npm:csv-parse/sync";
import {
  embeddingModels,
  VercelAIEmbedding,
  models,
  VercelAI,
} from "./VercelAI.ts";
import { z } from "npm:zod";

export class UpstashVectorStore {
  private index: Index;

  constructor(
    url: string,
    apiKey: string,
    private embeddingModel: VercelAIEmbedding
  ) {
    this.index = new Index({
      url,
      token: apiKey,
    });
  }

  async upsert({
    id,
    metadata,
    text,
  }: {
    id: string;
    text: string;
    metadata: Record<string, unknown>;
  }) {
    const embedding = await this.embeddingModel.embedOne(text);
    await this.index.upsert({
      id,
      vector: embedding,
      data: text,
      metadata,
    });
  }

  async similaritySearch(query: string, k: number) {
    const embedding = await this.embeddingModel.embedOne(query);
    const results = await this.index.query({
      vector: embedding,
      topK: k,
      includeData: true,
      includeMetadata: true,
      // includeVectors: true,
    });
    return results;
  }
}
```

Then here is how you can use it to parse a CSV and add each row as a document:

```ts
const { model: embeddingModel, modelOptions: embeddingModelOptions } =
  embeddingModels.get_lmstudio("text-embedding-nomic-embed-text-v1.5", 1536);
const lmStudioEmbeddings = new VercelAIEmbedding(embeddingModel, {
  ...embeddingModelOptions,
});

const apiKey = Deno.env.get("UPSTASH_API_KEY");
if (!apiKey) {
  throw new Error("UPSTASH_API_KEY is not set");
}

const vectorStore = new UpstashVectorStore(
  "https://allowing-gazelle-54329-us1-vector.upstash.io",
  apiKey,
  lmStudioEmbeddings
);
```

Then you would parse some text source, split the source into text chunks, and invidually add each chunk to the vector store:

```ts
import { parse } from "npm:csv-parse/sync";
async function addMoviesToVectorStore() {
  const records = parse(await Deno.readTextFile("imdb_movie_dataset.csv"), {
    columns: true,
  });
  console.log(records.length);
  for (const movie of records) {
    const text = `${movie.Title}. ${movie.Genre}. ${movie.Description}`;
    await vectorStore.upsert({
      id: movie.Title,
      text,
      metadata: {
        title: movie.Title,
        year: movie.Year,
        genre: movie.Genre,
        director: movie.Director,
        actors: movie.Actors,
        rating: movie.Rating,
        votes: movie.Votes,
        revenue: movie.Revenue,
        metascore: movie.Metascore,
      },
    });
    console.log(`Added ${movie.Title}`);
  }
  console.log("Done");
}
```

## Evals

If you don't use evals (tests and finidng metrics for your LLM service), you will have a terrible LLM wrapper app. Here are some metrics to test for:

-  Is the model calling the correct tool we expected?
## Finetuning

Finetuning is the act of doing training on the last layer of the LLM with all the other layers being frozen, thus modifying the weights for your use case.