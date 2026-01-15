# Authentication & Admin Panel Setup

## Overview
This feature introduces a secure admin panel and JWT-based authentication for the Mini Agronomist backend.

## Prerequisites
You must install the new Python dependencies.

```bash
pip install -r backend/requirements.txt
```

## Running the Application
1. Start the backend:
   ```bash
   cd backend
   uvicorn main:app --reload --port 8001
   ```
2. Open the Admin Panel:
   - Navigate to `pages/admin-login.html` in your browser.
   - For a local server (e.g. Live Server), go to: `http://127.0.0.1:5500/pages/admin-login.html` (port may vary).

## Default Credentials
**WARNING: Change these in production!**

- **Username**: `admin`
- **Password**: `admin123`

## Architecture
- **Backend**: 
  - `backend/auth.py`: Handles JWT token creation and password hashing (bcrypt).
  - `backend/main.py`: Includes `/token`, `/users/me`, and `/admin/dashboard` endpoints.
- **Frontend**:
  - `pages/admin-login.html`: Login form.
  - `pages/admin-dashboard.html`: Protected dashboard view.
  - Authentication state is stored in `localStorage` (`access_token`).

## Security Notes
- **HTTPS**: In a real deployment, serve over HTTPS to protect the token.
- **Secret Key**: The `SECRET_KEY` in `auth.py` is hardcoded for development. Use Environment Variables in production.
- **CORS**: `main.py` allows all origins (`*`). Restrict this in production.
