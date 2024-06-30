resource "aws_lb" "eks_alb" {
    name               = "eks-alb"
    internal           = false
    load_balancer_type = "application"
    subnets            =[module.vpc.public_subnet_1_id, module.vpc.public_subnet_2_id]
    security_groups    = [module.vpc.lb_security_group_id]
  
}
resource "aws_lb_listener" "http_listener" {
    load_balancer_arn = aws_lb.eks_alb.arn
    port              = 3000
    protocol          = "HTTP"

    default_action {
      type             = "forward"
      target_group_arn = aws_lb_target_group.eks_tg.arn
    }
  }


resource "aws_lb_target_group" "eks_tg" {
    name     = "eks-tg"
    port     = 80
    protocol = "HTTP"
    vpc_id   = module.vpc.vpc_id
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
