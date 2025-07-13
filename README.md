# EquiLearn

## Overview

EquiLearn is a full-stack donation platform designed to connect donors with underfunded schools and educational needs. The platform provides a modern, visually impactful web interface for donors to register, log in, and support schools, while administrators can manage schools and track platform impact.

The project is structured into two main components:
- **Backend API (Flask):** Handles user registration, authentication, school and donation management, and serves data to the frontend.
- **Frontend (React + TypeScript):** Provides a user-friendly interface for donors and admins to interact with the platform.

---

## Features

- Donor and admin registration and login
- Browse and support featured schools and micro-donation pools
- Track recent donations and platform impact
- Admin panel for managing schools and needs
- Modern, responsive UI with blue-themed branding and professional design
- Persistent user sessions and state management

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/EquiLearn.git
cd EquiLearn
```

---

### 2. Start the Backend API

The backend is built with Flask and uses SQLite for data storage.

#### a. Create and activate a virtual environment

```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

#### b. Install backend dependencies

```bash
pip install -r requirements.txt
```

#### c. Run the backend server

```bash
python run.py
```

The API will be available at `http://localhost:5000`.

---

### 3. Start the Frontend

The frontend is a React app located in the `frontend` directory.

#### a. Install frontend dependencies

```bash
cd frontend
npm install
```

#### b. Start the frontend development server

```bash
npm start
```

The frontend will be available at `http://localhost:3000` and will proxy API requests to the backend.

---

## Usage

1. Open your browser and go to `http://localhost:3000`.
2. Register as a donor or log in as an admin (default: `admin@equilearn.org` / `admin123`).
3. Browse schools, make donations, and view your impact.
4. Admins can manage schools and needs from the admin panel.

---

## Project Structure

```
EquiLearn/
  ├── backend/                # Flask backend
  │   ├── app.py
  │   ├── models.py
  │   ├── extensions.py
  │   ├── migrations/         # Database migrations
  │   └── instance/
  │       └── equilearn.db    # SQLite database
  ├── frontend/               # React frontend
  │   ├── src/
  │   ├── public/
  │   └── package.json
  ├── requirements.txt        # Backend dependencies
  ├── run.py                  # Backend runner
  ├── package.json            # (root, optional)
  └── README.md
```

---

## License

This project is open source and available under the [MIT License](LICENSE).

--- 