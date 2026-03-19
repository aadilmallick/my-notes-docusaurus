## N-gram

### Intro

- **unigrams**: When n=1.
- **bigrams**: When n=2
- **trigrams**: When n=3.
- **context window**: The $n-1$ words that serve as preceding context in an n-gram model.

![](https://i.imgur.com/EXAzKYO.jpeg)

### Limitations

- **bad at generalization**: a small context window and repetitive nature makes it a fundamental weakness for NLP

Because of these limitations, transformers are much better for predicting the next word, since a transformer trains enough to understand grammar rules and context.