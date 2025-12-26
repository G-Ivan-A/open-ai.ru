# Database Schema Design

## User Profile Model

### User Table
```prisma
model User {
  id                String              @id @default(uuid())
  email             String              @unique
  passwordHash      String
  name              String
  role              UserRole
  expertise         String[]            // Array of expertise areas
  contactInfo       Json                // Phone, telegram, etc.
  reputationPoints  Int                 @default(0)
  bio               String?
  avatar            String?             // URL to avatar image
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  // Relations
  profile           UserProfile?
  cases             Case[]
  projects          Project[]
  applications      Application[]
  reputationHistory ReputationHistory[]

  @@index([email])
  @@index([role])
}

enum UserRole {
  STARTUP      // Стартап
  SPECIALIST   // Специалист
  SME          // МСП (малое/среднее предприятие)
  ADMIN        // Администратор
}
```

### UserProfile Table (Extended Info)
```prisma
model UserProfile {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Startup specific
  companyName     String?
  companySize     String?
  foundedYear     Int?
  website         String?

  // Specialist specific
  yearsExperience Int?
  certifications  String[]
  portfolio       Json?    // Links to work samples

  // SME specific
  businessType    String?
  industry        String?
  employeeCount   Int?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### ReputationHistory Table
```prisma
model ReputationHistory {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  points      Int      // Can be positive or negative
  reason      String   // Description of why points were awarded
  sourceType  String   // "project_completion", "review", "contribution", etc.
  sourceId    String?  // ID of related entity (project, review, etc.)
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}
```

## Application Form Model

### Application Table
```prisma
model Application {
  id                  String            @id @default(uuid())
  userId              String
  user                User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Contact Information
  contactName         String
  contactEmail        String
  contactPhone        String?

  // Business Information
  businessDescription String            @db.Text
  companyName         String?
  industry            String

  // Automation Goals
  automationGoal      String            @db.Text
  targetProcess       String            @db.Text
  expectedResults     String?           @db.Text

  // Budget and Timeline
  budget              String?           // Range or specific amount
  timeline            String?           // Expected implementation timeframe
  urgency             UrgencyLevel      @default(MEDIUM)

  // Additional Information
  additionalComments  String?           @db.Text
  attachments         String[]          // URLs to uploaded files

  // Status Tracking
  status              ApplicationStatus @default(NEW)
  assignedTo          String?           // Admin/specialist who took the case

  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

enum ApplicationStatus {
  NEW              // Новая заявка
  IN_REVIEW        // На рассмотрении
  ASSIGNED         // Назначен специалист
  IN_PROGRESS      // В работе
  COMPLETED        // Завершена
  REJECTED         // Отклонена
  CANCELLED        // Отменена пользователем
}

enum UrgencyLevel {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

## Related Models (Minimal for MVP)

### Case Table
```prisma
model Case {
  id          String   @id @default(uuid())
  title       String
  description String   @db.Text
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  industry    String
  results     Json?    // Metrics and outcomes
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([isPublic])
}
```

### Project Table
```prisma
model Project {
  id          String        @id @default(uuid())
  title       String
  description String        @db.Text
  ownerId     String
  owner       User          @relation(fields: [ownerId], references: [id])
  status      ProjectStatus @default(PLANNING)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([ownerId])
  @@index([status])
}

enum ProjectStatus {
  PLANNING
  IN_PROGRESS
  COMPLETED
  ON_HOLD
  CANCELLED
}
```

## Indexes and Performance

Key indexes for performance:
- User email (unique, for authentication)
- User role (filtering)
- Application status (filtering)
- Application userId (user's applications)
- ReputationHistory userId + createdAt (reputation calculation)

## Data Validation Rules

1. **User**
   - Email: Valid email format, unique
   - Name: 2-100 characters
   - ReputationPoints: Non-negative integer
   - Expertise: Array of valid expertise categories

2. **Application**
   - ContactEmail: Valid email format
   - ContactPhone: Optional, valid phone format
   - BusinessDescription: 50-5000 characters
   - AutomationGoal: 50-5000 characters
   - Budget: Optional, positive value or range

3. **ReputationHistory**
   - Points: Integer (can be negative)
   - Reason: Required, 10-500 characters

## Migration Strategy

1. Create base User and Application tables first
2. Add UserProfile as extension
3. Add ReputationHistory for tracking
4. Add Case and Project for future features
5. Add indexes incrementally based on query patterns
