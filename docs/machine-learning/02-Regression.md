## Linear regression theory

### Model

For linear regression, the hypothesis will be a linear equation with any amount of features. This can be univariate or multivariate linear regression:

  

$$h_\beta (x) = \beta_0 + \beta_1 x $$

$$ h_\beta (x) = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + ... $$

  

The goal in linear regression is to minimize the squared error consisting of all the data points:

  

$$C = \sum (\hat{y} - y)^2$$

### Loss functions

We have several choices of loss functions for linear regression:


![](https://i.imgur.com/jiv89SK.jpeg)

## Univariate linear regression

### Evaluating the model

#### Coefficient of determination

We need some way to evaluate how well our model does and you can do that either with loss or something in statistics called the **coefficient of determination**, which only works in two-dimensional data (features X and output y).

- **coefficient of determination**: denoted via $R^2$, and has bounds $(-\infty, 1]$.
	- **use case**: used as a measure of correlation strength between two variables
- **correlation coefficient**: denoted by $r$, which is just the square root of the coefficient of determination, and has bounds $[0, 1]$.
	- **use case**: used as a measure of correlation strength



  

$$r = \sqrt{R^2}$$

  

> [!NOTE]
> The null model is just predicting the mean, which means that the null model has an $R^2$ value = 0

#### Null model

In linear regression, the **Null Model** is the simplest possible baseline. It assumes that the features ($x$) have no predictive power, so it simply predicts the **mean** ($\mu$) of the target variable ($y$) for every observation.

- **Equation:** $\hat{y} = \bar{y}$
- **Purpose:** It serves as a benchmark. If your regression model isn't better than the null model, your features are not useful.

The null model will just predict that every point is equal to the mean, giving a straight line. Then from there, we can get the coefficient R^2, which is the coefficient of determination.

  

$$R^2 = 1 - \frac{\mathrm{Sum \ of \  actual \ squared \  errors}}{\mathrm{Sum\  of\  squared\  errors\  using \ \ null\  model}}$$

  

You can also think of it like this:

  

$$R^2 = 1 - \frac{\sum (\hat y - y)^2}{\sum (\hat y - \mu)^2}$$
## Logistic Regression

### Binary cross-entropy loss


![](https://i.imgur.com/O74mGNT.jpeg)


