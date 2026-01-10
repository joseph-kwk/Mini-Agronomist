---
description: Run the Mini Agronomist application with Python Backend
---

This workflow starts both the FastAPI backend and the frontend server for the Mini Agronomist application.

1. Install Backend Dependencies
// turbo
```bash
pip install -r backend/requirements.txt
```

2. Start the Backend Server (Term 1)
// turbo
```bash
python -m uvicorn backend.main:app --reload --port 8001
```

3. Start the Frontend Server (Term 2)
// turbo
```bash
python -m http.server 8000
```

4. Access the Application
Open your browser to `http://localhost:8000`.

5. Verify Backend Connection
- Go to `http://localhost:8000`
- Open Console
- Look for "🐍 Python backend connected"
