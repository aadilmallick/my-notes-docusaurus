


## Why terraform

Choosing Terraform over cloud provider-specific tools like AWS CloudFormation or Azure ARM templates offers several advantages:  
  

- **Multi-cloud support:** Terraform works across all major cloud providers, allowing you to manage infrastructure in a consistent way regardless of the cloud platform.
- **Community and module ecosystem:** It has a large community contributing to a public registry of modules, which helps you quickly use and customize infrastructure components.
- **Feature parity and updates:** Terraform support for cloud features is generally as current as the cloud providers' own tools, sometimes even quicker due to community contributions.
- **Flexibility in state management:** You can store Terraform's infrastructure state in various secure and version-controlled locations, giving you control over your environment.

### IaC and Configuration Management

Terraform focuses on managing and provisioning your base infrastructure—like creating servers, networking, and storage—using code. It sets up the foundational resources but doesn't manage what runs inside those servers. 

Configuration management tools like Puppet come into play after Terraform has created the infrastructure; they configure and manage the software and applications on those servers. 

> [!NOTE]
> So, think of Terraform as setting up a blank canvas (the infrastructure), and Puppet as painting the picture (configuring the software). This separation helps keep infrastructure setup and software configuration distinct and manageable.

### How terraform works

The Terraform configuration file is structured into three main blocks: 

1. `terraform` block: specifies required providers and Terraform version constraints
2. `provider` block: configures the provider plugin, like choosing AWS and then the properties like AWS region and other connection details.
3. `resource` block: defines the actual infrastructure components, such as an AWS instance.

```terraform
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-east-2"
}

resource "aws_instance" "app_server" {
  ami           = "ami-0c7c4e3c6b4941f0f"
  instance_type = "t2.micro"

  tags = {
    Name = "Lab-03-AWS-Instance"
  }
}
```

> [!NOTE]
> Based on this static code, terraform produces a directed acyclic resource graph to create a dependency order in which to create resources. 

Then the basic workflow is:

1. Write the code
2. Run `terraform init` to initialize the directory
3. Validate the changes with `terraform validate` and `terraform plan`
4. Apply the infra with `terraform apply`

#### Terraform state file

Terraform tracks the state of the infrastructure with a `terraform.tfstate` JSON file.

A Terraform state file is a JSON-formatted text file that Terraform uses to keep track of the current state of your infrastructure. 

- It records details about the resources Terraform manages, like your AWS instances and configurations. 
- This file helps Terraform understand what exists in your environment so it can plan and apply only the necessary changes when you update your infrastructure code.

## Terraform basics

### Learning to create resources

The typical Terraform workflow involves three main steps:  
  

1. **Write your Terraform code** to define the infrastructure you want to create.
2. **Initialize your working directory** using the command `terraform init`, which sets up the directory and downloads necessary provider plugins.
3. **Apply your infrastructure** with `terraform apply`, which actually provisions the resources defined in your code.

Here's that workflow in action:
  

1. Create terraform resource in `.tf` file, with the resource type being `"local_file"` to refer to a local file:

  

```terraform
resource "local_file" "hello_world" {
  content  = "Hello, World!"
  filename = "${path.module}/hello_world.txt"
}
```

  

2. Run `terraform init`

3. Run `terraform plan` which is basically like `cdk synth`

4. Run `terraform apply` to apply the changes

5. Run `terraform destroy` to destroy all the resources managed by terraform

#### First EC2 instance

- [IaC+with+Terraform+Study+Guide.pdf](https://drive.google.com/file/d/1EBfvxQGX56dqOxkdviikKzRlfwwnElec/view?usp=sharing)
- [Lab+-+Infrastructure+as+Code+(IaC)+with+Terraform.pdf](https://drive.google.com/file/d/1dW07jrIpT8LJ79MMRTuFrq9g8rk74LRS/view?usp=sharing)
  

1. Load AWS access keys into shell session as env vars

  

```bash

aws sso login --profile sandbox

```

  

2. Add EC2 instance, give it logical ID of `"web"`

  

```terraform
resource "aws_instance" "web" {
    instance_type = "t2.micro"
	ami = "ami-0f8a61b66d1accaee"

    tags = {
        Name = "HelloWorld"
    }
}
```

  

3. Create variables that can be used elsewhere, and specify variables with the `variable` keyword and the cloud provider to use with the `"aws"` keyword:

  
```terraform

variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

provider "aws" {
  region = var.aws_region
}
```

#### File structure 

Once you provision the resources using terraform, all the provisioned resource info will be put into a file called `terraform.tfstate`, which contains all the details of all cloud assets it created from the most recent `terraform apply` call.

- **`terraform.tfvars`**: Holds configuration parameters you can tweak, like the number of servers or instance types.
- **Main Terraform files**: These define the actual infrastructure resources you want to create, such as networks, servers, and load balancers.
- **`terraform.tfstate` file**: This file tracks the current state of your infrastructure, recording what Terraform has created or modified. It’s crucial for managing changes accurately.
- **Modules directory**: Contains reusable Terraform code modules that handle specific parts of your infrastructure, like networking or compute resources.

### Basic resource types

The nice thing about using Terraform is that the logical ID of a resource is a combination of the resource type and the actual human-facing logical ID used. 

This means that you can scope logical IDs to a resource type and thus reuse logical IDs across your application as long as the combination of resource type and logical ID is unique. 

You can also refer to the properties of another resource using dot-notation syntax

```
resource_type.logical_id.property
```

#### Instances + VPCs

```hcl
resource "aws_instance" "blog" {
  ami                    = data.aws_ami.app_ami.id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.blog.id]

  tags = {
    Name = "Learning Terraform"
  }
}

resource "aws_eip" "blog" {
	instance = aws_instance.blog.id
	vpc = true
}

resource "aws_security_group" "blog" {
  name = "blog"
  tags = {
    Terraform = "true"
  }
  vpc_id = data.aws_vpc.default.id
}

resource "aws_security_group_rule" "blog_http_in" {
  type        = "ingress"
  from_port   = 80
  to_port     = 80
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
  security_group_id = aws_security_group.blog.id
}


resource "aws_security_group_rule" "blog_https_in" {
  type        = "ingress"
  from_port   = 443
  to_port     = 443
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
  security_group_id = aws_security_group.blog.id
}


resource "aws_security_group_rule" "blog_everything_out" {
  type        = "egress"
  from_port   = 0
  to_port     = 0
  protocol    = "-1"
  cidr_blocks = ["0.0.0.0/0"]
  security_group_id = aws_security_group.blog.id
}
```