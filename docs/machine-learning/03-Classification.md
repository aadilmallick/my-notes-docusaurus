## Classification theory

### Confusion matrix and common metrics


If data is unbalanced, we need recall and precision to truly evaluate a model's performance. 

- **Accuracy**: True positives / (total classified)
- **recall** : $\frac{TP}{TP + FN}$. Recall asks the question, "what percentage of the positive cases does the model correctly predict as positive?"
- **precision** $\frac{TP}{TP + FP}$. Precision asks the question, "when we predict a case as positive, how often is it correct?"
- **F1 score** : the harmonic mean of precision and recall, used to join both into a single universal scoring metric. F1 score will be 0 if either precision or recall equals 0, so this metric tries to strike a good balance between precision and recal

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

## Ensemble methods

### Random forest

### XGBoost

### Adaboost

