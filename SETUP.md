# Setup Guide - Open-AI.ru Portal

This guide will help you set up and run the Open-AI.ru portal locally.

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (for containerized setup)
- PostgreSQL 13+ (if running without Docker)
- npm or yarn

## Quick Start with Docker

The easiest way to run the project is using Docker Compose:

### 1. Clone the repository
```bash
git clone https://github.com/G-Ivan-A/open-ai.ru.git
cd open-ai.ru
```

### 2. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and configure email settings:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@open-ai.ru
ADMIN_EMAIL=admin@open-ai.ru
```

### 3. Start the services
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3001
- Frontend on port 5173

### 4. Run database migrations
```bash
docker-compose exec backend npx prisma migrate deploy
```

### 5. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health Check: http://localhost:3001/health

## Manual Setup (Without Docker)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/openai_ru?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@open-ai.ru
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@open-ai.ru
```

4. **Setup database**

Create PostgreSQL database:
```sql
CREATE DATABASE openai_ru;
```

Run Prisma migrations:
```bash
npx prisma migrate dev
```

Generate Prisma client:
```bash
npx prisma generate
```

5. **Start backend server**
```bash
npm run dev
```

Backend will be running on http://localhost:3001

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
VITE_API_URL=http://localhost:3001/api
```

4. **Start frontend dev server**
```bash
npm run dev
```

Frontend will be running on http://localhost:5173

## Database Management

### Prisma Studio (Database GUI)
```bash
cd backend
npx prisma studio
```

This opens a web interface at http://localhost:5555 to view and edit database data.

### Create a new migration
```bash
cd backend
npx prisma migrate dev --name <migration-name>
```

### Reset database
```bash
cd backend
npx prisma migrate reset
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Run tests in watch mode
```bash
cd backend
npm run test:watch
```

## Development Workflow

### Backend Development
```bash
cd backend
npm run dev  # Starts dev server with hot reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Starts Vite dev server
```

### Code Formatting
```bash
# Backend
cd backend
npm run format

# Frontend
cd frontend
npm run format
```

### Linting
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview  # Preview production build
```

## Environment Variables

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | - |
| PORT | Backend server port | 3001 |
| NODE_ENV | Environment (development/production) | development |
| JWT_SECRET | Secret key for JWT tokens | - |
| JWT_EXPIRES_IN | JWT token expiration time | 7d |
| SMTP_HOST | SMTP server host | smtp.gmail.com |
| SMTP_PORT | SMTP server port | 587 |
| SMTP_USER | SMTP username | - |
| SMTP_PASSWORD | SMTP password | - |
| EMAIL_FROM | Sender email address | - |
| FRONTEND_URL | Frontend URL for CORS and emails | http://localhost:5173 |
| ADMIN_EMAIL | Admin email for notifications | - |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:3001/api |

## Troubleshooting

### Database connection errors
- Ensure PostgreSQL is running
- Check DATABASE_URL is correct
- Verify database exists

### CORS errors
- Check FRONTEND_URL in backend .env
- Ensure frontend and backend are running on correct ports

### Email notifications not working
- Verify SMTP credentials
- For Gmail, use App Password instead of regular password
- Check firewall/network settings

### Port already in use
```bash
# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

## API Documentation

See [API.md](./API.md) for detailed API documentation.

## Project Structure

```
open-ai-ru/
├── backend/              # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   ├── prisma/           # Database schema and migrations
│   └── tests/            # Backend tests
├── frontend/             # Frontend app (React + Vite)
│   └── src/
│       ├── components/   # React components
│       ├── pages/        # Page components
│       ├── services/     # API client
│       ├── hooks/        # Custom React hooks
│       └── types/        # TypeScript types
├── docker-compose.yml    # Docker services configuration
└── README.md             # Project overview
```

## Next Steps

1. Create an admin user account
2. Test user registration and login
3. Submit a test application
4. Explore the API endpoints using the documentation
5. Customize the UI as needed

## Support

For issues or questions, please:
- Check existing GitHub issues
- Create a new issue with detailed description
- Include error logs and environment details
