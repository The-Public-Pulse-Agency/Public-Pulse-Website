#!/usr/bin/env bash
# One-time setup of the GitHub Actions OIDC trust into AWS for THIS repo.
#
#   bash scripts/setup-oidc.sh
#
# Idempotent: re-running just refreshes the trust policy and role permissions.
# Requires the calling AWS profile to have IAM rights (AdministratorAccess works;
# narrower works too — needs CreateOpenIDConnectProvider, CreateRole, PutRolePolicy).
#
# Result: one role
#   GitHubActionsDeployRole-PublicPulseWebsite
# trusted to be assumed ONLY by GitHub Actions runs of THIS repo that use the
# "production" GitHub Environment — which is gated by required-reviewer
# protection (see .github/workflows/deploy.yml).
#
# There is no staging stage and no automatic branch-push deploy path. The
# `verify` job in the workflow runs typecheck+build on every push/PR but has
# NO AWS access (no role assumption), so it doesn't need a trust subject.
#
# After this runs, copy the printed ARN into the repo settings:
#   Repo → Settings → Secrets and variables → Actions → Variables
#   New variable:  AWS_DEPLOY_ROLE_ARN  =  <printed ARN>

set -euo pipefail

PROFILE="${AWS_PROFILE:-eventpulse}"
REPO="The-Public-Pulse-Agency/Public-Pulse-Website"
ROLE_NAME="GitHubActionsDeployRole-PublicPulseWebsite"
POLICY_NAME="sst-deploy-policy"
APP_NAME="publicpulse-website"
PROVIDER_HOST="token.actions.githubusercontent.com"

die() { echo "❌ $*" >&2; exit 1; }
info() { printf "\n▸ %s\n" "$*"; }
ok() { printf "  ✓ %s\n" "$*"; }

aws sts get-caller-identity --profile "$PROFILE" >/dev/null \
  || die "AWS profile '$PROFILE' not configured."

ACCOUNT=$(aws sts get-caller-identity --profile "$PROFILE" --query Account --output text)
PROVIDER_ARN="arn:aws:iam::$ACCOUNT:oidc-provider/$PROVIDER_HOST"
ROLE_ARN="arn:aws:iam::$ACCOUNT:role/$ROLE_NAME"

info "Account: $ACCOUNT"
info "Repo:    $REPO"

# ─── 1. OIDC provider ───────────────────────────────────────────────────

info "Ensuring GitHub OIDC provider exists"
if aws iam get-open-id-connect-provider \
  --open-id-connect-provider-arn "$PROVIDER_ARN" \
  --profile "$PROFILE" >/dev/null 2>&1; then
  ok "OIDC provider already exists"
else
  # AWS verifies GitHub OIDC JWTs against GitHub's published JWKS — the
  # thumbprint field is required by the API but ignored for the major
  # well-known providers since 2023. A 40-char placeholder is accepted.
  aws iam create-open-id-connect-provider \
    --url "https://$PROVIDER_HOST" \
    --client-id-list "sts.amazonaws.com" \
    --thumbprint-list "ffffffffffffffffffffffffffffffffffffffff" \
    --profile "$PROFILE" >/dev/null
  ok "OIDC provider created"
fi

# ─── 2. Trust policy ────────────────────────────────────────────────────

info "Writing trust policy (scoped to $REPO)"
TRUST_FILE="$(mktemp)"
cat > "$TRUST_FILE" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "$PROVIDER_ARN" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "$PROVIDER_HOST:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "$PROVIDER_HOST:sub": [
          "repo:$REPO:environment:production"
        ]
      }
    }
  }]
}
EOF
ok "Trust policy ready"

# ─── 3. Role ────────────────────────────────────────────────────────────

info "Ensuring role $ROLE_NAME"
if aws iam get-role --role-name "$ROLE_NAME" --profile "$PROFILE" >/dev/null 2>&1; then
  aws iam update-assume-role-policy --role-name "$ROLE_NAME" \
    --policy-document "file://$TRUST_FILE" --profile "$PROFILE"
  ok "Trust policy refreshed"
else
  aws iam create-role --role-name "$ROLE_NAME" \
    --assume-role-policy-document "file://$TRUST_FILE" \
    --description "GitHub Actions deploy role for $REPO (publicpulse.com.bd)" \
    --profile "$PROFILE" >/dev/null
  ok "Role created"
fi

# ─── 4. Permissions ─────────────────────────────────────────────────────
# SST/OpenNext-shaped policy. Broad enough for the construct to operate,
# but app SSM parameters are scoped to THIS app's path only. Things to
# tighten later: limit CloudFormation/Lambda/S3/CloudFront/IAM actions to
# resources tagged sst:app=publicpulse-website.

info "Writing deploy permissions policy"
POLICY_FILE="$(mktemp)"
cat > "$POLICY_FILE" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SstOperational",
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "s3:*",
        "lambda:*",
        "cloudfront:*",
        "logs:*",
        "events:*",
        "scheduler:*",
        "apigateway:*",
        "dynamodb:*",
        "sqs:*",
        "sns:*",
        "route53:GetHostedZone",
        "route53:ListHostedZones",
        "route53:ChangeResourceRecordSets",
        "route53:GetChange",
        "route53:ListResourceRecordSets",
        "acm:RequestCertificate",
        "acm:DescribeCertificate",
        "acm:ListCertificates",
        "acm:DeleteCertificate",
        "acm:AddTagsToCertificate",
        "ses:SendEmail",
        "ses:SendRawEmail",
        "ses:GetSendQuota",
        "ses:GetIdentityVerificationAttributes",
        "ses:ListIdentities",
        "budgets:ViewBudget",
        "budgets:ModifyBudget",
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IamForSstManagedRoles",
      "Effect": "Allow",
      "Action": [
        "iam:GetRole",
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:PassRole",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:GetRolePolicy",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:ListAttachedRolePolicies",
        "iam:ListRolePolicies",
        "iam:UpdateAssumeRolePolicy",
        "iam:TagRole",
        "iam:UntagRole",
        "iam:CreateServiceLinkedRole"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AppSecrets",
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath",
        "ssm:PutParameter",
        "ssm:DeleteParameter",
        "ssm:DescribeParameters",
        "ssm:AddTagsToResource"
      ],
      "Resource": "arn:aws:ssm:*:$ACCOUNT:parameter/sst/$APP_NAME/*"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "$POLICY_NAME" \
  --policy-document "file://$POLICY_FILE" \
  --profile "$PROFILE"
ok "Inline policy '$POLICY_NAME' attached"

# ─── 5. Output ──────────────────────────────────────────────────────────

cat <<EOF

═══════════════════════════════════════════════════════════════════
  OIDC SETUP COMPLETE
═══════════════════════════════════════════════════════════════════

Role ARN:
  $ROLE_ARN

Action required — add this as a repository VARIABLE (not secret) on GitHub:
  Repo → Settings → Secrets and variables → Actions → Variables → New
  Name:  AWS_DEPLOY_ROLE_ARN
  Value: $ROLE_ARN

Then also set up the GitHub Environment for production gating:
  Repo → Settings → Environments → New environment
  Name: production
  → Add "Required reviewers" → add yourself (or any teammate)

Trust policy summary:
  ✓ workflow uses "environment: production" (gated by required reviewer) → role can be assumed
  ✗ branch pushes, PRs, fork PRs, any other ref → denied
  (The verify job runs typecheck+build with no AWS access — no trust needed.)

═══════════════════════════════════════════════════════════════════
EOF
