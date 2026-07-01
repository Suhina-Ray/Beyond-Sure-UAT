# User Registration System

A simple full-stack user registration application built using React, Express.js, and SQLite.

## Features

- User registration form with validation
- Stores user details in an SQLite database
- Displays all registered users on a separate page
- REST API using Express.js
- Simple and lightweight database setup

## Tech Stack

- Frontend: React + React Router
- Backend: Node.js + Express.js
- Database: SQLite
- Styling: CSS

## Project Structure

```
my-form/
│
├── backend/
│   ├── server.js
│   ├── user.db
│   └── package.json
│
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── pages/
│       ├── FormPage.jsx
│       └── UsersPage.jsx
```

## Installation

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
node server.js
```

## API Endpoints

### Add User

```
POST /users
```

Stores a new user's details in the SQLite database.

### Get All Users

```
GET /users
```

Returns all registered users from the database.

## Database

SQLite automatically creates a database file named:

```
user.db
```

The application also creates the `users` table automatically if it does not already exist.

## Workflow

1. Fill out the registration form.
2. Submit the form.
3. User details are stored in SQLite.
4. The application redirects to the Users page.
5. All registered users are displayed in a table.

## Author

**Suhina Ray**
