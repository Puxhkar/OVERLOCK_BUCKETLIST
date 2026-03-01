import os
import sqlite3
import jwt
import bcrypt
import json
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

from services import process_upload, generate_forecast, get_recommendations, get_insights
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests


app = FastAPI(title="SmartStock AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("data", exist_ok=True)
DB_PATH = "data/users.db"
SECRET_KEY = "supersecretkey_for_demo_purposes_only"
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID_STUB.apps.googleusercontent.com")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password_hash TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS user_data
                 (user_id INTEGER PRIMARY KEY, skus TEXT, has_data BOOLEAN)''')
    c.execute('''CREATE TABLE IF NOT EXISTS search_history
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, sku TEXT, action TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

init_db()



class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["sub"] # username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_user_data_path(username: str):
    return f"data/user_{username}_data.csv"


@app.post("/auth/register")
def register(user: UserCreate):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE username=?", (user.username,))
    if c.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    c.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (user.username, hashed_pw))
    user_id = c.lastrowid
    c.execute("INSERT INTO user_data (user_id, skus, has_data) VALUES (?, ?, ?)", (user_id, "[]", False))
    conn.commit()
    conn.close()
    return {"message": "User created successfully"}

@app.post("/auth/login")
def login(user: UserLogin):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, password_hash FROM users WHERE username=?", (user.username,))
    row = c.fetchone()
    conn.close()
    
    if not row or not bcrypt.checkpw(user.password.encode('utf-8'), row[1].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    token = jwt.encode(
        {"sub": user.username, "exp": datetime.utcnow() + timedelta(days=7)},
        SECRET_KEY, 
        algorithm="HS256"
    )
    return {"access_token": token, "token_type": "bearer"}

class GoogleAuthRequest(BaseModel):
    credential: str

@app.post("/auth/google")
def google_auth(data: GoogleAuthRequest):
    try:
        if data.credential.startswith("dummy_token_"):
            # Developer Bypass for Hackathon Demo
            email = data.credential.replace("dummy_token_", "")
            idinfo = {'email': email}
        else:
            # Verify the real Google Token
            idinfo = id_token.verify_oauth2_token(data.credential, google_requests.Request(), GOOGLE_CLIENT_ID)
        
        # ID token is valid. Get user's Google ID from `sub` or email
        email = idinfo['email']
        username = email.split('@')[0] # Simple username fallback
        
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT id FROM users WHERE username=?", (username,))
        row = c.fetchone()
        
        if not row:
            # Register new user if they don't exist
            # We use a dummy password for Google-only accounts
            dummy_pw = bcrypt.hashpw(os.urandom(24), bcrypt.gensalt()).decode('utf-8')
            c.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, dummy_pw))
            user_id = c.lastrowid
            c.execute("INSERT INTO user_data (user_id, skus, has_data) VALUES (?, ?, ?)", (user_id, "[]", False))
            conn.commit()
        else:
            user_id = row[0]
            
        conn.close()
        
        # Generate our own JWT
        token = jwt.encode(
            {"sub": username, "exp": datetime.utcnow() + timedelta(days=7)},
            SECRET_KEY, 
            algorithm="HS256"
        )
        return {"access_token": token, "token_type": "bearer"}
        
    except ValueError:
        # Invalid token
        raise HTTPException(status_code=401, detail="Invalid Google token")


@app.get("/user/me")
def get_user_status(username: str = Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE username=?", (username,))
    user_row = c.fetchone()
    if not user_row:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
        
    c.execute("SELECT skus, has_data FROM user_data WHERE user_id=?", (user_row[0],))
    data_row = c.fetchone()
    conn.close()
    
    has_data = bool(data_row[1])
    skus = json.loads(data_row[0]) if data_row[0] else []
    
    # Check if file actually exists
    if has_data and not os.path.exists(get_user_data_path(username)):
        has_data = False
        skus = []
        
    return {
        "username": username,
        "has_data": has_data,
        "skus": skus
    }

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    username: str = Depends(get_current_user)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    path = get_user_data_path(username)
    contents = await file.read()
    with open(path, "wb") as f:
        f.write(contents)
        
    try:
        df = pd.read_csv(path)
        skus, summary = process_upload(df)
        
      
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT id FROM users WHERE username=?", (username,))
        user_id = c.fetchone()[0]
        c.execute("UPDATE user_data SET skus=?, has_data=? WHERE user_id=?", (json.dumps(skus), True, user_id))
        conn.commit()
        conn.close()
        
        return {"filename": file.filename, "skus": skus, "summary": summary}
    except Exception as e:
        if os.path.exists(path):
            os.remove(path)
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/forecast")
def forecast(sku: str, days: int = 30, username: str = Depends(get_current_user)):
    path = get_user_data_path(username)
    if not os.path.exists(path):
        raise HTTPException(status_code=400, detail="No data uploaded yet.")
    
    try:
        df = pd.read_csv(path)
        result = generate_forecast(df, sku, days)
        
        # Log history
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT id FROM users WHERE username=?", (username,))
        user_id = c.fetchone()[0]
        c.execute("INSERT INTO search_history (user_id, sku, action) VALUES (?, ?, ?)", (user_id, sku, "forecast"))
        conn.commit()
        conn.close()
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating forecast: {str(e)}")

@app.get("/history")
def get_history(username: str = Depends(get_current_user)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE username=?", (username,))
    user_row = c.fetchone()
    if not user_row:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
        
    user_id = user_row[0]
    c.execute("SELECT sku, action, timestamp FROM search_history WHERE user_id=? ORDER BY timestamp DESC LIMIT 20", (user_id,))
    rows = c.fetchall()
    conn.close()
    
    return [{"sku": r[0], "action": r[1], "timestamp": r[2]} for r in rows]

@app.get("/recommend")
def recommend(sku: str, lead_time: int = 7, username: str = Depends(get_current_user)):
    path = get_user_data_path(username)
    if not os.path.exists(path):
        raise HTTPException(status_code=400, detail="No data uploaded yet.")
        
    try:
        df = pd.read_csv(path)
        result = get_recommendations(df, sku, lead_time)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@app.get("/insights")
def insights(sku: Optional[str] = None, username: str = Depends(get_current_user)):
    path = get_user_data_path(username)
    if not os.path.exists(path):
        raise HTTPException(status_code=400, detail="No data uploaded yet.")
        
    try:
        df = pd.read_csv(path)
        result = get_insights(df, sku)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")

@app.get("/status")
def status():
    return {"status": "ok"}
