## The state of AI in AWS

### Bedrock + Strands + Agentcore

- **bedrock**: provides inference for models on AWS
- **strands**: agent library for orchestrating agents, agentic loop, and subagents.
- **agentcore**: CLI tool that reads from a strands agent project to create a containerized API for it, and then deploy it to your AWS account as real containerized infra via S3, CodeBuild, ECR to store the image, and Agentcore to run the agent.

#### Agentcore

![](https://i.imgur.com/GIaCV88.jpeg)

Agentcore providers users a front-facing abstraction over API gateway for running inference on LLM models. It has these properties:

- **serverless**: agents on an Agent Core API run on serverless micro VMs managed by AWS. 
- **monitoring**: out-of-the-box AI observability 
- **MCP**: convert any Lambda or APIs into MCP
- **authorization add-ons**: integrates with Cognito to have protected authenticated access.

