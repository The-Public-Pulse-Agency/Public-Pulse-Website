#!/bin/bash
# Deploy publicpulse.com.bd to S3 and invalidate CloudFront cache.
# Usage: ./deploy.sh [--dry-run]
set -euo pipefail

BUCKET="publicpulse.com.bd"
REGION="ap-southeast-1"
DISTRIBUTION_ID="EFMM4G8ZO6TJX"
PROFILE="eventpulse"
SRC_DIR="$(dirname "$0")/site"

DRY=""
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY="--dryrun"
  echo "DRY RUN — no changes will be made."
fi

echo "Syncing ${SRC_DIR}/ -> s3://${BUCKET}/ ..."
aws s3 sync "${SRC_DIR}/" "s3://${BUCKET}/" \
  --profile "${PROFILE}" \
  --region "${REGION}" \
  --delete \
  ${DRY}

if [[ -z "${DRY}" ]]; then
  echo "Invalidating CloudFront distribution ${DISTRIBUTION_ID} ..."
  aws cloudfront create-invalidation \
    --distribution-id "${DISTRIBUTION_ID}" \
    --paths "/*" \
    --profile "${PROFILE}" \
    --query 'Invalidation.{Id:Id,Status:Status}' \
    --output table
  echo "Done. Live at https://publicpulse.com.bd/ (CDN propagation 1-5 min)."
else
  echo "Dry run complete. Re-run without --dry-run to publish."
fi
