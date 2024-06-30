output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_1_id" {
  value = aws_subnet.public_subnet_1.id
}

output "public_subnet_2_id" {
  value = aws_subnet.public_subnet_2.id
}

output "lb_security_group_id" {
  value = aws_security_group.lb_sg.id
}

output "bqcore_security_group_id" {
  value = aws_security_group.bqcore_sg.id
}

output "ecs_security_group_id" {
  value = aws_security_group.ecs_sg.id
}
output "private_subnet_1_id" {
  value = aws_subnet.private_subnet_1.id
}

output "private_subnet_2_id" {
  value = aws_subnet.private_subnet_2.id
}



output "public_route_table_id" {
  value = aws_route_table.public_rt.id
}


output "igw_id" {
  value = aws_internet_gateway.igw.id
}
