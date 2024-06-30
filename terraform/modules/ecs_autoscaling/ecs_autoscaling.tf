resource "aws_appautoscaling_target" "my_service" {
  max_capacity       = var.max_capacity
  min_capacity       = var.min_capacity
  resource_id        = "service/${var.cluster_name}/${var.service_name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "scale_out" {
  name                    = "scale_out"
  policy_type             = "StepScaling"
  resource_id             = aws_appautoscaling_target.my_service.resource_id
  scalable_dimension      = aws_appautoscaling_target.my_service.scalable_dimension
  service_namespace       = aws_appautoscaling_target.my_service.service_namespace

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = 1
    }
  }
}

resource "aws_appautoscaling_policy" "scale_in" {
  name                    = "scale_in"
  policy_type             = "StepScaling"
  resource_id             = aws_appautoscaling_target.my_service.resource_id
  scalable_dimension      = aws_appautoscaling_target.my_service.scalable_dimension
  service_namespace       = aws_appautoscaling_target.my_service.service_namespace

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Average"

    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = -1
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name                = "cpu_high"
  comparison_operator       = "GreaterThanThreshold"
  evaluation_periods        = "2"
  metric_name               = "CPUUtilization"
  namespace                 = "AWS/ECS"
  period                    = "60"
  statistic                 = "Average"
  threshold                 = "75"
  alarm_actions             = [aws_appautoscaling_policy.scale_out.arn]
  dimensions = {
    ClusterName     = var.cluster_name
    ServiceName     = var.service_name
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
  alarm_actions             = [aws_appautoscaling_policy.scale_in.arn]
  dimensions = {
    ClusterName     = var.cluster_name
    ServiceName     = var.service_name
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
  alarm_actions             = [aws_appautoscaling_policy.scale_out.arn]
  dimensions = {
    ClusterName     = var.cluster_name
    ServiceName     = var.service_name
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
  alarm_actions             = [aws_appautoscaling_policy.scale_in.arn]
  dimensions = {
    ClusterName     = var.cluster_name
    ServiceName     = var.service_name
  } 
}
