#!/bin/bash

# Test script for API endpoints
# Usage: ./test-api.sh

API_URL="http://localhost:3001/api"

echo "Testing Open-AI.ru API"
echo "====================="

# Health check
echo -e "\n1. Health Check"
curl -s $API_URL/../health | jq '.'

# Register a test user
echo -e "\n2. Register Test User"
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "SME",
    "bio": "Test bio"
  }')

echo $REGISTER_RESPONSE | jq '.'
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token')
USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.user.id')

echo "Token: $TOKEN"
echo "User ID: $USER_ID"

# Login
echo -e "\n3. Login"
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo $LOGIN_RESPONSE | jq '.'

# Get current user
echo -e "\n4. Get Current User"
curl -s $API_URL/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Update profile
echo -e "\n5. Update Profile"
curl -s -X PUT $API_URL/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio",
    "companyName": "Test Company"
  }' | jq '.'

# Get profile by ID
echo -e "\n6. Get Profile by ID"
curl -s $API_URL/users/profile/$USER_ID | jq '.'

# Create application
echo -e "\n7. Create Application"
APPLICATION_RESPONSE=$(curl -s -X POST $API_URL/applications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactName": "Test User",
    "contactEmail": "test@example.com",
    "businessDescription": "We are a manufacturing company looking to automate our inventory management process using AI and machine learning technologies.",
    "industry": "Manufacturing",
    "automationGoal": "We want to implement an AI-powered inventory management system that can predict demand and optimize stock levels automatically.",
    "targetProcess": "Our current manual inventory tracking process that involves spreadsheets and weekly physical counts needs to be automated.",
    "urgency": "HIGH"
  }')

echo $APPLICATION_RESPONSE | jq '.'
APPLICATION_ID=$(echo $APPLICATION_RESPONSE | jq -r '.data.id')

# Get my applications
echo -e "\n8. Get My Applications"
curl -s "$API_URL/applications/my" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Get specific application
echo -e "\n9. Get Application by ID"
curl -s "$API_URL/applications/$APPLICATION_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n\nAPI Tests Complete!"
