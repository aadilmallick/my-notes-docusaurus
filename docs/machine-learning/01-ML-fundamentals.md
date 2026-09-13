

## An overview of machine learning


![](https://i.imgur.com/kBSaGnF.jpeg)



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

Most machine learning algorithms use **distance metrics** (like Euclidean distance) or **gradient descent** for optimization. 

If one feature has a range of 0-1 and another has a range of 0-1,000,000, the algorithm will be dominated by the larger magnitude feature, even if the smaller feature is more predictive. That is why we must scale feature ranges into a more suitable, standardized and smaller range.


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

Standard scaling fits features to a normal distribution, making each feature have a mean $\mu=0$ and a standard deviation $\sigma=1$

The formula for standard scaling is this, where you subtract the mean from each feature value, and then divide that by the standard deviation.

  

$$\frac{x - \mu}{\sigma}$$
This results in each scaled feature having a mean = 0 and standard deviation = 1.
  

> [!NOTE]
> This is the exact same thing as the Z-score. It returns the z-score of each feature value, about how many standard deviations the observation is from the mean.




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

### Feature engineering

Feature engineering is the process of creating new features from existing raw data and other existing features in order to improve a model's performance and use new features that would benefit the model training.

> [!NOTE]
> Good feature engineering makes the difference between an average model and an excellent one, as it helps the model to focus on the most relevant patterns in the data.


![](https://i.imgur.com/i4AIc26.jpeg)


## Training, Validation, Test

### Generalization error

Generalization error is how much your model errors on new data it hasn't seen before. 

> [!NOTE]
> Therefore, to get an accurate view of how your model is doing, you need to make sure that you cannot reuse a training set as your test set when doing the generalization error. You must calculate the generalization error on new data that you haven't seen before, otherwise you introduce biases in the data.

Let's take a look at training performance vs generalization performance:

- **in-sample performance**: when training on a train set, which we use to iteratively find a good hypothesis, the error on the training set will be optimistic and having fit the model to the training set, the model would be biased to performing well on the training set.
- **out-of-sample performance**: When training on new data, the model has never seen before, it can't use its underlying biases to get a lower error, and therefore is a more accurate depiction of a model's performance
- **overfitting**: When we overfit a data set, essentially the model does well on the training data but fails to generalize on the testing data. It means training score is less than testing score.
- **underfitting**: When we underfit a data set, it performs poorly on both the training set and and test set.
- **internal validity** : how well the model performs on the training data
- **external validity** : how well the model performs on the test data

### Train test-split

The performance on the validation and test sets will be roughly the same, but the test set will be slightly worse since you will not have trained on the test set at all.

- **train set:** The dataset partition which you use to train your model - around 60% of dataset
- **validation set:** The dataset partition which you use to choose the best hyperparameters for your model - around 20% of dataset
- **test set:** The dataset partition which you use to test your model - around 20% of dataset
#### sklearn implementation

Here is an example of how we can do in sklearn:

The `tts()` method takes in an array of features and an array of target data, and then returns an array of 4 nested arrays, representing the training data and testing data respectively.

```python
from sklearn.model_selection import train_test_split as tts

X_train, X_test, y_train, y_test = tts(x, y, test_size=0.2, shuffle=True, random_state=201)
```

The first two arguments you pass to the `tts()` method are the array of features, `x`, and the array of target values `y`. Then after that here are the kwargs you can supply: 

- `test_size=` : the percentage of data to allocate to testing. 20% is pretty good here.
- `shuffle=` : whether to randomly sort data or not.
- `random_state=` : `int`. a random seed to set so that you get back the same split every time.

### k-fold cross validation

The idea of K-fold validation is to make each batch of data as the testing data so that there are no discrepancies and bias between what we're choosing for training data and testing data.

You will make $k$ models during this process.

1. Split data into $k$ equally sized groups, called **folds**
2. Use the first fold as a **validation fold**, which is the testing data, and then merge the rest of the $k-1$ folds into a group as the training data, called **train folds**.
3. Move on to make the second fold as the validation fold, and then merge the rest of $k-1$ the folds into a group as the training data.
4. Continue this process for $k$ iterations, covering all folds, and then compute the error for each iteration
5. The total error is the average of all $k$ error yields.

In total, each fold will be in the training data $k-1$  times and in the testing data 1 time. Per iteration, you have $k-1$ train folds and 1 validation fold.


#### **Theory of k**

The value of $k$ has a bias-variance tradeoff. 

- As the number of folds $k$ increases, You do better on training data and do worse on testing data (testing data is a smaller portion of data) and thus **variance increases**
- As the number of folds $k$ decreases, You do worse on training data and do better on testing data (testing data is a bigger portion of data, and you're training on less of data) and thus **bias increases**

#### kfold in code

1. Import `kfold`

   ```python
   from sklearn.model_selection import KFold
   ```

2. Create a kfold instance from the `KFold` class

   ```python
   kf = KFold(n_splits = 10, random_state=146, shuffle=True)
   ```


3. Use the `kf.split(data)` method to create kfold splits on your data, which should be a 2D array. This method returns a generator, so you should iterate through it

    ```python
    for idxTrain, idxTest in kf.split(x):
        Xtrain = x[idxTrain]
        Xtest = x[idxTest]
        ytrain = y[idxTrain]
        ytest = y[idxTest]
    ```

And here's a convenience method:

```py
from sklearn.model_selection import KFold

def do_Kfold(model,X,y,k,scaler = None, random_state = 146):
    
    kf = KFold(n_splits=k, random_state = random_state, shuffle=True)

    train_scores = []
    test_scores = []

    for idxTrain, idxTest in kf.split(X):
        Xtrain = X[idxTrain, :]
        Xtest = X[idxTest, :]
        ytrain = y[idxTrain]
        ytest = y[idxTest]
        if scaler != None:
            Xtrain = scaler.fit_transform(Xtrain)
            Xtest = scaler.transform(Xtest)

        model.fit(Xtrain,ytrain)

        train_scores.append(model.score(Xtrain,ytrain))
        test_scores.append(model.score(Xtest,ytest))
        
    return train_scores, test_scores
```
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

## Dimensionality

Dimensionality of your data is the number of features that contribute to the data.
### Curse of dimensionality

The curse of dimensionality states that:

> As the dimensionality increases, the number of data points required for good performance of any machine learning algorithm increases exponentially.

The cure of dimensionality has many effects:

- **equidistant points**: high-dimensional points are sparse and spread out, thus distance-based algorithms like KMeans or KNN degrade in utility with high dimensionality.
- **harder to learn patterns**: as the set of all possible data points becomes increasingly more sparse, it becomes harder to learn patterns in the data.

![](https://i.imgur.com/vtVfzaH.jpeg)

### Dimensionality Reduction

Dimensionality reduction is the practice of approximating high dimensional data to lower dimensions while trying to maintain as much accuracy and capture most of the patterns in the original data as possible.



![](https://i.imgur.com/EptIK0x.jpeg)


Lower dimensionality brings us two key benefits:

- **easier to understand and visualize**: As humans, we can't visualize past 3 dimensions.
- **easier to train**: most models perform better on low-dimensional data.

### SVD for dimensionality reduction

### PCA for dimensionality reduction

### tSNE for dimensionality reduction
## First algorithm: univariate linear regression

Understanding how univariate linear regression works will give you a foundational base to understand every other machine learning model out there.

### Types of gradient descent

| Type                        | Speed   | Stability                                       | Has vectorization? |
| --------------------------- | ------- | ----------------------------------------------- | ------------------ |
| Batch gradient descent      | Slow    | Highest, completely stable                      | Yes                |
| Stochastic gradient descent | Fastest | Lowest stability, but moves generally downhill. | No                 |
| Mini-batch gradient descent | Fast    | Medium stability                                | Only a bit         |
|                             |         |                                                 |                    |
- **Batch gradient descent**: each step of gradient descent vectorizes over all the training examples to calculate the gradient with respect to cost.
- **stochastic gradient descent**: each step of gradient descent chooses only one random training sample to calculate the gradient with respect to cost.
- **mini-batch gradient descent**: each step of gradient descent chooses a small randomly sampled batch of training sample to calculate the gradient with respect to cost.
#### Batch gradient descent

**Batch gradient descent** is where each step of gradient descent uses all the training examples to calculate the gradient with respect to cost.

> [!NOTE]
> This is what people usually think of by gradient descent.

- **con - slow**: This is more computationally expensive because you’re training on the entire dataset at once, where each gradient descent step computes on the entire dataset.
- **pro - accurate**: but it has the most stable downhill gradient descent since you KNOW that you’re going in the opposite direction of the correct gradient.
- **pro - uses vectorization**: Benefits from vectorization

> [!WARNING]
> TIP: Batch gradient descent is no longer feasible or efficient after N >> 1, meaning you have more than 1,000,000 training samples.

#### Stochastic gradient descenet

**stochastic gradient descent** is where you train on one random training sample at a time for the feed forward and backprop process, and update parameters based on one training sample per iteration.

- Fastest form of gradient descent, but most unstable since you’re basing entire parameter update off of one training sample
- Does not benefit from vectorization

#### Mini-batch gradient descent

**mini batch gradient descent** is where you train on a small randomly sampled batch of training samples for the feed forward and backprop process and update parameters based on calculation from that batch.

- **pro - average stability and speed**: Combines stability and speed for the best of both worlds
- A batch size of 100 training samples per iteration is the most recommended
## Regularization

Regularization punishes parameters to mitigate overfitting. By adding the parameters to the cost function, gradient descent aims to decrease the values of those parameters to make the hypothesis simpler.

There are three types of regularization: 

- **L1 regression**: regularization using the $L_1$ norm
- **L2 regression**: regularization using the $L_2$ norm
- **elastic regression**: regularization combining both L1 and L2 regularization

|         | Effect                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| L1      | Lasso regression is likely to completely reduce some parameters to 0, resulting in **sparse models** that require less memory. |
| L2      | Ridge regression reduces parameters a lot, but does not zero them out.                                                         |
| elastic | A healthy balance between L1 and L2 regularization                                                                             |

### Regularization fundamentals

**Effect of regularization parameter**

- As $\alpha$ increases, the hypothesis becomes extremely more simple 
- As $\alpha$ decreases, the hypothesis becomes slightly more simple

A high value of $\alpha$ penalizes the parameters a lot so that they are essentially 0, and the less that value, the less you are penalizing those parameters and thus the parameters only slightly decrease. 


**scaling**

You must always scale data with any type of regression so that they can all be penalized the same without any skewed data.

> [!NOTE]
> If data were not on the same scale, it would either grossly contribute to the cost or contribute nothing at all


### **$L_1$ regularization**

$L_1$ regularization, also called **lasso regression**, sums up the absolute value (L1 norm) of all the parameters and adds that to the cost function 

$$J = \sum_{i=1}^N (y_i - \hat{y}_i)^2 + \alpha \sum_{j=1}^n |\beta_i|$$

### **$L_2$ regularization**


L2 regularization, also called **ridge regression**, sums up the squares (L2 norm) of all the parameters and adds that to the cost function.

$$  
J = \sum_{i=1}^N (y_i - \hat{y}_i)^2 + \alpha \sum_{j=1}^n w_j^{2}  
$$

Here is the cost function for ridge regression, which serves to add the beta coefficients to the cost function so that we can penalize them. 

- $N$ : the number of training rows you have
- $n$ : the number of features/parameters
- $\alpha$ : the regularization hyperparameter



#### **Scaling**

You must always scale data with ridge regression so that they can all be penalized appropriately.

1. Scale training features
2. Scale testing features with the same scaler parameters as you did for the training data.

```python
ss = SS()
ss.fit(Xtrain)

# scale both training and testing data with scaler (based on training specs)
scaled_Xtrain = ss.transform(Xtrain)
scaled_Xtest = ss.transform(Xtest)
```

#### Hyperparameter optimization

Hyperparameter optimiziation is where we try to choose the best value for a hyperparameter that makes our model perform the best.

We always do hyperparameter optimization before training a model. Here are the steps we follow: 

1. Create a range for the $\alpha$ values, like an array of hyperparameter values to test
2. Loop through that range, and for each $\alpha$ parameter, perform ridge regression with the regularization hyperparameter set to $\alpha$, and add that score to a list of model scores.
3. Graph the alpha values against the list of model scores. THe optimal alpha lies at the peak of the graph.

```py
from sklearn.preprocessing import StandardScaler as SS

def getOptimalAlpha() -> int :
    # 1. setup kfold and scaler 
    k = 10
    ss = SS()

    # 2. create array of possible alpha values
    a_range = np.linspace(10,20,100)
    
    avg_tr_score=[]
    avg_te_score=[]
    
    for a in a_range:
        # 3. run model
        rid_reg = Ridge(alpha=a)
        train_scores, test_scores = do_Kfold(rid_reg, X, y, k, ss)

        # 4. collect statistics
        avg_tr_score.append(np.mean(train_scores))
        avg_te_score.append(np.mean(test_scores))

        # 5. return alpha that gave highest test score
        idx_max = np.argmax(avg_te_score)
        return a_range[idx_max]
```

## K-nearest neighbors

### Nearest Neighbor (NN)

The Nearest Neighbors (NN) algorithm works as follows:

1. Represent a data point as a vector
2. Given a data point, use the Euclidean distance formula with its vector representation to find its nearest neighbor, comparing to other data points.
3. The neighbor with the least distance value to the data point will be considered as the **nearest neighbor**

**Euclidean distance formula**

This is how you describe the euclidean distance formula (or L2 norm) in any number of dimensions $d$.

$$  
\| x^{(a)} - x^{(b)}\| = \sqrt{\sum_{j=1}^d (x_j^{(a)} - x_j^{(b)})^2}  
$$

> [!NOTE]
> The distance formula is just the same thing as subtracting the two vectors from each other and then taking the magnitude of that resultant vector.

### KNN theory

The **$K$-Nearest Neighbors ($K$-NN)** algorithm is a non-parametric, instance-based supervised learning method that performs prediction by querying stored training data directly at test time without an explicit training phase.

- **Training Data Representation:** The training set consists of $N$ pairs $\{(\mathbf{x}^{(1)}, t^{(1)}), \dots, (\mathbf{x}^{(N)}, t^{(N)})\}$, where each $\mathbf{x}^{(i)} \in \mathbb{R}^d$ is a $d$-dimensional feature vector and $t^{(i)}$ is the target label. 
	- In classification, $t^{(i)} \in \{1, \dots, C\}$
	- in regression, $t^{(i)} \in \mathbb{R}$.
    
- **Core Assumption:** Instances that are close to each other in feature space share the same or similar labels.
    
- **Lazy Learning:** The algorithm requires **$0$ computations at training time**. It simply memorizes the entire dataset and defers all computation to test time.

To determine distance between data points, we use the L2 norm as the distance metric of choice, but there are multiple different distance metrics.

#### NN as KNN

- **1-NN ($k=1$):** Selects the single closest sample $\mathbf{x}^*$, and predicted label is directly assigned as $y = t^*$. 
    
    $$\mathbf{x}^* = \arg\min_{\mathbf{x}^{(i)}} \Vert{}\mathbf{x} - \mathbf{x}^{(i)}\Vert{}_2$$
    
    
- **$K$-NN ($k > 1$):** Finds the $k$ training examples $\{(\mathbf{x}^{(1)}, t^{(1)}), \dots, (\mathbf{x}^{(k)}, t^{(k)})\}$ having the smallest Euclidean distances to $\mathbf{x}$.

However, NN is naive because it is extremely sensitive to noise. KNN solves this problem by having more neighbors factor into a classification technique like majority voting.


![](https://i.imgur.com/tH5t4c4.jpeg)


#### Majority voting

The predicted label $y$ is determined by a plurality/majority vote among the $k$ neighbors:

$$y = \arg\max_{t^{(z)}} \sum_{i=1}^k \mathbb{I}(t^{(z)} = t^{(i)})$$

Where $\mathbb{I}(\cdot)$ is the indicator function:

$$\mathbb{I}(A) = \begin{cases} 1 & \text{if } A \text{ is true} \\ 0 & \text{if } A \text{ is false} \end{cases}$$

> [!NOTE]
> The main intuition here is that if most of the neighbors are in one category, then you join the majority category. For example, for $k=9$ if you have 6 neighbors in one category, the new data point gets labeled as part of that majority category

#### $k$ and the decision boundary

The choice of $k$ is a **hyperparameter**—a parameter that cannot be learned directly from training data and must be selected using a separate validation set.



![](https://i.imgur.com/yxS0TRb.jpeg)


| **Parameter Choice**         | **Model Behavior**                                                                                              | **Variance & Bias**     | **Risk**                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------- |
| **Small $k$ (e.g., $k=1$)**  | Fits intricate local structures; captures fine-grained boundaries. Highly sensitive to label noise or outliers. | High Variance, Low Bias | **Overfitting:** Creates fragmented decision boundaries around mislabeled points.           |
| **Large $k$ (e.g., $k=15$)** | Averages over broader neighborhoods; smooths out decision boundaries.                                           | Low Variance, High Bias | **Underfitting:** Fails to capture localized patterns and may misclassify minority regions. |

- **Heuristic Guideline:** A practical rule of thumb is to choose $k < \sqrt{N}$, where $N$ is the number of training samples.
    
- **Validation Strategy:** Evaluate different candidate values of $k$ on a held-out validation set and pick the one with minimal validation error before performing final evaluation on the test set.


![](https://i.imgur.com/gNnpelU.jpeg)


### Distance metrics

In order to be a valid distance metric for KNN, it must satisfy three rules:

1. **symmetric**: $d(x, y) = d(y, x)$
    
2. **non-negative**: The resulting distance must be non-negative
    
3. **holds triangle inequality**: When calculating a triangle of points, the triangle inequality must hold:
    
    $$  
    d(x ,z) \le d(x,y) + d(y, z)  
    $$

These distance metrics work for KNN:

- cosine similarity
- euclidean distance
- edit/hamming distances


The default distance metric for KNN is `uniform`, meaning every point is weighted equally. You can change this with the `weights=` kwarg when instantiating the `KNN()` object.

Distance metrics come into play when deciding how to tally up a positive prediction or a negative prediction from the k nearest points.

- **`'uniform'`** : Each point is weighted equally, no matter how far away it is from the data point.

- **`'distance'`** : A point is weighted higher if it's closer to the data point being considered. Each point in the K nearest points to a data point is given a *weight*, which is the inverse of the distance from that point to the data point, 1 / distance.

### KNN in implementation

In the k nearest neighbors algorithm, we choose a number $k$, and in the corrdinate space, we consider a data point's distance to the $k$ nearest points to that data point.

Here are some things to keep in mind when implementing this algorithm in a ML practice:

- **train vs test**: For k nearest numbers, we want to keep train sets large and test sets small.
- **scaling**: Scaling is necessary for K nearest neighbors because this algorithm is dependent on the values of data points.
- **distance metric**: the choice of distance metric is crucial here.
- **size of $k$**
	- **small k:** Sensitive to noise, and overfits as a result
	- **large k:** Takes into account too much data and underfits as a result.

> [!NOTE]
> A good rule of thumb is to calculate $k = \sqrt{N}​$

#### Scaling

Because Euclidean distance aggregates squared differences across all dimensions, features with larger numerical ranges (e.g., seconds vs. minutes, or kilograms vs. grams) disproportionately dominate the distance calculation.

Because KNN is based on distance, all the points must be on the same distance scale. Therefore something like standard scaling is necessary.

> [!NOTE]
> For KNN classification, the neighbors approach only works if classes are not skewed. They need to be balanced, as in near 50-50, or else the neighbors approach will skew towards the majority class regardless of distance.

You can use standard scaling like so:

Transform each feature dimension $j$ to have zero mean and unit variance:

$$\tilde{x}_j = \frac{x_j - \mu_j}{\sigma_j}$$

where $\mu_j$ is the mean and $\sigma_j$ is the standard deviation of feature $j$.
#### Runtime complexity

During training and testing, you don’t really make any computations while training. You only do computations when testing a point, which is $O(n\log n$) complexity.

For each novel query instance at test time:

- **Distance Computations:** $O(ND)$ arithmetic operations against all $N$ data points.
    
- **Neighbor Sorting:** $O(N \log N)$ to rank distances and extract the top $k$.
    
- **Space Complexity:** $O(ND)$ memory to keep the complete training dataset loaded in RAM.

#### Code

In order to get the best performance of our model, we need to find out which value of k works best for the dataset. To fit a hyperparameter like k, we need to tune it on a validation set. 


![](https://i.imgur.com/yOUJ9Dz.jpeg)
The best way to do that is via KFOLD.

**Code**

1. Import

   ```python
   from sklearn.neighbors import KNeighborsClassifier as KNN
   from sklearn.preprocessing import StandardScaler as SS
   ```

2. Create model

   ```python
   knn = KNN(n_neighbors=5)
   ```

3. Fit model

   ```python
   knn.fit(X, y)
   ```

**KNN() kwargs**

- `n_neighbors=` : the number of neighbors to set for the algorithm.
- `weights=` : changes the distance metric. Default is `'uniform'`, where all points are weighted equally 

**Methods**

- `knn.predict_proba(X)` : returns a soft classification for the features, giving probabilities for each class
- `knn.predict(X)` : returns hard classification and classifies the observations to labels.
- `knn.score(X, y)`: returns the accuracy of the model on the data

**actual code**




```py
from sklearn.neighbors import KNeighborsClassifier as KNN
from sklearn.preprocessing import StandardScaler as SS
from sklearn.datasets import make_moons, make_blobs as mb, load_breast_cancer as lbc, load_iris as li
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split as tts

def knn_kfold(X, y, k):    
    neighbor_range = np.array(range(2,k))
    train=[]
    test=[]
    
    # run through k nearest neighbord k times, doing k fold
    for n_neighbors in neighbor_range:
        knn = KNN(n_neighbors=n_neighbors)
        tr, te = do_Kfold(knn, X, y, k, scaler=SS())
        train.append(np.mean(tr))
        test.append(np.mean(te))

    # plot error against k
    plt.figure(figsize=(6,6))
    plt.plot(neighbor_range, train, ':xk', label='Training')
    plt.plot(neighbor_range, test, ':xr', label='Testing')
    plt.ylabel('Mean accuracy', fontsize=14)
    plt.xlabel('$k$',fontsize=14)
    plt.xticks(neighbor_range)
    plt.legend()
    plt.show()
```

### KNN for regression and clustering

KNN is a non-parametric model, meaning that we don't really start off with a model equation like linear regression or a neural network we try to fit to per se, but rather we just let the algorithm do the work. 

The main idea of the regression algorithm is this: for any new data point we will predict its target to be the average value of its k nearest neighbors and k is a hyperparameter we set for how many neighbors to check. 

Over time this nudges data points even closer together and over thousands of iterations this eventually forms clusters, which helps you find categories and groupings via unsupervised learning. 



### Curse of dimensionality for KNN

K Nearest neighbors especially suffers whenever points in a space are roughly the same distance from each other, and in higher dimensionality, points are so dispersed from each other that they are approximately the same distance from each other due to the **curse of dimensionality**, so distance metrics become useless and unrepresentative.

As dimension $d$ grows, the volume of the feature space increases exponentially, causing data points to become extremely sparse.

**Intrinsic dimensionality** refers to the minimum number of parameters required to capture the essential characteristics of some data.

> [!NOTE]
> K nearest neighbors works well on data with low intrinsic dimensionality like images.

    
- **the problem**: In very high-dimensional spaces, distances between all pairs of points become roughly equidistant, eroding the predictive utility of proximity.
    
- **Saving Grace:** Datasets like images often reside on or near a lower-dimensional manifold (a low _intrinsic dimension_), preserving meaningful neighborhood structures despite high raw dimensionality.

> [!NOTE]
> TLDR
> ***
> Due to how the curse of dimensionality makes data points in higher dimensions more equidistant, a distance-based algo like KNN suffers as a result. As number of features $n$ increases, k nearest neighbors becomes an increasingly worse algorithm



