  resource "aws_lb" "ecs_alb" {
    name               = "ecs-alb"
    internal           = false
    load_balancer_type = "application"
    security_groups    = [aws_security_group.alb_sg.id]
    subnets            = [module.vpc.public_subnet_1_id, module.vpc.public_subnet_2_id]
  }
  /*
   ingress {
      from_port   = 3000
      to_port     = 3000
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  */
  resource "aws_security_group" "alb_sg" {
    name        = "alb-security-group"
    description = "Security group for the Application Load Balancer"
    vpc_id   = module.vpc.vpc_id # Ensure this is the correct VPC ID from your setup
    
    # Inbound rules: Typically, allow HTTP and HTTPS traffic
    
    ingress {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
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
    port     = 80
    protocol = "HTTP"
    vpc_id   = module.vpc.vpc_id
    target_type = "ip"

    health_check {
      path                = "/healthcheck"
      protocol            = "HTTP"
      #port                = "3000"
      healthy_threshold   = 2
      unhealthy_threshold = 2
      timeout             = 5
      interval            = 30
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



  
  
