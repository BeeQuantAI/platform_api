resource "aws_lb" "ecs_alb" {
  name               = "ecs-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]
  security_groups    = [aws_security_group.alb_sg.id]
}
resource "aws_security_group" "app_sg" {
  name        = "ecs-app-security-group"
  description = "Security group for ECS application"
  vpc_id      = aws_vpc.bqcore_vpc.id  # Ensure this is your correct VPC ID

  # Inbound rules: Allow specific inbound traffic (adjust ports and protocols based on your app's needs)
  ingress {
    from_port   = 3000  # Example port that your application uses
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Modify this if you want to restrict access to specific IP ranges
  }

  # Outbound rules: Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"  # -1 signifies all protocols
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ECS Application Security Group"
  }
}
resource "aws_security_group" "alb_sg" {
  name        = "alb-security-group"
  description = "Security group for the Application Load Balancer"
  vpc_id      = aws_vpc.bqcore_vpc.id  # Ensure this is the correct VPC ID from your setup

  # Inbound rules: Typically, allow HTTP and HTTPS traffic
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }


  # Outbound rules: Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ALB Security Group"
  }
}


resource "aws_lb_target_group" "ecs_tg" {
  name     = "ecs-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.bqcore_vpc.id
  target_type = "ip"

  health_check {
    enabled             = true
    interval            = 30
    path                = "/healthcheck"
    protocol            = "HTTP"
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }
}

resource "aws_lb_listener" "front_end" {
  load_balancer_arn = aws_lb.ecs_alb.arn
  port              = 3000
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ecs_tg.arn
  }
}
