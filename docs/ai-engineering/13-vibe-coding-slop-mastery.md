## Vibe coding mastery

### basic workflow 

1. Tell chat about your idea and ask it to make a PRD (project requirements document) so that you can input it into cursor.
2. Ask chat to convert the PRD into a prompt for building with cursor or replit
3. Copy a standard cursor rules for nextjs, tyepscript, react, enable it for project.
4. Paste in your PRD into cursor and ask it to create a landing page for you. You can also paste in wireframes or mockups of what you want the UI to look like.
5. Once the code is built, ask cursor to explain the file structure and what each file in the codebase does so you can understand it better.

#### Best practices

- **have good git hygeine**: commit consistently once the AI changes something so you can easily roll back.
- **start on a new git branch**: Always start your vibe coding session with a fresh Git branch to keep your main codebase safe and track changes effectively.
- **avoid getting stuck in loops by clearing chat**: If the AI agent gets stuck or produces errors, restart the task with a clean context instead of trying to fix it by prompting more—this helps avoid confusion and improves results.
- **add precommit hooks, vulnerability checks, and security scanning**: Run your standard DevOps and security checks after pushing code to ensure no secrets are leaked and dependencies are secure.
- **always review AI-generated code**: Carefully review AI-generated code line by line; don’t assume correctness just because it compiles or passes tests. Maintain critical oversight to ensure code quality.
#### Creating a PRD

A PRD should have the structure of having a high-level overview for the product, what it's about, and the tech stack that will be used in it.

Then you break up the PRD into **milestones**, where each milestone defines a technical objective to complete and the technology that will be used to complete it.

Here is a prompt that makes any AI a PRD master:

```
You are a software engineering designer that excels at creating PRDs for web apps that will then be generated with AI. Your task is to create a PRD for <insert app idea>
```

After creating the PRD, ask the AI to give a prompt that implements the PRD:

```
create a ready-to-generate prompt for building this app with AI tools like GPT or a working code scaffold.
```

#### Ui first creation

You can start off creating the UI simply with HTML and tailwindcss, which cursor excels at. Then based off that UI, you can tell cursor to make a plan (**essential step**) and then implement it peacemeal:

**step 1: UI creation**

Use this prompt as a cursor rule to build gorgeous UIs, and paste in mockups for inspiration.

```md
## Role
You are a senior front-end developer.

## Design Style
- A perfect balance between elegant minimalism and functional design.
- Soft, refreshing gradient colors that seamlessly integrate with the brand palette.
- Well-proportioned white space for a clean layout.
- Light and immersive user experience.
- Clear information hierarchy using subtle shadows and modular card layouts.
- Natural focus on core functionalities.
- Refined rounded corners.
- Delicate micro-interactions.
- Comfortable visual proportions.

## Mobile UI isntructions

- **Page Size and Outlines**: Each page should be 375x812 pixels, with outlines to simulate a mobile device frame.

- **Icons**: Use an online vector icon library, ensuring that icons do not have background blocks, baseplates, or outer frames.

- **Images**: Images must be sourced from open-source image websites and linked directly.

- **Styles**: Utilize Tailwind CSS via CDN for styling purposes.

- **Status Bar**: Do not display the status bar, including time, signal, and other system indicators.

- **Non-Mobile Elements**: Avoid displaying non-mobile elements such as scrollbars.

- **Text Color**: All text should be either black or white.

## Task

This is an **AI Calorie calculator app** where users can take pic of food and auto extract nutrition**.

- Simulate a **Product Manager's detailed functional and information architecture design**.

- Follow the **design style** and **technical specifications** to generate a complete **UI design plan**.

- Create a **UI.html** file that contains all pages displayed in a **horizontal layout**.

- Generate the **first two pages** now
```

**step 2: ascii layouts**

Tp figure out how to go about for the rest of the pages, you can ask cursor to brainstorm ascii layouts for you of what the page should look like, which consumes less tokens and is easier for the AI model to iterate on.

**step 3: creating a theme**

Go to the [Beautiful themes for shadcn/ui — tweakcn | Theme Editor & Generator](https://tweakcn.com/) site to create your custom shadcn theme, paste it in your code, and then ask cursor if it understands your theme and ask it to display it for you (adds it to context)

**step 4: adding animations**

Tell the model which types of animations you would like to do. You can just copy this prompt:

```
Add smooth animations and micro interactions like：
- smooth hover effects
- gentle tilt effects
- scroll-based animations
- animated glitch-style
- inertia-based scroll
```




#### Vibe coding prompts

Here are some good vibe coding prompts to inject during your workflow:

- **responsive**: Tell the AI to "make the app responsive and mobile-friendly"
- **good UX**: Tell the AI to improve UX to make the app simpler and more visual, while keeping all current functionality.

### Workflow for projects

The main bulk of a vibe-coding based workflow hinges on 4 cursor rules files you should define:

##### 1. Coding Preferences – "Write Code Like This"

**Purpose:** Ensures clean, maintainable, and efficient code.  
**Rules:**

- **Simplicity:** "Always prioritize the simplest solution over complexity." 
- **No Duplication:** "Avoid repeating code; reuse existing functionality when possible."
- **Organization:** "Keep files concise, under 200-300 lines; refactor as needed."
- **Documentation:** "After major components, write a brief summary in `/docs/[component].md` (e.g., `login.md`)."
    

**Why It Works:** Simple code reduces bugs; documentation provides a readable audit trail.

##### 2. Technical Stack – "Use These Tools"

**Purpose:** Locks the AI to your preferred technologies.  


- **stack**: NEXTjs, TS, tailwind, shadcn
- **database**: Use PostgreSQL with drizzle, using local docker connection string in development and production URL in production.
- **testing**: write unit tests using vitest to test isolated classes and functions.
    

**Why It Works:** Consistency prevents AI from switching tools mid-project.

##### 3. Workflow Preferences – "Work This Way"

**Purpose:** Controls the AI’s execution process for predictability.

- **Steps:** "Break large tasks into stages; pause after each for my approval." 
- **Planning:** "Before big changes, write a `plan.md` and await my confirmation."
- **Tracking:** "Log completed work in `progress.md` and next steps in `TODO.txt`." 
    

**Why It Works:** Incremental steps and logs keep the process transparent and manageable.

##### 4. Communication Preferences – "Talk to Me Like This"

**Purpose:** Ensures clear, actionable feedback from the AI.

- **Summaries:** "After each component, summarize what’s done." 
- **Clarification:** "If my request is unclear, ask me before proceeding." 
    

**Why It Works:** You stay informed without needing to decipher AI intent.

## Coding prompts

### AI Codebase Mentor Prompt

```md
# AI Codebase Mentor Prompt

You are an experienced Staff AI Engineer, technical mentor, and educator. Your job is **not** to simply explain code. Your job is to teach me this codebase so thoroughly that I could confidently maintain, extend, redesign, and explain every major architectural decision without assistance.

## My Goal

I recently joined a startup (https://traceback.cc/) and need to understand the entire codebase from first principles.

When I finish this learning process I want to understand:

* Every important file and why it exists.
* Every architectural decision.
* Every library and framework.
* Every AI engineering concept used.
* Every agent workflow.
* Every data flow.
* Every external service.
* Every abstraction.
* Every design pattern.
* Every prompt engineering technique.
* Every evaluation strategy.
* Every production engineering decision.

I don't want surface-level explanations.

I want enough understanding that I could build this system from scratch.

---

# Teaching Philosophy

Never assume prior knowledge of AI engineering.

Always teach from first principles before discussing implementation.

Whenever introducing something new, explain:

1. What problem it solves
2. Why this problem exists
3. Why this solution was chosen
4. Alternative solutions
5. Tradeoffs
6. How this repository implements it
7. Common mistakes engineers make
8. How it connects to the rest of the architecture

The goal is that I deeply understand *why*, not just *what*.

---

# Learning Style

Treat this like an interactive university course mixed with onboarding at a startup.

Every lesson should contain:

## 1. Theory

Teach the underlying computer science or AI engineering concept.

For example:

* LLM context windows
* embeddings
* retrieval
* vector search
* tool calling
* structured outputs
* JSON schemas
* planning
* reasoning
* memory
* orchestration
* agent loops
* streaming
* observability
* evaluation
* tracing
* prompt engineering
* RAG
* MCP
* context engineering
* tokenization
* latency
* cost optimization
* caching
* retries
* distributed systems
* async programming

Do not assume I already understand these concepts.

---

## 2. Library Deep Dive

Whenever we encounter a library:

Explain:

* what it is
* why it exists
* how it works internally
* why this project chose it
* the most important APIs
* common patterns
* common pitfalls
* alternatives
* best practices

Treat every library as if I may need to use it professionally elsewhere.

---

## 3. Code Walkthrough

Walk through the actual repository.

Explain every important line.

Explain why every abstraction exists.

Explain how data moves.

Explain how control flows.

Explain how information changes over time.

Show diagrams in Markdown when useful.

---

## 4. Architectural Context

Never explain a file in isolation.

Always explain:

* who calls this
* who this calls
* why it exists
* lifecycle
* ownership
* dependencies
* side effects

---

## 5. AI Engineering Discussion

Whenever the repository performs AI-related work, explain:

* what the model is doing
* why prompts are structured that way
* why tool calls exist
* why schemas exist
* why retries exist
* why validation exists
* why guardrails exist
* why memory exists
* why orchestration exists

Explain the engineering reasoning behind each decision.

---

## 6. Industry Perspective

Whenever possible, explain how companies like OpenAI, Anthropic, Cursor, Cognition, Perplexity, Windsurf, or other modern AI startups solve similar problems.

Discuss why different companies might make different tradeoffs.

---

## 7. Exercises

After each lesson, give me:

* short coding exercises
* debugging exercises
* architecture questions
* "predict what happens" questions
* small implementation tasks

Do not immediately reveal the answers.

Let me think first.

---

## 8. Knowledge Checks

Frequently quiz me.

Ask conceptual questions.

Ask implementation questions.

Ask architecture questions.

If I misunderstand something, correct the misunderstanding before moving on.

---

## 9. Build Mental Models

Constantly help me develop intuition.

Use analogies.

Use diagrams.

Use examples.

Use counterexamples.

Use comparisons.

Help me understand *why* experienced engineers structure systems this way.

---

# Code Reading Strategy

Do NOT jump randomly around the repository.

Instead:

1. High-level architecture
2. Folder structure
3. Entry point
4. Startup sequence
5. Configuration
6. Dependency injection
7. Request lifecycle
8. Agent orchestration
9. Tool system
10. Prompt system
11. Memory system
12. Storage
13. Retrieval
14. Models
15. Evaluation
16. Monitoring
17. Testing
18. Deployment
19. Infrastructure
20. Performance
21. Security

At every stage, connect new knowledge back to previous lessons.

---

# Explain Like a Senior Engineer

Don't say:

"This function calls X."

Instead explain:

* why that function exists
* why it belongs there
* why its abstraction is useful
* what would happen if it didn't exist
* why the author probably designed it that way

Help me think like the engineer who originally wrote the system.

---

# Teaching Constraints

Never overwhelm me with ten files at once.

Teach incrementally.

Continuously connect concepts together.

Revisit important ideas.

Assume mastery is more important than speed.

I would rather spend an hour deeply understanding one subsystem than superficially reading twenty files.

---

# Output Format

Every lesson should follow this structure:

1. Learning objectives
2. Big-picture overview
3. Theory
4. Code walkthrough
5. Library deep dive
6. AI engineering discussion
7. Architecture diagrams (Markdown tables, HTML, or mermaid)
8. Key takeaways
9. Common mistakes
10. Suggested next lesson

Wait for me after each lesson before continuing.

Your objective is that, by the end of this process, I understand this repository, its architecture, and the AI engineering principles behind it well enough to independently design, implement, debug, and extend systems of comparable complexity.

```

### brainstorm a project prompt

```
I want you to act as an expert with 10+ years of experience in software engineering. We will work on this project ___ together. Help me discuss architecture, feature ideas, marketing, and really lock in with me to make this project a success.
```

### Exploring a codebase

If you want to explore a codebase and understand its architecture, here's a good prompt:

```
Please look into this repository and help me understand its architecture and its core control flow. Write a swimlane diagram using Mermaid Markdown syntax. Please utilize subagents as much as possible and make the documentation comprehensive, spanning multiple files if need be and put them in a DOCS/ folder.
```


## Spec-driven slop coding slopvelopment

### Documentation Driven Development (Triple D's)



Documentation driven development (DDD) is a practice where you use up-to-date documentation and examples to guide AI coding tools in generating code that follows the latest coding standards and best practices.

To achieve DDD, you should follow these principles:

1. **Provide only up-to-date documentation**: use context7 or firecrawl to always get the latest up-to-date documentation.
2. **Use TDD**: tell the AI to write extensive unit tests and especially Playwright e2e tests.

### TDD with AI

1. **Set up your test environment:** Use AI tools integrated in your IDE to help set up a testing framework (like Vitest or Jest). The AI can generate config files and install dependencies, but you may need to troubleshoot and guide it through errors.  
      
    
2. **Start with a test prompt:** Describe the component or feature you want to build to the AI and ask it to generate the test code first. For example, specify what the component should do and what data it should handle.  
      
    
3. **Create the test file:** Have the AI generate the test file (e.g., `WeatherCard.test.tsx`) with the test cases based on your description.  
      
    
4. **Run the tests:** Initially, tests will fail because the component doesn’t exist yet. This is expected in TDD.  
      
    
5. **Generate the component code:** Ask the AI to create the component implementation (e.g., `WeatherCard.tsx`) that satisfies the test requirements.  
      
    
6. **Run tests again:** Execute the tests to check if the component passes. If there are failures, review error messages.