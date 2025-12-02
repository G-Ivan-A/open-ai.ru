#!/bin/bash

# Script to create GitHub Issues for MVP features
# Requires GitHub CLI to be installed and authenticated (gh auth login)

REPO="your-username/your-repo-name"  # Replace with your actual repository

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI is not installed. Please install it first."
    echo "See: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "You are not authenticated with GitHub CLI. Please run 'gh auth login' first."
    exit 1
fi

# Define MVP issues
issues=(
    "Setup project structure and basic configuration"
    "Implement user authentication system"
    "Create dashboard interface"
    "Develop data visualization components"
    "Build API endpoints for data access"
    "Implement basic search functionality"
    "Add user profile management"
    "Create notification system"
    "Implement data export features"
    "Add analytics and reporting tools"
)

# Create each issue
echo "Creating MVP issues in repository: $REPO"
for i in "${!issues[@]}"; do
    title="${issues[$i]}"
    body="MVP Feature #$(($i+1)): $title
This is an MVP feature that needs to be implemented for the minimum viable product.
Priority: P$(($i+1))"
    
    echo "Creating issue: $title"
    gh issue create --repo "$REPO" --title "$title" --body "$body" --label "MVP"
    
    if [ $? -ne 0 ]; then
        echo "Failed to create issue: $title"
    fi
done

echo "All MVP issues have been created!"