resource "aws_ecs_service" "my_service" {
  name            = "my-service"
  cluster         = aws_ecs_cluster.my_cluster.id
  task_definition = aws_ecs_task_definition.my_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets            = [module.vpc.public_subnet_1_id, module.vpc.public_subnet_2_id]
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ecs_tg.arn
    container_name   = "test1"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.front_end,
  # aws_autoscaling_group.ecs_asg
  ]
  
}
