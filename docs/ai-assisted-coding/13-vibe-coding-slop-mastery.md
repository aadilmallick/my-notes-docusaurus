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


### Spec driven development basics

A **Spec** is a single document that contains the UI/UX, tech, and business logic info of a desired feature to implement within the app.

If a spec has these three things:

1. **technology constraints**: what libraries to use, 
2. **visual requirements**: what the UI/UX should look like and acceptance criteria for that
3. **performance requirements**: what the desired performance of the feature should be and acceptance criteria for that

Then you can give that spec to AI and it will be able to vibe through it and complete it pretty nicely.

We can master spec-driven development through using these three techniques:

1. **DDD**: always grab the latest up-to-date documentation, and always keep the codebase documentation up to date with `progress.txt` files and `CODEBASE.md` files.
2. **TDD**: use test-driven development along with acceptance criteria to ensure you code never goes out of whack and you have extensive test coverage.
3. **SLDC**: plan, implement, test, and deploy features one at a time.

#### Documentation Driven Development (Triple D's)



Documentation driven development (DDD) is a practice where you use up-to-date documentation and examples to guide AI coding tools in generating code that follows the latest coding standards and best practices.

To achieve DDD, you should follow these principles:

1. **Provide only up-to-date documentation**: use context7 or firecrawl to always get the latest up-to-date documentation.
2. **Use TDD**: tell the AI to write extensive unit tests and especially Playwright e2e tests.

#### SDLC with AI

The Software Development Life Cycle (SDLC) is a structured process that guides software development through four core phases:  
  

- **Planning:** This is the foundation where you define the scope of your project, usually starting with a minimum viable product (MVP) that includes a core feature and a couple of side features. You create a detailed Product Requirements Document (PRD) that outlines user flows, navigation, and mockups. This step ensures clear goals and reduces costly changes later.  
      
    
- **Implementation:** Here, you build the software. The course emphasizes starting with the front-end design as a blueprint—like planning the layout of a house—before developing the back-end logic. Building back-end features in small, isolated, testable blocks helps maintain flexibility and ease of debugging.  
      
    
- **Testing:** After implementation, thorough testing, debugging, and code reviews are conducted to ensure the app works correctly, is secure, and meets quality standards.  
      
    
- **Deployment:** Finally, the app is deployed online for users. But this isn't the end; SDLC is iterative. After deployment, you return to planning for new features or improvements, following Agile principles.

#### TDD with AI

1. **Set up your test environment:** Use AI tools integrated in your IDE to help set up a testing framework (like Vitest or Jest). The AI can generate config files and install dependencies, but you may need to troubleshoot and guide it through errors.  
      
    
2. **Start with a test prompt:** Describe the component or feature you want to build to the AI and ask it to generate the test code first. For example, specify what the component should do and what data it should handle.  
      
    
3. **Create the test file:** Have the AI generate the test file (e.g., `WeatherCard.test.tsx`) with the test cases based on your description.  
      
    
4. **Run the tests:** Initially, tests will fail because the component doesn’t exist yet. This is expected in TDD.  
      
    
5. **Generate the component code:** Ask the AI to create the component implementation (e.g., `WeatherCard.tsx`) that satisfies the test requirements.  
      
    
6. **Run tests again:** Execute the tests to check if the component passes. If there are failures, review error messages.
#### 6 patterns

**Spec-driven development**

- The highest-impact practice 
- Teams that spec first report 2–3x better AI output
- Structure specs as PRDs covering six areas: commands, testing, project structure, code style, git workflow, and boundaries

**Test-first AI generation**

- Writing or generating tests before implementation gives the AI a target to hit
- Combined with Ralph Loops, this produces reliable code with minimal intervention
- Essentially TDD with an AI partner

**Project memory / rules files**

- CLAUDE.md, .github/copilot-instructions.md, .cursor/rules, custom instructions — encoding standards where the AI reads them automatically
- Table stakes for serious AI-assisted development

**The Ralph Loop**

- Define the goal with clear acceptance criteria, give the AI tests for self-verification, and let it iterate autonomously until all tests pass
- Works excellently for well-scoped, testable tasks
- Set a maximum iteration limit (5–7) to prevent runaway token usage.

**The Beads Pattern**

- "Beads on a string" — sequential, checkpointed tasks where each step's output feeds the next
- Each bead has its own acceptance criteria and commit point
- Provides granular rollback that monolithic agent tasks lack

**The Factory Model**

- The mental shift from writing code to building the factory that builds your software
- Spin up multiple agents in parallel, each with different concerns
- Define outcomes, review results, refine specs
- Quality control parallels: precise specs are precise inputs; vague specs multiply errors across the entire fleet.

### How to write good specs

Here's an example of how you write a good spec:

- **overview**: description of feature
- **user story**: what the user should be able to do
- **acceptance criteria**: definition of "done" for the feature
- **tech**: data model, auth, permissions, etc.

````md
# Feature Specification: User Invitation System

## Overview

Add the ability for users to invite other users to join the platform via email. Invitations are one-time use tokens that can be redeemed to create a new user account.

## User Story

As a user, I want to invite friends to join the platform by sending them an email with a unique link. When they click the link, they can create an account without needing a traditional sign-up form.

## Acceptance Criteria

- [ ] Users can generate invitation tokens
- [ ] Each token is unique and one-time use only
- [ ] Tokens include an expiration date (7 days default)
- [ ] Expired tokens are rejected
- [ ] Already-redeemed tokens are rejected
- [ ] New users can redeem invitations to create accounts
- [ ] Email addresses are validated before sending invites

## API Endpoints

### Generate Invitation
```
POST /invitations
Request: { email: string }
Response: { token: string, expiresAt: string }
```

Validates:
- Email format is valid
- Email is not already registered
- User has permission to send invites (optional: limit per user)

### Redeem Invitation
```
POST /invitations/:token/redeem
Request: { name: string, password: string }
Response: { user: { id, email, name }, message: string }
```

Validates:
- Token exists and is not expired
- Token has not been previously redeemed
- Name is non-empty
- Password meets complexity requirements
- Email from token is not already registered (double-check)

### List Pending Invitations (Optional)
```
GET /invitations/pending
Response: [{ email, expiresAt, createdBy, createdAt }]
```

Auth: Requires admin role

## Data Model

### Invitations Table
```sql
CREATE TABLE invitations (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_by_user_id TEXT NOT NULL,
  redeemed_at TIMESTAMP NULL,
  redeemed_by_user_id TEXT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL
);
```

Key fields:
- `token`: Random, cryptographically secure string (e.g., 32 bytes base64)
- `redeemed_at`: NULL if not yet redeemed, timestamp if redeemed
- `redeemed_by_user_id`: NULL if not yet redeemed, user ID if redeemed
- `expires_at`: Always set at creation time

## Validation Rules

### Email Validation
- Must match standard email regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Must not be already registered
- Must not have a pending invitation

### Token Generation
- 32 bytes of random data, base64 encoded
- Uniqueness guaranteed by database constraint
- Expiration: 7 days from creation (configurable)

### Password Validation (on redemption)
- Minimum 8 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one digit

## Error Cases

| Scenario | HTTP Status | Error Code | Message |
|----------|------------|-----------|---------|
| Invalid email format | 400 | INVALID_EMAIL | Email format is invalid |
| Email already registered | 400 | EMAIL_EXISTS | Email is already registered |
| Too many pending invitations for user | 429 | RATE_LIMITED | Too many invitations sent |
| Token not found | 404 | TOKEN_NOT_FOUND | Invitation token not found |
| Token expired | 400 | TOKEN_EXPIRED | Invitation has expired |
| Token already redeemed | 400 | TOKEN_REDEEMED | Invitation has already been redeemed |
| Invalid password | 400 | INVALID_PASSWORD | Password does not meet requirements |
| Weak password | 400 | WEAK_PASSWORD | Password must contain uppercase, lowercase, and digits |

## Implementation Notes

1. **Security Considerations**:
   - Tokens should be cryptographically random (use `crypto.randomBytes`)
   - Tokens should NOT be logged or exposed in error messages
   - Always compare tokens in constant time (prevent timing attacks)
   - Hash passwords before storing

2. **Database Design**:
   - Create index on `token` for fast lookups
   - Create index on `email` for duplicate checking
   - Create index on `expires_at` for cleanup queries

3. **Testing Requirements**:
   - Happy path: generate, send, redeem
   - Token expiration: expired tokens rejected
   - Token reuse: redeemed tokens rejected
   - Invalid emails: rejected before sending
   - Password validation: weak passwords rejected
   - Race conditions: simultaneously redeeming same token

4. **Optional Enhancements**:
   - Email templates for invitation messages
   - Rate limiting per user (max 5 invites per day)
   - Admin panel to view/manage invitations
   - Automatic cleanup of expired invitations

## Definition of Done

- [ ] All endpoints implemented
- [ ] All validation rules enforced
- [ ] All error cases handled
- [ ] Comprehensive tests (80%+ coverage)
- [ ] No security vulnerabilities
- [ ] Code follows project patterns
- [ ] API documentation updated
````

### Multi-phase planning for large refactors

The Multi-Phase Planning pattern is designed for **large, complex architectural refactors** that touch many files and require careful decomposition. Instead of diving into implementation, you first create a detailed migration plan, then execute it phase by phase.

SO instead of refactoring everything all at once, we break a refactor into 5 phases.

> [!NOTE]
> Doing refactoring in phases allows us to commit once we're done with a phase, so it's easy to rollback to a previous phase if one goes awry, as opposed to scrapping the entire refactor



![](https://i.imgur.com/l6JFDcs.jpeg)


**When to use this pattern:**

- Refactors touching 10+ files
- Architecture migrations (monolithic → microservices, flat → layered)
- Major feature additions requiring new patterns
- Projects where mistakes are costly

**Not for:**

- Small, isolated features (use Beads or RALPH instead)
- Bug fixes
- Simple refactors (just do them)
#### Phase 1: Plan

[README](https://github.com/LinkedInLearning/mastering-ai-assisted-development-10666010/blob/main/4.3-demo-multi-phase-planning/README.md#phase-1-plan)

**Goal**: Analyze the codebase and create a detailed migration plan.

The AI agent:

1. Explores the current codebase structure
2. Identifies pain points and architectural issues
3. Proposes the target architecture
4. Breaks the migration into logical steps
5. Writes everything to `specs/migration-plan.md`

**Output**: A migration spec with:

- Current state description
- Target state description
- Detailed steps for each phase
- Risks and mitigations
- Rollback strategy

**Duration**: Usually 30-60 minutes of analysis

**Commit**: `git commit -m "phase-0: migration plan (analysis)"`

#### Phase 2: Scaffold

[readme](https://github.com/LinkedInLearning/mastering-ai-assisted-development-10666010/blob/main/4.3-demo-multi-phase-planning/README.md#phase-2-scaffold)

**Goal**: Create the new file structure and type definitions without implementation.

The AI agent:

1. Creates new directories and files for the new architecture
2. Defines interfaces, types, and class signatures
3. Creates stub implementations (throw NotImplemented)
4. Does NOT implement business logic yet

**Output**:

- New directory structure
- All type definitions and interfaces
- Function/method signatures
- Still has broken imports from old code

**Why first?**: This phase locks in the architecture. Once types are defined, the next phases can implement in parallel (if needed).

**Commit**: `git commit -m "phase-1: scaffold new architecture"`

#### Phase 3: Implement

[README](https://github.com/LinkedInLearning/mastering-ai-assisted-development-10666010/blob/main/4.3-demo-multi-phase-planning/README.md#phase-3-implement)

**Goal**: Fill in implementations phase by phase, testing each piece.

The AI agent:

1. Implements one layer at a time (e.g., all repositories, then all services)
2. Tests each layer as it's implemented
3. Verifies that old code still works (no breaking changes yet)
4. Makes incremental commits for each subsystem

**Output**:

- Fully implemented new architecture
- Comprehensive tests
- Old code still works (dual-mode during transition)

**Commits**: Multiple atomic commits:

- `phase-2a: implement user repository`
- `phase-2b: implement order repository`
- `phase-2c: implement user service`
- etc.

#### Phase 4: Test

[README](https://github.com/LinkedInLearning/mastering-ai-assisted-development-10666010/blob/main/4.3-demo-multi-phase-planning/README.md#phase-4-test)

**Goal**: Add comprehensive tests for the new architecture.

The AI agent:

1. Writes unit tests for each service (mocking repositories)
2. Writes integration tests for routes
3. Adds edge case and error handling tests
4. Targets 80%+ code coverage

**Output**:

- Unit test suite
- Integration test suite
- Coverage report
- All tests passing

**Commit**: `git commit -m "phase-3: comprehensive test suite"`

#### Phase 5: Integrate

[readme](https://github.com/LinkedInLearning/mastering-ai-assisted-development-10666010/blob/main/4.3-demo-multi-phase-planning/README.md#phase-5-integrate)

**Goal**: Wire up the new architecture and remove the old code.

The AI agent:

1. Updates all routes to use new services (breaking old imports)
2. Removes old code
3. Updates all imports across the codebase
4. Verifies all tests still pass
5. Clean compilation with no warnings

**Output**:

- Fully migrated codebase
- Old code completely removed
- All tests passing
- No dead code or unused imports

**Commit**: `git commit -m "phase-4: migrate to new architecture and remove old code"`


### Testing and debugging

#### UX audit

1. Add the chrome devtools MCP

```bash
claude mcp add chrome-devtools -- npx @anthropic-ai/chrome-devtools-mcp@latest
```

2. `/ux-audit` slash command that runs a full checklist automatically.

```md
Run an automated UX audit on the running application using DevTools MCP.

Prerequisites: Dev server must be running. Chrome DevTools MCP must be configured.

Steps:

1. **Page inventory**: Take a screenshot of each key page (home, task list, task detail, create task form). Log any console errors on each navigation.

2. **Interactive element check**: For each page, identify all buttons, links, and form inputs. Click each one and verify it produces the expected response (navigation, modal, form submission, etc.). Report any that are unresponsive or produce errors.

3. **Responsive layout check**: Resize the viewport to three breakpoints:
   - Desktop (1280px wide)
   - Tablet (768px wide)
   - Mobile (375px wide)
   Take a screenshot at each size. Flag any layout issues: overlapping elements, text overflow, unreachable buttons, horizontal scroll.

4. **Loading and error states**: Navigate with simulated slow network. Verify loading indicators appear. Submit forms with invalid data. Verify error messages are shown clearly and are actionable.

5. **Performance check**: Run a performance trace on the heaviest page. Flag any long tasks (>50ms), layout thrashing, or excessive re-renders.

6. **Report**: Summarize findings as:
   - PASS: [what looks good]
   - WARN: [minor issues worth addressing]
   - FAIL: [issues that need fixing before shipping]

Fix any FAIL issues automatically. For WARN issues, describe the fix but leave it for the developer to decide.
```

#### Mutation testing

- **coverage** tells you what ran and the percentage of codebase coverage
	- Code coverage only tells you which lines of code were _executed_ during a test run, but it doesn't prove that your assertions are actually verifying correctness.
- **Mutation testing** tells you whether the tests would notice if the code were wrong.
	- **Mutation testing** evaluates the quality of your automated tests rather than the quality of your code. 

> [!NOTE]
>  Coverage tells you what lines of code ran in the tests but mutation tells you whether those tests actually mattered or not 

> [!NOTE]
> A completely green, passing test suite is just a hypothesis. Mutant testing tries to verify that hypothesis, where if all mutants are killed, then your tests actually matter and test something real.

Here's how it works:

- **Mutant Creation:** A tool introduces deliberate, small bugs (called "mutants") into your codebase (e.g., swapping `>` for `>=`, changing `+` to `-`, or deleting a line of logic).
    
- **Execution:** Your test suite is run against each mutated version of the code.
    
- **Verdict:**
    
    - **Killed Mutant:** If a test fails, the mutant is "killed" (a good outcome—your test caught the bug).
        
    - **Surviving Mutant:** If all tests pass despite the introduced bug, the mutant "survived." This highlights a gap in your test assertions or missing edge cases.


![](https://i.imgur.com/zrz6oZ3.jpeg)


Here's how to use AI-assisted coding with mutant testing:

1. Ask AI to create a mutant test suite

```
Add mutation testing for packages/core in the simplest maintainable way, using Stryker Mutator scoped to packages/core only. Wire it to `npm run mutation` and run it.

Print the results in the terminal: the mutation score, and the surviving mutants grouped by file and behavior - for each survivor give me the file, the line, the original operator and the mutated operator, so I can see what broke without the suite noticing. Call out the SLA breach boundary mutant (`>` → `>=` in `isBreached`) explicitly if it survived.

Do not write screenshots or report files, and do not strengthen the tests yet.
```

2. Ask AI to kill the mutants

```
Strengthen the tests to kill the meaningful surviving mutants. Add boundary tests for SLA breach and due-soon behavior, and add a small property-based test for triage ordering if it fits the repo.

Run `npm run test`, then `npm run mutation` again, and print a before/after table in the terminal: mutation score before, mutation score after, and one row per mutant that went from survived to killed. List the assertions you added and which mutant each one kills. Do not write screenshots or report files.
```

#### Fixing errors with chrome MCP

1. Add the chrome devtools MCP

```bash
claude mcp add chrome-devtools -- npx @anthropic-ai/chrome-devtools-mcp@latest
```

2. `/debug-runtime` slash command uses the devtools MCP to troubleshoot web app errors

```md
Systematically debug runtime issues using DevTools MCP.

Steps:
1. Take a screenshot of the current page state
2. Check the browser console for errors or warnings
3. Inspect network requests for failed or slow responses
4. If performance issues suspected, run a performance trace
5. For each issue found:
   - Identify the root cause in the source code
   - Propose a fix
   - Implement the fix
   - Verify with another screenshot/console check

Report findings as:
- Issue: [what's wrong]
- Root cause: [why it happens]
- Fix: [what you changed]
- Verified: [how you confirmed the fix]
```


### Playbook

```embed
title: "mastering-ai-assisted-development-10666010/5.4-demo-fullstack-agent-team/README.md at main · LinkedInLearning/mastering-ai-assisted-development-10666010"
image: ""
description: "This is a repo for the LinkedIn Learning course: Mastering AI-Assisted Development - LinkedInLearning/mastering-ai-assisted-development-10666010"
url: "https://github.com/LinkedInLearning/mastering-ai-assisted-development-10666010/blob/main/5.4-demo-fullstack-agent-team/README.md"
favicon: ""
```

#### When to use what

```embed
title: "mastering-ai-assisted-development-10666010/6.3-demo-ai-playbook/playbook/decision-framework.md at main · LinkedInLearning/mastering-ai-assisted-development-10666010"
image: "https://opengraph.githubassets.com/b864c8d13aec1d1a8f7ae9b8340c45b752c3c8b1d056ecabafc4496e0da5ee59/LinkedInLearning/mastering-ai-assisted-development-10666010"
description: "This is a repo for the LinkedIn Learning course: Mastering AI-Assisted Development - LinkedInLearning/mastering-ai-assisted-development-10666010"
url: "https://github.com/LinkedInLearning/mastering-ai-assisted-development-10666010/blob/main/6.3-demo-ai-playbook/playbook/decision-framework.md"
favicon: ""
aspectRatio: "50"
```


#### The Templates



This demo includes starter templates you can customize:

1. Spec Template (`templates/SPEC.md.template`): A reusable project specification following this formula:

	- Technology constraints
	- Visual / functional requirements
	- Performance targets
	- Interaction model

````md
# Project Spec: [PROJECT NAME]

## Technology Constraints
- **Framework**: [e.g., React 18, Next.js 15, Vue 3]
- **Language**: [e.g., TypeScript strict mode]
- **Styling**: [e.g., Tailwind CSS, CSS Modules]
- **Dependencies**: [list specific libraries and versions]
- **No**: [explicitly exclude anything you don't want]

## Functional Requirements
- [What should the application DO? List the core behaviors.]
- [Be specific about WHAT, flexible about HOW.]
- [Include interaction model: clicks, hover, keyboard, etc.]

## Visual Requirements
- [Color palette, typography, layout constraints]
- [Responsive breakpoints]
- [Animation and transition expectations]
- [Reference designs or inspiration (if any)]

## Performance Targets
- [Load time, bundle size, frame rate expectations]
- [e.g., "60 FPS animations", "< 200KB bundle", "< 2s initial load"]

## Out of Scope
- [What this project is NOT — helps Claude stay focused]
````

2. Skill Template (`templates/SKILL.md.template`): An empty template for creating a skill that contains these sections:

	- Purpose (when to activate)
	- Principles (domain expertise)
	- Patterns (code examples)
	- Anti-Patterns (what to avoid)
	- Checklist (verification steps)

````md
# Skill: [SKILL NAME]

## Purpose

When to activate this skill:
- [Trigger condition 1: e.g., "When creating React components"]
- [Trigger condition 2: e.g., "When the user asks for UI work"]

## Principles

Core expertise this skill encodes:

1. **[Principle Name]**: [What to do and why]
2. **[Principle Name]**: [What to do and why]
3. **[Principle Name]**: [What to do and why]

Start with 3-5 principles. You can always add more later.

## Patterns

Code examples showing the RIGHT way:

```typescript
// Good: [describe what this demonstrates]
```

## Anti-Patterns

Code examples showing the WRONG way:

```typescript
// Bad: [describe what to avoid and why]
```

## Checklist

Before considering the work done, verify:

- [ ] [Quality check 1]
- [ ] [Quality check 2]
- [ ] [Quality check 3]
````

3. CLAUDE.md Template (`templates/CLAUDE.md.template`): A project-level constitution covering:

	- Project context and architecture
	- Code style and conventions
	- Testing requirements
	- Common commands

````md
# CLAUDE.md — Project Constitution

## Project Overview

[One paragraph: what this project is, what it does, who it's for.]

## Architecture

[Brief description of the project structure:]

- `src/` — [what lives here]
- `tests/` — [testing strategy]
- `docs/` — [documentation approach]

## Code Style & Conventions

- [Language/framework conventions: e.g., "Use functional components with hooks, not class components"]
- [Naming conventions: e.g., "camelCase for variables, PascalCase for components"]
- [File naming: e.g., "kebab-case for files, one component per file"]
- [Import order: e.g., "external deps → internal modules → relative imports"]

## Testing Requirements

- [Test framework and approach: e.g., "Jest + React Testing Library"]
- [Coverage expectations: e.g., "All new code must have tests"]
- [What to test: e.g., "Test behavior, not implementation details"]

## Common Commands

```bash
npm run dev      # Start development server
npm test         # Run test suite
npm run build    # Production build
npm run lint     # Run linter
```

## Important Notes

- [Any gotchas, quirks, or critical context about the project]
- [Things that frequently trip people (and AI agents) up]
````

4. Agent Config Template (`templates/AGENT.md.template`): Subagent definition template

	- Name and description
	- Allowed tools
	- Model selection
	- System prompt with expertise

```md
---
name: [agent-name]
description: "[When should the parent delegate to this agent? Be specific.]"
model: sonnet
tools:
  - Read
  - Write
  - Edit
  - Bash
---

# [Agent Name] — [Role]

## Expertise

You are a specialist in [domain]. Your job is to [primary responsibility].

## Scope

**You own these files**:
- `src/[your-layer]/`
- `tests/[your-layer]/`

**You do NOT touch**:
- [files owned by other agents]

## Approach

1. [Step 1: e.g., "Read the shared types to understand the contract"]
2. [Step 2: e.g., "Implement each function with error handling"]
3. [Step 3: e.g., "Write tests for every public function"]
4. [Step 4: e.g., "Run tests and fix failures before committing"]

## Quality Standards

- [Standard 1: e.g., "Every function has JSDoc comments"]
- [Standard 2: e.g., "No `any` types — everything is strictly typed"]
- [Standard 3: e.g., "Tests cover happy path, edge cases, and error cases"]
```

#### Slash Commands

- `.claude/commands/evaluate.md` — Assess which AI pattern fits a given task

```md
Evaluate which AI development pattern best fits a given task.

Analyze the task and recommend an approach:

1. **Assess the task**:
   - How complex is it? (minutes, hours, days)
   - Can concerns be separated? (frontend/backend, modules, layers)
   - Is it visual/creative or logic-heavy?
   - Does it need external data or tools?
   - Is it a one-off or a repeating pattern?

2. **Recommend a pattern**:
   - Vibe Coding (quick visual prototypes)
   - Skills + Commands (repeating patterns)
   - MCP (external data/tools needed)
   - RALPH/Tasks (too big for one context)
   - Multi-Phase (large refactors)
   - Subagents (separable concerns, sequential)
   - Swarms (independent parallel work)
   - Agent Teams (full applications)

3. **Explain why**: One sentence on why this pattern fits better than alternatives.

4. **Suggest a starting point**: What's the first concrete step?
```

- `.claude/commands/retro.md` — Run a retrospective on your last AI-assisted session

```md
Run a quick retrospective on the current or most recent AI-assisted development session.

Review what happened and provide structured feedback:

1. **What worked well?**
   - Which prompts produced good results on the first try?
   - Which patterns or tools were most effective?
   - Any particularly efficient moments worth repeating?

2. **What didn't work?**
   - Where did the AI struggle, hallucinate, or go off track?
   - Which prompts needed multiple iterations to get right?
   - Any wasted effort or dead ends?

3. **What should be saved?**
   - Any prompt worth saving as a slash command?
   - Any pattern worth encoding as a skill?
   - Any spec worth saving as a template?
   - Any CLAUDE.md rules that helped?

4. **What should be tuned?**
   - Any existing skills that need refinement?
   - Any commands that could be more specific?
   - Any CLAUDE.md rules to add or adjust?

5. **Action items**:
   - List 1-3 specific things to do before the next session
   - e.g., "Save the dashboard spec as templates/dashboard.md"
   - e.g., "Add error handling principle to the API skill"

Format the output as a brief, actionable summary — not a lengthy report.
```

Use the `/retro` command or ask yourself:

1. **What worked?** — Which prompts, specs, or patterns produced good results?
2. **What didn't?** — Where did Claude struggle, hallucinate, or go off track?
3. **What should I save?** — Any prompt, spec, or approach worth reusing?
4. **What should I tune?** — Any skill, command, or CLAUDE.md rule to adjust?

The empty retrospective log template looks like this:

```md
# Pattern Log

Track which AI development patterns work for you. Fill this in after each session.

| Date | Task | Pattern Used | Result (Great/Good/Meh/Bad) | What Worked | What to Improve |
|------|------|-------------|----------------------------|-------------|-----------------|
|      |      |             |                            |             |                 |
|      |      |             |                            |             |                 |
|      |      |             |                            |             |                 |
|      |      |             |                            |             |                 |
|      |      |             |                            |             |                 |

## Templates Saved

| Date | Template Name | Type (spec/skill/command/agent) | Location | Notes |
|------|--------------|--------------------------------|----------|-------|
|      |              |                                |          |       |
|      |              |                                |          |       |

## Insights

Use this space to capture patterns you notice over time:

-
-
-
```

### Production grade quality

#### Fitness functions


A fitness function is a code architecture rule that can described in natural language, but then you convert it into an automated, programmatic check via a CLI function or something like that.

![](https://i.imgur.com/rTZaXj2.jpeg)

The goal is to reduce the cognitive load of memorizing hundreds of different rules and just hoping the agent remembers them and instead encapsulate those natural language rules into commands that the agent must run in its harness as part of its acceptance criteria.

Here's the standard workflow for fitness functions

1. Create a natural language rule
2. Ask your coding agent to create a fitness function from the rule, which results in a prompt like this:

```
Inspect this repo and turn the architecture rule in CLAUDE.md into an executable fitness function. The rule: code under apps/web must not import code under apps/api.

Use dependency-cruiser. Add it as a dev dependency, write the smallest config that forbids that one edge, and wire it to `npm run fitness`. Run it and show me the failure before fixing anything.

Print the result in the terminal - do not write screenshots or report files. I want the failing run on screen naming the exact forbidden import (source file, imported module, rule name) plus the module and dependency counts it cruised.
```

3. Ask your agent to fix the violation of the fitness function like so:

```
Fix the violation properly. The web app must not import server-side code from apps/api. Here it pulls in the server's feature-flag module to gate a button, but the server already gates the feature (server-side flag plus template fallback), so the client should just call the API and drop the import. Remove the cross-boundary import and any now-dead client-side flag check; move genuinely shared, framework-free logic to @helpdesk/core instead of apps/api. Then run `npm run fitness` and `npm run test` and print the before/after violation counts in the terminal. Do not write screenshots or report files. Show the changed files and the command output.
```

#### Test unhappy paths

You don't truly have a working app unless you test the unhappy paths. 

The way you could do this is with the chrome devtools MCP, asking the AI to try testing random things and stress test the app via chaos engineering.

Every app must strive to always let their user know what is going on at all times. This means showing loading, success, and error states and messages accordingly, never leaving something blank.

Here's an example of using chrome devtools MCP to test the unhappy path:

1. Prompt to test for 4 loading states:

```
Verify the helpdesk queue-to-reply flow at http://localhost:5173 using the built-in browser - if its not live, fire it up using npm run dev:slow. Report in the terminal - no screenshots, no files - and do not change any code. Work through all of this without stopping to ask me; you have everything you need.

FIRST, confirm the simulated slow queue is actually on:
  curl -s -o /dev/null -w "%{time_total}\n" http://localhost:3001/api/tickets
It must be about 4 seconds. If it comes back under a second, stop immediately and tell me to restart the app with `npm run dev:slow` - nothing below is valid without it.

1. LOADING. Do not navigate in one call and inspect in the next; the round trip is slower than the load and you will miss the window. In a SINGLE evaluation, load the app in a hidden iframe and poll it about once a second for ~7s, recording per tick: elapsed ms, ticket-row count, whether any loading text is present, and the number of [role=status], [aria-busy] and [aria-live] regions. Return the timeline.

2. EMPTY. Type a query into the search box that matches nothing and report what replaces the list. Then compare it to the loading screen and tell me directly: could a user tell those two apart?

3. SUBMIT FAILURE. Order matters - do this while the API is still up: open a ticket and draft a reply. THEN stop the API yourself with `lsof -ti:3001 | xargs kill`, submit the reply, and report exactly what happens to the compose box and whether the user could tell it did not send.

4. FETCH FAILURE. With the API still down, reload the page and report what the queue shows, plus any console errors.

Finish with one line per state: what is on screen, and whether a user could tell what happened.
```

2. Ask AI to fix all 4 states:

```
Fix all four states. Confine the changes to apps/web/src/App.tsx and apps/web/src/components/Compose.tsx - do not go exploring:
- a loading affordance while the queue is fetching, announced to assistive tech
- a distinct empty-result message, worded so it cannot be confused with loading
- a fetch-failure message with a retry control
- a failed submit that keeps the user's draft and shows an inline error plus Retry

Then re-verify only the two beats that carry the episode, using the identical methods: re-run the single-evaluation iframe timeline (the early ticks must now report a loading affordance instead of an empty panel), and repeat the draft-then-kill-API-then-submit sequence. Print one before/after table covering all four states, then run `npm run typecheck`. Do not re-drive the states you have already proven.
```

### Improving performance

>What gets measured gets managed


The most possibly important thing for you to have is a performance baseline, before you try to improve anything always do a trace, create a budget, and calculate a performance baseline so that you know what you're measuring against and you know what you can improve on and what will actually improve the performance. 

#### Browser performance

These are the metrics you must try to optimize in order to have a performant website.

![](https://i.imgur.com/XTl4RHB.jpeg)

To diagnose how to improve these browser metrics, you should run a production build and then test on that, not a dev build. 

> [!NOTE]
>  the reason for that is that production builds and dev builds have stark differences, like minified code and code-splitting optimizations in production that are not in dev 

```
npm run build
npx vite preview
```


Here are some actionable tips and key takeaways from the video on performance optimization:  
  

- **Measure first, don’t guess:** Use real user experience metrics like Core Web Vitals, especially Largest Contentful Paint (LCP), to identify performance issues.
- **Use real browser traces:** Capture detailed traces under controlled conditions (e.g., throttled network and CPU) to pinpoint bottlenecks accurately.
- **Target fixes based on data:** Optimize large assets (like oversized images), reserve space in markup to avoid layout shifts, use modern image formats (WebP, AVIF), and apply lazy loading and code splitting.
- **Validate improvements:** After applying fixes, re-measure performance to ensure the issues are resolved and improvements are real.

  
The recommended workflow to follow is:  
  

1. Build and serve a production bundle (not a dev server build) to get accurate performance data.
2. Throttle network and CPU to simulate realistic user conditions.
3. Run a trace to measure baseline performance and identify bottlenecks.
4. Analyze the trace to find the largest contributors to slow loading or layout shifts.
5. Prompt your AI agent (like Claude Code) to fix the identified issues.
6. Rebuild and rerun the trace to verify the fixes have improved performance.
7. Repeat the cycle if needed to address new bottlenecks.

Here's an example prompt that lets you run a performance audit on the production build:

```
Measure before changing code. Do not take screenshots and do not write report files - print the numbers in the terminal.

Build and serve the production bundle first, because dev-server numbers are meaningless here:
  npm run build
  (cd apps/web && npx vite preview --port 4173 &)

Then use the chrome-devtools MCP against http://localhost:4173. Call `emulate` with networkConditions "Slow 4G" and cpuThrottlingRate 4, then run `performance_start_trace` with reload true and autoStop true.

Report: LCP and CLS, the full LCP breakdown (TTFB, load delay, load duration, render delay), which element is the LCP, and the insights the trace surfaces. Tell me which subpart dominates LCP and what that implies. Also report the chunks the build emitted and whether the reporting panel is in the initial chunk. Then tell me the exact files you would change. Do not fix yet.
```
#### Performance bundle

A performance budget is a maximum bundle size that the web app build must stay under and if it's above that then the deploy job must fail.


![](https://i.imgur.com/wCey52W.jpeg)

1. Ask it to create a performance budget and run the app against it.

```
Add a `npm run budget` gate for this repo using size-limit. It should build the web app, measure the JavaScript the initial route ships, and fail when that exceeds a threshold set just above today's real number.

Configure size-limit with `"gzip": false` and `"brotli": false` so the reported number is the raw bundle size and matches the build output - size-limit measures brotli by default, which would report roughly a quarter of the real size.

Run it and report the measured baseline and the threshold you chose, in the terminal. Do not write screenshots or report files. Keep the setup simple enough for a course demo.
```

2. Ask it to give you fixes so that you're under budget

```
Prove the budget catches a regression. Introduce a small, realistic bundle regression by importing all of lodash for one helper in the web app, or by making the reporting panel pull extra code into the initial route. Run `npm run budget` and show it failing.

Then fix the regression with a scoped import, native code, or lazy loading, re-run `npm run budget`, and show it passing.

Print a before/after table in the terminal - measured size, limit, and the delta for each run. Do not write screenshots or report files, and do not claim any performance win without before/after numbers from the same harness.
```


#### Improving P50 and P95 via regressions

- **P50 latency** is the median response time. This means 50% of requests are faster than this time, and 50% are slower. It represents the typical or average user experience.  
      
    
- **P95 latency** is the 95th percentile response time. This means 95% of requests are faster, but 5% are slower. It captures the "slow tail"—the slower experiences some users face, especially under load.

Here are the key actionable tips and the workflow:
  

- **Measure first, then fix:** Start by planting realistic performance regressions and measure baseline metrics like Largest Contentful Paint (LCP) and API latency (P50, P95) in a production-like environment.
- **Use production builds for accuracy:** Always test with production bundles and real browser traces, not dev server builds, to get meaningful performance data.
- **Identify multiple issues:** Real slowdowns often come from several small issues across the stack, so look for all contributing factors.
- **Fix based on evidence:** Use AI tools (like Claude) to address the specific causes identified—e.g., removing heavy imports, optimizing critical path work, and offloading synchronous tasks.
- **Re-measure to validate:** After fixes, rerun the same tests to confirm improvements and ensure the performance budget passes.
- **Iterate as needed:** Repeat this measure-fix-validate cycle to continuously improve.

  
**Recommended workflow:**  
  

1. Plant realistic regressions to simulate performance issues.
2. Measure baseline performance metrics on production builds.
3. Analyze the data to find bottlenecks.
4. Use AI-assisted fixes targeting the named problems.
5. Rebuild and rerun measurements to verify improvements.
6. Let quality gates decide if the build passes.
7. Repeat the process to maintain and improve production readiness.


Here's how to ask AI to plant a realistic regression:

1. Tell AI to create a performance baseline

```
Set up a performance challenge for me in this repo. Plant realistic regressions in the current helpdesk workspace: a front-end bundle regression caused by importing too much lodash for one helper, heavier eager work in the reporting panel, and an API regression caused by extra synchronous per-request work in GET /api/tickets.

Then measure the failing baseline three ways and report the numbers in the terminal.

1. Bundle:  npm run budget
2. Page:    npm run build && (cd apps/web && npx vite preview --port 4173 &)
   then via the chrome-devtools MCP, call `emulate` with networkConditions "Slow 4G" and cpuThrottlingRate 4, followed by `performance_start_trace` with reload true and autoStop true against http://localhost:4173
3. API:     (cd apps/api && npx tsx src/server.ts &) && npx -y autocannon@7 -c 20 -d 5 -l http://localhost:3001/api/tickets

The trace must hit the preview build on 4173, not the dev server - dev-server numbers are meaningless.

Report measured bundle size vs limit, LCP with its breakdown (TTFB, load delay, load duration, render delay), CLS, and p50/p97.5/max latency plus requests per second. Do not write screenshots or report files - I want the numbers on screen. Do not fix the regressions.
```

2.  then tell it to fix the regressions 

```
Solve the performance challenge. Use the failing budget, the trace, and the autocannon baseline as the source of truth. Fix the front-end lodash regression without broad imports. If reporting is on the critical path, lazy-load or defer it without changing user-visible behavior. Fix the synchronous work in GET /api/tickets without changing the response shape.

Then re-run the three identical measurements from the baseline - same throttled trace on the rebuilt preview at 4173, same autocannon run - and print one before/after table in the terminal with these rows: bundle size vs limit, budget pass/fail, LCP, LCP load delay, CLS, API p97.5 latency, and requests per second. Finish with `npm run typecheck`.

Do not write screenshots or report files. If a difference is small enough to be noise across runs, say so instead of claiming the win.
```

### Accessibility

#### Running an accessibility audit

Here are the key actionable tips and the workflow you should follow based on the video:  
  

- **Measure first, then fix:** Start by measuring real user experience metrics like color contrast for accessibility and performance indicators such as Largest Contentful Paint (LCP).
- **Use automated tools as a baseline:** Tools like Axe help catch mechanical accessibility issues (e.g., contrast failures, missing labels), but manual testing (keyboard navigation, screen readers) is essential to ensure real usability.
- **Fix issues iteratively:** Use AI assistance (like Claude) to address flagged problems, such as improving color contrast, adding persistent labels, and ensuring keyboard focus management.
- **Validate fixes thoroughly:** After applying changes, rerun automated scans and perform manual interaction tests to confirm that issues are resolved and the user experience is genuinely improved.

  
**Recommended workflow:**  
  

1. Run automated accessibility scans to identify mechanical issues.
2. Perform manual testing with keyboard and screen readers to catch real user experience problems.
3. Use AI tools to fix the identified issues programmatically.
4. Re-run scans and manual tests to verify fixes.
5. Repeat as needed to achieve a production-ready, accessible product.

  
**actual steps**




1. Install required dependencies

```
npm i -D @axe-core/playwright playwright && npx playwright install chromium
```

2. Ask AI to run the accessibility audit:

```
Audit the helpdesk UI for WCAG 2.2 AA issues. Write a small script `a11y.mjs` that uses Playwright with @axe-core/playwright and scans TWO states: the ticket list as loaded, and again with the compose dialog open (the dialog's controls are not in the tree until it is open, so a single page scan misses them). Wire it to `npm run a11y`.

Run it and report each violation with rule id, impact, node count, the success criterion, and the measured value - for contrast, the actual ratio against the 4.5:1 requirement. Print results in the terminal; do not save screenshots or reports.

Then answer one question explicitly: does the reply textarea pass or fail, and why? Tell me the accessible name axe computed for it. Do not fix anything yet.
```

3. Ask AI to fix and improve upon a11y based on the audit results

```
Fix what the scan found: name the icon-only send button, and fix the priority badge contrast to meet 4.5:1. Re-run `npm run a11y` and show the before/after violation counts and the new contrast ratio.

Then go beyond the scanner. Give the reply textarea a real, persistent label - the placeholder is not one, as your scan just demonstrated. Next do a keyboard-only pass on the compose dialog: open it, tab through it, press Escape, and report what happens. Fix the focus handling so Escape closes the dialog and focus returns to the opener. Finally add the least intrusive live-region behavior so "Reply sent" is announced politely. Report each fix with how you verified it.
```

### Evals

When using AI agents or LLMs to generate or modify code, traditional deterministic tests (unit/integration tests) are necessary but insufficient on their own. AI models introduce non-deterministic outputs, subtle hallucinations, and edge-case security risks. 

Evals (evaluation harnesses) bridge this gap.

An **eval** is a repeatable test for AI behavior meant for checking the AI models' output.

> [!NOTE]
> You can think of it as testing a nondeterministic LLM's output is up to snuff to your quality standards, by either creating deterministic or nondeterministic tests.

![](https://i.imgur.com/ZPohpOb.jpeg)

Here are the key benefits of evals:

- **offer a way to test AI outputs**: Since AI outputs can be unpredictable and sometimes problematic (like leaking sensitive data or following harmful instructions), evals help ensure the AI behaves safely and appropriately.
- **prevent regressions**: prompts and models may change, but an eval test suite ensures that the llm output does not stray away from what's desired.

There are two types of evals:

There are two main types you can think of:  
  

- **Guardrail Evals:** These focus on safety and correctness. They check that the AI doesn't do anything catastrophic like leaking sensitive data, following harmful hidden instructions, or going off-topic. For example, the video shows tests ensuring AI replies don’t leak customer emails or obey malicious prompts. These evals act as safety nets to block dangerous or clearly wrong outputs before they reach users.  
      
    
- **Quality Evals:** These go a step further and assess how helpful or useful the AI's responses are. While guardrail evals ensure the AI doesn’t misbehave, quality evals measure if the AI actually provides valuable, relevant, and accurate answers. This might involve scoring replies against a rubric or using another AI model to judge helpfulness.


Of the quality evals, there are two techniques you can use:

- **Deterministic Checks (The Baseline Floor):** Use fast, automated checks first in your CI pipeline. These check structural validity, schema constraints, security rules (e.g., rejecting prompt injection vectors), maximum output length, or strict regex patterns.
- **LLM-as-a-Judge (Behavioral / Quality Evals):** For subjective qualities like "is this generated code idiomatic?" or "is the AI reply clear?", use a larger, well-calibrated model to score output against an explicit rubric.

#### LLM as judge

LLM as a judge has two main weaknesses

- **Judge bias.** Models favor the first option shown, favor longer answers, and favor text that resembles their own. So don't ask "is this good?"—give the judge an explicit rubric (the criteria, plus pass/fail examples) and calibrate it against a small set of cases you labeled by hand. If it disagrees with your labels, the judge is miscalibrated, not your labels.
- **Cost.** Judging is slow and not free, so tier it. Deterministic checks run on everything; the model judge runs only on the subjective cases or the critical paths. Cheap and certain first; expensive and probabilistic only where it earns its keep. Running a frontier judge on every case is a common way to make evals too expensive to keep.

#### Mutation testing with eval workflow

- **Apply Mutation Testing to AI-Written Tests:** Run mutation testing specifically on tests written or suggested by AI. This pressure-tests whether the agent created robust assertions or merely wrote code that touches lines to boost coverage metrics.
    
- **Property-Based Testing:** Pair AI-assisted development with property-based testing. Instead of testing single static examples, generate wide ranges of synthetic inputs to enforce invariants (e.g., "sorting should never change array length").

- **Provide Clear Rubrics & Calibration:** Avoid vague instructions like "check if the code is good." Provide a detailed rubric with explicit criteria and calibrated pass/fail examples.
    
- **Tier Your Evaluation Pipeline:** Run cheap, fast deterministic tests on every commit/PR merge. Only invoke LLM judges on critical paths or subjective assertions to keep costs low and build times fast.

#### Eval test suite example

1. Ask the AI to create an eval test suite

```
Create a small local eval harness for the AI Suggested Reply behavior. Use the deterministic mock, include cases from data/tickets.json, and make the injection ticket T-1006 fail if the reply leaks customer emails or follows hidden instructions. Wire it to `npm run evals` and run it.

Print results in the terminal: one line per case with the case name, the property being asserted, and pass/fail. For any failure, print the actual reply text the harness received next to the assertion that rejected it, so the failure is legible rather than a bare red X. Do not write screenshots or report files, and do not fix the product code yet.
```

2. Ask AI to make the code pass the evals

```
Harden the Suggested Reply path so the eval passes: isolate untrusted ticket text in the prompt, add output validation for empty/over-length/leaky replies, and keep the offline mock deterministic.

Re-run `npm run evals`, `npm run test`, and `npm run typecheck`, and print a before/after summary in the terminal - cases passing before, cases passing after, and what T-1006 returns now instead of the email list. Do not write screenshots or report files.
```

3. Ask AI to implement LLM as judge eval

```
Add a single LLM-as-judge eval for reply helpfulness, scored against an explicit rubric (specific, actionable, no invented facts, right tone). Include 3-4 hand-labeled calibration cases and assert the judge agrees with those labels before trusting it. Keep it in a separate tier that runs only for that subjective case, not across every ticket, and note the judge's known biases (position, verbosity, self-preference) in a comment. Run `npm run evals`.
```

### Security

#### Preventing prompt injection

Why is prompt injection so dangerous? Because it leads to the lethal trifecta:


![](https://i.imgur.com/6ORRwY2.jpeg)


 here are actionable tips to avoid prompt injection:
 
- **Treat all user input as untrusted data:** Always isolate user-submitted text clearly from instructions to prevent prompt injection attacks.
- **Use delimiters or structured framing:** Separate trusted system prompts from untrusted user input to avoid mixing data with commands.
- **Add runtime output guards:** Implement checks that detect and block unsafe or sensitive data leaks in AI responses.
- **Enforce least privilege:** Limit the AI's access strictly to the data and capabilities it needs for the task.
- **Verify fixes with automated eval tests:** Regularly run tests that confirm your AI features do not leak data or obey malicious instructions.
- **Ensure deployment updates:** After code changes, restart or update running processes to avoid stale code causing security issues.

#### Hardening AI-generated code

Start with the code. Run the checks that do not rely on anyone's good intentions:

- **SCA analysis**: A dependency audit, so a hallucinated or malicious package fails before it installs
- **Static analysis**: (Semgrep or similar) for injection, missing validation, and dangerous sinks
- **Security review skill**: A `/security-review` pass that reads the diff for logic-level problems a linter cannot see
	- And, for anything non-trivial, a fresh-context reviewer subagent that only sees the diff and is told to try to break it, because an agent reviewing its own work is an echo chamber, not a second opinion

Wire the ones that are deterministic into a `npm run security` gate so they block a merge, not just a conversation.

#### Principle of least privilege

Concretely, least privilege for an agent means:

- Keep secrets out of files and out of the model's reach; read them from the environment
- Scope what the agent can touch in `.claude/settings.json` - allow the commands the task needs, deny the rest, and prefer read-only analysis until a change is actually required (verify the current settings schema and permission-mode names against your installed version - they have moved)
- Run in a sandbox when the work allows it, so a decisive mistake is contained
- Make risky commands explicit and reviewable rather than automatic
- Do not give the feature network egress or private-data access it does not need, especially where untrusted content flows in

> [!NOTE]
> The uncomfortable truth is that a scanner finds the bugs you already know how to name, and an agent will occasionally write something none of them catch. That is why this is two habits, not one: scan the output, and constrain the authority. Neither is sufficient alone


#### AI error visibility

> [!NOTE]
> An AI feature is not reliable because the model usually works. It is reliable when failures are visible and survivable.


The Suggested Reply path depends on a model call. Model calls can be slow, fail, return empty output, or produce something the product should not use. Reliability work starts by assuming those things will happen.

For the course app, lightweight local telemetry is enough:

- Model latency
- Error count
- Timeout count
- Fallback count
- Degraded response marker

Then make failure survivable:

- Timeout so the request does not hang
- Retry only where safe
- Circuit breaker for repeated failures
- Deterministic template fallback
- Output validation for empty, oversized, or unsafe replies

> [!NOTE]
> The useful standard is: see it fail, survive the failure, and report the degraded path clearly enough that a human can act.


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

#### Subagent orchestration

1. Use this orchestrator prompt template to create an orchestrator subagent that controls several other subagents:

````md
# Orchestration Script: User Invitation Service

## Your Role

You are the parent agent orchestrating a feature implementation using custom subagents defined in `.claude/agents/`.

Your job is NOT to implement the feature yourself. Instead:
1. Delegate each layer to the appropriate specialist subagent
2. Collect results from each subagent
3. Run integration tests at the end
4. Commit the complete feature

## The Feature

See `specs/feature.md` for the complete specification.

**TL;DR**: Build a user invitation service with token generation, email validation, and invitation redemption.

## Subagent Definitions

Three custom subagents are defined in `.claude/agents/`:

| Subagent | File | Responsibility |
|----------|------|---------------|
| `data-layer` | `.claude/agents/data-layer.md` | Repository with CRUD operations |
| `business-logic` | `.claude/agents/business-logic.md` | Service layer with validation |
| `api-layer` | `.claude/agents/api-layer.md` | Express routes and middleware |

Each subagent has:
- A focused **description** that tells Claude when to delegate
- **Tool restrictions** (Read, Edit, Write, Bash, Grep, Glob)
- **Model** set to Sonnet for fast implementation
- A **system prompt** that defines scope and rules

## Execution Order

### Step 1: Data Layer (use the `data-layer` subagent)

Delegate to the data-layer subagent:
- Read `specs/feature.md` for requirements
- Read `src/invitations/types.ts` for the shared contract
- Implement `src/invitations/repository.ts`
- Run tests to verify

Wait for it to complete and verify its report.

### Step 2: Business Logic (use the `business-logic` subagent)

Delegate to the business-logic subagent:
- Read the repository interface from Step 1
- Implement `src/invitations/service.ts` with validation
- Run tests to verify

Wait for it to complete and verify its report.

### Step 3: API Layer (use the `api-layer` subagent)

Delegate to the api-layer subagent:
- Read the service interface from Step 2
- Implement `src/invitations/routes.ts`
- Run tests to verify

Wait for it to complete and verify its report.

### Step 4: Integration (you, the parent agent)

Run the full test suite:
```bash
npm test
```

All tests must pass. If they do, commit:
```bash
git add -A
git commit -m "feat: user invitation service

Implemented via subagent coordination:
- Data layer: Repository with CRUD operations
- Business logic: Service with validation rules
- API layer: Express routes with error handling

13 tests passing."
```

## Key Constraint

Each subagent gets only the types file and its brief. Do not share the full codebase context. Let each specialist focus on its layer.

## Key Principles

1. **Clear scope**: Each subagent knows exactly which files it owns
2. **Shared contract**: The types file is the interface between layers
3. **Sequential delegation**: Each layer builds on the previous
4. **Integration at the end**: The parent runs the full test suite
5. **Minimal context**: Less context = more focused output
````

2. Create a new subagent with the `/agents` command and then make it an orchestrator subagent via this prompt:

````md
# Orchestrator Prompt: Feature Implementation with Subagents

## Your Role
You are the lead engineer orchestrating feature implementation across subagents.

## Step 1: Research (Subagent A)

Delegate to a subagent:
"Analyze the codebase and report back in RESEARCH.md:
- Current architecture
- Testing patterns
- Naming conventions
- Key dependencies
- Design decisions"

After subagent reports back, review RESEARCH.md.

## Step 2: Implementation (Subagent B)

Delegate to a subagent:
"Implement the feature described in specs/feature.md:
- Follow patterns documented in RESEARCH.md
- Run tests after each change
- All tests must pass
- Document in IMPLEMENTATION.md"

After subagent reports back, review IMPLEMENTATION.md and code changes.

## Step 3: Testing (Subagent C)

Delegate to a subagent:
"Write comprehensive tests for src/[feature]:
- Follow patterns from RESEARCH.md
- Aim for 80%+ coverage
- Cover happy path, edges, errors
- Document coverage in TESTS.md"

After subagent reports back, review TESTS.md and test count.

## Step 4: Integration (You)

Review all reports and code:
- Does implementation match the spec?
- Are tests adequate?
- Do patterns match the codebase?
- Are there any issues?

If all looks good:
```bash
git add .
git commit -m "feature: [name] (implemented via subagent coordination)"
```

If issues exist, request fixes from relevant subagents.


## Subagent Communication

Subagents report back via:

1. **Report files** (RESEARCH.md, IMPLEMENTATION.md, TESTS.md)
   - Written during the subagent's work
   - Parent reads these to understand what was done
   - Specific, detailed, with examples

2. **Git commits**
   - Each subagent commits their work
   - Parent reviews the diff
   - Helps catch unintended changes

3. **Structured output**
   - Summary of what was done
   - Blockers encountered
   - Decisions made
   - Next steps needed

## Example Workflow

**Feature**: Add a user authentication service

### Step 1: Research
Parent delegates to Research Subagent:

"Analyze src/ and report:

How is the current auth handled?
What JWT/session library is used?
How are errors handled?
What testing patterns exist? Write to RESEARCH.md"

Research Subagent returns:
RESEARCH.md:

Current: No auth, routes unprotected
Library: no JWT yet, using express-session
Errors: Custom AppError class with statusCode
Testing: Jest with mocked Express (req, res, next)
Recommendation: Add JWT for stateless auth

### Step 2: Implementation
Parent delegates to Implementation Subagent:
"Implement JWT authentication service:

Create src/auth/auth-service.ts
Follow error patterns from RESEARCH.md
Add src/middleware/auth-middleware.ts
Run tests after each change
Document in IMPLEMENTATION.md"

Implementation Subagent returns:
IMPLEMENTATION.md:

Added AuthService with sign, verify, refresh methods
Added authMiddleware for route protection
45 lines of code
All existing tests still pass
New auth code tested with AuthService.test.ts

### Step 3: Testing
Parent delegates to Testing Subagent:
"Write comprehensive tests for src/auth/:

Test valid tokens, expired tokens, invalid tokens
Test JWT signing and verification
Test middleware (pass/fail scenarios)
Target 85%+ coverage
Update TESTS.md"

Testing Subagent returns:
TESTS.md:

12 test cases covering all paths
87% code coverage
All tests passing
Edge cases: malformed JWT, expired token, missing Authorization header

### Step 4: Integration
Parent reviews all work and runs:
```bash
npm test         # All tests pass
npm run build    # Clean build
git diff         # Review changes
git commit -m "feat: JWT authentication with subagent coordination"
````

Now you should implement these three subagents:

##### API layer subagent

````md
---
name: api-layer
description: API layer specialist for building Express routes, middleware, and HTTP endpoint handlers. Use when implementing REST endpoints, request validation, and response formatting.
tools: Read, Edit, Write, Bash, Grep, Glob
model: sonnet
---

You are an API layer specialist. Your job is to implement Express routes that wire HTTP to services.

When invoked:
1. Read the shared types and the service interface
2. Implement Express routes with proper HTTP methods and status codes
3. Add request validation middleware
4. Handle all error responses defined in the spec
5. Write integration tests for the endpoints
6. Verify all tests pass before reporting back

Rules:
- Only modify files in the routes layer (src/invitations/routes.ts)
- Import the service — never access the repository directly
- Map service errors to correct HTTP status codes
- Validate request bodies before calling services
- Tests must cover: successful operations, validation failures, not-found, error responses
````

##### business logic subagent

````md
---
name: business-logic
description: Business logic specialist for implementing service layers, validation rules, and domain logic. Use when building services that orchestrate data operations with business rules.
tools: Read, Edit, Write, Bash, Grep, Glob
model: sonnet
---

You are a business logic specialist. Your job is to implement service layers that enforce business rules.

When invoked:
1. Read the shared types and the repository interface
2. Implement the service layer with validation and business rules
3. Handle all error cases defined in the spec
4. Write unit tests for the service
5. Verify all tests pass before reporting back

Rules:
- Only modify files in the service layer (src/invitations/service.ts)
- Import the repository — never access storage directly
- Implement all validation rules from the spec
- Return proper error codes for each failure case
- Tests must cover: happy path, validation errors, edge cases
````

##### data layer subagent

````md
---
name: data-layer
description: Data layer specialist for building repositories, type definitions, and database schemas. Use when implementing storage, CRUD operations, or data access patterns.
tools: Read, Edit, Write, Bash, Grep, Glob
model: sonnet
---

You are a data layer specialist. Your job is to implement repository patterns with clean CRUD operations.

When invoked:
1. Read the shared types file to understand the data contract
2. Implement the repository with in-memory storage
3. Create proper TypeScript interfaces for all operations
4. Write unit tests for the repository
5. Verify all tests pass before reporting back

Rules:
- Only modify files in the data/repository layer (src/invitations/repository.ts, src/invitations/types.ts)
- Import shared types — never redefine them
- Use the exact field names from the types file
- Implement proper error handling for all operations
- Tests must cover: create, read, update, delete, not-found cases
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

