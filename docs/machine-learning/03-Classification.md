## Classification theory

### Confusion matrix and common metrics


If data is unbalanced, we need recall and precision to truly evaluate a model's performance. 

- **Accuracy**: True positives / (total classified)
- **recall** : $\frac{TP}{TP + FN}$. Recall asks the question, "what percentage of the positive cases does the model correctly predict as positive?"
- **precision** $\frac{TP}{TP + FP}$. Precision asks the question, "when we predict a case as positive, how often is it correct?"
- **F1 score** : the harmonic mean of precision and recall, used to join both into a single universal scoring metric. 
	- Purpose: F1 score will be 0 if either precision or recall equals 0, so this metric tries to strike a good balance between precision and recall

> [!NOTE]
> **Precision and recall problems**
> ***
> When doing precision and recall matrix problems, remember these two facts: 
> 
> - **Precision** is vertical and asks: When we predicted something as belonging to class A, what was the percentage that actually belonged to class A?
> - **Recall** is horizontal and asks: For all values that actually belongs to class A, what was the percentage we correctly predicted as class A?

#### The tradeoff between recall and precision

A trade-off between recall and precision will always exist because there is always a trade-off between false positives and false negatives. 


#### ROC curve

The ROC (receiver operating characteristic) curve is just plotting the true positive rate vs the false positive rate. 

We call the area under the ROC curve as AUC (area under the curve).

- The closer the AUC is to 1, the better the model performs.


![](https://i.imgur.com/m68hpJn.jpeg)


## SVM

### Problem formulation and intuition

SVM (support vector machine) was designed as a model to create **decision boundaries** between different classes of data, making its primary purpose as classification.

A **decision boundary** is a mathematical equation that segments data points into one of two classes depending on which side of the equation they graphically fall within:

For SVM, the decision boundary degree (linear vs polynomial vs nonlinear) depends on whether you're doing binary classification or multi-class classification and how complex you foresee the decision boundary being.

Although SVM is the one who learns the decision boundary, you as the ML engineer have to decide the nature of the decision boundary (linear or nonlinear) based on the data you're trying to fit to.

There are two types of decision boundaries you can do with SVM:

- **linear decision boundary**: a simple case where the decision boundary is a line. Works well for binary classification.

![](https://i.imgur.com/CCNVhfl.jpeg)

- **nonlinear decision boundary**: when dealing with high-dimensional data, the decision boundary is called a **hyperplane**


![](https://i.imgur.com/VTT3j4j.jpeg)


Instead of just finding _any_ line that separates the data, the SVM seeks the boundary that maximizes the **margin**—the distance between the boundary and the closest data points from each class. This approach helps the model generalize better to new, unseen data and makes it less sensitive to noise or outliers

The SVM chooses its decision boundary by trying to find the smallest margin possible between **support vectors**, which are the data points that sit right on the edge of the margin. 

- They are used to calculate the margin and classification of new data points.
- These are the critical data points that "support" or define the position and orientation of the decision boundary. 

> [!NOTE]
> Because only these points are necessary to determine the boundary, the algorithm is often very memory-efficient, even in higher dimensions

#### Linear case

two data points in different classes, denotes these chosen data points as **support vectors**, then puts a linear decision boundary line smack dab in the middle of that margin.

- **support vectors**: the data points that sit right on the edge of the margin. They are used to calculate the margin and classification of new data points.



![](https://i.imgur.com/jvIkIWf.jpeg)

#### Nonlinear case

SVM works well even in high dimensions to create effective hyperplane decision boundaries due to the **kernel trick**.

One of the most powerful features of SVMs is the use of **kernel functions**, which allow the algorithm to handle **non-linear data**.


![](https://i.imgur.com/1feiBhj.jpeg)


By using the "kernel trick," the SVM can implicitly map original features into a higher-dimensional space where it becomes possible to deal with a nonlinear decision boundary as if it were a linear decision boundary.

Common kernels include:

- **Linear Kernel:** Used when data is linearly separable.
- **Polynomial, RBF (Radial Basis Function), and Sigmoid Kernels:** These allow the algorithm to create highly complex, non-linear decision boundaries to fit more intricate data distributions

Mathematically, the SVM aims to **maximize the margin** between the two classes. It looks for a hyperplane that provides the widest separation between the support vectors of class A and class B.
## Decision trees

Decision Trees work by repeatedly splitting the data into subsets based on feature values. The goal is to reach "pure" nodes—subsets where all observations belong to the same class.

> [!NOTE]
> Think of decision trees as a giant series of nested if/else branches, until you reach a base case which is a single homogenous bucket, like "rhino", or "cheetah"



![](https://i.imgur.com/V8lgSv7.jpeg)



*   **Pros:** Highly interpretable (you can visualize the logic), requires no feature scaling, handles both numerical and categorical data well.

*   **Cons:** Very sensitive to small changes in data (high variance), prone to overfitting if not constrained.

*   **Best Use:** When you need a "white-box" model where the decision logic must be explainable to stakeholders.

#### ML algo properties

**pros**

- **no need for scaling**: doesn't require feature scaling, since scale doesn't matter for learning the algorithm.

**cons**


- **may leave out features/information**: You may not use all the features, since we try to minimize gini impurity, not necessarily use all features

- **root node has bias**: the root node of a decision tree influences a lot of its decision-making and performance, so the choice or root node affects the algorithm very differently.

### Components

Decision trees are made up of nodes and at each node you pick a feature and a certain value to partition on. 

In the example below, the root node is `age` and we partition on the buckets of 18, 18-30, and 30, creating three buckets. 


![](https://i.imgur.com/tQyRdAZ.jpeg)


- **root node**: the first feature-value pair to partition on
- **decision node**: individual nodes that are feature-value pairs to partition on
- **leaf node**: a bucket with pure values (all members of the lead node are of the same class), and they don't have any children.

### Gini impurity

**Gini Impurity** is the standard metric used to decide where to split. 

**Gini Impurity** measures how "pure" a node is, or in other words, the probability of a randomly chosen element being incorrectly labeled if it were randomly labeled according to the distribution of labels in that node.

Mathematically, for a set of data with $C$ classes, the Gini Impurity ($G$) is calculated as, where $p_i$ is the probability (or fraction) of items belonging to class in that specific node.

$$G = 1 - \sum_{i=1}^{C} p_i^2$$

Here are what the different values of $G$ mean:

- **$G = 0$:** Perfectly pure (all one class).
- **Higher $G$:** More mixed/impure, occurs when classes are evenly distributed, leading to a higher Gini value.


![](https://i.imgur.com/2SOtjwY.jpeg)


When building the tree, the algorithm tests different possible splits on the data. 

2. For each potential split, it calculates the **weighted average Gini Impurity** of the resulting child nodes. 
3. It then selects the split that results in the **highest reduction in impurity** (or the lowest resulting impurity). 
4. By repeatedly applying this logic, the tree grows until it reaches a stopping condition (such as a maximum depth), effectively isolating classes into increasingly pure segments
### Hyperparameters

Decision trees are prone to **overfitting** (growing too deep and memorizing noise). We use hyperparameters to "prune" or constrain the tree:

1.  **`max_depth`**: The maximum number of levels. Shorter trees are simpler and less likely to overfit.

2.  **`min_samples_split`**: The minimum number of samples a node must have before it can be split. High values prevent the tree from creating branches based on very few data points.

3.  **`min_samples_leaf`**: The minimum number of samples allowed in a leaf node. This ensures that every prediction is based on a meaningful number of observations.

4.  **`criterion`**: Usually `'gini'` or `'entropy'`. Both measure impurity, but Gini is slightly faster to compute.
## Ensemble methods

Ensemble models are composed of multiple individual models, and they can different combinations of models. You then combine the results from all the models in some way to get one final result.

Instead of relying on a single estimator, these methods aggregate the predictions of several individual models to produce a more robust result.


> [!NOTE]
> An example of an ensemble model is having one model as K nearest neighbors with one model as Logistic Regression, etc.

### Ensemble techniques

#### Bagging and bootstrapping

**Bagging** (Bootstrap Aggregating) is a specific type of ensemble method designed to reduce variance and prevent overfitting:

1. **Bootstrapping:** The process begins by creating multiple subsets of the original training data. This is done through sampling with replacement, meaning the same data point can appear multiple times in a single subset 
2. **Aggregating:** A separate model (often a decision tree) is trained on each of these bootstrap samples. Finally, these models are combined—usually by taking a majority vote for classification tasks or an average for regression—to arrive at the final prediction.



![](https://i.imgur.com/Q31J3WR.jpeg)

### Random forest

Random forests are ensemble models made up of only multiple decision trees. 

Here is the main improvement of a random forest over basic decision trees:

>At each split we take a subset of the features and consider it as the feature to be split on. This way, a decision tree is forced to use every feature and prevents overfitting.

Random forests can be used for both classification and regression.

- **Classification**: We make multiple decision trees, hence the "forest" term, and tally up the votes from each resulting classification.
- **Regression**: When doing regression, we average the outputs from all trees to get a predicted value back.

Here are the other properties of random forests:
  
- **Hyperparameter standardization**: All trees use the exact same hyperparameters
- **Bootstrapping**: Random forests use **bootstrapping** (random sampling with replacement) to change the training data passed to each tree. We do this instead of just having smaller unique data for each tree because more training data is good.

> [!NOTE]
> Bootstrapping is what puts the "random" in "random forest", and forces decision trees to factor all features, leading to better performance and avoiding the overfitting pitfall of decision trees.

#### Hyperparameters

- **Number of estimators** : how many decision trees will be in the forest
  - As random forests is a fast algorithm, you can use a lot of estimators as they will never overfit and suffer from bad performance.
  - 64 - 128 trees is a good choice to make.
  - To find the optimal number of estimators, run an elbow plot against error.
- **Number of features** : How many features will we include in the subset of features?
  - A good number to select out of $N$ features is $\sqrt{N}$
- **Bootstrap samples**: Bootstrapping means random sampling with replacement (allows duplicate observations). If we bootstrap samples, it means for each tree we randomly assign observations/rows with replacement instead of giving all the data.  
  - This is a boolean, by default true.
  - Turning bootstrapping samples on reduces overfitting as the trees train on different data.
  - If bootstrapping is turned on, certain rows of data are not used for training certain trees because that's the nature of random sampling with replacement.
- **Out of bag error**: An error metric unique to random forests. When bootstrapping is turned on, we test trees on the observations that each tree was not trained on to get back an error metric for each tree and average that overall to get out of bag error.
  - By default, out of bag error is turned off.

**Hyperparameter optimization with elbow plot**

You can plot each feature against the number of misclassifications to choose an optimal hyperparameter, not necessarily the best scoring one.

For example, plot the number of estimators `n_estimators=` against the number of misclassifications you make when predicting the test data. Choose a value that levels off.

#### Classification strategy

For random forests, we have the choice between hard classification and soft classification for random forest ensemble models to implement **random voting**.

- **Soft classification**: Add up the individual probabilities for each class, and then average that to get an average probability for each class.
- **Hard classification**: For each outcome, adds a vote for the class who had the highest probability. THe class with the most total votes wins it all.

> [!NOTE]
> Scikit-learn uses soft classification



![](https://i.imgur.com/4G01wQQ.jpeg)


```py
probs = np.array(
    [[0.36, 0.49, 0.15],
    [0.44, 0.41, 0.15],
    [0.39, 0.31, 0.30]]
)

def hard_classification(probs):
    num_classes = probs.shape[1]
    votes = [0 for i in range(num_classes)]
    decisions = np.argmax(probs, axis=1)

    for class_ in decisions: 
        votes[class_] += 1

    print(f"predicted class: {np.argmax(votes)+1}")
    return np.array(votes)

def soft_classification(probs): 
    sums = []
    for outcome in range(probs.shape[1]): 
        sums.append(np.sum(probs[:, outcome]))
    averages = np.array([x / probs.shape[1] for x in sums])
    print(f"predicted class: {np.argmax(averages)+1}")
    return averages
```
  

### Boosting

Boosting is the idea of taking many weak machine learning model hypothesis, training each of them in sequence, multiplying each of them by some weight, and then summing them all up to become a strong ensemble model.

Here are the core properties of boosting:

- **training in sequence**: models are trained in sequence, and learn from the mistakes (cost) of the previous model in the pipeline. Each sequential model tries to fix the errors of the previous model in the sequence
- **weighted influence**: each model gets a weight coefficient to determine its influence percentage in voting. Stronger models get more influence, weaker models get less influence.


![](https://i.imgur.com/yqOELr8.jpeg)



![](https://i.imgur.com/O6wxNj6.jpeg)


> [!NOTE]
> Boosting works especially well for decision trees

Boosting often yields better performance than random forests, but has two key disadvantages compared to random forests:

1. **prone to overfitting**: yields a stronger model than random forests because it overfits to training data and previous models.
2. **slow to train**: random forests train in parallel via bagging, while boosting algorithms train in sequence, which takes much longer.



![](https://i.imgur.com/kSmw9cH.jpeg)

#### XGBoost

#### Adaboost

