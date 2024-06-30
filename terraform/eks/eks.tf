
resource "aws_eks_cluster" "my_cluster" {
  name     = "my-cluster"
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids = [module.vpc.private_subnet_1_id, module.vpc.private_subnet_2_id]
   # security_group_ids = [aws_security_group.eks_node_sg.id]
    security_group_ids = [module.vpc.ecs_security_group_id]
  }
  #depends_on = [ aws_iam_role.eks-node-role ]
}

resource "aws_eks_node_group" "my_node_group" {
  cluster_name    = aws_eks_cluster.my_cluster.name
  node_group_name = "my-node-group"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      =[module.vpc.private_subnet_1_id, module.vpc.private_subnet_2_id]

  scaling_config {
    desired_size = 2
    max_size     = 3
    min_size     = 1
  }
  #depends_on = [ aws_iam_role.eks-node-role ]

  instance_types = ["t3.medium"]
}

output "cluster_endpoint" {
  value = aws_eks_cluster.my_cluster.endpoint
}

output "cluster_name" {
  value = aws_eks_cluster.my_cluster.name
}
