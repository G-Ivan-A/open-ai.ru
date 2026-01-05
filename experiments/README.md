# Experiments Folder

This folder contains experimental scripts and test utilities for the Open-AI.ru project.

## Available Scripts

### test-api.sh
Test script that validates API endpoints functionality.

**Prerequisites:**
- Backend server running on http://localhost:3001
- `jq` installed for JSON formatting
- `curl` for HTTP requests

**Usage:**
```bash
./test-api.sh
```

**What it tests:**
1. Health check endpoint
2. User registration
3. User login
4. Get current user
5. Update user profile
6. Get profile by ID
7. Create application
8. Get user's applications
9. Get specific application

## Running Experiments

Make sure the backend is running before executing any scripts:

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Run experiment
cd experiments
./test-api.sh
```

## Adding New Experiments

When creating new experiment scripts:
1. Add clear comments explaining what the script does
2. Include usage instructions
3. Make scripts executable: `chmod +x your-script.sh`
4. Update this README with script description
