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

## Diffusion models


## Foundation models

### Intro

#### What are foundation models?

- **data models**: fine-tuned for a specific task, like cat vs dog classification
- **foundation models**: foundation models are powerful and flexible, capable of performing a wide range of tasks without needing retraining on new data.

 Foundation models are built using self-supervised learning, which allows them to process vast amounts of unlabeled data and create pseudo labels, giving them a broad understanding of many topics. 
 
 This makes foundation models essential for generative AI systems, whereas traditional data models cannot be used for generative AI.

