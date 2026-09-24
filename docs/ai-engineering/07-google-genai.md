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
