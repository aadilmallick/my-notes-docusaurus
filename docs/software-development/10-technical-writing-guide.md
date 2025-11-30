## Secret Sauce of Writing

The main principles of writing are as follows:

1. **simplicity**: bring punchiness to writing, remove fluff.
	- Use as few words as possible and prefer simple words rather than complex ones.
2. **clarity**: Make writing easy to understand
3. **elegance**: makes writing flow well
	- Have good sentence structure and vary sentence lengths.
4. **evocativeness**: makes writing captivating, and stimulating
	- Always avoid passive voice and always use strong verbs

### Crash Course

#### 1. Clarity (The Reader Understands Quickly)

Clarity is achieved by minimizing the time between the reader seeing a word and understanding its meaning.

- **Theory: The Subject-Verb-Object (S-V-O) Principle:** Keep the **actor (subject)** and the **action (verb)** as close together as possible. This is the natural order of English.
    - **Fix:** **Avoid Passive Voice.** Passive voice separates the actor from the action and often uses weaker "to be" verbs.
        - _Before:_ "The bug was found by the passionate coder." (Passive)
        - _After:_ "**The passionate coder found the bug.**" (Active, clear)
- **Theory: The One-Idea-Per-Sentence Rule:** Do not try to stuff multiple complex or competing ideas into a single sentence.
    - **Fix:** Use a semicolon to connect two _related_ independent clauses, or use a dash for emphasis, but if the ideas are different, **break them into separate sentences.**

#### 2. Simplicity (The Writing is Lean)

Simplicity means using the fewest words necessary to convey the idea. Every word must earn its spot.

- **Theory: The Principle of Economy:** Eliminate all redundancies and filler words (called **flab**).
    - **Fix:** **Eliminate Redundant Phrases:**
        - _Instead of:_ "In the event that..." $\rightarrow$ **If**
        - _Instead of:_ "Due to the fact that..." $\rightarrow$ **Because**
        - _Instead of:_ "Definitely, absolutely necessary" $\rightarrow$ **Necessary**
- **Theory: Use Strong Verbs:** Strong verbs carry the action themselves and don't need adverbs to prop them up.
    - _Instead of:_ "They **ran quickly** to the computer."
    - _Use:_ "They **sprinted** to the computer." (Strong verb does the work)

#### 3. Elegance (The Writing Flows and Sounds Good)

Elegance is the aesthetic quality of writing; it’s about rhythm, sound, and structure.

- **Theory: Parallel Structure (Rhythm):** When listing concepts or ideas, use the same grammatical form (noun, verb phrase, adjective phrase). This creates a satisfying, rhythmic pattern for the reader.
    - _Before:_ "A passionate coder is someone who loves **to solve problems**, **building side projects**, and **they get joy from debugging**."
    - _After:_ "A passionate coder loves **solving problems**, **building side projects**, and **debugging for joy**." (All gerund phrases)
- **Theory: Sentence Length Variance:** Mix short, punchy sentences with longer, descriptive ones. A short sentence after several long ones acts like a sudden, memorable punctuation mark.
    - _Example:_ (Long setup...) "The theory was dry, the documentation overwhelming, and the need to grind LeetCode felt soul-crushing. **Then I coded my own to-do list.**" (Short, powerful conclusion)

#### 4. Evocativeness (The Writing Creates Imagery and Feeling)

Evocativeness is about using language that connects to the reader's senses, emotions, or shared cultural knowledge.

- **Theory: Concrete Nouns and Imagery:** Use nouns and imagery that the reader can **see, hear, or feel** instead of abstract concepts.
    - _Instead of:_ "I found the learning process tedious."
    - _Use:_ "I was more bored than a **DMV clerk**." (A shared cultural image)
- **Theory: Metaphor and Analogy:** Introduce a familiar concept to explain an unfamiliar one. You did this beautifully by using **"intoxicated on the high of programming"**—it evokes a strong, positive, almost addictive feeling of success.
    - _Fix:_ Continue to use strong, vivid verbs related to the metaphor (e.g., _fueled, addicted, high, tricked_).

### Simplicity and clarity

**never use a long word when a short one will do**

| Wordy                     | Concise |
| ------------------------- | ------- |
| at this point in time     | now     |
| determine the location of | find    |
| is able to                | can     |

**There is, there are**

avoid starting sentences with “There is” or “There are” because these pair a generic subject with a generic verb and make sentences vague.


| Bad                                                                          | Good                                                       |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| There is a variable called `met_trick` that stores the current accuracy.     | A variable named `met_trick` stores the current accuracy.  |
| There are two disturbing facts about Perl you should know                    | You should know two disturbing facts about Perl.           |
| There is no guarantee that the updates will be received in sequential order. | Clients might not receive the updates in sequential order. |

From the example above, we can see that the easiest way to avoid using "there is" or "there are" is to just move the subject to the beginning of the sentence.

If there is no clear subject in a sentence, then you may be tempted to use "there is" or "there are", but the antidote to this is to make your own concrete subject.
- **wrong**: *There is no guarantee that the updates will be received in sequential order.* 
	- Here we see that we don't know who's receiving the updates, so we're tempted to use the weak "there is."
- **correct**: *Clients might not receive the updates in sequential order.*
	- Here we specify "clients" as the concrete subject.

**avoid adjectives**

Avoid overusing adjectives and especially adverbs

****
## Technical Writing specifics

### Avoid Gatekeeping

**gatekeeping words** are ones that alienate your readers, so you should avoid them.

### Each sentence should be only about 1 idea

Focus each sentence on a single idea, thought, or concept. Just as statements in a program execute a single task, sentences should execute a single idea.

An easy way to tell if a sentence is too long and has more than one idea is if it has a **subordinate clause**, which is a sentence fragment starting with the following demonstrative adjectives:

- which
- that
- because
- unless


> [!NOTE]
> If the subordinate clause of a sentence is a different idea than the main sentence, extract it out into its own sentence so you can adhere to the one-idea-per-sentence rule

### Lists

Items in a list whether ordered or unordered should be **parallel**, meaning they have the same structure in all these 4 aspects: grammar, capitalization, punctuation, and logic.

![](https://i.imgur.com/e1fKqBn.png)

Here are the basic grammar rules concerning lists:

- **use imperative verbs for numbered lists**: Each sentence of an item in an ordered list must start with an imperative verb, like a command.
- **start each list item with a capital letter**: Each item in a list should start with a capital letter.
- **always introduce a list or table**: Always provide context for a list or table before presenting it, often by using the word "following"
	- **example**: *The following list identifies key performance parameters*

### Paragraphs

The opening sentence of each paragraph should always state the main purpose or main idea of the paragraph, and should be setup for the rest of the paragraph.