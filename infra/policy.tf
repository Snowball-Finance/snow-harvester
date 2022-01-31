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

data "aws_iam_policy_document" "task_ssm_access" {
  statement {
    actions = [ "kms:Decrypt" ]
    resources = [ "${data.aws_kms_key.kms_key.arn}" ] 
  }
  statement {
    actions = [ "ssm:GetParameters" ]
    resources = [
      "${data.aws_ssm_parameter.dd_dog.arn}",
      "${data.aws_ssm_parameter.snowball_key.arn}",
      "${data.aws_ssm_parameter.discord_key.arn}"
    ]
  }
}

resource "aws_iam_policy" "task_ssm_access" {
  name = "${local.env}-${local.cluster_name}-ssm-access-policy"
  policy = data.aws_iam_policy_document.task_ssm_access.json
}

resource "aws_iam_role_policy_attachment" "attach_ssm_access" {
  role = aws_iam_role.task_role.name
  policy_arn = aws_iam_policy.task_ssm_access.arn
}


resource "aws_iam_policy" "ssm_access" {
  name = "${local.env}-${local.cluster_name}-ssm-access-policy"
  policy = data.aws_iam_policy_document.task_ssm_access.json
}

resource "aws_iam_role_policy_attachment" "task_ssm_access" {
  role       = aws_iam_role.task_role.name
  policy_arn = aws_iam_policy.ssm_access.arn
}

data "aws_iam_policy_document" "sns_topic_policy" {
  statement {
    sid = "SNSFullAccess"
    actions = [
      "sns:*",
    ]
    effect = "Allow"
    resources = [
     "*",
    ]
  }
}

resource "aws_iam_policy" "sns" {
  name = "${local.env}-${local.cluster_name}-sns-policy"
  policy = data.aws_iam_policy_document.sns_topic_policy.json
}

resource "aws_iam_role_policy_attachment" "task_to_sns" {
  role       = aws_iam_role.task_role.name
  policy_arn = aws_iam_policy.sns.arn
}
