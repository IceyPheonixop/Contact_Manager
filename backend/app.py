from flask import Flask, request, jsonify, g
from flask_cors import CORS
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "contacts.db")

def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
    return db

def init_db():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT
    )
    ''')
    db.commit()

app = Flask(__name__)
CORS(app)

with app.app_context():
    init_db()

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()

# Health check route for cloud deployment
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"message": "Contact Manager API is running smoothly."}), 200

@app.route("/contacts", methods=["GET"])
def list_contacts():
    db = get_db()
    cursor = db.execute("SELECT * FROM contacts ORDER BY id DESC")
    contacts = [dict(row) for row in cursor.fetchall()]
    return jsonify(contacts)

@app.route("/contacts/<int:cid>", methods=["GET"])
def get_contact(cid):
    db = get_db()
    cursor = db.execute("SELECT * FROM contacts WHERE id = ?", (cid,))
    row = cursor.fetchone()
    if not row:
        return jsonify({"error": "Not found"}), 404
    return jsonify(dict(row))

@app.route("/contacts", methods=["POST"])
def create_contact():
    data = request.get_json() or {}
    name = data.get("name")
    phone = data.get("phone")
    email = data.get("email")
    address = data.get("address")
    if not name:
        return jsonify({"error": "Name is required"}), 400
    
    if phone and not phone.isdigit():
        return jsonify({"error": "Phone number must only contain digits."}), 400
    
    db = get_db()
    
    if phone:
        existing = db.execute("SELECT id FROM contacts WHERE phone = ?", (phone,)).fetchone()
        if existing:
            return jsonify({"error": "Phone number already exists."}), 409

    cursor = db.execute("INSERT INTO contacts (name, phone, email, address) VALUES (?, ?, ?, ?)",
                        (name, phone, email, address))
    db.commit()
    new_id = cursor.lastrowid
    return jsonify({"id": new_id}), 201

@app.route("/contacts/<int:cid>", methods=["PUT"])
def update_contact(cid):
    data = request.get_json() or {}
    name = data.get("name")
    phone = data.get("phone")
    email = data.get("email")
    address = data.get("address")
    db = get_db()
    cursor = db.execute("SELECT * FROM contacts WHERE id = ?", (cid,))
    if not cursor.fetchone():
        return jsonify({"error": "Not found"}), 404

    if phone and not phone.isdigit():
        return jsonify({"error": "Phone number must only contain digits."}), 400

    if phone:
        existing = db.execute(
            "SELECT id FROM contacts WHERE phone = ? AND id != ?", (phone, cid)
        ).fetchone()
        if existing:
            return jsonify({"error": "Phone number already exists for another contact."}), 409

    db.execute("UPDATE contacts SET name=?, phone=?, email=?, address=? WHERE id=?",
               (name, phone, email, address, cid))
    db.commit()
    return jsonify({"status": "updated"})

@app.route("/contacts/<int:cid>", methods=["DELETE"])
def delete_contact(cid):
    db = get_db()
    cursor = db.execute("SELECT * FROM contacts WHERE id = ?", (cid,))
    if not cursor.fetchone():
        return jsonify({"error": "Not found"}), 404
    db.execute("DELETE FROM contacts WHERE id = ?", (cid,))
    db.commit()
    return jsonify({"status": "deleted"})

if __name__ == "__main__":
    if not os.path.exists(DB_PATH):
        open(DB_PATH, "a").close()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)