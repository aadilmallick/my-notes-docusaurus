## Claude 101

### Prompt engineering


#### What makes a good prompt

1. **Setting the stage:** What is your role and what are your objectives? Is there context about your work that Claude should know about?
2. **Defining the task:** What action do you want Claude to take? Do you want Claude to write, analyze, build, or something else?
3. **Specifying rules:** What's the style or tone you want Claude to use? Are there examples that you can attach to show Claude what you're looking for?

#### Prompt troubleshooting

| Challenge                                                            | What's happening                                                                                                  | Try this                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Claude's response is too generic**                                 | Your prompt didn't include enough context about your specific situation                                           | Add details about your audience, role, or constraints. Instead of "Write an email about the project delay," try "Write an email to our enterprise client explaining that the software integration will be delayed by two weeks. They've been patient so far but this is the second delay. Keep it professional but apologetic." |
| **The response is too long (or too short)**                          | Claude is guessing at appropriate length                                                                          | Be explicit: "Give me a two-paragraph summary" or "Keep this under 100 words" or "I need a comprehensive analysis—length isn't a concern."                                                                                                                                                                                      |
| **Claude didn't follow my format**                                   | Claude understood _what_ you want but not _how_ you want it presented                                             | Show, don't just tell. Provide an example of the format, or describe the structure explicitly: "Use bullet points with bold headers for each section."                                                                                                                                                                          |
| **I got confident-sounding information that turned out to be wrong** | Claude occasionally generates plausible but incorrect information, especially with specific facts or niche topics | For high-stakes work, verify key facts independently. Ask Claude to cite sources or indicate confidence level. Enable web search to ground responses in current information.                                                                                                                                                    |
| **The tone isn't right**                                             | Claude defaults to helpful and professional, which may not match your needs                                       | Describe the tone in plain language: "Make this more conversational" or "This should sound authoritative and formal." Provide an example of writing in the style you want.                                                                                                                                                      |


### 4D framework for AI fluency

three ways people engage with AI:

- **Automation**: The AI completes specific tasks based on your instructions.
- **Augmentation**: You and AI collaborate as creative thinking and task execution partners.
- **Agency**: You configure AI to work independently on your behalf, establishing its knowledge and behavior patterns rather than just giving it specific tasks.

The **4D Framework for AI Fluency**, developed through research collaboration between Professor Rick Dakan (Ringling College of Art and Design) and Professor Joseph Feller (University College Cork), identifies four core competencies that, when combined, can help you make the most of your AI interactions:

- **Delegation:** Deciding on what work should be done by humans, what work should be done by AI, and how to distribute tasks between them. Includes understanding your goals, AI capabilities, and making strategic choices about collaboration.
- **Description:** Effectively communicating with AI systems. Includes clearly defining outputs, guiding AI processes, and specifying desired AI behaviors and interactions.
- **Discernment:** Thoughtfully and critically evaluating AI outputs, processes, behaviors and interactions. Includes assessing quality, accuracy, appropriateness, and determining areas for improvement.
- **Diligence:** Using AI responsibly and ethically. Includes making thoughtful choices about AI systems and interactions, maintaining transparency, and taking accountability for AI-assisted work.

#### Delegation

Delegation is about making thoughtful decisions about what work to do yourself, what to do together with AI, or what to let AI handle independently, and how to distribute those tasks. It's the  thoughtful approach about deciding where and when to use AI.

To Delegate well, you need to do these three things:

1. Understand your goal and the problems you are trying to solve
2. Know what AI systems can and can't do well.
3. Decide how to divide the work between you and AI.

There are three types of delegation:

- Problem Awareness: Understanding your goals and the work involved to achieve it
- Platform Awareness: Knowing what different AI systems can do
- Task Delegation: Strategically dividing work between you and AI

Before taking apart in delegation, ask yourself these core questions:

1. What is my expertise and domain knowledge
#### Description

A good description describes the following:

1. What you want the final output to be
2. How you want the AI to approach the task
3. How exactly you want the AI to behave (tone and style)

#### Discernment

Discerning what's good vs bad concernign AI outputs hinges on three key questions:

1. Is the output useful and correct? 
2. Is AI taking the correct approach?
3. Is the AI behaving as desired?

#### Diligence

Can you stand behind your outputs and verify them as correct and take responsibility for them?


### Personalizing Claude

There are two features that help Claude work better for you over time to increase the power of your prompts.

- **Memory** automatically saves key context from your conversations — your role, preferences, past decisions, and working style — so you don't have to repeat yourself every time you start a new chat. For example, if you tell Claude you work in marketing at a B2B company, it'll remember that context going forward. You can review, edit, or delete anything Claude remembers anytime in Settings, and memory syncs across all your devices.
- **Styles** let you customize how Claude communicates. Choose from preset options — like concise, formal, or explanatory — or create your own custom style by describing exactly how you want Claude to write. Once set, your style applies across all conversations automatically.

### Evals

Evals (short for evaluations) are a way to develop intuition for assessing Claude's outputs on the tasks that matter to you. They're systematic ways to test how well Claude performs on specific types of tasks that matter to you.


Running simple evals helps you:

- Understand where Claude adds the most value in your workflow
- Identify tasks where you'll need to provide more context or examples
- Build confidence in Claude's outputs for recurring tasks

#### Simple eval approach

You don't need complex infrastructure to evaluate Claude. Here's a practical approach:

1. **Gather examples.** Collect 5-10 examples of a task you do regularly—emails you've written, reports you've created, analyses you've done.
2. **Create test prompts.** Write prompts that would generate similar outputs. Include the context you'd naturally have when doing this work.
3. **Compare outputs.** Run your prompts and compare Claude's responses to your examples. Ask yourself:
    - Does Claude capture the key information?
    - Is the tone and style appropriate?
    - What's missing or could be improved?
4. **Refine your approach.** Based on what you learn, adjust your prompts, add examples to show Claude what good looks like, or identify where human review is essential.

### Claude in-house products

The main three modes are chat, cowork, and claude code.

|                          | Chat                                                                                             | Cowork                                                                                                          | Code                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Optimized for**        | Quicker exchanges: exploring ideas, iterative drafting, quick answers, learning through dialogue | Complex or sustained work: research, analysis, file organization, producing finished documents and deliverables | Building software: writing, testing, running and deploying code                   |
| **Key features**         | Quick entry, dictation                                                                           | Work from local folders, plugins, subagents, scheduled tasks                                                    | Ask/Code/Plan modes, visual diffs, git integration, local and remote environments |
| **Tools and extensions** | Connectors, Skills, Claude in Chrome                                                             | Connectors (local and remote), Skills, Claude in Chrome, Plugins, Computer Use                                  | Connectors, Skills, Claude in Chrome, Plugins, Hooks                              |

- **Folder access.** Point Claude to a folder on your computer and it reads what's there, figures out what's relevant, and saves finished work back to the same place. You can also upload files, paste content into the conversation, or connect tools that pull in what Claude needs.
- **Scheduled tasks.** Claude can handle recurring work on a schedule: a daily briefing that pulls from your Slack and calendar, a weekly roundup of what shipped, a morning inbox triage that sorts what needs your attention. You define the task and when it should run, and Claude handles it automatically each time the app is open. If your computer or the app was closed when a task was due, it catches up when you're back.
- **Subagents.** Background workers that Claude spins up to handle parts of a task in parallel. If you ask for something complex — like a research brief that pulls from multiple sources — Claude breaks it into subtasks, assigns each to a subagent with its own context, and coordinates the results, giving you one finished deliverable.
- **Dispatch.** A persistent conversation thread that allows you to continue your Cowork conversations from your phone. From the Claude mobile app, you can hand Claude tasks that use everything on your computer — your files, connectors, plugins, even desktop apps. To use this feature, you need both the desktop and mobile apps, with your computer awake and the desktop app open.
- **Projects.** Projects in Cowork let you group related tasks into dedicated workspaces with their own files, context, instructions, and memory. If you use projects on Claude, Cowork projects work similarly, but they live locally on your desktop and are built around the tasks you run through Cowork.
- **Browser use.** Connect Claude in Chrome and Claude can navigate websites, interact with pages, and pull what it finds directly into the task it's working on. This is how Cowork does things like check competitor pricing across ten sites or gather data from pages that don't have an API.
- **Computer use.** When Claude doesn't have a connector or plugin for what you need, it can navigate your computer directly — clicking, typing, and opening apps just like you would. Claude follows a priority order: connectors first, then Chrome, then screen interaction, so it always picks the fastest, most reliable path. You'll see a permission prompt before Claude accesses each app, and you can set up a blocklist for anything you want off-limits. Computer use is in research preview on Pro and Max plans, macOS only (Windows coming soon)
- **Plugins.** Plugins give Claude capabilities it doesn't have on its own: pulling live financial data, searching your company's internal knowledge base, or working within a specific compliance framework. Browse and add them from the Cowork interface to fit the task.
- **Protected environment.** Cowork runs in a contained space on your computer. Claude can read, create, and edit files within the folders you share, but can't access anything outside them.
### Projects

- **Projects are self-contained workspaces** with their own memory, chat histories, knowledge bases, and customized instructions. Think of them as dedicated environments for specific work streams.
- **Project knowledge enhances Claude's understanding** by letting you upload relevant documents that Claude references across all chats within that project. No more re-uploading the same files each time.
- **Project instructions guide Claude's behavior**—you can specify tone, expertise level, response style, and more. These instructions apply to every conversation within the project.
- **Projects scale automatically.** When your knowledge base approaches context limits, Claude seamlessly enables Retrieval Augmented Generation (RAG) mode to expand capacity by up to 10x while maintaining response quality.
- **For Claude for Work users, projects enable collaboration.** Share projects with teammates so everyone benefits from the same context, instructions, and accumulated knowledge.

#### **when to use projects**

Projects are particularly valuable when you're working on something ongoing—not just a one-off question. Consider creating a project when you have a workflow with:

- **Reference materials you'll use repeatedly** (meeting notes, survey results, reports, historical data, etc.)
- **Consistent requirements** for how Claude should respond (always use formal language, always cite sources, always follow our template)
- **Team collaboration needs** where multiple people should work from the same foundation

#### **creating project instructions**

Good project instructions typically include:

- **Context about what you're working on:** "This project is for creating marketing content for our B2B software product."
- **Process instructions:** "First consider a blog structure that will entice this audience, then write the draft."
- **Tone and style preferences:** "Use a professional but conversational tone. Avoid jargon when possible."
- **Specific requirements:** "Always include a call-to-action at the end of marketing copy."

#### **adding project files**

> [!NOTE]
> **Pro tip:** Name your files descriptively. Claude uses file names to understand and retrieve the right information, so "Q4-2024-Brand-Guidelines.pdf" is more helpful than "document1.pdf."

### Claude chrome extension

<iframe width="560" height="315" src="https://www.youtube.com/embed/IypXvHej9eY?si=jD_yP-T8ERRXEn8c" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

The claude for chrome extension allows claude to read webpage content and run browser client-side JS code to interact with the page via a content script.

**security**

The claude team has made this with security in mind:

- **granular permissions**
- **limited websites**
- **protects against prompt injections**
### Skills

There are two categories of Skills you'll encounter:

- **Anthropic Skills** are created and maintained by Anthropic. These include enhanced document creation capabilities for Excel, Word, PowerPoint, and PDF files. Anthropic Skills are available to all paid users and Claude invokes them automatically when relevant—you don't need to do anything special to use them.
- **Custom Skills** are ones you or your organization create for specialized workflows and domain-specific tasks. For example, you might create a skill that applies your company's brand guidelines to presentations, structures meeting notes in a specific format, or executes your organization's data analysis workflows.

Skills are currently available as a feature preview for users on Pro, Max, Team, and Enterprise plans. To use Skills, you'll need to have Code execution and file creation enabled, since Skills require Claude's secure sandboxed computing environment to function.

**skill examples**

The beauty of Skills is that you typically don't need to think about them—Claude handles skill selection automatically based on your request. Here are some examples of prompts that would invoke Skills:

- "Create an Excel spreadsheet tracking monthly expenses with formulas for totals"
- "Turn this meeting notes document into a PowerPoint presentation"
- "Generate a PDF report summarizing this data"
- "Build a financial model in Excel with scenario analysis"

#### Security considerations

Because Skills can include executable code, it's important to use them thoughtfully:

- Only install custom Skills from trusted sources
- Anthropic's built-in Skills are tested and maintained by Anthropic
- Custom Skills you upload are private to your individual account
- If you're installing a custom Skill from an external source, review its contents before use to understand what it does.

#### Creating skills

Here's how to create a Skill through conversation:

1. **Start a new chat** and tell Claude what you want to create. For example: "I want to create a skill for writing quarterly business reviews" or "I need a skill that applies our brand guidelines to presentations."
2. **Answer Claude's questions.** Claude will interview you about your workflow, asking things like: What should this skill do? What makes good output for this type of work? Can you give examples of when you'd use this skill?
3. **Upload reference materials** if you have them. Templates, style guides, brand assets, or examples of work you're proud of all help Claude understand exactly what you're looking for.
4. **Save your skill.** When finished, Claude generates a file containing your properly structured skill. All you have to do is save it and the skill will be ready for Claude to use.

#### Skills vs. Projects

You might be wondering—if both skills and projects can be used to give more context to Claude, when should I use each? Think of it this way: **projects store knowledge, skills perform tasks**.

**Projects** are knowledge hubs. They hold the reference materials Claude needs to understand your work—project specs, meeting notes, research documents. When you upload files to a project, Claude draws on that information across every conversation within that project.

**Skills** are procedural machines. They encode _how_ Claude should execute a task—the specific steps, order of operations, and methodology you want followed every time. Skills shine when you have repeatable workflows you want Claude to run consistently.

The two features complement each other. A skill can reference knowledge stored in a project—your "customer call prep" skill might pull from customer profiles uploaded to a project's knowledge base. The project provides the _what_ (information), the skill provides the _how_ (process).

|                 | Projects                                                   | Skills                                                                |
| --------------- | ---------------------------------------------------------- | --------------------------------------------------------------------- |
| **Purpose**     | Store knowledge Claude references                          | Define processes Claude executes                                      |
| **Best for**    | Long-term context, reference materials, team collaboration | Repeatable workflows, multi-step tasks, consistent methodology        |
| **Example**     | Customer hub, research buddy, feedback generator           | Process guidelines (like brand or legal), Blog drafting, PDF creation |
| **Persistence** | Knowledge available across all chats in the project        | Instructions applied when the skill is invoked                        |

### Connectors and MCP

- **Connectors transform Claude from an assistant into an informed collaborator** by giving Claude access to the same tools, data, and context that you use every day. Instead of starting every conversation from scratch, Claude can work directly with your actual information.
- **Connectors allow Claude to read information and perform actions on your behalf.** Depending on the connector and permissions you grant, Claude can search your files, retrieve documents, analyze data, create new content, update records, and execute tasks across your connected applications—all from within your conversation.
- **The Model Context Protocol (MCP) powers connectors.** Think of MCP like USB-C for AI—a universal standard that allows Claude to connect to many different applications through a single, consistent interface. This open standard means developers can build connectors for any tool, and those connectors work seamlessly with Claude.
- **There are two types of connectors: web connectors and desktop extensions.** Web connectors link Claude to cloud services like Google Drive, Notion, Slack, and Asana. Desktop extensions run locally on your computer through the Claude Desktop app, giving Claude access to local files and native applications.

Anthropic maintains a directory of recommended connectors at claude.ai/directory. The directory is organized into two tabs:

- **Web:** Cloud services and applications (Gmail, Notion, Slack, Asana, Linear, Stripe, and many more)
- **Desktop extensions:** Local tools that run on your computer through the Claude Desktop app


#### Setting up a web connector

Here's how to connect a cloud service:

1. **Find the connector:** Navigate to claude.ai/directory, or click **+** > **Connectors** in any chat
2. **Click Connect:** Select the connector you want to add
3. **Authenticate:** You'll be redirected to the service's login page. Sign in with your existing credentials
4. **Grant permissions:** Review the specific permissions Claude is requesting, then authorize access
5. **Test the connection:** Return to Claude and try a simple request, like "Can you access my (enter tool name here)?"

#### Desktop extensions

Desktop extensions require the Claude Desktop app rather than the web interface. These extensions let Claude interact with local applications, your file system, and native features on macOS or Windows.

Some desktop extensions include:

- Local file access for reading and organizing documents
- Browser control for automated web tasks
- Native application integration (like Figma for design work)

To install a desktop extension:

1. Download and install the [Claude Desktop app](https://claude.ai/download)
2. Open the app and navigate to Settings > Extensions
3. Browse available extensions and click Install
4. Follow any additional setup steps specific to that extension


#### Security and permissions

When you connect Claude to external services, you're granting it access to read—and sometimes modify—data within those services. Here are some important considerations:

- **Scoped access:** Permissions are specific to what the connector needs and you can toggle individual permissions on and off within each application's menu.
- **Claude sees what you see:** Claude can only access data _you_ have access to. Connecting your work email doesn't give Claude access to your CEO's inbox—only your own.
- **Revocable at any time:** You can disconnect a service through Claude's settings or through the third-party service's security settings. Just as with Skills, you can also find or build custom connectors. Exercise the same caution — only install connectors from trusted sources

### Deep research

- **Research transforms how Claude finds and analyzes information.** Instead of a single search, Claude operates agentically—conducting multiple searches that build on each other while determining exactly what to investigate next. It explores different angles of your question automatically and works through open questions systematically.
- **Research delivers comprehensive answers in minutes.** Most reports complete in 5 to 15 minutes, though more complex investigations may take up to 45 minutes—work that would typically require hours of manual research.
- **Extended thinking is automatically enabled with Research.** This powerful combination lets Claude both plan its approach thoughtfully and gather comprehensive information, breaking complex requests into manageable pieces.
- **Citations make verification easy.** Research delivers thorough answers complete with easy-to-check citations, so you can trust Claude's findings and quickly verify sources yourself.

**Use Research when you need:**

- Comprehensive reports that synthesize information from multiple sources
- In-depth analysis across the web and your connected integrations (like Google Workspace)
- Thorough investigations that would typically require hours of manual work
- Comparative analysis, such as evaluating competitors or vendor options
- Reports with citations you can verify

**Research is ideal for tasks like:**

- Market analysis and competitive research
- Planning complex projects, like team offsites or product launches
- Synthesizing information from your email, calendar, and documents
- Creating technical documentation that draws from multiple sources
- Preparing briefings that require current, verified information

**Consider web search instead when:**

- You need a quick, specific fact (like today's stock price or a company's address)
- The answer requires only one or two sources
- Speed matters more than comprehensiveness

**Consider extended thinking instead when:**

- You need deep reasoning on a complex problem that doesn't require external information
- You're working on mathematical problems, code debugging, or logical analysis
- The answer comes from reasoning through a problem rather than gathering information

**Consider enterprise search instead when:**

- You need answers that draw from your organization's internal knowledge — documents, Slack threads, emails, meeting notes
- You're onboarding and want to quickly find how your company handles something (like policies, processes, or past decisions)
- You're asking a question that's specific to your company, not the public web

#### How research works

When you enable Research, you're activating an agentic, multi-step process that goes far beyond a simple web search. Claude autonomously decides what to search next based on what it has already found, pursuing leads and filling gaps without you needing to direct each step.

1. **Step 1: Claude plans its approach.** When Research is enabled, extended thinking automatically activates. This lets Claude break down your request, identify what information it needs, and plan how to investigate different angles of your question.
2. **Step 2: Claude conducts multiple searches.** Rather than running a single search, Claude conducts many searches that build on each other. It determines what to investigate next based on what it finds, pursuing promising leads and filling in gaps.
3. **Step 3: Claude synthesizes findings.** After gathering information from multiple sources—including the web and any connected integrations like Gmail, Google Calendar, or Google Drive—Claude compiles everything into a comprehensive, well-organized report.
4. **Step 4: Claude provides citations.** Every claim in Research reports links back to its source, making it easy to verify information and dig deeper when needed.

#### Tips for effective Research prompts

Since Research can take 5 to 45 minutes depending on complexity, investing time in crafting your prompt pays off. Here are some strategies:

- **Be specific about your goals.** Instead of "Tell me about the EV market," try "Analyze the electric vehicle battery market—identify key players, technology trends, and supply chain challenges that might affect investment decisions."
- **Specify the sections or structure you want.** Claude will organize its findings around the structure you provide. For example: "Compare venue options for a team offsite including: location and accessibility, meeting space and amenities, catering options, and pricing considerations."
- **Include relevant constraints.** Budget ranges, timelines, geographic requirements, and other parameters help Claude focus its research on relevant options.
- **Ask Claude to help refine your prompt.** If you're not sure how to frame your research question, you can even ask Claude to help you write a better Research prompt before enabling the feature.

## AI fluency fundamentals

### Generative AI fundamentals

Generative AI learns through two stages: pre-training (analyzing patterns across billions of examples) and fine-tuning (learning to follow instructions and provide helpful responses)

- Current capabilities include versatility across tasks, conversational awareness, and the ability to connect with external tools
- Current limitations include knowledge cutoff dates, potential for hallucinations, context window constraints, and challenges with complex reasoning