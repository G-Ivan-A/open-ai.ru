#!/bin/sh

# Agent execution wrapper script
# Receives options as first argument and input via environment variable

set -e

OPTIONS="${1:-{}}"
INPUT_BASE64="${INPUT:-}"

# Decode input
if [ -n "$INPUT_BASE64" ]; then
    INPUT_TEXT=$(echo "$INPUT_BASE64" | base64 -d)
else
    INPUT_TEXT=""
fi

# Execute agent based on type
case "$AGENT_TYPE" in
    "text-analysis")
        echo "$INPUT_TEXT" | python3 /app/text-analysis/agent.py "$OPTIONS"
        ;;
    *)
        echo "{\"error\": \"Unknown agent type: $AGENT_TYPE\"}"
        exit 1
        ;;
esac
