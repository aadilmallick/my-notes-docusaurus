## Developer focused AI tools

### Github Copilot

**fix with copilot**

You can highlight line(s), right click, and then use either **modify with copilot** or **review with copilot** to review the code, suggest any improvements, etc.

#### Attaching context

You can attach context in the inline chat or in the chat sidebar by either manually adding files and images, or you can use these symbol prefixes to reference stuff in your codebase:

- `#`: used to reference individual files, folders, symbols in your code (objects and types), content from the terminal, or an entire codebase
- `@`: used to reference different VSCode contexts, like `@codebase` for your code, `@terminal` for the terminal, or `@workspace` for the current VSCode workspace. *These are only available in the sidebar chat*.

You can attach context in the **inline chat** by clicking `CTRL + I` twice to get a list of slash commands and available contexts.

#### Running terminal commands

With the chat sidebar, you can first type `@terminal` to give github copilot access to your terminal context, and then it will write a command to run based on the prompt.

You can also do `CTRL + I` in the terminal to popup an inline chat in the terminal to run commands there.

#### Slash commands

Copilot has a variety of slash commands that make doing monotonous tasks like documentation, fixing code, and creating unit tests much much easier. You can view a list of slash commands by clicking `CTRL + I` twice or by typing them manually in the chat sidebar.

Here are the most useful ones:

- `/explain`: explains the selected code
- `/fix`: fixes the selected code
- `/doc`: creates documentation for the selected code, like JSdoc
- `/tests`: creates unit tests for the selected code
- `/explain`: explains the selected code

#### Copilot Extensions

Copilot Extensions are 3rd party extensions that add additional context options with the `@`symbol to github copilot in your VSCode.

Go [here](https://github.com/marketplace?type=apps&copilot_app=true) for a list of all extensions

Here are the useful ones:

**Agentic search**

Go to the [agentic search extension](https://github.com/settings/installations/68474817)in order to use agentic search capabilities, using cookies, etc.

**prisma**
****
Provides additional context for asking questions abotu prisma

[go here](https://github.com/apps/prisma-for-github-copilot)

**neon db**
****
Provides an additional context for asking questions about neon db.

[go here](https://github.com/settings/installations/68475406)

### Cursor

#### Inline chat

The inline chat in cursor has several options for what you can do with it by first typing `CTRL + K` to bring up the inline chat, and then typing `@` for context options. 

You can also instead of asking it to generate or edit code, ask a quick question about it in the inline chat:

![](https://res.cloudinary.com/dsmvtmv8z/image/upload/v1748293987/image-clipboard-assets/ut9zdv3eklbjpj8qegh0.webp)

#### adding docs

You can add certain websites' documentation to cursor, and cursor will index it and be able to reference it via the `@docs` context command. There are two ways to add documentation to certain websites you want:

- Add when prompted to add a new documentation when typing the `@docs` command
- Add in the cursor features settings.

## ChatGPT features

### Canvas mode

Canvas mode is a way to edit some text, like an essay or code, by "pair coding" with chatGPT.

- You can highlight text in canvas mdoe and ask chatgpt to do something abotu that highlighted text, which is faster than simply retyping it.

### Code execution

You can ask ChatGPT to execute code in a python repl to give you back exact mathematical answers or to create charts with matplotlib. Here are the things you can do:

- **math**: get back perfect math answers by asking in a repl
- **graphs**: ask for perfect graphs using matplotlib
- **qr codes**: ask to make qr codes from a link using the `qrcode` python package

## Prompt engineering

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

