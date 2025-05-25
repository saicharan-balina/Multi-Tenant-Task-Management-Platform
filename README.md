# Multi-Tenant Task Management Platform

A full-stack MERN application that provides a multi-tenant task management system with role-based access control.

## Features

### User Management
- **Multi-Tenancy**: Data isolation per organization
- **Role-Based Access Control (RBAC)**: Admin, Manager, Member roles
- **Authentication**: JWT-based session handling
- **Registration & Onboarding**: Create or join organizations
- **Invitation System**: Invite users via email or invite link

### Task Management
- **CRUD Operations**: Create, read, update, and delete tasks
- **Task Assignment**: Assign tasks to organization members
- **Task Properties**: Categories, priorities, due dates
- **Status Automation**: Auto-expire overdue tasks
- **In-app Notifications**: For overdue tasks and other events

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Frontend**: React.js, Tailwind CSS
- **Authentication**: JWT
- **Docker**: Containerized services
- **Task Scheduling**: node-cron

## Project Structure

```
.
├── client/                  # React frontend
│   ├── public/              # Static files
│   ├── src/                 # Source files
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context for state management
│   │   ├── pages/           # Page components
│   │   └── ...
│   ├── Dockerfile           # Client Docker configuration
│   └── nginx.conf           # Nginx configuration for client
├── server/                  # Express.js backend
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── .env                 # Environment variables
│   ├── Dockerfile           # Server Docker configuration
│   └── server.js            # Entry point
└── docker-compose.yml       # Docker Compose configuration
```

## Installation and Setup

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB
- Docker and Docker Compose (for containerized deployment)

### Local Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd MultiTenant-TaskManager
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:
```bash
# In server directory
cp .env.example .env
# Edit .env with your configuration
```

4. Run the development servers:
```bash
# Start MongoDB (if not using Docker)
mongod

# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm start
```

### Docker Deployment

1. Make sure Docker and Docker Compose are installed.

2. Build and run containers:
```bash
docker-compose up -d --build
```

3. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost/api

4. Stop containers:
```bash
docker-compose down
```

## Deployment to Production

1. Update environment variables for production in `.env` file:
```
NODE_ENV=production
JWT_SECRET=<strong-secret-key>
```

2. Build the client for production:
```bash
cd client
npm run build
```

3. Deploy using Docker:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## CI/CD Guidelines

For continuous integration and deployment:

1. Set up a CI pipeline (e.g., GitHub Actions, Jenkins) to:
   - Run tests
   - Build Docker images
   - Push to container registry

2. Configure CD to:
   - Pull latest images
   - Update services
   - Run migrations
   - Monitor deployment

## Testing

Run tests:
```bash
# Server tests
cd server
npm test

# Client tests
cd client
npm test
```

## License

[MIT](LICENSE)
