resource "aws_iam_role" "ecs_events" {
  name               = "${local.env}-ecs-events-${local.cluster_name}-scheduled-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_events_assume_role_policy.json
}

data "aws_iam_policy_document" "ecs_events_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "ecs_events" {
  name   = aws_iam_role.ecs_events.name
  policy = data.aws_iam_policy.ecs_events.policy
}

data "aws_iam_policy" "ecs_events" {
  arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceEventsRole"
}

resource "aws_iam_role_policy_attachment" "ecs_events" {
  role       = aws_iam_role.ecs_events.name
  policy_arn = aws_iam_policy.ecs_events.arn
}

resource "aws_iam_role" "ecs_task_execution" {
  name               = "${local.env}-task-execution-${local.cluster_name}-scheduled-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_assume_role_policy.json
}

data "aws_iam_policy_document" "ecs_task_execution_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "ecs_task_execution" {
  name   = aws_iam_role.ecs_task_execution.name
  policy = data.aws_iam_policy.ecs_task_execution.policy
}

data "aws_iam_policy" "ecs_task_execution" {
  arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = aws_iam_policy.ecs_task_execution.arn                                                                 
}

resource "aws_iam_role" "task_role" {
  name               = "${local.env}-snowball-${local.cluster_name}-scheduled-task"
  assume_role_policy = data.aws_iam_policy_document.task_assume_role_policy.json
}

data "aws_iam_policy_document" "task_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs.amazonaws.com","ecs-tasks.amazonaws.com"]
    }
  }

}

data "aws_iam_policy_document" "task_policy" {
  statement {
    sid    = "AllowDecrypt"
    effect = "Allow"
    actions = [
      "kms:Decrypt"
    ]
    resources = ["${data.aws_kms_key.kms_key.arn}"]
  }

   statement {
    sid    = "AllowAccessToSSM"
    effect = "Allow"
    actions = [
      "ssm:GetParameters"
    ]
    resources = [
      "${data.aws_ssm_parameter.dd_dog.arn}",
      "${data.aws_ssm_parameter.discord_key.arn}",
      "${data.aws_ssm_parameter.snowball_key.arn}"
    ]
  }
}

resource "aws_iam_policy" "policy" {
  name = "${local.env}-${local.cluster_name}-harvester-scheduled-task-policy"
  policy = data.aws_iam_policy_document.task_policy.json
}

resource "aws_iam_role_policy_attachment" "task" {
  role       = aws_iam_role.task_role.name
  policy_arn = aws_iam_policy.policy.arn
}
