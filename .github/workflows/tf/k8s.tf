provider "kubernetes" {

  host                   = data.aws_eks_cluster.my_cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.my_cluster.certificate_authority.0.data)
  token                  = data.aws_eks_cluster_auth.my_cluster.token
 # config_path = "~/.kube/config"
}

#data "aws_eks_cluster" "eks" {
 # name = "my-cluster"
#}

data "aws_eks_cluster" "my_cluster" {
  name = aws_eks_cluster.my_cluster.name
}

data "aws_eks_cluster_auth" "my_cluster" {
  name = aws_eks_cluster.my_cluster.name
}



resource "kubernetes_deployment" "my_deployment" {
  metadata {
    name = "my-deployment"
    namespace = "default"

  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "my-app"
      }
    }

    template {
      metadata {
        labels = {
          app = "my-app"
        }
      }

      spec {
        container {
          name  = "my-container"
          image = "904484189421.dkr.ecr.us-east-1.amazonaws.com/test1:34fb18e9330786c59000b84953aec99e87aad4e8"

          port {
            container_port = 80
          }

          env {
            name  = "DB_HOST"
            value = aws_db_instance.bqcore_db2.endpoint
          }

          env {
            name  = "DB_NAME"
            value = "bqCore"
          }

          env {
            name  = "DB_PORT"
            value = "5432"
          }

          env {
            name  = "DB_USERNAME"
            value = "postgres"
          }

          env {
            name  = "DB_PASSWORD"
            value = "CORE_ADMIN"
          }

          env {
            name  = "JWT_SECRET"
            value = "hello_beeQuant"
          }
        }
      }
    }
  }
}
