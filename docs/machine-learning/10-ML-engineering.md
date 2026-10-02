## ML engineering practices

### Classification data imbalance

In security and guardrail systems, it is standard practice to define the **minority class of interest** as Positive.

For example, for a 95% rate of in-scope queries and 5% rate out-of-scope queries:

- 🛡️ **Positive ($1$):** Out-of-scope query (e.g., prompt injection, entertainment, non-work topics).
    
- 💼 **Negative ($0$):** In-scope query (e.g., HR benefits, IT tickets, facilities).

For highly-imbalanced data sets like this, accuracy is not a good metric.

> [!NOTE]
> Because the problem states that **95% of queries are in-scope and only 5% are out-of-scope**, an untrained model that blindly labels _every single query_ as "in-scope" achieves **95% accuracy** instantly! However, it catches 0% of unwanted queries, making overall accuracy completely useless here.


To optimize our model, we must weigh the two types of classification errors against their real-world consequences:

1. 🚫 **False Positive (FP):** An employee asks a valid work question (in-scope), but the model flags it as out-of-scope and blocks it.
    
    - _Business Cost:_ Employee frustration, disrupted work, reduced adoption of the AI tool.
        
2. ⚠️ **False Negative (FN):** An off-limits, entertainment, or adversarial query (out-of-scope) slips through undetected.
    
    - _Business Cost:_ LLM token waste, compliance breaches, or jailbreaks/data leakage.

let's look at the problem framing here:

- **allow false positives**: If you allow a high **False Positive Rate (FPR)**, employees asking legitimate questions get blocked, leading to frustration and abandonment of the tool.
- **allow false negatives**: If you allow a high false negative rate, out-of-scope queries are mistakenly and dangerously flagged as in-scope queries more often.

| **Metric**                    | **Formula**                                                                                                     | **What It Measures**                                                 | **Impact in Our System**                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **False Alarm Rate (FPR)** 🚨 | $\frac{\text{FP}}{\text{FP} + \text{TN}} = \frac{\text{FP}}{N}$                                                 | Proportion of safe/in-scope queries mistakenly flagged.              | Directly measures how often we frustrate legitimate users.                                  |
| **Recall / Sensitivity** 🔍   | $\frac{\text{TP}}{\text{TP} + \text{FN}} = \frac{\text{TP}}{P}$                                                 | Proportion of actual bad/out-of-scope queries caught.                | High recall means very few harmful queries slip past.                                       |
| **Precision** 🎯              | $\frac{\text{TP}}{\text{TP} + \text{FP}}$                                                                       | When the model flags a query as out-of-scope, how often is it right? | Prevents "crying wolf" and ensures blocked queries are truly out-of-scope.                  |
| **$F_\beta$ Score** ⚖️        | $(1 + \beta^2) \frac{\text{Precision} \times \text{Recall}}{(\beta^2 \times \text{Precision}) + \text{Recall}}$ | Weighted balance between Precision and Recall.                       | Tuning $\beta$ lets us prioritize either catching bad queries or minimizing user annoyance. |
