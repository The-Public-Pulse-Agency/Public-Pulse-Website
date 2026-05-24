#!/bin/bash
# Local preview server for publicpulse.com.bd
# Serves the site at http://localhost:8080
set -e
cd "$(dirname "$0")/site"
PORT="${PORT:-8080}"
echo "Serving publicpulse.com.bd at http://localhost:${PORT}"
echo "Press Ctrl+C to stop."
python3 -m http.server "${PORT}"
