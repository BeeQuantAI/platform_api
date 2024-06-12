

output "kubeconfig" {
  value = <<EOT
apiVersion: v1
clusters:
- cluster:
    server: ${aws_eks_cluster.my_cluster.endpoint}
    certificate-authority-data: ${base64encode(aws_eks_cluster.my_cluster.certificate_authority.0.data)}
  name: kubernetes
contexts:
- context:
    cluster: kubernetes
    user: aws
  name: aws
current-context: aws
kind: Config
preferences: {}
users:
- name: aws
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1beta1
      command: aws
      args:
        - eks
        - get-token
        - --cluster-name
        - ${aws_eks_cluster.my_cluster.name}
EOT
  sensitive = true
}
