variable "cluster_name" {
  description = "The name of the ECS cluster"
  type        = string
}

variable "service_name" {
  description = "The name of the ECS service"
  type        = string
}

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
