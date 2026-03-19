## N-gram

### Problem statement

We want to design a autocorrect functionality, which requires knowing the probabilities of certain combinations of words.

Consider these phrases: “Table Mountain is beautiful,” “Table Mountain is huge.” They are familiar and make sense, but “Table Mountain is pangolin” and “Table Mountain is midnight” seem completely wrong. You may have heard the first phrases but never the others. 

This suggests that there is a natural way to determine these probabilities: analyze collections of text and observe how words are actually used. The foundational principle for this approach was articulated decades ago by the British linguist John Rupert Firth, who famously stated, "you shall know a word by the company it keeps"

### Intro

An n-gram is a sequence of **_n_ words** that appear together in text. By counting how often different n-grams occur in large amounts of text, you can build a simple yet effective way to capture patterns of language.

N-grams works by statistically analyzing the co-occurence of words. 

For example, if a model sees "jollof rice" hundreds of time in a dataset, then $P(rice | jollof)$, which is the probability of the word "rice" immediately following given "jollof" is present, will be very high.

If you want the probability of word B following context A, you just count how often you see A and B together, and divide that by how often you see context A all by itself, which is the formula for conditional probability:

$$P(B | A) = \frac{P(A \cap B)}{P(A)}$$

When it comes to n-grams, the probability of a word is just the number of times it appears in the dataset divided by the number of words in the dataset. Here's an example:

$$P(\text{rice} \mid \text{jollof}) = \frac{\text{Count}(\text{jollof rice})}{\text{Count}(\text{jollof})}
$$


> [!NOTE]
> **Some intuition**
> ***
>  So if you're trying to predict what comes after New York, and your data shows New York City appears 300 times, but New York appears once, then the model will predict city with extremely high confidence.



![](https://i.imgur.com/lOUfPgr.jpeg)


- **unigrams**: When n=1.
- **bigrams**: When n=2
- **trigrams**: When n=3.
- **context window**: The $n-1$ words that serve as preceding context in an n-gram model.

![](https://i.imgur.com/EXAzKYO.jpeg)

![](https://storage.googleapis.com/cloud-training/cls-html5-courses/GDM/BuildYourOwnSmallLanguageModel/course/en/assets/680caf78f936a2caa531d6f3/original.svg)

### Limitations

- **small context window**: a small context window and repetitive nature makes it a fundamental weakness for NLP
- **data sparsity**: as $n$ increases, the possible combinations of n-grams increases and the probability of a certain 4 or 5-word combination appearing will be near zero for almost all combinations, leading to the model being useless.
- **bad at generalization**: So if you're trying to predict what comes after New York, and your data shows New York City appears 300 times, but New York appears once. Then the model will predict city with extremely high confidence.

Because of these limitations, transformers are much better for predicting the next word, since a transformer trains enough to understand grammar rules and context.


## Tokenization

A tokenizer is a way to split up text into groups of words or tokens.

### Simple tokenizers

- **space tokenizers**: splits text into individual words by splitting on space characters.