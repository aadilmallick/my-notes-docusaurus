
## Features



### Univariate data and bivariate data

In statistics, the terms univariate and bivariate refer to the number of variables being analyzed.

- **Univariate data** involves the analysis of a single variable. The goal is to describe the distribution of this variable, often using measures of central tendency (like mean or median) and measures of spread (like variance or standard deviation). 
    
- **Bivariate data** involves the analysis of two variables simultaneously. The goal is to understand the relationship or correlation between these two variables. 

### Univariate data and feature types

There are 4 types of univariate data, meaning when you're looking at just one feature:

- **nominal data** : categorical data with no order to the data
- **ordinal data** : categorical data with order to the data and labels
- **continuous data** : numerical data that includes decimals
- **discrete data** : numerical data that includes only integers or a finite collection of integers.

There are two types of feature types:

- **qualitative**: either nominal or ordinal data, where the feature is based on categories and uses one-hot encoding to encode the category numerically.
- **quantitative**: either continuous or discrete data, using numerical data.

#### Measures of central tendency

Based on the skewness of the distribution, these facts are guaranteed:

- **Symmetric** : mean = median
- **Right skewed** : mean > median
- **Left Skewed** : mean < median

**Best measures of central tendency for each situation**

- **Median** : when dealing with ordinal data or with skewed data
- **Mean** : When dealing with evenly distributed data like in a normal distribution

#### Measures of spread

- **variance** : we can use the `np.var(arr)` method to get the variance of the data within a vector.
- **standard deviation** : we can use the `np.std(arr)` method to get the standard deviation of the data within a vector.
- **coefficient of variation** : the coefficient of variation is the standard deviation divided by the mean.

```py
x = np.random.randn(20)

print("standard deviation:", np.std(x))
print("variance:", np.var(x))
print("coefficient of variation", np.std(x) / np.mean(x))
```


### Feature scaling

Most machine learning algorithms use **distance metrics** (like Euclidean distance) or **gradient descent** for optimization. If one feature has a range of 0-1 and another has a range of 0-1,000,000, the algorithm will be dominated by the larger magnitude feature, even if the smaller feature is more predictive.


So why do we use feature scaling? Three key principles:

1.  **Comparability:** It brings all features to a similar scale, making them directly comparable.

2.  **Convergence:** Algorithms that use Gradient Descent (like Logistic Regression or Neural Networks) converge much faster when features are scaled.

3.  **Distance Sensitivity:** Algorithms like KNN, K-Means, and PCA are highly sensitive to the magnitude of features.


There are three types of scaling:

*   **Standardization (Z-score normalization):** Transforms data to have a mean of 0 and a standard deviation of 1. It is robust to outliers compared to Min-Max scaling.

    $$\text{Standard Scaled } x = \frac{x - \mu}{\sigma}$$

*   **Normalization (Min-Max Scaling):** Rescales the data to a fixed range, usually 0 to 1. It is very sensitive to outliers (a single outlier can compress all other values into a tiny range).

    $$\text{Min-Max Scaled } x = \frac{x - x_{min}}{x_{max} - x_{min}}$$

- **log 10 scaling**: Simple rescaling of data on large magnitudes, but not actually used to improve the performance of a machine learning model in the sense of how feature scaling is supposed to be. It's only used for human-readable values so we can see smaller values instead of all values being in the thousands.


```py
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import numpy as np

# Sample data: [Feature A, Feature B]
data = np.array([[10, 0.001], [20, 0.002], [30, 0.005], [1000, 0.01]])

# Standard Scaler
std_scaler = StandardScaler()
std_data = std_scaler.fit_transform(data)

# Min-Max Scaler
mm_scaler = MinMaxScaler()
mm_data = mm_scaler.fit_transform(data)

print("Original Data:\n", data)
print("\nStandard Scaled (Mean=0, Std=1):\n", std_data)
print("\nMin-Max Scaled (Range 0-1):\n", mm_data)
```

#### Log transformation

We use **log transformation** to get better resolution on a plot where our data varies widely between magnitudes, like on a range from 1,000 - 350,000.

- `np.log10(arr)` : applies base 10 log to all elements in the array. Returns new array
- `np.log(arr)` : applies natural log to all elements in the array. Returns new array

We want to apply the log 10 transformation on our features that vary widely in magnitude.


#### Min-max scaling

Rescales the data to a fixed range, usually between 0 to 1.

- **pro (fixed range)**: a fixed range offers predictability and standardization in mathematical outputs
- **con (sensitive to outliers)**: very sensitive to outliers since a single outlier can compress all other values into a tiny range. 
	- For example if the max is 1,000,000 and the average is maybe 29, then that single million value outlier basically ruins the rest of the range because it makes every single other value extremely small while the largest value is equal to 1. 



   $$\text{Min-Max Scaled } x = \frac{x - x_{min}}{x_{max} - x_{min}}$$

#### Standard scaling

> [!WARNING]
> If you try to calculate the coefficient of variation on standard scaled data, then you will get an error because standard scaled data always has a mean = 0 and variance = 1, thus 1 / 0 nets you undefined.


We can get access to a standard scaler through the sklearn library, like so: 

```python
from sklearn.preprocessing import StandardScaler as SS
standard_scaler = SS()
```

- `ss.fit_transform(df)` : takes in a dataframe or another 2D array, and then feature scales all the feature columns. It returns the scaled dataframe or array.
- `ss.fit(df)` : calculates mean and standard deviation of data and stores it in the `ss` object. Returns `None`
- `ss.transfom(df)` : feature scales the data after you call `ss.fit()`. Only does this for standard scaler, but applies fitted parameters to data

These three methods do different things depending on which object instance of sklearn you use. Here is how they work in general: 

- `.fit()` : fits the data to the model
- `.transform()` : transforms the model
- `.fit_transform()` : fits the data to the model, and then returns the transformed data.


```py
standard_scaler = StandardScaler()
scaled_df = standard_scaler.fit_transform(data)
```


## Training, Validation, Test

### Generalization error

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
4. Continue this process for $k$ iterations, covering all folds, and then compute the error for each iteration
5. The total error is the average of all $k$ error yields.

In total, each fold will be in the training data $k-1$  times and in the testing data 1 time. Per iteration, you have $k-1$ train folds and 1 validation fold.

## Overfitting, Underfitting, Bias vs Variance

### Intro

When we overfit a data set, essentially the model just well on the training data but fails to generalize on the testing data. It means training score is less than testing score.

When we underfit a data set, it performs poorly on both the training set and and test set.

- **internal validity** : how well the model performs on the training data
- **external validity** : how well the model performs on the test data
- **overfitting**: high internal validity, low external validity
- **underfitting**: low internal validity, low external validity

### How model complexity affects performance

Model complexity affects performance because either your model is too complex and thus "memorizes" the training data while failing to generalize, or the model is too simple to capture any complex pattern in the data.

We quantify the number of candidate hypotheses in the hypothesis set by **degrees of freedom**, also known as **VC dimension**. So degrees of freedom is just the cardinality of the hypothesis set.

- **small VC dimension**: We may not even have a good hypothesis in the hypothesis set since it's so small, which is a symptom of choosing a simple model.
- **large VC dimension**: Although it is likely we contain a good hypothesis somewhere in the hypothesis set, it's harder to find, which is a symptom of choosing an overly complex model.

> [!NOTE]
>**VC dimension in a nutshell**
> ***
> 
> VC dimension is a way to quantify the complexity of a model, and mathematically it represents the cardinality of the hypothesis set.


![](https://i.imgur.com/egzdjNF.jpeg)


> [!NOTE]
> **Overfitting in a nutshell**
> ***
> 
> Overfitting is a symptom of having a too complex model for the data, leading to the model fitting the noise and thus overperforming on training data but failing to generalize to testing data.


### Learning curves

We can see if a model is overfitting or underfitting by plotting a **learning curve**, which plots the model accuracy/performance on the y-axis against the number of training examples on the x-axis.


![](https://i.imgur.com/djSb5He.jpeg)

From the learning curve, we can see how to mitigate overfitting and improve performance:

- **get more training data**: When we have more training data, it is less likely that by chance we choose the wrong hypothesis function. 
- **regularization**: to prevent fitting to too much noise, making a complex model simpler.



### Bias-variance tradeoff

- **low VC-dimension**: simple models have high bias and low variance, thus they underfit.
	- **high bias**: the chance of finding the best hypothesis in the set is high.
	- **low variance**: Since the VC dimension is low, there are not many variations of the hypothesis and thus not much of a chance of finding a better, more complex model.
- **high VC-dimension**: complex models have low bias and high variance, thus they overfit.
	- **low bias**: the chance of finding the best hypothesis in the set is low, since it's such a small subset of the hypothesis set.
	- **high variance**: There are many variations of hypotheses, and even training on one different sample can lead to many different hypothesis functions in this set.


![](https://i.imgur.com/f6BN3WV.jpeg)

This is a fitting graph, which plots model error on the Y-axis and VC-dimension on the X-axis:


![](https://i.imgur.com/bAGUNkQ.jpeg)


### Regularization

Regularization is a technique to mitigate overfitting by penalizing noise through a parameter $\lambda$, with the purpose of trying to make a complex model (cause of overfitting) simpler.

The greater the parameter $\lambda$ the more penalization there is for parameters being too large and that's how it makes a simpler model. 

- **small $\lambda$**: If lambda is small then basically no regularization happens and the model retains its complexity
- **large $\lambda$**: If lambda is large, then large parameters get penalized and become smaller to avoid blowing up error and thus the model becomes simpler.

Here is an example of how one would undertake regularization:

1. Perform k-fold cross validation with different values of $\lambda$.
2. Choose the $\lambda$ value that gave the lowest cross-validation error.
3. Retrain on all the training data with the found $\lambda$ value, and then test and see the generalization error.

## A first algorithm: K-nearest neighbors