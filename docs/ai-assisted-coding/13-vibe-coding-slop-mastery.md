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

### SDLC with AI

The Software Development Life Cycle (SDLC) is a structured process that guides software development through four core phases:  
  

- **Planning:** This is the foundation where you define the scope of your project, usually starting with a minimum viable product (MVP) that includes a core feature and a couple of side features. You create a detailed Product Requirements Document (PRD) that outlines user flows, navigation, and mockups. This step ensures clear goals and reduces costly changes later.  
      
    
- **Implementation:** Here, you build the software. The course emphasizes starting with the front-end design as a blueprint—like planning the layout of a house—before developing the back-end logic. Building back-end features in small, isolated, testable blocks helps maintain flexibility and ease of debugging.  
      
    
- **Testing:** After implementation, thorough testing, debugging, and code reviews are conducted to ensure the app works correctly, is secure, and meets quality standards.  
      
    
- **Deployment:** Finally, the app is deployed online for users. But this isn't the end; SDLC is iterative. After deployment, you return to planning for new features or improvements, following Agile principles.

### TDD with AI

1. **Set up your test environment:** Use AI tools integrated in your IDE to help set up a testing framework (like Vitest or Jest). The AI can generate config files and install dependencies, but you may need to troubleshoot and guide it through errors.  
      
    
2. **Start with a test prompt:** Describe the component or feature you want to build to the AI and ask it to generate the test code first. For example, specify what the component should do and what data it should handle.  
      
    
3. **Create the test file:** Have the AI generate the test file (e.g., `WeatherCard.test.tsx`) with the test cases based on your description.  
      
    
4. **Run the tests:** Initially, tests will fail because the component doesn’t exist yet. This is expected in TDD.  
      
    
5. **Generate the component code:** Ask the AI to create the component implementation (e.g., `WeatherCard.tsx`) that satisfies the test requirements.  
      
    
6. **Run tests again:** Execute the tests to check if the component passes. If there are failures, review error messages.

## Advanced vibe coding

### Spec driven development

A **Spec** is a single document that contains the UI/UX, tech, and business logic info of a desired feature to implement within the app.

If a spec has these three things:

1. **technology constraints**: what libraries to use, 
2. **visual requirements**: what the UI/UX should look like and acceptance criteria for that
3. **performance requirements**: what the desired performance of the feature should be and acceptance criteria for that

Then you can give that spec to AI and it will be able to vibe through it and complete it pretty nicely.

## Vibe coding workflows with different harnesses

### Codex

### Claude

#### Permissions

```json
{
  "model": "claude-opus-4-6",
  "permissions": {
    "allow": [
      "Bash(npm test)",
      "Bash(npm run lint)",
      "Bash(npm run dev)",
      "Bash(npm run build)",
      "Bash(npm run format)",
      "Bash(git status)",
      "Bash(git diff)",
      "Bash(git log)",
      "Bash(git add)",
      "Bash(git commit)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(rm -rf /)",
      "Bash(git reset --hard)",
      "Bash(git clean -fd)",
      "Bash(git push --force)",
      "Bash(npm publish)",
      "Bash(sudo)"
    ]
  },
  "context": {
    "maxTokens": 100000,
    "autoCompact": true,
    "autoCompactThreshold": 80000
  }
}
```

#### Hooks

```json title=".claude/settings.local.json"
{
  "PreCommit": [
    {
      "matcher": "*.ts",
      "command": "npx eslint --fix ${file} && npx prettier --write ${file}"
    },
    {
      "matcher": "*.tsx",
      "command": "npx eslint --fix ${file} && npx prettier --write ${file}"
    },
    {
      "matcher": "*.js",
      "command": "npx prettier --write ${file}"
    },
    {
      "matcher": "*.json",
      "command": "npx prettier --write ${file}"
    },
    {
      "matcher": "*.md",
      "command": "npx prettier --write ${file}"
    }
  ],
  "PostFileWrite": [
    {
      "matcher": "*.js",
      "command": "npx eslint --fix ${file}"
    },
    {
      "matcher": "*.ts",
      "command": "npx eslint --fix ${file}"
    },
    {
      "matcher": "*.tsx",
      "command": "npx eslint --fix ${file}"
    },
    {
      "matcher": "src/**/*.test.ts",
      "command": "npx jest --findRelatedTests ${file} --passWithNoTests"
    },
    {
      "matcher": "src/**/*.test.tsx",
      "command": "npx jest --findRelatedTests ${file} --passWithNoTests"
    }
  ],
  "OnTaskComplete": [
    {
      "description": "Desktop notification on build completion",
      "matcher": "build",
      "command": "osascript -e 'display notification \"Build complete\" with title \"Claude Code\"' || notify-send 'Build complete'"
    }
  ]
}
```

#### Claude code commands

Good claude code commands have three properties:

1. **explicit steps**: no ambiguity, explicit ordered steps
2. **structured output**: follows an example output you specify in the command file
3. **clear success criteria**: know what done means.

##### `/review`

````md
# /review

Review the current project for code quality issues.

## Steps

1. Read all source files in `src/`.
2. Check for **security issues**: unsanitized inputs, missing auth checks, exposed secrets.
3. Check for **performance issues**: N+1 queries, missing indexes, unbounded loops, memory leaks.
4. Check for **code style**: inconsistent naming, missing error handling, dead code, missing types.
5. Output a structured summary:

```
## Code Review Summary

### Security
| Severity | File | Issue | Suggestion |
|----------|------|-------|------------|
| ...      | ...  | ...   | ...        |

### Performance
| Severity | File | Issue | Suggestion |
|----------|------|-------|------------|
| ...      | ...  | ...   | ...        |

### Code Style
| Severity | File | Issue | Suggestion |
|----------|------|-------|------------|
| ...      | ...  | ...   | ...        |

### Overall: PASS / NEEDS ATTENTION
```

## Notes

- Severity levels: HIGH, MEDIUM, LOW
- If no issues found in a category, say "No issues found"
- Be specific about file paths and line numbers
````

##### `/scaffold`

````md
# /scaffold $ARGUMENTS

Generate a new feature module with route and test files.

The feature name is provided as: $ARGUMENTS

## Steps

1. Read the existing `src/example-project/server.ts` to understand the current patterns (route structure, error handling, types).
2. Create a new route file at `src/example-project/$ARGUMENTS.ts` that:
   - Exports an Express Router
   - Includes GET (list all), GET by ID, POST (create), PUT (update), and DELETE endpoints
   - Uses the same error handling pattern as server.ts
   - Includes TypeScript interfaces for the resource
   - Uses in-memory Map storage (matching the existing pattern)
3. Create a test file at `src/example-project/$ARGUMENTS.test.ts` that:
   - Tests all CRUD operations
   - Tests error cases (404, 400)
   - Uses supertest (matching the existing test pattern)
4. Show how to wire the new router into server.ts (but don't modify server.ts automatically).

## Success Criteria

- New files follow the exact patterns from the existing codebase
- Tests pass when run with `npx jest`
- TypeScript compiles without errors
````

##### `/verify`

````md
# /verify

Run tests and lint, then summarize results.

## Steps

1. Run `npm test` and capture the output.
2. Run `npm run lint` and capture the output.
3. Summarize results in this format:

```
## Verification Summary
- Tests: PASS / FAIL (X passed, Y failed)
- Lint: PASS / FAIL (X errors, Y warnings)
- Issues: [list any failures with file paths and suggested fixes]
```

## Success Criteria

All tests pass and zero lint errors. If anything fails, suggest specific fixes.
````
## Lovable

### Frontend with Lovable

#### System prompt

The first step with Lovable is the system prompt. In this system prompt you should specify:

- **software development principles**: what libraries to use, what tech stack, whether to use OOP, how to do error handling and security.
	- **comprehensive logging**: add detailed console log patterns for observability built in straight from the start.
	- **dry principle**: ask the AI to refactor early and split out components into modules so that it doesn't repeat itself.
- **tech stack**: zod, typescript, tanstack query, tailwindcss
- **workflow constraints**: rules for how the AI should conduct code writing and turns, like test driven development.
	- **TDD**: ask AI to use TDD, following the red-green-refactor cycle.
	- **OOP**: ask AI to use OOP and follow SOLID design principles for clean code.
	- **page by page**: when implementing the frontend, go page by page, perfecting each section before you move on to the next one.

1. To achieve this, brainstorm with some other AI like ChatGPT by entering this prompt:

````md
## Your Role
You are a technical project interviewer for Lovable.dev projects. Your goal is to gather enough information to generate a comprehensive knowledge base file for AI-assisted development.

## Your Goal
Ask focused questions to understand:
1. **Project Overview** — What the project does, who it's for, what problem it solves, and success metrics
2. **North Star Feature** — The single most critical user flow that defines product success
3. **Performance Targets** — Key metrics for the north star feature (if applicable)

## Interview Structure

Start with: "I'll help you create a knowledge base for your Lovable project. I'll ask you a few questions to understand your product vision. Let's start with the basics."

### Questions to Ask (in Order):

**Project Overview:**
1. "What is your project in one sentence? What does it do?"
2. "Who is this for? Describe your target user."
3. "What specific problem does this solve for them? What's the pain point?"
4. "How will you measure success? What's the key user action or metric?"

**North Star Feature:**
5. "What's the ONE feature that defines your product's core value? The feature that if it doesn't work well, nothing else matters?"
6. "Walk me through the ideal user flow for this feature step-by-step."
7. "What makes this feature 'feel right' to users? What's the magic moment?"
8. "Are there any performance requirements for this feature? (examples: load times, response times)"

## Output Format

After gathering answers, generate a knowledge base file in this exact structure:
```
# [Project Name] — Knowledge Base

## Project Overview
**What:** [One sentence description]
**Who:** [Target user description]
**Problem:** [Pain point in user's voice]
**Success:** [Key success metric]

---

## Software Development Principles

1. **Project Structure:** Maintain consistent file and folder organization. Group related code by feature or domain. Follow established patterns for hooks, components, utilities, and types. Keep separation of concerns clear between UI, business logic, and data layers.
2. **Strict TypeScript:** Always use strict typing. Avoid 'any'. Ensure data structures are explicitly defined to prevent runtime errors.
3. **Descriptive Naming:** Use clear, intent-based names for variables, functions, and components (example: `isUserAuthenticated` instead of `auth`).
4. **DRY Principle:** Do not repeat yourself. Centralize shared logic, types, and components. If a pattern is used more than twice, create a reusable utility or component.
5. **Error Handling:** Always implement 'Unhappy Path' logic. Provide clear, user-friendly error messages and loading states for all asynchronous actions.
6. **Security (Server-Side Logic):** Never trust the client. Sensitive logic, data validation, and API keys must remain on the server/back end.
7. **Accessible Component Design:** Build using small, isolated UI components with proper accessibility. Use ARIA labels, semantic HTML, keyboard navigation support, and ensure WCAG AA compliance. Components should be reusable and follow standard naming conventions (Modals, Cards, Buttons).
8. **Mobile-First Responsiveness:** All UI must be fully responsive and optimized for mobile devices before scaling to desktop.
9. **Comprehensive Logging:** Always implement detailed logging by default to ensure observability and rapid debugging. Log edge function entry/exit with parameters, external API calls with request/response details, database operations, authentication events, and data transformations at key boundaries. Use structured logging with consistent formats.
10. **Modular Architecture:** Structure all code (front end and back end) in a modular way so that individual features can be tested, debugged, and rolled back without affecting global state. Keep concerns separated and dependencies explicit.

---

## Workflow Constraint

1. Build the front-end UI first. Do not implement back-end integrations or database schemas until the front-end user flow is explicitly approved.
2. When implementing the front end, make sure to implement it page by page, explicitly asking me to approve each page.
3. Test-Driven Development: Follow the Red-Green-Refactor cycle for all front-end and back-end implementation. Write a failing test before any implementation code. Use Vitest + React Testing Library for components, Vitest with mocked Supabase client for edge functions. Co-locate test files next to source files. All tests must pass before committing.
4. After each module implementation, instruct me how i can test the new implemented capability in the preview mode. Do not continue implementing the next module until I confirm I’m ready 

---

## North Star Feature

**Priority #1:** [Feature Name] ([Tagline])

[Description of why this matters]

[Numbered step-by-step flow]

[Context about supporting features]

[Performance philosophy if relevant]

**Performance Target:** [if applicable]
- [metric]: [target]
- [metric]: [target]
```

## Interview Style
- Ask ONE question at a time.
- Keep questions conversational and clear.
- Validate understanding before moving on.
- If an answer is vague, ask for specific examples.
- Don't move to the next section until you have clear, concrete answers.

## Before Generating Output
Confirm with the user: "I have everything I need. Let me generate your knowledge base file. Does this cover everything, or is there anything else critical I should know about your project's vision?"

---

Begin the interview now.
````

2. Enter the result of what you got as the Lovable system prompt.

Here's an example of the perfect system prompt that combines software development principles and workflow constraints:

```md
# Recipe Matcher MVP — Knowledge Base

## Project Overview
**What:** An ingredient-first recipe matcher that ranks recipes by match quality, with pantry persistence and favorites for all signed-in users.
**Who:** Home cooks who hate food waste and need cooking inspiration from random ingredients they already have.
**Problem:** "I have stuff in my fridge but no idea what to cook right now."
**Success:** Time from ingredient entry to clicking a recipe (speed = magic).

---

## Software Development Principles

1. **Project Structure:** Maintain consistent file and folder organization. Group related code by feature or domain. Follow established patterns for hooks, components, utilities, and types. Keep separation of concerns clear between UI, business logic, and data layers.
2. **Strict TypeScript:** Always use strict typing. Avoid 'any'. Ensure data structures are explicitly defined to prevent runtime errors.
3. **Descriptive Naming:** Use clear, intent-based names for variables, functions, and components (examples: `isUserAuthenticated` instead of `auth`).
4. **DRY Principle:** Do not repeat yourself. Centralize shared logic, types, and components. If a pattern is used more than twice, create a reusable utility or component.
5. **Error Handling:** Always implement 'Unhappy Path' logic. Provide clear, user-friendly error messages and loading states for all asynchronous actions.
6. **Security (Server-Side Logic):** Never trust the client. Sensitive logic, data validation, and API keys must remain on the server/back end.
7. **Accessible Component Design:** Build using small, isolated UI components with proper accessibility. Use ARIA labels, semantic HTML, keyboard navigation support, and ensure WCAG AA compliance. Components should be reusable and follow standard naming conventions (Modals, Cards, Buttons).
8. **Mobile-First Responsiveness:** All UI must be fully responsive and optimized for mobile devices before scaling to desktop.
9. **Comprehensive Logging:** Always implement detailed logging by default to ensure observability and rapid debugging. Log edge function entry/exit with parameters, external API calls with request/response details, database operations, authentication events, and data transformations at key boundaries. Use structured logging with consistent formats.
10. **Modular Architecture:** Structure all code (front end and back end) in a modular way so that individual features can be tested, debugged, and rolled back without affecting global state. Keep concerns separated and dependencies explicit.

---

## Workflow Constraint
1. Build the front-end UI first. Do not implement back-end integrations or Database schemas until the front-end user flow is explicitly approved.
2. When implementing the front end, make sure to implement it page by page, explicitly asking me to approve each page. 
3. Test-Driven Development: Follow the Red-Green-Refactor cycle for all front-end and back-end implementation. Write a failing test before any implementation code. Use Vitest + React Testing Library for components, Vitest with mocked Supabase client for edge functions. Co-locate test files next to source files. All tests must pass before committing.
4. After each module implementation, instruct me how i can test the new implemented capability in the preview mode. Do not continue implementing the next module until I confirm I’m ready 

---

## North Star Feature
**Priority #1:** Ingredient → Recipe Search (The Magic Moment)

This is the anchor feature everything else supports. The entire UX flows from this:
1. User adds ingredients (fast autocomplete)
2. Hits "Let's cook something!" 
3. Sees ranked results instantly (showing match percentages)
4. Clicks recipe → sees what they have vs. need

Everything else (pantry, favorites, onboarding) exists to make this faster on repeat visits. If search feels slow or confusing, the product fails. Optimize relentlessly for time-to-first-recipe-click.

**Performance Target:** 
- Autocomplete: <300ms
- Recipe search: <1
- Recipe details: <500ms
```

#### Create color system prompt

Once you tweak the design of your app to something you're happy with, you can then use this prompt to extract that into a complete color system:

1. Tweak the app design to something you like
2. Ask AI to extract the app styles into a design system using this prompt:

```md
Analyze the current design of this project and create a complete Design System Specification document that I can add to my project's knowledge base.

Include ALL of the following in exhaustive detail:

1. **Theme Philosophy** — Describe the overall aesthetic in 12 sentences

2. **Color Palette** — List every color token with:
   - CSS variable name
   - HSL value
   - Hex equivalent
   - Usage context (when to use each color)

3. **Typography** — Include:
   - Font families for headings and body
   - Google Fonts import URL
   - Font weights used
   - Text sizes (mobile and desktop) with Tailwind classes

4. **Border Radius** — Document:
   - Base radius variable
   - All radius sizes with values and Tailwind classes
   - Common usage patterns for each

5. **Shadows** — List all shadow variables with CSS values and use cases

6. **Gradients** — All gradient definitions with CSS values

7. **Button Specifications** — Include:
   - Size variants (height, padding, classes)
   - Style variants (colors, hover states, borders)
   - Focus and disabled states

8. **Card Specifications** — Base styles and enhanced variants

9. **Input Specifications** — Height, borders, focus states

10. **Badge/Tag Specifications** — Styles for pills and tags

11. **Icon Containers** — Sizes and border radius patterns

12. **Animations** — Keyframe definitions and usage

13. **Spacing and Layout** — Container sizes, section padding, gap patterns

14. **Hover and Interactive States** — All hover behaviors

Format this as a clean, copy-paste ready document using markdown headers and code blocks where appropriate. Do NOT use emojis. Make it technical and precise so future prompts can reference it for consistency.
```

3. Attach the results of the prompt into the system prompt for lovable so it understands the design system and what colors to use.
4. Ask Lovable to create UI based on the design system:

```
The UI should feel like an upscale restaurant menu meets a modern app—sophisticated, warm, and inviting. 
The overall feel should be premium, warm, and food-focused—like a high-end cooking app. 
Hero Section should have a full-width background image (elegant food photography) with dark linear gradient overlay to bottom. 
Dark elegance with warm golden accents. 
The UI uses a sophisticated charcoal background paired with golden/amber highlights to create a premium, inviting food app aesthetic. 
Dark-mode first design.
```

#### Florish

- **SVG animations**: drop in SVG animations and tell it to use the JavaScript animations API to make complex timeline animations of it.
- **Skeletons**: ask it to add loading skeletons.
### Backend with Lovable Cloud

The Lovable Cloud option allows you to use Lovable's integrated backend to make your app a full-stack app.

> [!NOTE]
> Under the hood, lovable cloud is powered by Supabase.



![](https://i.imgur.com/KcVZfsB.jpeg)


#### Create backend architecture system prompt

```md
Act as a **principal software architect and teacher**. Your goal is to help me design an architecture for this web app built based on **Lovable (frontend)** with **Supabase (backend via Lovable Cloud)**. 

Useful libraries to add:

- Tanstack query for data fetching and caching
- Zod for single source of truth for typescript and runtime validation, export inferred types from created zod schemas in a /globals/schema.ts as the typescript types to use throughout the application

---



### Step 1: Analyze the existing front end.
Use your tools to thoroughly examine:
- All pages in `src/pages/`
- All components in `src/components/`
- Types and interfaces in `src/types/`
- Mock data and services in `src/data/` and `src/lib/`
- Routing configuration in `src/App.tsx`
- Any existing state management

### Step 2: Review knowledge in settings.
Understand everything that the user stored in Knowledge already regarding this project. 

### Step 3: Internal findings checklist
Silently confirm you understand:
- [ ] App purpose and core value proposition
- [ ] User types (Guest/Authenticated/Premium)
- [ ] Core user flows from pages and navigation
- [ ] Data entities from types and interfaces
- [ ] Mock services that need real back-end replacement
- [ ] Authentication patterns and protected routes
- [ ] Data relationships and ownership
      
### Step 4: architecture design

- [ ] Database: map out the tables and RLS policies
- [ ] Authentication: enable email OTP passwordless auth and google auth, ask me securely for the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET secrets and then instruct me as how to set the redirect URI and authorized domains on the google oauth credentials page, walking me through the steps and the exact urls I should put down, wait until I confirm I did it and it worked.
- [ ] Edge functions: when creating edge function architecture, understand which ones need JWT verification (authenticated user performing CRUD on resources they own) and implement edge functions with TDD.
- [ ] Payments: use your Stripe integration for payments

```

### Quality Assurance and control

#### Code review prompt

Here is a list of what to ask AI to review in a comprehensive code review:

1. Separation of concerns, following clean code
2. No mock data or ghost data
3. Type safety: complete type safety with zod
4. Error handling: no silent failures, failures are surfaced to UI

And here's the prompt:

```
Perform a comprehensive audit of the entire codebase to ensure our architecture is clean, modular, and optimized for production.

##Key Audit Areas:

**Separation of Concerns:** Check if UI components are doing too much 'thinking.' Identify logic that should be moved into Hooks or Edge Functions.
**The DRY Principle:** Locate any duplicate logic, especially in our API translation and data fetching layers.
**Ghost Code and Cleanup:** Identify any leftover mock data, unused imports, or 'dead' code from previous versions.
**Type Safety:** Scan for loose types or 'any' usage that compromises our guardrails. Ensure guest and premium data shapes are clearly separated.
**Error Handling:** Identify 'Silent Failures' where the UI might hang if a courier (API/DB) doesn't respond.
**Organization:** Point out misplaced files or logic that doesn't follow a standard React/Supabase structure.
**Output Requirements:** Provide a detailed report with specific recommendations. Do not modify the code yet. Break the suggestions down into an ordered list from 'Critical Fixes' to 'Optional Polish.'
**This is a read-only analysis; acknowledge that you will not make changes until instructed.**
```

#### Code refactoring

DO NOT ask AI to fix everything at once. Refactor one thing at a time:


1. Dead code removal
2. remove duplicated code where it makes sense to refactor instead
3. UI/UX polish

And here's the prompt:

```
# Role: Senior Engineer — Audit Fix Implementation

You are a Senior Engineer implementing fixes from a recent audit. The work is split into **two types**: bug fixes (correcting broken behavior) and refactoring (improving structure without changing behavior). Both are organized into **five sequential clusters** for controlled rollout.

## Ground Rules
- Do not begin any cluster until explicitly instructed.
- Never alter tests to make them pass. Always fix the underlying issue.
- Before starting each cluster, confirm your implementation plan and flag which items are bug fixes vs. refactoring.

## Cluster Execution Protocol

Every cluster follows the same four steps:

1. **Confirm plan** — Outline what you intend to change, and label each item as BUG FIX or REFACTOR.
2. **Implement** — Execute all fixes for this cluster.
3. **Summarize** — Describe the specific changes made.
4. **Impact Zone & Testing** — Identify which features or pages could be affected, run the test suite, and fix any failures at the source until all tests pass.

## Clusters

| # | Cluster | Type | Focus |
|---|---------|------|-------|
| 1 | **Dead Code Removal** | Refactor | Delete unused files, functions, and types |
| 2 | **DRY & Deduplication** | Refactor | Consolidate nav, animations, autocomplete, shared edge function utilities |
| 3 | **Data & Type Cleanup** | Bug Fix + Refactor | Fix RLS policies, resolve type drift, fix inefficient queries, adopt React Query |
| 4 | **UX Polish** | Bug Fix + Refactor | Fix password validation, fix logged-in CTA, align NotFound to design system |
| 5 | **Test Alignment** | Refactor | Update test files to reflect current service layer |

Do not advance to the next cluster until the user says **"Proceed."**

## Important: Cluster 3 — RLS Policies
When fixing RLS policies, the goal is **not** to make them less strict — it is to make them correctly configured. Each policy must enforce row-level ownership: a user can only read, insert, update, or delete rows where `user_id` matches their own authenticated ID. Do not write policies that allow any user to access another user's data. Confirm the exact policy logic before implementing.

## Final Step — Audit Reconciliation
Once all clusters are complete, run a full audit reconciliation: check every item from the original audit report and confirm what was resolved, what was partially addressed, and what (if anything) remains open.
```

#### Chaos engineering

Test the unhappy paths like network failures, race conditions, malformed input data so you have robust error handling and graceful failover.

```md
Review the full front end and edge function test suites. List all the features and behaviours that currently have test coverage, and identify what's missing. 
Focus on: unhappy paths we haven't tested (network failures, timeouts, malformed data), edge cases (empty inputs, extremely long inputs, duplicate submissions), error handling (what does the user see when something fails?), and boundary conditions (rate limits, large result sets, expired sessions). 
Present the gaps as a prioritised list—critical gaps first. 
```

### Lovable Security testing

Lovable offers a free security testing and fixing service:


![](https://i.imgur.com/NZ7ETHL.jpeg)

### Lovable cloud environments

Lovable cloud environments allows you to sandbox your code into different deployment environments, like live vs test.


![](https://i.imgur.com/fiokinw.jpeg)

Once you enable this feature, it duplicates the codebase and backend infra to have one test environment and one live environment.

- Test data stays in test
- Live data never gets overwritten


![](https://i.imgur.com/wjSBAVo.jpeg)

### Compliance


- **legal pages**: The required legal pages are:
	- **privacy policy**: highlights the data you collect
	- **terms of service**: your contract with users
	- **cookie policy**: browser data disclosure

GDPR requires users to be able to perform CRUD on their own data and delete their accounts or change their emails.

here is how to achieve all of that within one prompt:

````md
# Compliance PRD: Settings and Data Management Page

## Overview
Add a Settings page that gives authenticated users full control over their personal data, in compliance with GDPR and CCPA requirements. Add legal pages (Privacy Policy, Terms of Service, Cookie Policy) accessible from the app footer, and a cookie consent popup for first-time visitors.

## User Flow

### Accessing Settings
1. User clicks their profile icon or name in the top navigation bar,
2. A dropdown menu appears with two options: **Settings** and **Sign Out**,
3. User clicks **Settings** → navigates to the Settings page,

### Accessing Legal Pages
1. Footer is visible on every page of the app,
2. Footer contains three links: **Privacy Policy**, **Terms of Service**, **Cookie Policy**,
3. Each link opens the respective legal page,

---

## Page Layout: Settings

### Section 1: Personal Information
Displays all personal data the app stores for the authenticated user.

```
+-------------------------------+
|  Settings                     |
|                               |
|  PERSONAL INFORMATION         |
|  +-------------------------+  |
|  | Name:  [Jane Doe  ] Edit|  |
|  | Email: [jane@... ] Edit |  |
|  +-------------------------+  |
|                               |
|  [ Save Changes ]             |
+-------------------------------+
```

**Behavior:**
- Fields are read-only by default,
- Clicking "Edit" or the field makes it editable,
- "Save Changes" appears only when a field has been modified,
- On success → toast: "Profile updated successfully",
- On error → toast: "Failed to update profile. Please try again."

### Section 2: Delete Account

```
+-------------------------------+
|  - - - - - - - - - - - - -   |
|                               |
|  DANGER ZONE                  |
|                               |
|  Permanently delete your      |
|  account and all data.        |
|  This cannot be undone.       |
|                               |
|  [ Delete My Account ]  (red) |
+-------------------------------+
```

**Behavior:**
- "Delete My Account" is styled in red to signal destructive action,
- Clicking it opens a confirmation dialog (see below),

### Confirmation Dialog: Delete Account

```
+-------------------------------+
|                               |
|  ! Are you sure?              |
|                               |
|  This will permanently        |
|  delete your account and      |
|  all your data, including:    |
|                               |
|  - Your saved pantry items    |
|  - Your favorite recipes     |
|  - Your profile information   |
|                               |
|  This cannot be undone.       |
|                               |
|  Type "DELETE" to confirm:    |
|  +-------------------------+  |
|  |                         |  |
|  +-------------------------+  |
|                               |
|  [Cancel]  [Delete Everything]|
+-------------------------------+
```

**Behavior:**
- User must type "DELETE" to enable the "Delete Everything" button,
- Button is disabled and greyed out until confirmation word is typed,
- On confirmation → delete all user data → sign user out → redirect to landing page,
- Toast on landing page: "Your account and all data have been permanently deleted",
- "Cancel" closes the dialog with no changes,

---

## Page Layout: Legal Pages

Each legal page uses a simple, readable layout:

```
+-------------------------------+
|  < Back                       |
|                               |
|  Privacy Policy               |
|  Last updated: [date]         |
|                               |
|  [Content from Termly or      |
|   Iubenda goes here]          |
|                               |
+-------------------------------+
```

**Note:** The actual legal content should be generated using a service like Termly (termly.io) or iubenda (iubenda.com). This PRD defines the page layout and navigation only — not the legal text itself.

---

## Cookie Consent Popup

Shown once to first-time visitors at the bottom of the screen:

```
+-------------------------------+
| We use cookies to keep you    |
| logged in and improve your    |
| experience.                   |
| Read our Cookie Policy.       |
|                               |
|      [Accept]  [Decline]      |
+-------------------------------+
```

**Behavior:**
- Appears on first visit, pinned to the bottom of the viewport.
- "Accept" → stores consent, popup disappears, does not show again.
- "Decline" → stores refusal, popup disappears, does not show again.
- "Cookie Policy" links to the Cookie Policy legal page.
- User's choice is stored locally so the popup doesn't reappear.

---

## Footer (All Pages)

```
---------------------------------
Privacy Policy | Terms | Cookies
---------------------------------
```

Added to the bottom of every page. Each link opens the respective legal page.

---

## Edge Cases

| Scenario | Expected Behavior |
|---|---|
| User tries to save an empty name field | Validation error: "Name cannot be empty" |
| User tries to change email to invalid format | Validation error: "Please enter a valid email address" |
| User types "delete" (lowercase) in confirmation | Button stays disabled — must be exactly "DELETE" |
| User deletes account, then tries to sign in again | Standard "Invalid credentials" message — no indication the account existed |
| Network error during profile update | Toast: "Failed to update profile. Please try again." |
| Network error during account deletion | Toast: "Failed to delete account. Please try again." — account remains intact |
| Unauthenticated user navigates to /settings | Redirect to sign-in page |

---

## Data Deleted on Account Removal

When a user deletes their account, the following data must be permanently removed:

- **profiles** table → user's row
- **pantry_items** table → all rows matching user's ID
- **favorites** table → all rows matching user's ID
- **Supabase Auth** → user's authentication record

This is handled by the CASCADE DELETE policies already configured in our database schema.

---

## Design
Follow the existing design system defined in the project Knowledge file. The Settings page should match the style and feel of all other pages in the app. The "Danger Zone" section should use red/warning styling to clearly distinguish destructive actions from normal ones.


````

### Lovable payments

Lovable has built-in integration with Stripe now.

### Lovable Ai

Lovable has built-in integration with adding AI inference to apps.

Here is what you should specify when telling Lovable to add AI:

- **integrate into edge functions**: AI inference should be run in the context of an edcge function
- **use tanstack AI libraries**: tanstack AI UI components are great for wiring up AI to the backend.
## Replit

