import jwt
import datetime
from flask import Flask, request, jsonify, render_template
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = 'professional_risk_management_2026'

# --- PROFESSIONAL DATA STRUCTURE (Mock Database) ---
# In a real scenario, these would be in a SQL/NoSQL DB
users = {
    "admin_user": {
        "password": generate_password_hash("admin123"), # Hashed!
        "role": "admin"
    },
    "member_user": {
        "password": generate_password_hash("member123"),
        "role": "member"
    }
}

jobs = [
    {"id": 1, "title": "Quantitative Developer", "company": "Alpha Flow", "salary": "$180k", "desc": "Develop HFT algorithms."},
    {"id": 2, "title": "Risk Analyst", "company": "Secure Assets", "salary": "$140k", "desc": "Audit portfolio exposure."}
]

# --- AUTH MIDDLEWARE ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Unauthenticated access!'}), 401
        try:
            # Note: We use 'jwt' here (from PyJWT)
            data = jwt.decode(token.split(" ")[1], app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = data
        except:
            return jsonify({'message': 'Token is invalid or expired!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# --- ROUTES ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = users.get(username)
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = jwt.encode({
        'user': username,
        'role': user['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({'token': token, 'role': user['role']})

@app.route('/api/vacancies', methods=['GET'])
@token_required
def get_vacancies(current_user):
    return jsonify(jobs)

if __name__ == '__main__':
    app.run(debug=True)