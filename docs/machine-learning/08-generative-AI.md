## Intro generative AI

### Self-supervised learning

Self-supervised learning is a technique used by AI systems to learn from large amounts of unlabeled or unstructured data. 

 Since most data doesn't come with labels, the AI makes educated guesses—called **pseudo labels**—about what the data might represent, and uses that for classification tasks.


Here's how it works:

1. We use unsupervised clustering techniques to group the unstructured data into clusters
2. The system creates **psuedo-labels** for the clustered data via supervised learning.
3. It then uses these guesses to teach itself.

## VAE

### Intro

#### What are autoencoders?

- **autoencoder**: encodes the essential pattern of same data using unsupervised and supervised learning
- **encoding**: finding the essential pattern behind data
- **variational autoencoder**: adds probabilistic random variation to the encoded essence pattern that an autoencoder encodes from data.

An autoencoder in image processing is an AI system that learns to improve images by capturing the essential features of many similar images. 

It encodes the 'essence' of an image—like the shape of a tree or a vase—into a simplified form, then decodes this to enhance new images by removing noise or imperfections. 

- For example, it can sharpen or colorize old photos by separating the main subject from unwanted noise. 
- The most common type, the variational autoencoder, groups similar image features and detects anomalies to create clearer, improved images.

> [!NOTE]
> Autoencoders supervised or unsupervised learning and is powerful for enhancing existing digital images without needing the flexibility of more complex AI models.

## GANs

### Intro

#### What is a GAN

A GAN (generative adversarial network) creates photorealistic images from a base image, where the goal is generate an image so good that it fools a **discriminator** AI, and repeating that thousands of times.

- **generator**: deep learning model that creates the image
- **discriminator**: deep learning model that classifies the image as fake or real, then gives the generator feedback.


![](https://i.imgur.com/iyBlMNi.jpeg)

**limitations**

The main limitation of GAN models is that the discriminator limits whatever the generator can create because the discriminator can only effectively discriminate against images and image types that it was trained on (for example, a human portrait). 

The generator can only generate photos of the same type that the discriminator was trained on, otherwise the discriminator will not be an accurate judge.


## LLMs

### State of LLMs today

#### Supervised fine-tuning and RLHF

In order to get LLMs to follow instructions, OpenAI released a paper that showed that adding supervised learning and RLHF allows LLMs to achieve better results when following instructions.

1. **supervised fine-tuning**: human labeler creates sample response from sample prompt, and then that question-answer pair is used to finetune the LLM


![](https://i.imgur.com/wQ2M3YS.jpeg)


2. **RHLF**: let the model generate multiple different outputs from a single prompt, human labeler grades the responses, picks the best one, and those results go back into training a reinforcement learning model called a **reward model**


![](https://i.imgur.com/6sCuvp4.jpeg)


3. **reinforcement learning**: use reinforcement learning to update the model with the reward


![](https://i.imgur.com/blomlGL.jpeg)



**RHLF**

Reinforcement learning from human feedback (RLHF) is a training method used to make large language models better at following instructions and producing helpful, safe outputs. Here's how it works:  
  

1. After initial fine-tuning, the model generates multiple responses to a task.
2. Human labelers rank these responses based on quality, safety, and how well they follow instructions.
3. A reward model is trained to predict these human preferences.
4. The original model is then optimized using reinforcement learning, guided by this reward model, to produce outputs that get higher human approval.

#### LLM scaling laws

Scaling laws in language models describe how their performance improves when you increase three key factors together: 

1. **model size** (number of parameters)
2. **amount of training data** (dataset size)
3. **amount of compute** used for training.

When you increase of all of these properties, test loss decreases, just making LLM performance better as long as you scale up.


![](https://i.imgur.com/b2F7AK3.jpeg)


> [!NOTE]
> Due to OpenAI's research, they concluded that shoving compute towards making the model larger gives you the best return on investment for your compute and is what will contribute the most to better model performance. 

#### LLM types

##### BERT

BERT, which stands for bi-directional encoder representations from transformers, is a large language model developed by Google

It's based on the transformer architecture, and is an **encoder-only** model, and is designed to understand language deeply rather than generate text. 

- **primary use case**: Google uses BERT in its search engine to better understand the meaning behind queries, allowing for more accurate and relevant search results. 

Unlike models like GPT that generate text, BERT focuses on language understanding through tasks like predicting missing words and determining if one sentence logically follows another.

here are the tasks BERT was trained on:

- **MLM (masked language model)**: requires BERT to predict a masked out word, with the end goal being to have BERT master context and text completion.
- **NSP (next sentence prediction)**: asks "does the second sentence follow immediately after the first", with the end goal being to get BERT to understand the logical flow of sentences in sequence


![](https://i.imgur.com/y3jJXkG.jpeg)

##### GPT-3

GPT-3 is trained on a large corpus of the english language and is a decoder-only transformer, with its main objective as trying to predict the next token given previous tokens.

> [!NOTE]
> These are also called causal or autoregressive LLMs because they look at previous tokens in order to predict the next one.

Because these are auto-regressive models, they benefit from sentence examples in the prompt that follow a pattern, as it's easier to complete tokens if there is a simple, established pattern in the previous tokens already.

> [!NOTE]
> That's why few-shot and one-shot prompts work far better than zero-shot for all LLMs.

But the biggest factor in model performance is still model size, as shown by the graph below, and then adding in examples so finding patterns is easier in the text.


![](https://i.imgur.com/x9RcMzh.jpeg)

##### CHincilla

By now, the scaling law of LLMs still worked fine and LLMs became larger and larger, but not that much better.

Google Deep Mind's hypothesis was that large language models are significantly undertrained. You could get much better performance with the same computational budget by training a smaller model for longer. 

Chincilla was a 70B parameter trained on 1.4 trillion training tokens, and it proved Deepmind's hypothesis correct because it outperformed GPT-3.

Deepmind's conclusion from building Chinchilla was the following:

> As compute scales up you should invest equal amounts in both increasing the model size and getting more training data and training for longer on more tokens. 


> [!NOTE]
> Basically, more training data is also very important in improving model performance because LLMs are severely undertrained for their size.

##### PaLM

PaLM has 540B params, and discovered that the bigger the size of your model, it starts to unlock capabilities other smaller models don't have, like code generation and joke understanding.

##### GPT4

- **GPT3.5**: follows instructions better with supervised fine-tuning and RLHF
- **ChatGPT**: finetuned from GPT3.5 for dialogue purposes.

GPT-4 achieves human-level performance on many college exams and is multimodal.
## Diffusion models


## Foundation models

### Intro

#### What are foundation models?

- **data models**: fine-tuned for a specific task, like cat vs dog classification
- **foundation models**: foundation models are powerful and flexible, capable of performing a wide range of tasks without needing retraining on new data.

 Foundation models are built using self-supervised learning, which allows them to process vast amounts of unlabeled data and create pseudo labels, giving them a broad understanding of many topics. 
 
 This makes foundation models essential for generative AI systems, whereas traditional data models cannot be used for generative AI.

