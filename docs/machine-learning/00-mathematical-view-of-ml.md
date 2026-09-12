

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

