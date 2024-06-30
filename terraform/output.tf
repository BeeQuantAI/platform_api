output "igw_id" {
  value = module.vpc.igw_id
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_1_id" {
  value = module.vpc.public_subnet_1_id
}

output "public_subnet_2_id" {
  value = module.vpc.public_subnet_2_id
}

output "public_route_table_id" {
  value = module.vpc.public_route_table_id
}

output "lb_security_group_id" {
  value = module.vpc.lb_security_group_id
}

output "ecs_security_group_id" {
  value = module.vpc.ecs_security_group_id
}


