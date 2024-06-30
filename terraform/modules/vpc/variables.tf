
variable "max_capacity" {
  description = "The maximum capacity for the autoscaling target"
  type        = number
  default     = 10
}

variable "min_capacity" {
  description = "The minimum capacity for the autoscaling target"
  type        = number
  default     = 1
}

variable "vpc_cidr" {
  description = "The CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_1_cidr" {
  description = "The CIDR block for the first public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "public_subnet_2_cidr" {
  description = "The CIDR block for the second public subnet"
  type        = string
  default     = "10.0.2.0/24"
}
variable "private_subnet_1_cidr" {
  description = "The CIDR block for the first private subnet"
  type        = string
}

variable "private_subnet_2_cidr" {
  description = "The CIDR block for the second private subnet"
  type        = string
}