# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "STARTUP|SPECIALIST|SME|ADMIN",
  "expertise": ["AI", "Automation"],  // optional
  "bio": "About me"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token"
  }
}
```

#### POST /auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token"
  }
}
```

#### GET /auth/me
Get current user profile (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": { /* user object with profile */ }
}
```

### User Profile

#### GET /users/profile/:id
Get user profile by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "SPECIALIST",
    "reputationPoints": 150,
    "bio": "About me",
    "expertise": ["AI", "Automation"],
    "profile": { /* extended profile data */ }
  }
}
```

#### PUT /users/profile
Update current user profile (requires authentication).

**Request Body:**
```json
{
  "name": "John Doe",
  "bio": "Updated bio",
  "expertise": ["AI", "ML", "Automation"],
  "companyName": "AI Startup Inc",
  "website": "https://example.com",
  "yearsExperience": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated user object */ },
  "message": "Profile updated successfully"
}
```

#### GET /users/role/:role
Get users by role (e.g., SPECIALIST, STARTUP, SME).

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response:**
```json
{
  "success": true,
  "data": [ /* array of users */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### GET /users/:id/reputation
Get user reputation history.

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "points": 10,
      "reason": "Completed project successfully",
      "sourceType": "project_completion",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

#### GET /users/leaderboard
Get reputation leaderboard.

**Query Parameters:**
- `role` (optional, filter by role)
- `limit` (optional, default: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "role": "SPECIALIST",
      "reputationPoints": 500
    }
  ]
}
```

### Applications

#### POST /applications
Create new application (requires authentication).

**Request Body:**
```json
{
  "contactName": "John Doe",
  "contactEmail": "john@example.com",
  "contactPhone": "+7 999 123-45-67",  // optional
  "businessDescription": "Description of the business...",
  "companyName": "Company LLC",  // optional
  "industry": "Manufacturing",
  "automationGoal": "Goal description...",
  "targetProcess": "Process description...",
  "expectedResults": "Expected results...",  // optional
  "budget": "100-500k RUB",  // optional
  "timeline": "1-3 months",  // optional
  "urgency": "MEDIUM",  // LOW|MEDIUM|HIGH|URGENT
  "additionalComments": "Additional info..."  // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* application object */ },
  "message": "Application submitted successfully"
}
```

#### GET /applications/my
Get current user's applications (requires authentication).

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response:**
```json
{
  "success": true,
  "data": [ /* array of applications */ ],
  "pagination": { /* pagination info */ }
}
```

#### GET /applications/:id
Get application by ID (requires authentication, owner or admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "contactName": "John Doe",
    "businessDescription": "...",
    "status": "NEW",
    "createdAt": "2024-01-01T00:00:00Z",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "SME"
    }
  }
}
```

#### GET /applications
Get all applications (admin only).

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `status` (optional, filter by status)

**Response:**
```json
{
  "success": true,
  "data": [ /* array of applications */ ],
  "pagination": { /* pagination info */ }
}
```

#### PATCH /applications/:id
Update application status (admin only).

**Request Body:**
```json
{
  "status": "IN_REVIEW|ASSIGNED|IN_PROGRESS|COMPLETED|REJECTED",
  "assignedTo": "specialist-user-id",  // optional
  "adminNotes": "Internal notes..."  // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated application */ },
  "message": "Application updated successfully"
}
```

#### DELETE /applications/:id
Delete application (owner or admin only).

**Response:**
```json
{
  "success": true,
  "message": "Application deleted successfully"
}
```

#### GET /applications/statistics
Get application statistics (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "totalApplications": 100,
    "newApplications": 20,
    "inProgressApplications": 30,
    "completedApplications": 40,
    "topIndustries": [
      { "industry": "Manufacturing", "count": 30 },
      { "industry": "Retail", "count": 25 }
    ]
  }
}
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Email Notifications

The system automatically sends email notifications for:
1. **New User Registration** - Welcome email to new users
2. **New Application** - Notification to admin when application is submitted
3. **Application Status Update** - Notification to user when application status changes
