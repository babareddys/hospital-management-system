# Hospital Management System — MERN Stack

A full-stack hospital management web app with role-based portals for
**Patients**, **Doctors**, and **Admins**. It covers appointment booking,
doctor session scheduling, prescriptions, and admin management of
doctors, patients, and appointments — all backed by a REST API with
JWT authentication and bcrypt password hashing.

## Features

| Role    | Capabilities |
|---------|--------------|
| Patient | Register/login, view profile, book an appointment (by doctor → date → session), view their own appointments and prescriptions |
| Doctor  | Register/login, view/edit weekly session timings, view their appointments, mark them completed/cancelled, write prescriptions |
| Admin   | Login, add/delete doctors (auto-seeds default session timings), add/delete patients, view every appointment in the system |

## Tech Stack

- **Frontend:** React 18 (Vite), React Router, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Auth:** JWT (JSON Web Tokens) + bcrypt password hashing
- **Data integrity:** a partial unique index on `Appointment` (doctor +
  date + time, scoped to non-cancelled statuses) makes it impossible to
  double-book the same slot, even under concurrent requests

## Project Structure

```
mern-hospital-management/
├── server/                  # Express + MongoDB API
│   ├── config/db.js
│   ├── models/              # User, DoctorSession, Appointment
│   ├── middleware/auth.js   # JWT verification + role guard
│   ├── routes/              # auth, doctors, patients, appointments, sessions
│   ├── seed.js              # optional sample-data seeder
│   └── server.js
└── client/                  # React (Vite) frontend
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── components/      # Navbar, PrivateRoute
        └── pages/           # Home, Login, Register, dashboards, etc.
```

## Getting Started Locally

### Prerequisites
- Node.js 18+
- A MongoDB instance (local `mongod`, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hospital_management
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Optionally seed sample data (an admin, a doctor, and a patient):

```bash
npm run seed
```

This creates:
- `admin` / `admin123` (role: admin)
- `harsha` / `doctor123` (role: doctor, Gynacologist, default weekly sessions)
- `ramu` / `patient123` (role: patient)

Start the API:

```bash
npm run dev      # with nodemon
# or
npm start
```

The API runs at `http://localhost:5000/api`.

### 2. Frontend setup

```bash
cd client
npm install
cp .env.example .env
```

`client/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

Visit `http://localhost:5173`.

## API Overview

| Method | Endpoint                                  | Access        | Description |
|--------|--------------------------------------------|---------------|--------------|
| POST   | `/api/auth/register/patient`               | Public        | Register a patient |
| POST   | `/api/auth/register/doctor`                | Public        | Register a doctor (seeds default sessions) |
| POST   | `/api/auth/register/admin`                 | Bootstrap / Admin* | Register an admin |
| POST   | `/api/auth/login`                          | Public        | Login (any role) |
| GET    | `/api/auth/me`                             | Authenticated | Current user's profile |
| GET    | `/api/doctors`                             | Public        | List all doctors |
| GET    | `/api/doctors/:id`                         | Public        | Single doctor |
| POST   | `/api/doctors`                             | Admin         | Add a doctor |
| DELETE | `/api/doctors/:id`                         | Admin         | Delete a doctor |
| GET    | `/api/doctors/:doctorId/sessions`          | Public        | Weekly session timings |
| PUT    | `/api/doctors/:doctorId/sessions/:day`     | Doctor (own)  | Edit a day's two sessions |
| GET    | `/api/patients`                            | Admin         | List all patients |
| POST   | `/api/patients`                            | Admin         | Add a patient (default password `admin`) |
| DELETE | `/api/patients/:id`                        | Admin         | Delete a patient |
| POST   | `/api/appointments`                        | Patient       | Book an appointment |
| GET    | `/api/appointments/mine`                   | Patient       | Own appointments |
| GET    | `/api/appointments/doctor`                 | Doctor        | Own appointments |
| GET    | `/api/appointments`                        | Admin         | All appointments |
| PUT    | `/api/appointments/:id/status`             | Doctor (own)  | Complete/cancel (only from pending) |
| PUT    | `/api/appointments/:id/prescription`       | Doctor (own)  | Save prescription (marks completed) |

\* Admin registration is locked down: it only succeeds if no admin exists
yet (first-run bootstrap) or if the request carries a valid admin's JWT
(an existing admin inviting another). Anyone else gets a 403.

## Deploying

- **Backend:** Render, Railway, Fly.io, or any Node host — set the same
  environment variables as `.env.example`.
- **Frontend:** Vercel, Netlify, or any static host — set `VITE_API_URL`
  to your deployed backend's `/api` URL, then `npm run build` and deploy
  the `client/dist` folder.
- **Database:** MongoDB Atlas free tier works well for small deployments.

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Initial commit: MERN hospital management system"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

`node_modules/`, `.env` files, and `client/dist/` are already excluded via
`.gitignore`.

## License

MIT — see [LICENSE](LICENSE).
