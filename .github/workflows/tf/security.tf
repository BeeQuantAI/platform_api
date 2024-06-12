resource "aws_security_group" "bqcore_sg" {
  name        = "rds-sg"
  description = "Allow PostgreSQL traffic"
  vpc_id      = aws_vpc.bqcore_vpc.id

ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"  # -1 means all protocols
    cidr_blocks = ["0.0.0.0/0"]
  }


  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "RDS Security Group"
  }
}


resource "aws_security_group" "ecs_sg" {
  name        = "ecs_security_group"
  description = "Security group for ECS instances"
  vpc_id      = aws_vpc.bqcore_vpc.id # Replace with your VPC ID

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    security_groups = [aws_security_group.bqcore_sg.id]
   # cidr_blocks = ["0.0.0.0/0"]
  }


  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow outbound traffic to RDS"
  }
   tags = {
    Name = "ECS Security Group"
  }
}


resource "aws_security_group" "eks_node_sg" {
  name        = "eks-node-sg"
  description = "EKS Node security group"
  vpc_id      = aws_vpc.bqcore_vpc.id

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "eks-node-sg"
  }
}