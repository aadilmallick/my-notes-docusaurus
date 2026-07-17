## Prompt engineering basics

### Prompt Engineering in a nutshell

A good prompt consists of these 4 ingredients:

1. Initial context
    - Telling chatgpt what role to play, and providing any initial context about the situation the model needs to know.
    - Use the **act as** or **imagine** syntax for defining the gpt role
2. Instructions
    - Start by saying, **your task is ____**. The task is best paired with good context or a good role.
3. Input data
    - Make sure chatgpt can find your input data by clearly separating it from the rest of your prompt.
    - Put your input data as the last thing in your prompt, to prevent confusion
    - You could do something like, “here is the text below:”
4. Constraints and format
    - Explain to gpt what format you want the output to be in
        - _using fewer than 200 characters_
        - _your response should be formatted as markdown, you should bold any key sentences or phrases_

All together, you should get something like this:

> Act as an article summarizing assistant. I will provide you with the text of a news article, and I’d like you to generate a summary. **(step 1, initial context)** The summary should include a 2 sentence overall summary and then also include 4-6 bullet points summarizing the key points of the article.  **(step 2, instructions)** Your total output should not exceed 120 words. **(step 4, constraints)** Here is the text: **(then you do step 3, the input)**

This is formally known as the **RGC** prompt:

- **RGC prompting:** A type of prompting that can be universally used to generate detailed output. It has these following attributes:
    - **role:** Tell chatgpt who to act as
    - **result:** Tell chatgpt what kind of output you want back
    - **goal:** What is the purpose that the output is supposed to serve? What are you trying to accomplish here?
    - **context:** Provide what or who the output is for
    - **constraint:** Guidelines for the response.
- You are an expert `[role]`. Create `[result]`. The goal is `[end goal]`. The content is for `[context]`. Your guidelines for writing are `[constraints]`.

### What makes a good prompt

1. **Setting the stage:** What is your role and what are your objectives? Is there context about your work that Claude should know about?
2. **Defining the task:** What action do you want Claude to take? Do you want Claude to write, analyze, build, or something else?
3. **Specifying rules:** What's the style or tone you want Claude to use? Are there examples that you can attach to show Claude what you're looking for?

Then follow the 6-part prompt framework

- **Give context:** Be specific about what you want, why you want it, and relevant background
- **Show examples**: Demonstrate the output style or format you're looking for
- **Specify constraints**: Clearly define format, length, and other output requirements
- **Break complex tasks into steps**: Guide the AI through multi-step reasoning
- **Ask the AI to think first**: Give space for the AI to work through its process
- **Define the AI's role or tone**: Specify how you want the AI to communicate

### Basic techniques

#### Shot prompting

The concept of a **shot** is providing the model context that is an example of a response you want to get back or of what you want the model to do.

> [!NOTE]
> The main use case of shot prompting is to inject a bit of determinism into the AI so we can get a predictable response back. This is useful if you need the response to be in a certain style, format, etc.

There are three types of "shot" prompting:

- **zero-shot**: you don't give the AI any examples of the response you want back.
- **one-shot**: you give the AI one example of the response you want back.
- **few-shot**: you  give the AI many examples of the response you want back.

The structure of a shot prompting prompt should be as follows to ensure the AI follows it correctly:

1. At the beginning, give general background context and instructions  and say something like "below you have examples."
2. paste the examples delimited by xml tags like `<example-1>` to clearly delineate where an example starts and ends.
3. Put your main instructions at the end

#### Chain of thought

For complex mathematical calculations, you can ask the ai  to walk through a solution step by step:

```
think step by step, outline your solution process (in detail), and derive the solution step by step.
```

#### Ask before answer

**ask before answer prompting** is where before telling chatgpt what to do, you tell it to ask any questions for clarification it needs before answering the prompt in the best way possible.

This lets chatgpt ask its own questions so you can give it context and form the best possible prompt.

#### Rephrase the question

By asking the AI to rephrase and expand the question before responding, it gives you a glimpse into what the AI thinks you're asking and fleshes it out, thus increasing the probability of producing a better response.

![](https://i.imgur.com/8GrllW8.png)

The basic prompt formula is like so:

```
{Your question} 
Rephrase and expand the question, and respond.
```

There are some limitations:

- While rephrasing can help clarify ambiguous questions, it can also make straightforward queries unnecessarily complex.
- Rephrasing can sometimes inadvertently alter the original question's intent or focus, leading to a response that doesn’t fully address the user's needs.

#### reverse prompt engineering

Telling chatgpt to pretend it is a prompt engineer, and you give it a piece of content and tell it to reverse-engineer it and give you back a prompt that would produce that type of content.

#### The order of prompts

Here is a basic guideline of the order to follow when prompting the AI:

1. Examples (if needed)
2. Additional Information
3. Role
4. Directive
5. Output Formatting



### prompt resources

```embed
title: "prompts.chat"
image: "https://github.com/user-attachments/assets/e0d0e32d-d2ce-4459-9f37-e951d9f4f5de"
description: "This repo includes ChatGPT prompt curation to use ChatGPT and other LLM tools better."
url: "https://prompts.chat/"
favicon: ""
aspectRatio: "30.126582278481013"
```

## AI chatting basics

### Create a profile context doc

AI systems do better on tasks specific to you if they have more context about you. To this end, create a universal **profile context doc** that you can plug into any AI provider to let them have context about you.

```
Act as an expert Executive Coach and Professional Biographer. Your goal is to build a "Master Personal Context Profile" for me. This profile will be used in future AI interactions to ensure all outputs match my voice, role, and specific needs.

**The Rules:**
1. Do not write the profile yet.
2. You must interview me to gather the information.
3. Ask me one question at a time.
4. Wait for my response before moving to the next question.
5. Start with open-ended questions.
6. Then move to multiple-choice questions so it's easier for me to answer fast.
7. Continue this process until you have a granular understanding of who I am.

**The Interview Phase:**
Gather information on the following pillars, but do not ask everything at once:
- **Role & Function:** My specific job title, who I report to, and who reports to me.
- **Daily Reality:** My biggest recurring headaches, my favorite tasks, and the tools I use daily.
- **Communication Style:** How I write (formal vs. casual, terse vs. elaborate), my preferred vocabulary, and things I never say.
- **Strategic Goals:** What I'm trying to achieve this quarter and this year.
- **Learning Style:** How I prefer to consume information (bullet points, summaries, deep dives).

**The Output Phase:**
Once you have enough (usually after 3-4 rounds of questioning), tell me you're ready. Then generate a code block containing a "System Instruction" formatted in Markdown that I can paste into future AI chats to give them perfect context about me.
```

### What to do when you run out of context

When you run out of context, you often need to compact the information or start a new chat but get it to the point where you could just start off from where you last left off.

There are two methods to remedy this:

1. **reverse-engineer prompt**: When a long chat produces a good result,, ask the model to compress the whole conversation into one prompt that reproduces the final output so can start off from that same spot in a brand new chat.
2. **handoff document method**: Before the AI runs out of context, have the AI summarize everything you've worked on and put that into a markdown file.

#### Reverse engineering prompt

>"Reverse engineer this conversation and write a single prompt that will produce this final output according to the final result here"


```
Reverse-engineer our entire conversation and write me a **single prompt** that would produce this exact final output from scratch.

Capture all the key decisions, context, format, and constraints we landed on so I don't have to start from zero next time. Output it as a clean, copy-paste-ready prompt in a code block.
```

#### Handoff document prompt

```
We're about to run low on context, so I need you to write a **handoff document** as if you're passing this off to another teammate or agent who is starting fresh.

Summarize:
- **The goal:** what we're trying to accomplish
- **Key decisions:** what we've locked in so far
- **What we tried:** including approaches that didn't work
- **What to avoid:** dead ends, constraints, and things I've explicitly ruled out
- **Next steps:** where a fresh chat should pick up

Format it in clean Markdown so I can paste it into a new conversation.
```
## Prompt engineering use cases

### Talk-it-out interview method

Use this ny time you want quality output without crafting a long prompt, even for a quick four-minute task. This is your go-to opener for almost everything, especially when starting new projects that you want discussion on to get more clarity.

```
Act as a top expert with **10+ years of experience** in [topic].

We're going to work on [project] together.

## Do Not Start Yet.
First, ask me a **series of questions, one at a time**. Wait for my answer before asking the next one.

Don't start drafting until I give you the go-ahead and you are crystal clear on exactly what I need and the format I need it in.

To make it even easier for me to reply fast, ask each question in **multiple-choice format** so I can answer with A, B, C, or D whenever possible.
```

### Brutal honesty method

To bypass AI's sycophantic behavior, ask it to be brutally honest and critical about your project or business plans.

```
I've attached [my work — e.g., these reports, this plan, our funnel metrics].

I don't want you to just build what I've already decided. I want you to be a **reaction engine** and challenge my thinking.

- What blind spots am I missing?
- What's the common denominator or pattern across these that I might not be seeing?
- Is my assumed root cause / top priority actually right, or is there a better explanation?
- What would a skeptical expert push back on?

Don't placate me or tell me what I want to hear. I have thick skin — give me real, harsh coaching to sharpen my thinking and surface what I should be worried about.
```

## AI project basics

Many providers have projects where you can upload files to be added into a RAG database for context retrieval via similarity search. Projects allow consistent outputs and can be great for use cases like companies or coding.

### Company use case

If you want to create a great AI project based on your company, you should upload these documents to the project knowledge base:

- **profile context doc**: The document you can create here [[#Create a profile context doc]] to give AI context about yourself
- **company context doc**: The document you can create here [[03-prompt-slop#Company deep research report prompt]] to give AI context about yourself
## Image prompting

### Basics

with any llm chat that supports creating images like ChatGPT, you have the ability to use the chat interface to improve image generation. Here are the specific things you can do:

- **provide aspect ratio**: You can tell gpt to set the image's aspect ratio to something like 16:10 or 4:3.
- **refine the image**: Since images are saved as part of the chat history, you can ask gpt to refine the image and change certain parts of the image.
- **base off of a previous image**: If you find an image you like, you can ask chat to create an image in that exact same style.