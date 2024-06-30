resource "aws_appautoscaling_target" "my_service" {
  max_capacity       = 10
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.my_cluster.name}/${aws_ecs_service.my_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "scale_out" {
  name                    = "scale_down"
  policy_type             = "StepScaling"
  resource_id         = aws_appautoscaling_target.my_service.id
  scalable_dimension = aws_appautoscaling_target.my_service.scalable_dimension
  service_namespace  = aws_appautoscaling_target.my_service.service_namespace

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"
    

    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = -1
    }
  }
}

resource "aws_appautoscaling_policy" "scale_in" {
  name                    = "scale_in_policy"
  policy_type             = "StepScaling"
  resource_id             = aws_appautoscaling_target.my_service.resource_id
  scalable_dimension      = aws_appautoscaling_target.my_service.scalable_dimension
  service_namespace       = aws_appautoscaling_target.my_service.service_namespace
  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Average"
    step_adjustment {
      scaling_adjustment = -1
      metric_interval_upper_bound = 0
    }
  }
}

# CloudWatch 指标报警
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name                = "cpu_high"
  comparison_operator       = "GreaterThanThreshold"
  evaluation_periods        = "2"
  metric_name               = "CPUUtilization"
  namespace                 = "AWS/ECS"
  period                    = "60"
  statistic                 = "Average"
  threshold                 = "75"
  alarm_actions             = [
    aws_appautoscaling_policy.scale_out.arn,
    aws_sns_topic.alarm_topic.arn
  ]
  dimensions = {
    ClusterName     = aws_ecs_cluster.my_cluster.name
    ServiceName     = aws_ecs_service.my_service.name
  }
}

resource "aws_cloudwatch_metric_alarm" "cpu_low" {
  alarm_name                = "cpu_low"
  comparison_operator       = "LessThanThreshold"
  evaluation_periods        = "2"
  metric_name               = "CPUUtilization"
  namespace                 = "AWS/ECS"
  period                    = "60"
  statistic                 = "Average"
  threshold                 = "25"
  alarm_actions             = [
    aws_appautoscaling_policy.scale_in.arn,
    aws_sns_topic.alarm_topic.arn
  ]
  dimensions = {
    ClusterName     = aws_ecs_cluster.my_cluster.name
    ServiceName     = aws_ecs_service.my_service.name
  } 
}

resource "aws_cloudwatch_metric_alarm" "memory_high" {
  alarm_name                = "memory_high"
  comparison_operator       = "GreaterThanThreshold"
  evaluation_periods        = "2"
  metric_name               = "MemoryUtilization"
  namespace                 = "AWS/ECS"
  period                    = "60"
  statistic                 = "Average"
  threshold                 = "75"
  alarm_actions             = [
    aws_appautoscaling_policy.scale_out.arn,
    aws_sns_topic.alarm_topic.arn
  ]
  dimensions = {
    ClusterName     = aws_ecs_cluster.my_cluster.name
    ServiceName     = aws_ecs_service.my_service.name
  }

}

resource "aws_cloudwatch_metric_alarm" "memory_low" {
  alarm_name                = "memory_low"
  comparison_operator       = "LessThanThreshold"
  evaluation_periods        = "2"
  metric_name               = "MemoryUtilization"
  namespace                 = "AWS/ECS"
  period                    = "60"
  statistic                 = "Average"
  threshold                 = "25"
  alarm_actions             = [
    aws_appautoscaling_policy.scale_in.arn,
    aws_sns_topic.alarm_topic.arn
  ]
  dimensions = {
    ClusterName     = aws_ecs_cluster.my_cluster.name
    ServiceName     = aws_ecs_service.my_service.name
  }
}


resource "aws_sns_topic" "alarm_topic" {
  name = "alarm-topic"
}

resource "aws_sns_topic_subscription" "email_subscription" {
  topic_arn = aws_sns_topic.alarm_topic.arn
  protocol  = "email"
  endpoint  = "aaulli41@gmail.com"  
}