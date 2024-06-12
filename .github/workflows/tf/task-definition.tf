resource "aws_ecs_task_definition" "my_task" {
  family                   = "my-vpc"
  network_mode             = "awsvpc"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn      = aws_iam_role.ecs_task_execution_role.arn

  cpu                      = "1024"
  memory                   = "3072"
  requires_compatibilities = ["FARGATE"]
  runtime_platform {
    cpu_architecture      = "X86_64"
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([
    {
      name           = "test1"
      image          = "904484189421.dkr.ecr.us-east-1.amazonaws.com/test1:34fb18e9330786c59000b84953aec99e87aad4e8"
      cpu            = 0
      essential      = true
      portMappings = [
        {
          containerPort = 3000 
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "DB_NAME", value = "bqCore" },
        { name = "DB_USERNAME", value = "postgres" },
        { name = "DB_HOST",value = join("", slice(split(":", aws_db_instance.bqcore_db2.endpoint), 0, 1))},  // Reference the RDS endpoint directly
        { name = "DB_PORT", value = "5432" },
        { name = "DB_PASSWORD", value = "CORE_ADMIN" },
        { name = "JWT_SECRET", value = "hello_beeQuant"}
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-create-group"   = "true"
          "awslogs-group"          = "/ecs/tf-version"
          "awslogs-region"         = "us-east-1"
          "awslogs-stream-prefix"  = "ecs"
        }
      }
    }
  ])
}
