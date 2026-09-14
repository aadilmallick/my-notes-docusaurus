
## The heart of math and AI

There are two ways to solve mathematical problems:

- Analytical: Exact solutions through algebraic manipulation
    
- Numerical: Approximate solutions using algorithms
    

In engineering and in AI, we are constantly choosing between these approaches.

When training AI models with millions of parameters, analytical solutions are impossible. This is why, in these cases, we need numerical approaches.

When creating math theorems, we need analytical precision to make sure it is the best possible solution.

This is one of the many things an engineering degree teaches you: often, in the real world, it’s better to just write some code to solve a problem than to actually solve it by hand with math. Other times, the best solution is to just think in first principles and from there create new theorems to solve a problem.

### Grand unified theory of mathematics

Is it possible to unify all math?

In theory, yes. This is known as the Grand Unified Theory of Mathematics. It's the idea that all different areas of math can be linked together to discover deeper patterns in mathematics.

With a Grand Unified Theory of Mathematics, we would be able to understand how every branch of the tree connects with the others and all the relationships between them.

By studying history, we can find patterns. The unification of various fields has created many massive impacts on society, such as:

- In the 19th century, James Clerk Maxwell united the fields of electricity and magnetism with his famous Maxwell equations. This allowed the creation of radios and electric grids around the globe. In turn, it served as a foundation for all technological progress in the 20th and 21st century.
    
- In the 20th century, the unification of algebra with logic led to the rise of digital systems. In turn, digital systems gave rise to processors and the evolution of computers and the modern laptop.
    
- Also in the 20th century, the unification of probability and communication led to information theory. This became the foundation for the internet. This unification was carried out by a great mathematician named Claude Shannon.


In the end, a grand unified theory of mathematics could be one of the biggest achievements in modern society.

In AI, it could help unify all machine learning models in a common architecture. This would help accelerate the development of new AI models and could also open the door to new material science advances.

It could help reveal – with math – the deep patterns we still haven’t found in these fields. Just as uniting electricity and magnetism led to modern technology, a unified math framework would lead to a wave of innovation.

### AI vs AGI

But over time, rather than creating [general intelligence](https://en.wikipedia.org/wiki/Artificial_general_intelligence), most AI systems have been designed to excel at narrow tasks.

For example:

- Chess-playing programs like Deep Blue that defeated world champion Garry Kasparov
    
- Image recognition systems that can identify objects in photographs with impressive accuracy
    
- Natural language processing models that can translate between languages
    
- Game-playing AI like AlphaGo that mastered the ancient game of Go


Only very narrow AI models have demonstrated human-level or superhuman performance in their narrow domains.

In my view, and as we will see in this book, AGI will be the combination and interaction of different large language models interacting with each other and with the tools available to them.

### Symbolic vs Non-symbolic AI

- **Symbolic AI** refers to the creation of a program based on many rules and symbols to simulate how humans think.
	- **examples**: Min-max with chess, solving a maze
- **Non-symbolic AI**: AI that learns from data iteratively to create a probabilistic model.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1755906892854/197f7bc3-8c05-46f2-aa2a-99dbaa733a9a.png)

### Rank, compression, and LoRA

The matrix rank shows the maximum number of independent equations that can exist. This help engineers model the simplest possible form of the systems.

In LLMs like ChatGPT, Gemini, Grok, and Claude, linear independence, dependence, and rank are used in a very important technique called LoRA (Low-Rank Adaptation).

LoRA (Low-Rank Adaptation) is widely used to calibrate these models to make sure they adapt efficiently to new tasks or domains without retraining the full model. Also, there are variants of this technique, like Quantized LoRA. This way, in many data centers, LoRA saves energy, water for cooling, and so many other things.

## Learning Model

### 5 components of learning

![Illustration of learning model](https://i.imgur.com/3KcLDbP.jpeg)

Here is the essence of machine learning:

1. A pattern exists
2. We cannot pin it down mathematically (no pattern we can mathematically compute)
3. We have data on it

> [!NOTE]
> A **learning problem** is when we have to use machine learning to solve it, and a **design problem** is a problem that can be solved mathematically.


> [!IMPORTANT]
> The basic premise of learning is using a set of observations to uncover an underlying process.


Here are all the components:

1. **unknown target function**: We denote this as $f(\mathbb{x})$, the true hypothesis that deterministically describes how the input affects the output and is a perfect predictor of inputs to outputs.
    - A **hypothesis**  $g(\mathbb{x})$  is a candidate approximation of the target function.
    - We're to find a hypothesis that solves a problem that can’t be mathematically solved, a hypothesis that we’ll truly never know.
2. **data**
    - A set of training examples
3. **learning algorithm**: Selects the best hypothesis from the a hypothesis set over an iterative process, and picks the _final hypothesis_.
4. **hypothesis set**: the set of all possible variations to the current hypothesis, and you will pick one hypothesis from that set as the final hypothesis.
    1. A set of candidate formulas that approximate the target function.
    2. As the hypothesis set gets more complex, the more data we need.
    3. As the hypothesis set gets less complex, the less data you need.
5. **final hypothesis**: Our chosen best hypothesis  $g(\mathbb{x})$ from the hypothesis set, and we hope that  $g(\mathbb{x}) \approx f(\mathbb{x})$.

> [!NOTE]
> **Learning in a nutshell**
> ***
> From a large hypothesis set of potential hypothesis functions, we want to select the hypothesis function that has the lowest generalization error from the set, which means it generalizes well to new examples and is thus an effective model.

