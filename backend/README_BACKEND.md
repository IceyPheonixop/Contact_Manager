## Backend (Flask) - Contact Manager

How to run:
1. Create a virtual environment (recommended) and install requirements:
   ```
   python3 -m venv venv
   source venv/bin/activate   # on Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Run the backend:
   ```
   python app.py
   ```

The server will run at http://localhost:5000 and exposes these endpoints:
- GET /contacts
- GET /contacts/<id>
- POST /contacts  (JSON: {name, phone, email, address})
- PUT /contacts/<id> (JSON: same fields)
- DELETE /contacts/<id>
