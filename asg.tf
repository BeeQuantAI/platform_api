

data "aws_ami" "latest_amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_iam_role" "ecs_instance_role" {
  name = "ecsInstanceRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = {
        Service = "ec2.amazonaws.com"
      },
      Action    = "sts:AssumeRole"
    }]
  })
}


resource "aws_iam_role_policy_attachment" "ecs_instance_role_policy" {
  role       = aws_iam_role.ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "ecsInstanceProfile"
  role = aws_iam_role.ecs_instance_role.name
}


resource "aws_launch_configuration" "ecs_launch_configuration" {
  name          = "ecs-launch-configuration"
  image_id      = data.aws_ami.latest_amazon_linux.id
  instance_type = "t2.micro"
  iam_instance_profile = aws_iam_instance_profile.ecs_instance_profile.name
  security_groups = [aws_security_group.ecs_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              echo ECS_CLUSTER=${aws_ecs_cluster.my_cluster.name} >> /etc/ecs/ecs.config
              EOF

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "ecs_asg" {
  desired_capacity     = 2
  max_size             = 5  
  min_size             = 1
  vpc_zone_identifier  =[module.vpc.private_subnet_1_id, module.vpc.private_subnet_2_id]
  launch_configuration = aws_launch_configuration.ecs_launch_configuration.id

}
