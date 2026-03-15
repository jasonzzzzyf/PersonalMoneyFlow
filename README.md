# Personal Money Flow

Personal Money Flow is a full-stack personal finance project. It has an Angular frontend, a Spring Boot API, and a small Python service for market data and background jobs.

The app is still in active development. Core finance flows are in place, but there are still rough edges, missing polish, and some deployment work that needs to be tightened up.

## Features

- Track income and expenses with custom categories
- Manage budgets and reminders
- View transactions in list and calendar layouts
- Track investments, assets, loans, and net worth
- Use a separate Python service for stock data and related background tasks

## Tech Stack

- Frontend: Angular 17, TypeScript, Angular Material, SCSS
- Backend: Spring Boot 3, Java 17, Spring Security, JPA, Maven
- Data service: FastAPI, Python, Redis integration
- Database and infra: Flyway migrations, Docker Compose, Render deployment config

## Project Structure

```text
backend/            Spring Boot API and database migrations
frontend/           Angular application
python-service/     FastAPI service for stock data and async tasks
database/           Local database-related files and scripts
docs/               Project notes and supporting docs
render.yaml         Render deployment config
docker-compose.yml  Local multi-service setup
```

## Run Locally

### 1. Backend

```bash
cd backend
mvn spring-boot:run
```

The backend expects database, Redis, and application settings from `application.yml` and any environment-specific overrides.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

The frontend runs on `http://localhost:4200` by default.

### 3. Python service

```bash
cd python-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

If you are on macOS or Linux, activate the virtual environment with `source .venv/bin/activate`.

### 4. Optional: run the stack with Docker

```bash
docker-compose up --build
```

## Testing

Backend:

```bash
cd backend
mvn test
```

Frontend:

```bash
cd frontend
npm test -- --watch=false --browsers=ChromeHeadless
```

Python service:

```bash
cd python-service
python -m unittest discover -s tests -v
```

## Deployment Notes

- `render.yaml` is set up for Render.
- The frontend builds from `frontend/`.
- The backend builds from `backend/`.
- The Python service has its own dependency set and should be deployed separately if used in production.

Before deploying, double-check environment variables, database connectivity, and Redis availability.

## Current Status

Working now:

- Main backend and frontend apps build successfully
- Basic automated smoke tests are in place
- Render configuration exists for hosted deployment

Still needs work:

- Broader backend and frontend test coverage
- Cleanup of some larger frontend stylesheets
- Better production configuration and environment management
- More complete end-to-end verification after deploy

## Roadmap

- Add more feature-level tests
- Reduce production build warnings
- Tighten deployment and post-deploy checks
- Continue improving UX around budgets, investments, and reminders