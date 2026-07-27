## Vibe coding mastery

### tech stack

The "gooner tech stack" as I like to call it helps with vibe coding and consists of NextJS, tailwind, typescript, supabase, shadcn.

### Workflow

1. Tell chat about your idea and ask it to make a PRD (project requirements document) so that you can input it into cursor.
2. Ask chat to convert the PRD into a prompt for building with cursor or replit
3. Copy a standard cursor rules for nextjs, tyepscript, react, enable it for project.
4. Paste in your PRD into cursor and ask it to create a landing page for you. You can also paste in wireframes or mockups of what you want the UI to look like.
5. Once the code is built, ask cursor to explain the file structure and what each file in the codebase does so you can understand it better.

**must have workflow techniques**

- **have good git hygeine**: commit consistently once the AI changes something so you can easily roll back.
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
