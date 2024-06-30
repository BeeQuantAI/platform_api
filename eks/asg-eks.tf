data "aws_autoscaling_groups" "eks_node_asgs" {
  filter {
    name   = "tag:eks:cluster-name"
    values = [aws_eks_cluster.my_cluster.name]
  }
  filter {
    name   = "tag:kubernetes.io/cluster/${aws_eks_cluster.my_cluster.name}"
    values = ["owned"]
  }
}

locals {
  eks_node_asg_name = length(data.aws_autoscaling_groups.eks_node_asgs.names) > 0 ? data.aws_autoscaling_groups.eks_node_asgs.names[0] : ""
}


resource "aws_cloudwatch_metric_alarm" "cpu_high_utilization" {
  alarm_name                = "eks-high-cpu-utilization"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = "2"
  metric_name               = "CPUUtilization"
  namespace                 = "AWS/EKS"
  period                    = "300"
  statistic                 = "Average"
  threshold                 = "75"
  alarm_actions             = [aws_sns_topic.alarm_topic.arn]
  dimensions = {
    ClusterName = aws_eks_cluster.my_cluster.name
  }
}

resource "aws_cloudwatch_metric_alarm" "cpu_low_utilization" {
  alarm_name                = "eks-low-cpu-utilization"
  comparison_operator       = "LessThanOrEqualToThreshold"
  evaluation_periods        = "2"
  metric_name               = "CPUUtilization"
  namespace                 = "AWS/EKS"
  period                    = "300"
  statistic                 = "Average"
  threshold                 = "25"
  alarm_actions             = [aws_sns_topic.alarm_topic.arn]
  dimensions = {
    ClusterName = aws_eks_cluster.my_cluster.name
  }
}

resource "aws_cloudwatch_metric_alarm" "memory_high_utilization" {
  alarm_name                = "eks-high-memory-utilization"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = "2"
  metric_name               = "mem_used_percent"
  namespace                 = "CWAgent"
  period                    = "300"
  statistic                 = "Average"
  threshold                 = "75"
  alarm_actions             = [aws_sns_topic.alarm_topic.arn]
  dimensions = {
    ClusterName = aws_eks_cluster.my_cluster.name
  }
}

resource "aws_cloudwatch_metric_alarm" "memory_low_utilization" {
  alarm_name                = "eks-low-memory-utilization"
  comparison_operator       = "LessThanOrEqualToThreshold"
  evaluation_periods        = "2"
  metric_name               = "mem_used_percent"
  namespace                 = "CWAgent"
  period                    = "300"
  statistic                 = "Average"
  threshold                 = "25"
  alarm_actions             = [aws_sns_topic.alarm_topic.arn]
  dimensions = {
    ClusterName = aws_eks_cluster.my_cluster.name
  }
}

resource "aws_autoscaling_policy" "scale_out" {
  name                   = "scale-out"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = local.eks_node_asg_name
}
resource "aws_autoscaling_policy" "scale_in" {
  name                   = "scale-in"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = local.eks_node_asg_name
}