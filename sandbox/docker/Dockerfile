# AI Agent Sandbox Container
FROM node:18-alpine

# Create non-root user for security
RUN addgroup -g 1001 sandbox && \
    adduser -D -u 1001 -G sandbox sandbox

# Set working directory
WORKDIR /app

# Install Python for text analysis agent
RUN apk add --no-cache python3 py3-pip

# Copy agent files
COPY --chown=sandbox:sandbox agents/ /app/

# Install Python dependencies
COPY --chown=sandbox:sandbox agents/text-analysis/requirements.txt /app/requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

# Make agent script executable
RUN chmod +x /app/agent.sh

# Switch to non-root user
USER sandbox

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD echo "Sandbox container is running"

# Default command
CMD ["tail", "-f", "/dev/null"]
