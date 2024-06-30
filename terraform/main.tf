terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      // Ensure the version is valid and compatible
    }
    

  }
}

provider "aws" {
  region     = "us-east-1"
  access_key = "AKIA5FF3VOTWYBRJ4H7Y"
  secret_key = "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"
}



module "vpc" {
  source               = "./modules/vpc"
  vpc_cidr             = "10.0.0.0/16"
  public_subnet_1_cidr = "10.0.1.0/24"
  public_subnet_2_cidr = "10.0.2.0/24"
  private_subnet_1_cidr = "10.0.3.0/24"
  private_subnet_2_cidr = "10.0.4.0/24"
}

module "ecs_autoscaling" {
  source        = "./modules/ecs_autoscaling"
  cluster_name  =   aws_ecs_cluster.my_cluster.name
  service_name  =   aws_ecs_service.my_service.name
  max_capacity  = 10
  min_capacity  = 1
}

resource "aws_ecs_cluster" "my_cluster" {
  name = "my-cluster"
}

