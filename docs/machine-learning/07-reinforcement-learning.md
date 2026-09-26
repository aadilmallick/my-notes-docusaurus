

## Intro

### What is reinforcement learning

Reinforcement learning is machine learning algorithms that use rewards as a way to give the system an incentive to find new patterns. 

![](https://i.imgur.com/EDm0NVH.jpeg)

Instead of learning from examples, reinforcement learning forces an agent to learn from experience in its environment via rewards and punishments. 

Here are the important components and terminology:

- **agent**: the AI whose goal is to maximize the total reward over time.
- **rewards**: a positive number, given to the agent as a result of good actions intended to reward the agent and encourage it to repeat the same good actions in the future.
- **penalties**: a positive number, given to the agent as a result of bad actions intended to punish the agent and discourage it from repeating those bad actions in the future.
- **total reward**: the total points after all rewards and penalties have been added together.

![](https://i.imgur.com/PZzCUMo.jpeg)

> [!NOTE]
> The easiest way to think about reinforcement learning is like how you drop a mouse in a maze and expect it to find some cheese, where cheese is the reward and the punishment is starving to death. By the way it doesn't even know what game it is trying to play but it eventually learns the game, which is called a policy, just by trying to maximize reward and minimize penalties. 

Our goal in reinforcement learning is to try to make the agent learn a **policy**, which is a strategy that tells the agent what action to take in any state as to maximize total reward.

A policy can be categorized into two main actions:

- **exploitation**: when the agent takes an action it already knows how to do because it has been rewarded for doing it in the past
- **exploration**: when the agent takes a new action that might be better and lead to greater rewards

> [!NOTE]
> There is a trade-off between exploitation and exploration called the **exploration-exploitation dilemma**. Although exploitation has the highest probability of working, you can miss better solutions that exploration gives you but exploration can also waste time and lose rewards in the process. 
> 
> - exploitation: low risk, low reward
> - exploration: high risk, high reward

![](https://i.imgur.com/PQdQS68.jpeg)

#### Reinforcement learning model

Modern reinforcement learning uses deep neural networks to learn and handle complex environments. 

![](https://i.imgur.com/H2AaF4W.jpeg)

#### When to use reinforcement learning

Reinforcement learning works best when you're trying to reward good behavior and punish bad behavior in a feedback loop that's easily accessible. 

> [!NOTE]
> Think about something like Pavlov's dog. If you don't have something as simple as that, then it's probably not a good fit for reinforcement learning. 



![](https://i.imgur.com/PwpTzOF.jpeg)

### Types of reinforcement learning

#### Q learning

Q-Learning is a type of reinforcement learning where an AI learns to make better decisions by earning rewards for its actions. 


![](https://i.imgur.com/vAddpve.jpeg)


Imagine the AI is in different "states" (situations) and can take various "actions" in each state. Each action leads to a result with a certain quality, called Q. 

- The AI starts with a Q value of zero and tries different actions, earning digital "reward coins" when it makes good choices, like when you click and listen to a recommended song longer. O
- Over time, it learns which actions increase its Q value the most, so it can make smarter decisions to maximize its rewards. 