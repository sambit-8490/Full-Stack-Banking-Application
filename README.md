# 🏦 SecureBank — Full Stack Banking Application

A full-stack banking application built with **Spring Boot**, **React**, **MySQL**, and **Redis**, fully containerized with **Docker Compose**.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Default Credentials](#default-credentials)
- [API Endpoints](#api-endpoints)
- [Architecture](#architecture)
- [Known Limitations](#known-limitations)

---

## ✨ Features

### User Features
- Register with email verification
- JWT-based login and session management
- View account dashboard (balance, account number, account type)
- Deposit, withdraw, and transfer funds
- View paginated transaction history (Redis-cached)
- Change password
- Update profile

### Admin Features
- Dedicated admin dashboard (dark theme)
- View all registered users with pagination
- Search users by name, email, user ID, or account number
- Create new user accounts
- Edit user information
- Delete user accounts

### Security
- BCrypt password hashing (cost factor 10)
- JWT authentication (HS256, 1-hour expiry)
- Role-based access control (`USER` / `ADMIN`)
- CORS configured for frontend origin
- Spring Security filter chain with stateless sessions

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, Axios |
| Backend | Spring Boot 3.5, Java 21 |
| Database | MySQL 8.0 |
| Cache | Redis 7 |
| Auth | JWT (jjwt), Spring Security |
| Container | Docker, Docker Compose |
| Web Server | Nginx (frontend) |

---

## 📁 Project Structure

```
BankApplication/
├── compose.yml                  # Docker Compose configuration
├── Dockerfile                   # Backend Docker image
├── Frontend/
│   ├── Dockerfile               # Frontend Docker image
│   ├── nginx.conf               # Nginx configuration
│   └── src/
│       ├── pages/               # React page components
│       ├── components/          # Shared components
│       ├── contexts/            # AuthContext (JWT state)
│       ├── services/            # API service (Axios)
│       └── utils/               # JWT utilities
└── src/main/java/.../
    ├── Auth/                    # SecurityConfig, RedisConfig
    ├── Controller/              # REST controllers
    ├── Service/                 # Business logic
    ├── Repository/              # JPA repositories
    ├── Entity/                  # JPA entities
    ├── Filters/                 # JwtAuthFilter
    ├── DTOs/                    # Data transfer objects
    └── DataInitializer.java     # Default admin seeder
```

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed
- Ports `3000`, `8082`, `3306`, `6379` available on your machine

### Run the Application

```bash
# Clone the repository
git clone <your-repo-url>
cd BankApplication

# Build and start all containers
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8082 |
| MySQL | localhost:3306 |
| Redis | localhost:6379 |

### Stop the Application

```bash
docker-compose down
```

To also remove the database volume:

```bash
docker-compose down -v
```

---

## ⚙️ Environment Variables

### Backend (`compose.yml`)

| Variable | Default | Description |
|---|---|---|
| `MYSQL_HOST` | `mysql` | MySQL service hostname |
| `MYSQL_PORT` | `3306` | MySQL port |
| `MYSQL_DB` | `bank_management_system_springboot` | Database name |
| `DB_USERNAME` | `bank_user` | Database username |
| `DB_PASSWORD` | `bank_password` | Database password |
| `REDIS_HOST` | `redis` | Redis service hostname |
| `REDIS_PORT` | `6379` | Redis port |
| `FRONTEND_URL` | `http://localhost:3000` | Allowed CORS origin |
| `PORT` | `8080` | Backend server port |

### Frontend (`compose.yml`)

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_BASE_URL` | `http://localhost:8082` | Backend API base URL |

> **Note:** React environment variables are baked in at **build time**. Pass them as Docker build args, not runtime environment variables.

---

## 🔑 Default Credentials

A default admin account is automatically created on first startup via `DataInitializer.java`:

| Field | Value |
|---|---|
| Email | `admin@securebank.com` |
| Password | `Admin@1234` |
| Role | `ADMIN` |

> **Important:** Change the default admin password after first login in any non-local environment.

---

## 📡 API Endpoints

### Auth (Public)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/authenticate` | Login — returns JWT token |
| `POST` | `/api/signup` | Register new user |
| `GET` | `/user/verify` | Email verification |

### User (Authenticated)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/user/dashboard` | Get current user info |
| `GET` | `/api/user/balance` | Get account balance |
| `PUT` | `/api/user/{id}` | Update user profile |
| `DELETE` | `/api/user/{id}` | Delete own account |
| `POST` | `/api/user/change-password` | Change password |

### Transactions (Authenticated)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/transactions/deposit` | Deposit funds |
| `POST` | `/api/transactions/withdraw` | Withdraw funds |
| `POST` | `/api/transactions/transfer` | Transfer to another account |
| `GET` | `/api/transactions/history` | Paginated transaction history |

### Admin (ADMIN role required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/users` | Get all users (paginated) |
| `POST` | `/api/admin/users` | Create new user |
| `DELETE` | `/api/admin/users/{id}` | Delete user |

### Actuator (Public)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/actuator/health` | Health check |
| `GET` | `/actuator/info` | App info |

---

## 🏗 Architecture

```
Browser
  │
  ▼
React Frontend (Nginx :80 → :3000)
  │  JWT in Authorization header
  ▼
Spring Boot Backend (:8080 → :8082)
  ├── JwtAuthFilter        ← validates JWT on every request
  ├── SecurityFilterChain  ← role-based route protection
  ├── Controllers          ← REST endpoints
  ├── Services             ← business logic + Redis caching
  └── Repositories         ← JPA/MySQL
        │
        ├── MySQL :3306    ← persistent data
        └── Redis :6379    ← transaction history cache
```

### Redis Caching

Transaction history is cached in Redis with the key pattern `transactions::{email}`. The first request hits MySQL; subsequent requests are served from Redis. Cache is invalidated automatically on new transactions.

Account data is cached with key pattern `accounts::{accountId}`.

---

## ⚠️ Known Limitations

- JWT secret is hardcoded in `JwtUtils.java` — move to an environment variable for production
- JWT tokens cannot be invalidated before expiry (no token blacklist / refresh token mechanism)
- `spring.jpa.hibernate.ddl-auto=update` is fine for development but should be changed to `validate` with Flyway/Liquibase migrations for production
- Email verification is enabled — ensure SMTP is configured in `application.properties` before deploying
- `PageImpl` serialization warning is non-critical but can be resolved by adding `@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)` to the main application class

---

## 🐳 Docker Services

| Container | Image | Port |
|---|---|---|
| `bank-frontend` | Custom (React + Nginx) | 3000→80 |
| `bank-backend` | Custom (Spring Boot) | 8082→8080 |
| `bank-mysql` | mysql:8.0 | 3306 |
| `bank-redis` | redis:7-alpine | 6379 |

Backend waits for MySQL to be healthy before starting (`condition: service_healthy`).

---

## 📝 License

This project is for educational and portfolio purposes.
