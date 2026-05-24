#!/bin/bash
# Pull the live site from S3 into ./site (one-way mirror).
# Use this to refresh local copy if site was changed outside this folder.
set -euo pipefail

BUCKET="publicpulse.com.bd"
REGION="ap-southeast-1"
PROFILE="eventpulse"
DEST_DIR="$(dirname "$0")/site"

echo "Pulling s3://${BUCKET}/ -> ${DEST_DIR}/ ..."
aws s3 sync "s3://${BUCKET}/" "${DEST_DIR}/" \
  --profile "${PROFILE}" \
  --region "${REGION}" \
  --delete
echo "Done."
