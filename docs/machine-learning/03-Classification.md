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

## Decision trees

## Ensemble methods

### Random forest

### XGBoost

### Adaboost

