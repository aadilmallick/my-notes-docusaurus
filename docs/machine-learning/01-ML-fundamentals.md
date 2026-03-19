

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

## Training, Validation, Test

### Generalization error

#### A surface level view

Generalization error is how much your model errors on new data it hasn't seen before. 

> [!NOTE]
> Therefore, to get an accurate view of how your model is doing, you need to make sure that you cannot reuse a training set as your test set when doing the generalization error. You must calculate the generalization error on new data that you haven't seen before, otherwise you introduce biases in the data.

Let's take a look at training performance vs generalization performance:

- **in-sample performance**: when training on a train set, which we use to iteratively find a good hypothesis, the error on the training set will be optimistic and having fit the model to the training set, the model would be biased to performing well on the training set.
- **out-of-sample performance**: When training on new data, the model has never seen before, it can't use its underlying biases to get a lower error, and therefore is a more accurate depiction of a model's performance

### Train test-split

Given a dataset we want to train our model on, reserve 80% of it for training and 20% of it for testing.

#### k-fold cross validation

The idea of K-fold validation is to make each batch of data as the testing data so that there are no discrepancies and bias between what we're choosing for training data and testing data.

You will make $k$ models during this process.

1. Split data into $k$ equally sized groups, called **folds**
2. Use the first fold as a **validation fold**, which is the testing data, and then merge the rest of the $k-1$ folds into a group as the training data, called **train folds**.
3. Move on to make the second fold as the validation fold, and then merge the rest of $k-1$ the folds into a group as the training data.
4. Continue this process until you cover all the folds.

In total, each fold will be in the training data $k-1$  times and in the testing data 1 time. Per iteration, you have $k-1$ train folds


## Overfitting, Underfitting, Bias vs Variance

### Intro

When we overfit a data set, essentially the model just well on the training data but fails to generalize on the testing data. It means training score is less than testing score.

When we underfit a data set, it performs poorly on both the training set and and test set.

- **internal validity** : how well the model performs on the training data
- **external validity** : how well the model performs on the test data
- **overfitting**: high internal validity, low external validity
- **underfitting**: low internal validity, low external validity




## Mathematical View of Machine Learning


