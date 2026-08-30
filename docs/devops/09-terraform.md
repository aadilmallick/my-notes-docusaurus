


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

## Terraform CLI and config

### Terraform state file

Terraform tracks the state of the infrastructure with a `terraform.tfstate` JSON file.

> [!NOTE]
> A Terraform state file is a JSON-formatted text file that Terraform uses to keep track of the current state of your infrastructure.

- It records details about the resources Terraform manages, like your AWS instances and configurations. 
- This file helps Terraform understand what exists in your environment so it can plan and apply only the necessary changes when you update your infrastructure code.

> [!NOTE]
> The state file represents a source of truth for resource provisioning with Terraform. 


The Terraform state file is a critical component that keeps track of the real-world infrastructure Terraform manages. It stores metadata about your AWS resources so Terraform knows what exists and how to manage it.  
  
"Refreshing" the state means Terraform compares the information in the state file with the actual current state of your AWS infrastructure. This ensures Terraform's view is up to date before making any changes.  
  
Here’s how some Terraform CLI commands interact with the state file:  
  

- **terraform plan:** Refreshes the state to reflect the current infrastructure, then shows what changes will be made based on your configuration.
- **terraform apply:** Also refreshes the state, applies the planned changes to AWS, and updates the state file to reflect the new infrastructure.
- **terraform destroy:** Refreshes the state, then removes all resources defined in the state file, updating the state to show that resources are gone.

  
Keeping the state file accurate through refreshing is essential for Terraform to manage your infrastructure reliably and avoid unexpected changes or errors.


#### Local state file

All Terraform CLI commands interact with the state file and modify it, and use it as a source of truth to provision or destroy cloud resources.

This means that if you want github actions or a remote server with a CI/CD pipeline to use terraform CLI commands and be up-to-date on the current state of your infra, you must use the `terraform.tfstate` file as a source of truth for both your local and remote environments.

However, to achieve this, you run into some issues:

- **sensitive values are in plain text**: because the `terraform.tfstate` file is just a JSON file, sensitive values like access keys and env vars are in plain text and cannot be checked into source control.
- **remotely storing `terraform.tfstate` file requires extra complexity**: You need to figure out stuff like encryption, which backend to host, and how to pull down the state.

#### Remote storage

Remote storage of the `terraform.tfstate` file brings key benefits:

- **CI/CD capabilities**: now you can have CI/CD pipelines that use the `terraform` CLI based on the state file to provision your infra and test it.
- **Collaboration**: multiple people on your team can work on terraform and use the same state file.

Here are the three backends you can use for storing your `terraform.tfstate` file and how to configure them:

- **terraform cloud**: free storage of the `terraform.tfstate` file and a first class code integration for pulling it down and marking the terraform environment as using remote state configuration.

```hcl
terraform {
	backend "remote" {
		organization = "my-org"
		
		workspaces {
			name = "my-workspace"	
		}
	}
}
```

- **S3**: AWS-managed storage using S3 and DynamoDB of the `terraform.tfstate` file and a first class code integration for pulling it down and marking the terraform environment as using remote state configuration.`


```hcl
terraform {
  backend "s3" {
    bucket         = "devops-directive-tf-state"
    key            = "tf-infra/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-locking"
    encrypt        = true
  }
}

```

##### Terraform Cloud flow

Just use this:

```hcl
terraform {
  backend "remote" {
    organization = "devops-directive"

    workspaces {
      name = "devops-directive-terraform-course"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
```
##### S3 flow

Here is how to make the S3-based remote storage of the `terraform.tfstate` file work, starting off first using a local `terraform.tfstate` file:


1. Provision the infra with terraform, making sure everything is named exactly:

```hcl
resource "aws_s3_bucket" "terraform_state" {
  bucket        = "devops-directive-tf-state"
  force_destroy = true
  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-state-locking"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
}
```

2. Run `terraform apply`
3. Specify the remote backend to be of the `"s3"` type, so from now on you will use the remote state file stored in S3.

```hcl
terraform {
  backend "s3" {
    bucket         = "devops-directive-tf-state"
    key            = "tf-infra/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-locking"
    encrypt        = true
  }
}

```

Here's the full flow:

```hcl
terraform {
  #############################################################
  ## AFTER RUNNING TERRAFORM APPLY (WITH LOCAL BACKEND)
  ## YOU WILL UNCOMMENT THIS CODE THEN RERUN TERRAFORM INIT
  ## TO SWITCH FROM LOCAL BACKEND TO REMOTE AWS BACKEND
  #############################################################
  # backend "s3" {
  #   bucket         = "devops-directive-tf-state" # REPLACE WITH YOUR BUCKET NAME
  #   key            = "03-basics/import-bootstrap/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "terraform-state-locking"
  #   encrypt        = true
  # }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "terraform_state" {
  bucket        = "devops-directive-tf-state" # REPLACE WITH YOUR BUCKET NAME
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "terraform_bucket_versioning" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state_crypto_conf" {
  bucket        = aws_s3_bucket.terraform_state.bucket 
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-state-locking"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
}
```

### Basic workflow


All of these commands interact with the state file and modify it, and use it as a source of truth to provision or destroy cloud resources.

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

**planning destruction**

If you want to see a plan of what will happen and what resources will either get replaced, updated, orphaned, or destroyed upon using the `terraform destroy` command, then you should use the `-destroy` flag with the `terraform plan` command:

```bash
terraform plan -destroy
```

#### `terraform apply`

The `terraform apply` command is the step where Terraform actually builds the infrastructure you've defined in your configuration. 

1. It first shows you the execution plan again and asks for your confirmation before proceeding. 
2. Once you confirm by typing "yes," it creates the resources on AWS and generates a state file to track the current infrastructure. 

This command is crucial because it turns your code into real cloud infrastructure, but it’s important to review the plan carefully and ensure your AWS credentials are properly configured before applying changes.

**update by replacement**

If you want to apply changes by replacing cloud resources, use the `-replace` flag and specify a resource to replace (delete then recreate)

```bash
terraform apply -replace="$RESOURCE_TYPE.$LOGICAL_ID"
```


#### `terraform destroy`

The `terraform destroy` command looks at the state file and destroys all infra provisioned by terraform.

### `terraform show`

The `terraform show` command goes to the TF state file and outputs the details of all provisioned resources. 

The `terraform state show <resource_type>.<logical_id>` command is used to show details of a specific resource.

If you have multiple `terraform.tfstate` files since those files are scoped within a directory, you can specify the state file to use and query from for the `terraform state show` command with the `-state` option like so:

```bash
terraform state show -state="../terraform.tfstate" resource_type.logical_id
```


![](https://i.imgur.com/kIUgSPO.jpeg)


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

A **variable** in Terraform is basically a typed key-value pair .

You have many different ways of creating variables in terraform and there are different types of variables:

- **input variables**: variables that are declared but don't have a value until runtime, and you inject values in `terraform apply` or through `terraform.tfvars`. 
	- Use the `variable` block for this.
- **local variables**: standard key-value pairs that act basically as config objects that you can immediately use in your terraform code. 
	- Use the `locals` block for this.

#### Local variables

Local variables are basically just key-value pairs with values already there, so you can access them through the `locals` namespace.

```hcl
locals {
	service_name = "My service"
	owner = "me"
}
```

#### Input variables

You can define input variables in Terraform that you can then use throughout your Terraform files, using the `variable` block like so, with these meta-arguments:

- `description`: the human-facing description of what the variable does or represents.
- `default`: the default value of the variable
- `type`: the data type of the variable, default is string.
- `sensitive`: a boolean type, where if you pass `true`, then it marks the variable and sensitive and will mask its value when outputted.

```hcl
variable "instance_type" {
  description = "Type of EC2 instance to provision"
  default     = "t3.nano"
}
```

For input variables defined with the `variable` block, you can access variables through the `var` namespace via dot notation:

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

#### Data types

You have these three primitive data types you can use for variables:

  - **string**: A sequence of characters. Requires double-quotes.
    - Ex: `"hello world!"`.
  - **number**: A numeric value. Does not use double-quotes.
    - Ex: `2`, `20`, or `17.2014`.
  - **bool**: A boolean value.
    - Ex: `true` or `false`.
    - These are used with conditional logic.
- **null**: A `null` value is an omission of value. 
	- Defaults will be used if the variable has one. 
	- Used often in conditional expressions.

You also have these complex data types:

  - **list**: (also known as tuple) A sequence of values. Each value sits in double-quotes and are comma-separated. Uses square brackets `[]` as delimiters.

```hcl
variable names {
	type: list
	default = ["Alice", "Bob", "Charlie", "Denise"]
}
```

  - **map**: (also known as object) a group of values using labels and values - collectively known as key pairs. Uses curly braces `{}` as delimiters.
    - Ex: `{name = "Bob", occupation = "Programmer"}`
    - In this case, `name` is a label, and `"Bob"` is a value for that label.

```hcl
variable "ami_filter" {
  description = "Name filter and owner for AMI"

  type    = object ({
    name  = string
    owner = string
  })

  default = {
    name  = "bitnami-tomcat-*-x86_64-hvm-ebs-nami"
    owner = "979382823631" # Bitnami
  }
}
```

#### Object type

In Terraform, use an **object type variable** when you want to group related configuration values together logically, like an AMI filter with both a name and owner, or an environment with a name and network prefix. 

This helps keep your code organized and makes it easier to manage complex settings as a single unit.

First, create variables like so:

```hcl
variable "instance_type" {
  description = "Type of EC2 instance to provision"
  default     = "t3.nano"
}

// define object type
variable "ami_filter" {
  description = "Name filter and owner for AMI"

  type    = object ({
    name  = string
    owner = string
  })

  default = {
    name  = "bitnami-tomcat-*-x86_64-hvm-ebs-nami"
    owner = "979382823631" # Bitnami
  }
}

// define object variable type
variable "environment" {
  description = "Deployment environment"

  type        = object ({
    name           = string
    network_prefix = string
  })
  default = {
    name           = "dev"
    network_prefix = "10.0"
  }
}

variable "asg_min" {
  description = "Minimum instance count for the ASG"
  default     = 1
}

variable "asg_max" {
  description = "Maximum instance count for the ASG"
  default     = 2
}
```

Then you can use those advanced variables like this:

```hcl
data "aws_ami" "app_ami" {
  most_recent = true

  filter {
    name   = "name"
    values = [var.ami_filter.name]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = [var.ami_filter.owner] # Bitnami
}
```

#### Injecting values for input variables

Here is the priority order for the injection precedence of the different ways to inject values for the input variables at runtime, lowest to highest.

1. Default value in a declaration block
2. `TF_VAR_<VARNAME>` environment variables in the current shell session
3. `terraform.tfvars` file
4. `*.auto.tfvars` file
5. Using `terraform apply` or `terraform plan` with the `-var` flag.
##### `terraform.tfvars`

The `terraform.tfvars` file is a special file that uses `.env` syntax where in one file, you define a bunch of key value pairs in the syntax below, and then terraform will automatically inject those key-value pairs in that file as values for the terraform variables that you define with the `variable` block.

```
key=value
```

> [!NOTE]
> The main purpose of this file is to supply values at runtime for the variables you define with the `variable` block.

Here is a full example:

1. Create `variable` blocks for those variables to define them in the terraform.

```hcl
variable "ami_id" {
  description = "The AMI ID for the localstack Amazon Linux image"
  type        = string
  default     = "ami-024f768332f0" 
}

variable "ec2_instance_type" {
  type        = string
  default     = "t2.micro"
}

variable "instance_name" {
  type        = string
}
```

2. Create a `terraform.tfvars` file with the variables you want to use:

```hcl title="terraform.tfvars"
ec2_instance_type = "t2.micro"
instance_name = "MyInstanceName"
ami_id = "ami-024f768332f0"
```

2. Use the variables, which will be populated on the `var` object:

```hcl title="main.tf"
resource "aws_instance" "web" {
  instance_type = var.ec2_instance_type
  ami           = var.ami_id

}
```

##### Variables with CLI

You can run `terraform apply` and pass in variable values to have those values get injected into runtime:

```bash
terraform apply -var="var_name=value"
```


### Outputs

Outputs are like cloudformation outputs, defined by a `output` top level block.

```hcl
output "ec2_instance_id" {
  value       = aws_instance.web.id
  description = "The ID of the EC2 instance"
}

output "ec2_instance_public_ip" {
  value       = aws_instance.web.public_ip
  description = "The public IP address of the EC2 instance"
}

output "ec2_instance_private_ip" {
  value       = aws_instance.web.private_ip
  description = "The private IP address of the EC2 instance"
}

output "ec2_instance_public_dns" {
  value       = aws_instance.web.public_dns
  description = "The public DNS name of the EC2 instance"
}
```

Here are the meta-arguments to supply to an `output` block:

- `value`: the output value
- `description`: the human-facing description for the output 

#### Output CLI

You can also imperatively use the terraform CLI to fetch raw output values from your terraform code after the fact.

This works by looking through the `tfstate` file to find all previous outputs, because the outputs are stored in that file.


Here is the basic syntax:

```bash
terraform output -raw $OUTPUT_NAME
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

You can then access data block variable values through the `data` namespace via dot notation.

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

### Expressions and functions



![](https://i.imgur.com/sOK3Ohu.jpeg)


#### Template interpolation

In Terraform you can use template string interpolation syntax to use a variable's value within a string with the `${}` syntax.

```hcl
module "blog_vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = var.environment.name
  cidr = "${var.environment.network_prefix}.0.0/16"

  azs             = ["us-west-2a","us-west-2b","us-west-2c"]
  public_subnets  = ["${var.environment.network_prefix}.101.0/24", "${var.environment.network_prefix}.102.0/24", "${var.environment.network_prefix}.103.0/24"]


  tags = {
    Terraform = "true"
    Environment = var.environment.name
  }
}
```


#### Ternary expressions + Conditionals

You have all these operators in terraform:

```hcl
!, - # (multiplication by -1)
*, /, % # (modulo)
+, - # (subtraction)
>, >=, <, <= # (comparison)
==, != # (equality)
&& # (AND)
|| # (OR)
```

You can use ternary operators to supply a value conditionally.

```hcl
condition ? true_val : false_val

# For example
var.a != "" ? var.a : "default-a"
```

#### Numeric functions

```hcl
abs()
ceil()
floor()
log()
max()
parseint() # parse as integer
pow()
signum() # sign of number
```

#### String functions

```hcl
chomp() # remove newlines at end
format() # format number
formatlist()
indent()
join()
lower()
regex()
regexall()
replace()
split()
strrev() # reverse string
substr()
title()
trim()
trimprefix()
trimsuffix()
trimspace()
upper()
```
## Resources

### Basics and meta-arguments

The nice thing about using Terraform is that the logical ID of a resource is a combination of the resource type and the actual human-facing logical ID used. 

This means that you can scope logical IDs to a resource type and thus reuse logical IDs across your application as long as the combination of resource type and logical ID is unique. 

You can also refer to the properties of another resource using dot-notation syntax on the namespace of the resource type, like `aws_security_group`.

```
resource_type.logical_id.property
```

You specify the properties of a resource through **meta-arguments**, like the AMI ID or instance type of an EC2 instance, but you also have these built-in metaarguments:

- `count`: **Number**, defines the number of duplicates you want to create of this resource.
- `depends_on`: **String**, defines which resource is a dependency, so doesn't create the current resource until the resource it depends on is created
- `for_each`: **Array**, basically populates an array from some value you you inject it with, then you can use `each` to refer to the current element in the iteration. 
	- This lets you create multiple resources dynamically through an array with more control than just creating duplicates with `count`.
- `lifecycle`: **Object**, controls the lifecycle of a resource with properties like being replaced upon update and what property changes to ignore on update.
#### `depends_on`

Based on the meta-arguments and the references you have to other resources and variables throughout the entire code, Terraform automatically creates a dependency graph with the order of dependencies to create. 

If two resources depend on each other but not on each other's data, then use the `depends_on` identifier, which manually specifies a resource's dependency on another resource

#### `lifecycle`

A set of meta arguments to control terraform lifecycle behavior for a resource, especially upon a configuration update.

- `create_before_destroy`: **Boolean**. If `true`, creates the new resource before destroying the old one
- `ignore_changes`: a list of properties/meta-arguments to ignore for drift detection, meaning that if you manually change one of these properties in the AWS console, it's ok, terraform doesn't automatically fix drift for those irgnored properties being changed.
- `prevent_destroy`: reject any plan that would destroy this resource.
### EC2 instances

#### Instance basics: setup security group

1. **Create SSH security group**: here is how to create a security group that allows all ingress SSH traffic in on port 22:

```hcl
resource "aws_security_group" "sg_ssh_allow_all" {
  name        = "sg_ssh_allow_all"
  description = "Allow SSH traffic"

  // Allow all ingress to port 22 from any SSH process on the internet.
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

2. **Create HTTP security group**: here is how to create a security group that allows all ingress HTTP traffic in on port 80 and any egress traffic from the instance to anywhere.

```hcl
resource "aws_security_group" "sg_http_allow_all" {
  name        = "sg_http_allow_all"
  description = "Allow HTTP traffic"

  // Allow all ingress to port 80 from any HTTP process on the internet.
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  // Allow all egress to any process on the internet.
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

3. Then to create an instance with security groups attached, we have to specify three important meta-arguments:
	- `instance_type`: the instance type of the EC2 instance 
	- `ami`: the image ID of the AMI to use
	- `vpc_security_group_ids`: the array of security groups to use and attach to the instance, referenced by their IDs


```hcl

resource "aws_instance" "web" {
  instance_type = "t2.micro"
  ami = "ami-61ad6e59d7b0" // ubuntu 26.04

  vpc_security_group_ids = [
    aws_security_group.sg_ssh_allow_all.id,
    aws_security_group.sg_http_allow_all.id
  ]

  tags = {
    Name = "HelloWorld"
  }
}

resource "aws_security_group" "sg_ssh_allow_all" {
  name        = "sg_ssh_allow_all"
  description = "Allow SSH traffic"

  // Allow all ingress to port 22 from any SSH process on the internet.
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "sg_http_allow_all" {
  name        = "sg_http_allow_all"
  description = "Allow HTTP traffic"

  // Allow all ingress to port 80 from any HTTP process on the internet.
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  // Allow all egress to any process on the internet.
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

#### Instance basics: add key pair

1. Create an SSH key pair locally, in a `keys` directory, call it something like `keys/ec2_instance_key`

```
ssh-keygen -t ed25519
```

2. Create the keypair resource, specify the path to the public key that was created, which should end in a `.pub` extension. 

```hcl
resource "aws_key_pair" "my_key" {
  key_name   = "my-key"
  public_key = file("keys/ec2_instance_key.pub")
}
```

3. specify that you want to use a key pair for the instance and reference the key pair name to use.

```hcl
resource "aws_instance" "web" {
  instance_type = "t2.micro"
  ami = var.ec2_instance_config.ami
  
  # specify which key pair to use
  key_name = aws_key_pair.my_key.key_name

  # need to allow SSH on port 22 from anywhere, else no point.
  vpc_security_group_ids = [
    aws_security_group.sg_ssh_allow_all.id,
  ]
}

resource "aws_security_group" "sg_ssh_allow_all" {
  name        = "sg_ssh_allow_all"
  description = "Allow SSH traffic"

  // Allow all ingress to port 22 from any SSH process on the internet.
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

4. You can then connect via public IP or public DNS via `ssh`, using the private key as the connection input file, and connecting as `root`.

```bash
ssh -i keys/ec2_instance_key root@ec2-172-17-0-3.localhost.localstack.cloud
```
#### Instance basics: outputs

```hcl
output "ec2_instance_id" {
   value = aws_instance.web.id
   description = "The ID of the EC2 instance"
 }

 output "ec2_instance_public_ip" {
   value = aws_instance.web.public_ip
   description = "The public IP address of the EC2 instance"
 }

 output "ec2_instance_private_ip" {
   value = aws_instance.web.private_ip
   description = "The private IP address of the EC2 instance"
 }

 output "ec2_instance_public_dns" {
   value = aws_instance.web.public_dns
   description = "The public DNS name of the EC2 instance"
 }
```

#### Instance basics: user data scripts + Cloud init scripts

A cloud-init script is a declarative YAML configuration script that automates the setup and initialization of a cloud server right after it’s created.

- A cloud-init script automates tasks like creating user groups and users with SSH access, updating the system, installing software such as the Apache web server and Python pip, and setting up a static website using MkDocs. 
- Essentially, it simplifies and automates the manual steps you’d normally perform on a Linux server, making your infrastructure setup faster, repeatable, and more efficient within your Terraform workflow on AWS.

Here is a cloud init YAML script that does two things:

1. Declare NGINX as one of the packages to be installed in the `packages` section
2. Use `systemctl` to enable and start NGINX in the background in the `runcmd` section:

```yaml title="script/cloudinit.yaml"
#cloud-config
packages:
  - nginx
runcmd:
  - systemctl start nginx
  - systemctl enable nginx
```

Now once your cloud init script is created, all you have to do to register it as a user data script for an instance is to use the `user_data` meta argument when creating an instance in Terraform and reference the filepath to the cloud init script:

```hcl
resource "aws_instance" "web" {
  instance_type = "t2.micro"
  ami           = var.ec2_instance_config.ami
  user_data     = file("script/cloudinit.yaml")
}
```

#### Instances + data blocks

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

#### ALB

1. Define the variables

```hcl
variable "ami" {
  description = "Amazon machine image to use for ec2 instance"
  type        = string
  default     = "ami-011899242bb902164" # Ubuntu 20.04 LTS // us-east-1
}

variable "instance_type" {
  description = "ec2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "domain" {
  description = "Domain for website"
  type        = string
}
```

2. Fetch the default VPC and default subnet via `data` blocks

```hcl
data "aws_vpc" "default_vpc" {
  default = true
}

data "aws_subnet_ids" "default_subnet" {
  vpc_id = data.aws_vpc.default_vpc.id
}
```

3. Create a security group that allows all ingress on port 8080

```hcl
resource "aws_security_group" "instances" {
  name = "instance-security-group"
}

resource "aws_security_group_rule" "allow_http_inbound" {
  type              = "ingress"
  security_group_id = aws_security_group.instances.id

  from_port   = 8080
  to_port     = 8080
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}
```

4. Create two EC2 instances that are basically copies of each other, and use the same security group:

```hcl
resource "aws_instance" "instance_1" {
  ami             = var.ami
  instance_type   = var.instance_type
  security_groups = [aws_security_group.instances.name]
  user_data       = <<-EOF
              #!/bin/bash
              echo "Hello, World 1" > index.html
              python3 -m http.server 8080 &
              EOF
}

resource "aws_instance" "instance_2" {
  ami             = var.ami
  instance_type   = var.instance_type
  security_groups = [aws_security_group.instances.name]
  user_data       = <<-EOF
              #!/bin/bash
              echo "Hello, World 2" > index.html
              python3 -m http.server 8080 &
              EOF
}
```

5. Create a target group for the load balancer and attach instances to it.

```hcl
resource "aws_lb_target_group" "instances" {
  name     = "example-target-group"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default_vpc.id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 15
    timeout             = 3
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

resource "aws_lb_target_group_attachment" "instance_1" {
  target_group_arn = aws_lb_target_group.instances.arn
  target_id        = aws_instance.instance_1.id
  port             = 8080
}

resource "aws_lb_target_group_attachment" "instance_2" {
  target_group_arn = aws_lb_target_group.instances.arn
  target_id        = aws_instance.instance_2.id
  port             = 8080
}
```

6. Create a security group for the load balancer that allows all ingress on port 80 and egress traffic to anywhere on the internet:

```hcl
resource "aws_security_group" "alb" {
  name = "alb-security-group"
  
  ingress {
	  from_port   = 80
	  to_port     = 80
	  protocol    = "tcp"
	  cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
	  from_port   = 0
	  to_port     = 0
	  protocol    = "-1"
	  cidr_blocks = ["0.0.0.0/0"]
  }
}
```

7. Create a load balancer and a listener component:

```hcl
resource "aws_lb" "load_balancer" {
  name               = "web-app-lb"
  load_balancer_type = "application"
  subnets            = data.aws_subnet_ids.default_subnet.ids
  security_groups    = [aws_security_group.alb.id]
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.load_balancer.arn

  port = 80

  protocol = "HTTP"

  # By default, return a simple 404 page
  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "404: page not found"
      status_code  = 404
    }
  }
}

resource "aws_lb_listener_rule" "instances" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  condition {
    path_pattern {
      values = ["*"]
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.instances.arn
  }
}
```

8. Add a DNS A record for a domain you own via route 53 to alias it to the load balancer DNS.

```hcl
resource "aws_route53_zone" "primary" {
  name = var.domain
}

resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = var.domain
  type    = "A"

  alias {
    name                   = aws_lb.load_balancer.dns_name
    zone_id                = aws_lb.load_balancer.zone_id
    evaluate_target_health = true
  }
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

### S3 Buckets

Here is a basic S3 bucket:

```hcl
resource "aws_s3_bucket" "bucket" {
  bucket        = "devops-directive-web-app-data"
  force_destroy = true
  versioning {
    enabled = true
  }
}
```

- `bucket`: **String**. the bucket name
- `force_destroy`: **Boolean**. Whether or not to force destroy the bucket when running `terraform destroy`.
- `versioning`
	- `enabled`: enables object versioning.


#### Server-side encryption

```hcl
resource "aws_s3_bucket" "bucket" {
  bucket        = "devops-directive-web-app-data"
  force_destroy = true
  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}
```

## Terraform modules

A Terraform module is a way to group related Terraform code into a single, logical unit that can be managed together.

Modules help you organize and reuse code, making it easier to manage complex infrastructure.

A module can use `variable` and `output` blocks, but the content of a module is encapsulated and works like a black box, so the only way you can access code from a module is through exposing `output` blocks on it.

Using a Terraform module for security groups simplifies your code by bundling complex configurations into reusable, manageable blocks. 

- Instead of manually defining every rule and detail, the module handles much of that for you, reducing errors and saving time. 
- Modules also make your infrastructure code cleaner and easier to maintain, and you can use pre-built, tested modules from the Terraform Registry, which helps ensure best practices and consistency in your setups.

### Example with security group module

Here are the steps where we use an official terraform module for security groups to make the process of creating a security group simpler:

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

2. Create a module that creates a security group with these rules:
	- **ingress**: allow ingress from any source IP to HTTPS port 443 and HTTP port 80
	- **egress**: allow all traffic from any process and port combo to all destinations.

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

### Organizing code with modules

When using Terraform modules and multiple environments, a good practice is to organize your code into separate directories within the same repository:  
  

- **Modules Directory:** Contains reusable Terraform code grouped logically (e.g., a module for your blog infrastructure). This keeps your infrastructure code modular and manageable.  
      
    
- **Environments Directory:** Contains subdirectories for each environment (like `dev`, `staging`, `prod`). Each environment directory holds configuration files and provider settings specific to that environment.  


  
This structure allows you to keep modules and environment-specific configurations side by side, making it easier to manage infrastructure without juggling multiple repositories or complex pull requests. 

It also helps Terraform understand which environment it’s working with by specifying the working directory accordingly.

Here’s a clear, step-by-step guide to modularizing your Terraform code based on the approach taught in the course:  
  

1. **Pull Out Configuration Values into Variables:**  
      
    
    - Start by moving hard-coded values from your main Terraform files (like `main.tf`) into a separate `variables.tf` file.
    - Define variables with types, defaults, and descriptions to make your code flexible and reusable.
    
      
    
2. **Create a Module Directory:**  
      
    
    - In your repo root, create a folder named `modules`.
    - Inside `modules`, create a subfolder for your module, e.g., `blog`.
    - Move your main Terraform files (`main.tf`, `variables.tf`, `outputs.tf`, etc.) into this module folder.
    
      
    
3. **Define Outputs in the Module:**  
      
    
    - Add an `outputs.tf` file in your module to expose useful information, like the DNS name of a load balancer.
    - Outputs let other parts of your Terraform code access values from the module.
    
      
    
4. **Create Environment Directories:**  
      
    
    - At the root level, create an `environments` folder.
    - Inside `environments`, create subfolders for each environment, e.g., `dev`, `staging`, `prod`.
    - Each environment folder will contain Terraform configuration files specific to that environment.
    
      
    
5. **Reference the Module in Environment Configurations:**  
      
    
    - In each environment folder, create a `main.tf` that calls your module using the `module` block.
    - Use the `source` attribute to point to your module path, e.g., `../../modules/blog`.
    - Pass any required variables to customize the module per environment.
    
      
    
6. **Organize Provider and Backend Configurations:**  
      
    
    - Keep provider settings (like AWS credentials) and backend configurations (state storage) in the environment folders.
    - This keeps environment-specific settings isolated.
    
      
    
7. **Manage Terraform State Carefully:**  
      
    - When moving resources into modules, use Terraform’s `moved` blocks to update the state file without recreating resources.

## Terraform with localstack
### Setup

1. Install the `tflocal` wrapper around the `terraform` CLI:

```bash
brew install terraform-local
```

2. In a `main.tf` file, override the AWS provider to point to localstack

```hcl
provider "aws" {
 access_key = "test"
 secret_key = "test"
 region = "us-east-1"
 skip_credentials_validation = true
 skip_metadata_api_check = true
 skip_requesting_account_id = true
 endpoints {
   sqs = "http://localhost:4566"
 }
}
```

3. Initialize and apply configuration:

```bash
tflocal init
tflocal plan
tflocal apply
```

### EC2

For EC2 instances in localstack, make sure you have these two gotchas covered:

1. **AWS EC2 endpoint is set to localstack endpoint**: make sure that the AWS EC2 endpoint is set to `localhost:4566`. 
2. **You are using Localstack-compatible AMI**: LocalStack comes shipped with two AMIs that are available for use. You can't use normal Amazon AMI IDs. 
	- Ubuntu 26.04: `ami-61ad6e59d7b0`
	- Amazon Linux 2023: `ami-024f768332f0`

Here is an example of all the provider and variable setup:

```hcl
variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

provider "aws" {
  access_key                  = "test"
  secret_key                  = "test"
  region                      = var.aws_region
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  endpoints {
    sqs                    = "http://localhost:4566"
    ec2                    = "http://localhost:4566"
    vpclattice             = "http://localhost:4566"
    account                = "http://localhost:4566"
    elasticloadbalancing   = "http://localhost:4566"
    elasticloadbalancingv2 = "http://localhost:4566"
    autoscaling            = "http://localhost:4566"
    applicationautoscaling = "http://localhost:4566"
    cloudwatch             = "http://localhost:4566"
  }
}

variable "aws_localstack_ami_ubuntu" {
  description = "The AMI ID for the localstack Ubuntu image"
  type        = string
  default     = "ami-61ad6e59d7b0" // localstack ubuntu AMI
}

variable "aws_localstack_ami_amazon_linux" {
  description = "The AMI ID for the localstack Amazon Linux image"
  type        = string
  default     = "ami-024f768332f0" // localstack amazon linux AMI
}

variable "ec2_instance_config" {
  type = object({
    instance_type = string
    ami           = string
    tags          = map(string)
  })

  description = "Configuration for the EC2 instance"

  default = {
    instance_type = "t2.micro"
    ami           =  "ami-61ad6e59d7b0"
    tags = {
      Name = "HelloWorld"
    }
  }
}
```

