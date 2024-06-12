resource "aws_ecr_repository" "test1" {
  name                 = "test1"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}