# Daymark task tracker

A full-stack task tracker with a React/Vite frontend, Java 17 + Spring Boot REST API, and MongoDB storage.

## Features

- Create, edit, and delete tasks
- Filter tasks by To do, In progress, and Completed
- Dashboard counts and completion percentage
- Request validation and readable API errors

## Prerequisites

- Java 17+
- Maven 3.6+
- Node.js 20+
- MongoDB running locally on `mongodb://localhost:27017`, or a MongoDB connection URI

## Run locally

1. Start MongoDB.
2. Start the API:

   ```powershell
   cd backend
   mvn spring-boot:run
   ```

3. In a separate terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

4. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

Set `MONGODB_URI` to use a hosted database, `PORT` to change the API port, or `FRONTEND_URL` to allow a different frontend origin.
Set `VITE_API_URL` before starting Vite to change the API base URL (defaults to `http://localhost:8080/api`).

## REST API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/tasks` | List tasks |
| `GET` | `/api/tasks?status=IN_PROGRESS` | Filter by status (`TODO`, `IN_PROGRESS`, `DONE`) |
| `GET` | `/api/tasks/stats` | Get dashboard counts |
| `GET` | `/api/tasks/{id}` | Get one task |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/{id}` | Update a task |
| `DELETE` | `/api/tasks/{id}` | Delete a task |

Task JSON fields: `title` (required, up to 120 characters), `description` (optional, up to 1000 characters), and `status` (optional on create; defaults to `TODO`).
