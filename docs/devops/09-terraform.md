


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

#### `terraform init`

The `terraform init` command initializes your working directory for Terraform. 

It sets up the backend (usually local at first), downloads and installs the necessary provider plugins like AWS, and creates a lock file (`.terraform.lock.hcl`) that records the provider versions and selections. 

You can safely run this command multiple times—it will recheck for updates and ensure your environment is ready to build infrastructure with Terraform.

#### `terraform validate`

The `terraform validate` command checks your Terraform configuration files for syntax errors and correctness before you proceed to planning or applying infrastructure changes. 

- It helps catch issues like misplaced commas or incorrect argument formats by providing clear error messages with file and line details. 
- You can also run it with a `-json` option to get machine-readable output, useful for automation. 

Using `terraform validate` regularly ensures your code is error-free and ready to be applied, making your infrastructure management smoother and more reliable.


#### `terraform plan`

The `terraform plan` command generates a detailed preview of the changes Terraform will make to your infrastructure based on your current configuration. 

It shows what resources will be created, changed, or destroyed without actually applying those changes yet. 

- This helps you verify your setup before making any real modifications. 
- You can also save the plan to a file to apply it later, ensuring consistency between planning and applying stages.

#### `terraform apply`

The `terraform apply` command is the step where Terraform actually builds the infrastructure you've defined in your configuration. 

1. It first shows you the execution plan again and asks for your confirmation before proceeding. 
2. Once you confirm by typing "yes," it creates the resources on AWS and generates a state file to track the current infrastructure. 

This command is crucial because it turns your code into real cloud infrastructure, but it’s important to review the plan carefully and ensure your AWS credentials are properly configured before applying changes.

#### Terraform state file

Terraform tracks the state of the infrastructure with a `terraform.tfstate` JSON file.

A Terraform state file is a JSON-formatted text file that Terraform uses to keep track of the current state of your infrastructure. 

- It records details about the resources Terraform manages, like your AWS instances and configurations. 
- This file helps Terraform understand what exists in your environment so it can plan and apply only the necessary changes when you update your infrastructure code.

> [!NOTE]
> The state file represents a source of truth for resource provisioning with Terraform. 

#### `terraform destroy`

The `terraform destroy` command looks at the state file and destroys all infra provisioned by terraform.
## Terraform basics

### First terraform

```hcl title="main.tf"
// 1. create terraform config
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
    }
  }
}

// 2. create provider config
provider "aws" {
  region  = "us-west-2"
}

// 3. define variables
variable "instance_type" {
  description = "Type of EC2 instance to provision"
  default     = "t3.nano"
}


data "aws_ami" "app_ami" {
  most_recent = true

  filter {
    name   = "name"
    values = ["bitnami-tomcat-*-x86_64-hvm-ebs-nami"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["979382823631"] # Bitnami
}

data "aws_vpc" "default" {
  default = true
}

// 4. create resources
resource "aws_instance" "blog" {
  ami                    = data.aws_ami.app_ami.id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.blog.id]

  tags = {
    Name = "Learning Terraform"
  }
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

### Variables

You can define variables in Terraform that you can then use throughout your Terraform files, using the `terraform` block like so:

```hcl
variable "instance_type" {
  description = "Type of EC2 instance to provision"
  default     = "t3.nano"
}
```

And then you can access variables through the `var` namespace via dot notation:

```
var.<variable_name>
```

Here's an example of defining a variable then using it:

```hcl
variable "instance_type" {
  description = "Type of EC2 instance to provision"
  default     = "t3.nano"
}

resource "aws_instance" "blog" {
  ami                    = data.aws_ami.app_ami.id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.blog.id]

  tags = {
    Name = "Learning Terraform"
  }
}
```
### Outputs

Outputs are like cloudformation outputs, defined by a `output` top level block.

```hcl
output "instance_ami" {
  value = aws_instance.blog.ami
}

output "instance_arn" {
  value = aws_instance.blog.arn
}
```

### Data blocks

In Terraform, a data block is used to fetch or reference existing information about infrastructure that Terraform doesn't directly manage.

In the example below, here are the values we get access to by creating the data blocks:

- `data.aws_ami.app_ami`: returns a reference to the AMI object filtered by name, virtualization type, and owners.
- `data.aws_vpc.default`: returns `true`, meaning that the default value for whether to use a VPC for instances is true.

```hcl
data "aws_ami" "app_ami" {
  most_recent = true

  filter {
    name   = "name"
    values = ["bitnami-tomcat-*-x86_64-hvm-ebs-nami"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["979382823631"] # Bitnami
}

data "aws_vpc" "default" {
  default = true
}
```

You can then use data block variables as normal variables:

```hcl
resource "aws_instance" "blog" {
  ami                    = data.aws_ami.app_ami.id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.blog.id]

  tags = {
    Name = "Learning Terraform"
  }
}
```

### Basic resource types

The nice thing about using Terraform is that the logical ID of a resource is a combination of the resource type and the actual human-facing logical ID used. 

This means that you can scope logical IDs to a resource type and thus reuse logical IDs across your application as long as the combination of resource type and logical ID is unique. 

You can also refer to the properties of another resource using dot-notation syntax

```
resource_type.logical_id.property
```

#### Instances + VPCs

```hcl
data "aws_ami" "app_ami" {
  most_recent = true

  filter {
    name   = "name"
    values = ["bitnami-tomcat-*-x86_64-hvm-ebs-nami"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["979382823631"] # Bitnami
}

data "aws_vpc" "default" {
  default = true
}

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

#### ALB + ASG

1. **Set Up the Load Balancer Module:**  
      
    
    - Use the Terraform AWS ALB module from the Terraform Registry.
    - Configure it with your VPC ID and public subnets from your VPC module.
    - Attach your existing security group by passing its ID as a list.
    - Define listeners to forward HTTP traffic to a target group (no HTTPS for simplicity).
    - Remove inline security group rules and access logs if not needed.
    
      
    
2. **Create the Target Group:**  
      
    
    - Define an AWS load balancer target group resource.
    - Set the name and link it to your VPC using the VPC ID.
    
      
    
3. **Connect Target Group to Instances:**  
      
    
    - Initially, create a target group attachment resource to link the target group to your single instance.
    - When using an autoscaling group, remove this attachment.
    
      
    
4. **Set Up the Auto Scaling Group Module:**  
      
    - Use the Terraform AWS Auto Scaling module from the Registry.
    - Configure parameters like `min_size` (e.g., 1), `max_size` (e.g., 2), and `vpc_zone_identifier` with your public subnets.
    - Use a launch template name (e.g., “blog”) to let the module handle instance provisioning.
    - Set security groups and image ID (AMI) for instances.
    - Add a traffic source attachment block to connect the ASG to the ALB’s target group by referencing the target group ARN.

Here's the complete code.

```hcl
data "aws_ami" "app_ami" {
  most_recent = true

  filter {
    name   = "name"
    values = ["bitnami-tomcat-*-x86_64-hvm-ebs-nami"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["979382823631"] # Bitnami
}

module "blog_vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "dev"
  cidr = "10.0.0.0/16"

  azs             = ["us-west-2a","us-west-2b","us-west-2c"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  tags = {
    Terraform = "true"
    Environment = "dev"
  }
}


module "blog_autoscaling" {
  source  = "terraform-aws-modules/autoscaling/aws"
  version = "6.5.2"

  name = "blog"

  min_size            = 1
  max_size            = 2
  vpc_zone_identifier = module.blog_vpc.public_subnets
  target_group_arns   = module.blog_alb.target_group_arns
  security_groups     = [module.blog_sg.security_group_id]
  instance_type       = var.instance_type
  image_id            = data.aws_ami.app_ami.id
}

module "blog_alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 6.0"

  name = "blog-alb"

  load_balancer_type = "application"

  vpc_id             = module.blog_vpc.vpc_id
  subnets            = module.blog_vpc.public_subnets
  security_groups    = [module.blog_sg.security_group_id]

  target_groups = [
    {
      name_prefix      = "blog-"
      backend_protocol = "HTTP"
      backend_port     = 80
      target_type      = "instance"
    }
  ]

  http_tcp_listeners = [
    {
      port               = 80
      protocol           = "HTTP"
      target_group_index = 0
    }
  ]

  tags = {
    Environment = "dev"
  }
}

module "blog_sg" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "4.13.0"

  vpc_id  = module.blog_vpc.vpc_id
  name    = "blog"
  ingress_rules = ["https-443-tcp","http-80-tcp"]
  ingress_cidr_blocks = ["0.0.0.0/0"]
  egress_rules = ["all-all"]
  egress_cidr_blocks = ["0.0.0.0/0"]
}
```
### Terraform modules

A Terraform module is a way to group related Terraform code into a single, logical unit that can be managed together.

Modules help you organize and reuse code, making it easier to manage complex infrastructure.

A module can use `variable` and `output` blocks, but the content of a module is encapsulated and works like a black box, so the only way you can access code from a module is through exposing `output` blocks on it.

Using a Terraform module for security groups simplifies your code by bundling complex configurations into reusable, manageable blocks. 

- Instead of manually defining every rule and detail, the module handles much of that for you, reducing errors and saving time. 
- Modules also make your infrastructure code cleaner and easier to maintain, and you can use pre-built, tested modules from the Terraform Registry, which helps ensure best practices and consistency in your setups.

#### Example

Here are the steps where we use an offical terraform module for security groups to make the process of creating a security group simpler:

- **in-house way**: Create a `security_group` resource and then for each rule you want to add to the security group, create a `security_group_rule` resource.
- **module way**: Just define meta-arguments for the security group module to create a security group with rules all at once.

So here are the steps to implement the module way:

1. Create a module that creates a VPC:

```hcl
module "blog_vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "dev"
  cidr = "10.0.0.0/16"

  azs             = ["us-west-2a","us-west-2b","us-west-2c"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]


  tags = {
    Terraform = "true"
    Environment = "dev"
  }
}
```

2. Create a module that creates a security group

```hcl
module "blog_sg" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "4.13.0"

  vpc_id  = data.aws_vpc.default.id
  name    = "blog"
  ingress_rules = ["https-443-tcp","http-80-tcp"]
  ingress_cidr_blocks = ["0.0.0.0/0"]
  egress_rules = ["all-all"]
  egress_cidr_blocks = ["0.0.0.0/0"]
}
```

3. Use the module as a security group reference:

```hcl
resource "aws_instance" "blog" {
  ami                    = "ami-2342343242"
  instance_type          = t2.micro
  vpc_security_group_ids = [module.blog_sg.security_group_id]

  tags = {
    Name = "Learning Terraform"
  }
}
```


And here it is all complete:

```hcl
data "aws_ami" "app_ami" {
  most_recent = true

  filter {
    name   = "name"
    values = ["bitnami-tomcat-*-x86_64-hvm-ebs-nami"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["979382823631"] # Bitnami
}

data "aws_vpc" "default" {
  default = true
}

resource "aws_instance" "blog" {
  ami                    = data.aws_ami.app_ami.id
  instance_type          = var.instance_type
  vpc_security_group_ids = [module.blog_sg.security_group_id]

  tags = {
    Name = "Learning Terraform"
  }
}

module "blog_sg" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "4.13.0"

  vpc_id  = data.aws_vpc.default.id
  name    = "blog"
  ingress_rules = ["https-443-tcp","http-80-tcp"]
  ingress_cidr_blocks = ["0.0.0.0/0"]
  egress_rules = ["all-all"]
  egress_cidr_blocks = ["0.0.0.0/0"]
}
```