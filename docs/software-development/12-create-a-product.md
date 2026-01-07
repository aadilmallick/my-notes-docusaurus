
```embed
title: "static.frontendmasters.com"
image: ""
description: ""
url: "https://static.frontendmasters.com/assets/courses/2024-05-29-product-design/product-design-slides.pdf"
favicon: ""
```



## Validating your idea

### Three reasons why SAAS apps fail

1. **no real problem**: Your app fails to solve a meaningful problem
2. **bad marketing**: Even if your app is good, if nobody knows about it, then nobody will buy it.
3. **no differentiation**: nobody knows what differentiates you from your competitors and therefore you get lost in the sea of similar products.

### The 4 steps to create a winning SAAS

1. Do market research
2. Do audience research, create an audience profile.
3. Define your MVP
4. Run a test marketing campaign to see if people really will buy your app

## Review the market

It's crucial to understand the current market and any competitors in the same space as you, and generate ideas on how to differentiate yourself. You want to broadly define your niche:

1. Define your audience, make sure it's a small initial audience that's niche
2. Define your offering and what would differentiate it from other companies.
3. Identify market challenges, as in any challenges that would come up when you try to enter the market.
4. Establish a strategy for you to succeed in the market

> [!NOTE]
> The smaller your initial audience, the higher the probability of success. The more niche your product, the more loyal your audience and the higher your chances of success.


> [!NOTE]
> 42% of startups fail because there is no market need. Always make sure you are either 1) better than your competitors and 2) solve an actual pain point that people have.

Always start with a niche audience. Don't go for a large broad audience, but rather find a select group of people who would be passionate about what you're selling

#### Competitor research

here is how you can perform research on your competitors:

1. Find your competitors
2. Try out each of their offerings, write down what they do good and what they do bad.
3. Pay attention to their reach. How much money do they have for marketing? You might have to walk away if they have too much marketing.

Let's hone in on step 2. WHen trying out their offerings, these are the components you want to ascertain:

- **core offering**: what's the focus of their app, what's the main functionality?
- **unique features**: what unique features do they have that differentiate them form their other competitors?
- **integrations**: Do they have integrations with other platforms, like apple calendar, google calendar, or notion?
- **user experience**: Do they have good onboarding, and can people use their app without initial difficulty? The most loved apps are those with a low learning curve and a good onboarding process.
- **repeat use**: Are there some actions you repeat so often that they become annoying and cumbersome to do? 
- **accessibility**: Is their site widely available for all types of users on all types of devices, and is their site accessible?
- **market position**: A combination of audience, pricing, and value proposition:
	- **audience**: What audience are they targeting? Can you go more niche than that?
	- **pricing**: What pricing model do they have? Can you be more generous than that?
	- **value proposition**: WHat's their value proposition? Is there anything they're missing that you could capitalize on?
- **customer feedback**: WHat do customers like about the product? What do they wish was different?

#### How to beat competitors

You can often beat out competitors in either user experience, repeat use, or accessibility:

- **user experience**: You can provide a better onboarding experience, or make the app so easy to use that there's no learning curve.
- **repeat use**: If there any annoying repeat actions in the competitors' app, you can provide some bulk CRUD functionality or simply an easier, faster way to do something such that it's not an annoyance.
- **accessibility**: If you can make your app work for a wider audience in different circumstances, those people will appreciate your app for being accessible.

You can also beat out your competitors in specific "gaps" that they leave open:

- **feature gaps**: ANything your competitor is missing in features, like integrations, data ownership, and more.
- **experience gaps**: Anything your competitor lacks in user experience that you could take advantage of by providing better UX, better UI, or customer support
- **audience gap**: is there an audience niche that your competitor fails to target?

You can also beat out competitors by just doing stuff better than them:

- **faster**: Can you copy a competitors' functionality and make it faster, enabling people to do less in a shorter amount of time
- **cheaper**: can you offer a better price point than your competitors?

## Product design

### Product design philosophy

Here are three challenges product designers should think about:

1. **Repeated operations**: operations in a web app that users repeat many times can become annoying and so it's your job to figure out to remove the annoyance from those repeated operations by making them easier.
2. **maintaining procedural knowledge**: most users will have some subconscious manner in how they use websites (search bar at top right, hamburger at top left) and you don't want to break that procedural knowledge and increase the cognitive load.

Here are the core things you should do for product design:

1. **market research**: Research your competitors, what they do right, what they do wrong, and how you could differentiate yourself.
2. **making your product user centric**: Your product should have good answers to these three components:
	- **goal**: What does your web app allow people to achieve, and is it meaningful enough that it would be difficult for people to do that thing without your app?
	- **pain point**: What pain point will your product solve for its users?
	- **need**: Is there a legitimate need for the functionality your product offers?
3. **task-orientated**: Answer these three questions to define the functionality in your app and prioritize them in order of how much users care about them.
	- What tasks/functionality will a user be able to do within your app?
	- What tasks benefit users the most?
	- Which are the most-popular or frequently used tasks?

### principle 1) Simplicity

A simple product is a good product. Aim to strip out the complexity from your designs using these three tactics:

1. **delete**: If an element is inessential, see if you can delete it and no web app functionality changes. It's completely unnecessary.
2. **hide**: If an element changes/adds functionality to the web app, then hide the element with the a way to toggle showing it if the user wants more info. Think of like a floating action button.
3. **shrink**: Visually deemphasize inessential yet important elements to let user focus on more important functionality.

![](https://i.imgur.com/O4D5XuU.jpeg)

### Principle 2) usability

You want your app to be both user-friendly, intuitive, and accessible for disabled people. So answer these three questions well:

1. **intuitive**: is the web app easy to learn?
2. **user-friendly**: is it simple and easy to complete common tasks?
3. **forgiving**: is it forgiving of mistakes? Can you undo mistakes?

### Creating MVPs

#### MVP Philosophy

People churn out MVPs as working, half-baked ideas, but MVPs are supposed to be a fully-polished product with a few good features such that you can acquire customer feedback and iterate on it.


![](https://i.imgur.com/2zafr66.jpeg)

As soon as you build your MVP with the core features, immediately launch it to a small group of users to receive user feedback. Follow this advice carefully:


> [!IMPORTANT]
> Iterate on that feedback. You should not have a backlog of features to implement once you put your MVP out. The cycle should be launch MVP -> get feedback -> implement new features based on feedback -> get feedback and so on. The consumers decide which features you put out, not you.


#### Building an MVP

When building an MVP, focus on these three components and build out your features based on your answers to these questions:

1. **value proposition**: what pain point does your product solve and is how is it different from your competitors'?
2. **user needs**: what are the core, essential features a user needs to achieve their goal and get the value from your value proposition?
3. **time and effort**: which features can be built realitively easily? Include those first.

#### Iterating on your MVP

After receiving customer feedback, you need an organized way to choose which task to tackle next in your MVP. The best way to do this is through some sort of task manager which needs two important features:

1. Ability to label tasks and sort them into different bins, like one for new features and one for improving existing features
2. Ability to add a priority level to tasks to make some more important than others.

Below is an example of how to organize your tasks, making sure you assign a priority level to each task so you know which ones to tackle first.

- **optimization stream**: bin for tasks that are for improving existing features.
- **innovation stream**: bin for tasks that are for implementing new features.


> [!TIP] 
> You can organize tasks based on the eisenhower matrix, where high important, low effort tasks shuld get the highest priority and the high effort, low importance tasks should get the lowest priority.



![](https://i.imgur.com/QuruAR9.jpeg)

### identifying customers

#### Audience segmentation

To find out your audience for your product, segment them by asking these questions:

1. **questions**: what questions does your audience ask?
2. **tasks**: what tasks would your audience want to complete?
3. **different needs**: What are the different types of needs your audience would have? (Language, disabled, etc.)

#### Creating a persona

To create a persona that represents your audience, answer these 6 questions:


![](https://i.imgur.com/vlaASdG.jpeg)



After creating a persona, create a **persona statement**, which succinctly summarizes the target audience for your app.

> As a `____`, I want to `____` so I can `____`. And I'll know that I'm done when `____`.

This lets you dive into the use cases:

#### Use cases

After creating a persona, find out which **use cases** your audience has, meaning which tasks they want to complete. And then see how to translate that into adding functionality to your app to achieve those use cases.

### principle 3) Top Tasks

The most important tasks of your web app, the so-called **top tasks**, must be readily accessible and easily initiated on your site as they are the most beneficial and important tasks for users. 

Therefore you should develop and design your app in such a way that the top tasks are not impeded by less important tasks, and you can use the simplicity principles of delete, hide, or shrink to accomplish this.