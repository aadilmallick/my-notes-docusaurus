## Multivariate linear regression

### Model

For linear regression, the hypothesis will be a linear equation with any amount of features. This can be univariate or multivariate linear regression:

  

$$h_\beta (x) = \beta_0 + \beta_1 x $$

$$ h_\beta (x) = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + ... $$

  

The goal in linear regression is to minimize the squared error consisting of all the data points:

  

$$C = \sum (\hat{y} - y)^2$$

We have several choices of loss functions for linear regression:


![](https://i.imgur.com/jiv89SK.jpeg)



## Logistic Regression

### Problem and intuition

### Model

Logistic regression is used for classification tasks, but like regression, it also outputs a single number.

The hypothesis uses the sigmoid function to make sure all probability outputs are between 0 and 1.

$$h_{\beta}(\vec x) = \sigma (\vec \beta \cdot \vec x) = \frac{1}{1 + e^{-\vec \beta \cdot \vec x}}$$

Logistic Regression predicts probabilities. To ensure the output is always between 0 and 1, it wraps a linear equation inside the **Sigmoid (or Logistic) function**:

$$P(y=1) = \frac{1}{1 + e^{-z}}$$

Where $z = \beta_0 + \beta_1 x_1 + ... + \beta_n x_n$.


#### What are Odds and Log Odds?

While we interpret the output as a probability ($p$), the model itself is essentially a linear model for the **Log Odds** (also called the **Logit**).

  

1.  **Probability ($p$):** The chance of an event occurring (e.g., 0.8 or 80%).

2.  **Odds:** The ratio of the probability of success to the probability of failure.

    $$\text{Odds} = \frac{p}{1-p}$$

    *Example:* If $p=0.8$, then Odds = $0.8 / 0.2 = 4$ (meaning it is 4 times more likely to happen than not).

3.  **Log Odds:** The natural logarithm of the odds.

    $$\text{Log Odds} = \ln\left(\frac{p}{1-p}\right)$$

    The Logistic Regression model assumes that this Log Odds value is a linear combination of your input features.

```py
import numpy as np

# Let's see how Probabilities map to Log Odds
probabilities = np.array([0.1, 0.3, 0.5, 0.7, 0.9])

def calculate_log_odds(p):
    odds = p / (1 - p)
    log_odds = np.log(odds)
    return odds, log_odds

print(f"{'Prob':<10} | {'Odds':<10} | {'Log Odds':<10}")
print("-" * 35)
for p in probabilities:
    o, lo = calculate_log_odds(p)
    print(f"{p:<10.2f} | {o:<10.2f} | {lo:<10.2f}")
```

#### Binary cross-entropy loss


![](https://i.imgur.com/O74mGNT.jpeg)


### Logistic regression with regularization

Logistic regression uses L2 regularization, the hyperparameter $C$ controls that behavior, acting as the penalty for regularization.

## **Multi-class logistic regression**


There are two methods for multiclass logistic regression.

- **One vs rest**: We do repeated loops of treating one class as the positive class, and lumping all other classes together as the negative class.

- **Multinomial**: We do a softmax classification where all the classes have their own probability, and all together they sum to 1. This is the default for scikit-learn