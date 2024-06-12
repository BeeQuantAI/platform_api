# Create a custom DB parameter group
resource "aws_db_parameter_group" "bqcore_param_group" {
  name   = "bqcore-param-group"
  family = "postgres16"

  parameter {
    name  = "rds.force_ssl"
    value = "0"
  }
}

resource "aws_db_subnet_group" "bqcore_db_subnet_group" {
  name       = "bq-subnet-group"
  subnet_ids = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id,
                aws_subnet.public_subnet_1.id,aws_subnet.public_subnet_2.id,]

  tags = {
    Name = "My DB Subnet Group"
  }
}


# Create RDS Instance for PostgreSQL
resource "aws_db_instance" "bqcore_db2" {
  #identifier        = "bqcore"
  engine            = "postgres"
  engine_version    = "16.2"  # Specify your desired version
  instance_class    = "db.t3.micro"
  allocated_storage = 5
  storage_type      = "gp2"

  db_name = "bqCore"
  username = "postgres"
  password = "CORE_ADMIN"
  port     = 5432

  db_subnet_group_name     = aws_db_subnet_group.bqcore_db_subnet_group.name
  vpc_security_group_ids   = [aws_security_group.bqcore_sg.id]


  parameter_group_name = aws_db_parameter_group.bqcore_param_group.name

  publicly_accessible = true
  skip_final_snapshot = true
}


output "db_endpoint" {
  value = join(":", slice(split(":", aws_db_instance.bqcore_db2.endpoint), 0, 1))
}


#output "db_endpoint" {
 # value = aws_db_instance.bqcore_db2.endpoint
 # }

