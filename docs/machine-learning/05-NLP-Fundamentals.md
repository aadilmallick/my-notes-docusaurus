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
	- Even for $n=2$, about 99.95% of bigrams have a probability of 0, meaning they don't appear even once even in a dataset of 26,000,000 bigram possibilities.
	- For any context A, the probability $𝑃(B∣A)$ will be 0 for most tokens B.

Because of these limitations, transformers are much better for predicting the next word, since a transformer trains enough to understand grammar rules and context.

### Building an N-gram model

To build an n-gram language model, you need to determine the counts of all n-grams and (n-1)-grams so you can find all the conditional probabilities.

1. Determine value of $n$.
2. Tokenize text into n-grams
3. Create a dictionary where the keys are the context, which have a length of $n-1$ tokens, and the values are a frequency dictionary of the next token.
4. Loop through the dictionary, and for each context key, calculate the probability of the n-gram for a certain next token by dividing the count of the next token over the total of the frequency dictionary. Repeat for all possible next tokens based on the context (frequency of next token is greater than 0).

>For example, if the dataset consists of the two sentences "Table Mountain is tall." and "Table Mountain is beautiful." then the function called with `n = 3` should return:
>
>```
>{
>   "Table Mountain": Counter({"is": 2}),
>   "Mountain is": Counter({"tall": 1, "beautiful": 1})   
>}
>```


```python
# space tokenizer
def space_tokenize(text: str) -> list[str]:
    """
    space tokenizer, splits text on a space
    """
    tokens = text.split(" ")
    return tokens

# generate n grams
def generate_ngrams(text: str, n: int) -> list[tuple[str]]:
    """Generates n-grams from a given text.

    Args:
        text: The input text string.
        n: The size of the n-grams (e.g., 2 for bigrams, 3 for trigrams).

    Returns:
        A list of n-grams, each represented as a list of tokens.
    """

    # Tokenize text.
    tokens = space_tokenize(text)

    # Construct the list of n-grams.
    ngrams = []

    # Add your code here.
    for i in range(len(tokens) - n + 1):
      ngrams.append(tuple(tokens[i:i+n]))

    return ngrams

# generates dictionary of context -> next token
def get_ngram_counts(dataset: list[str], n: int) -> dict[str, Counter]:
    """Computes the n-gram counts from a dataset.

    This function takes a list of text strings (paragraphs or sentences) as
    input, constructs n-grams from each text, and creates a dictionary where:

    * Keys represent n-1 token long contexts `context`.
    * Values are a Counter object `counts` such that `counts[next_token]` is the
      count of `next_token` following `context`.

    Args:
        dataset: The list of text strings in the dataset.
        n: The size of the n-grams to generate (e.g., 2 for bigrams, 3 for
            trigrams).

    Returns:
        A dictionary where keys are (n-1)-token contexts and values are Counter
        objects storing the counts of each next token for that context.

    """

    # Define the dictionary as a defaultdict that is automatically initialized
    # with an empty Counter object. This allows you to access and set the value
    # of ngram_counts[context][next_token] without initializing
    # ngram_counts[context] or ngram_counts[context][next_token] first.
    # Reference
    # https://docs.python.org/3/library/collections.html#collections.Counter and
    # https://docs.python.org/3/library/collections.html#collections.defaultdict
    # for more information on how to use defaultdict and Counter types.
    ngram_counts = defaultdict(Counter)

    for paragraph in dataset:
        # Add your code here.
        n_grams = generate_ngrams(paragraph, n)
        for ngram in n_grams:
          context = " ".join(ngram[:-1])
          next_token = ngram[-1]
          ngram_counts[context][next_token] += 1

    return dict(ngram_counts)

def build_ngram_model(
    dataset: list[str],
    n: int
) -> dict[str, dict[str, float]]:
    """Builds an n-gram language model.

    This function takes a list of text strings (paragraphs or sentences) as
    input, generates n-grams from each text using the function get_ngram_counts
    and converts them into probabilities.  The resulting model is a dictionary,
    where keys are (n-1)-token contexts and values are dictionaries mapping
    possible next tokens to their conditional probabilities given the context.

    Args:
        dataset: A list of text strings representing the dataset.
        n: The size of the n-grams (e.g., 2 for a bigram model).

    Returns:
        A dictionary representing the n-gram language model, where keys are
        (n-1)-tokens contexts and values are dictionaries mapping possible next
        tokens to their conditional probabilities.
    """

    # A dictionary to store P(B | A).
    # ngram_model[context][token] should store P(token | context).
    ngram_model = {}

    # Use the ngram_counts as computed by the get_ngram_counts function.
    ngram_counts = get_ngram_counts(dataset, n)

    # Loop through the possible contexts. `context` is a string
    # and `next_tokens` is a dictionary mapping possible next tokens to their
    # counts of following `context`.
    for context, next_tokens in ngram_counts.items():

        # Compute Count(A) and P(B | A) here.
        # Add your code here.
        ngram_model[context] = {}
        for token, count in next_tokens.items():
          ngram_model[context][token] = count / next_tokens.total()

    return ngram_model
```

### Next-word prediction


> [!WARNING] 
> While it intuitively seems that a larger context (greater 𝑛) would lead to better quality output by capturing more long-range dependencies in language, it quickly runs into the problem of data sparsity since most n-grams will never be observed in the dataset.




## Tokenization

A tokenizer is a way to split up text into groups of tokens.

### Simple tokenizers

- **space tokenizers**: splits text into individual words by splitting on space characters.