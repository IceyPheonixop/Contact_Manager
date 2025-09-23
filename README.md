# Contact Manager - Fullstack (Flask backend + Simple Frontend)

## What you get
- `backend/` : Flask REST API with SQLite database (contacts.db)
- `frontend/` : Static HTML + JS frontend (index.html + app.js)
- Instructions to run locally.

## Run backend
```
cd backend
python3 -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## Run frontend
- Open `frontend/index.html` in your browser.
- Or serve it with a static server (e.g., `python -m http.server 8000` from the frontend folder).

The frontend expects the backend at http://localhost:5000. If your backend runs elsewhere, edit `frontend/app.js` -> API variable.

## Notes
- This is a minimal, working example suitable for demo and report.
- Enhancements: authentication, profile pictures, pagination, export CSV, validation, and nicer UI (React/Tailwind).
