


## Why terraform

Choosing Terraform over cloud provider-specific tools like AWS CloudFormation or Azure ARM templates offers several advantages:  
  

- **Multi-cloud support:** Terraform works across all major cloud providers, allowing you to manage infrastructure in a consistent way regardless of the cloud platform.
- **Community and module ecosystem:** It has a large community contributing to a public registry of modules, which helps you quickly use and customize infrastructure components.
- **Feature parity and updates:** Terraform support for cloud features is generally as current as the cloud providers' own tools, sometimes even quicker due to community contributions.
- **Flexibility in state management:** You can store Terraform's infrastructure state in various secure and version-controlled locations, giving you control over your environment.

## Terraform basics

### Learning to create resources
  

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

  

### First EC2 instance

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