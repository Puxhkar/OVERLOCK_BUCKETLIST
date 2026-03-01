import os
import json
import sqlite3
import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

from services import process_upload, generate_forecast, get_recommendations, get_insights, get_portfolio

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
DATA_PATH = "data/uploaded_data.csv"
SKU_STATE_PATH = "data/skus.txt"


def get_skus():
    if os.path.exists(SKU_STATE_PATH):
        with open(SKU_STATE_PATH, "r") as f:
            return [line.strip() for line in f.readlines() if line.strip()]
    return []


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
        return payload["sub"]  # username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_user_data_path(username: str):
    return f"data/user_{username}_data.csv"


def save_skus(skus):
    with open(SKU_STATE_PATH, "w") as f:
        f.write("\n".join(skus))


@app.get("/user/me")
def get_user_status():
    has_data = os.path.exists(DATA_PATH)
    skus = get_skus() if has_data else []
    return {
        "username": "demo",
        "has_data": has_data,
        "skus": skus
    }


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")

    contents = await file.read()
    with open(DATA_PATH, "wb") as f:
        f.write(contents)

    try:
        df = pd.read_csv(DATA_PATH)
        skus, summary = process_upload(df)
        save_skus(skus)
        return {"filename": file.filename, "skus": skus, "summary": summary}
    except Exception as e:
        if os.path.exists(DATA_PATH):
            os.remove(DATA_PATH)
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@app.get("/forecast")
def forecast(sku: str, days: int = 30):
    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=400, detail="No data uploaded yet.")
    try:
        df = pd.read_csv(DATA_PATH)
        return generate_forecast(df, sku, days)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating forecast: {str(e)}")


@app.get("/recommend")
def recommend(sku: str, lead_time: int = 7):
    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=400, detail="No data uploaded yet.")
    try:
        df = pd.read_csv(DATA_PATH)
        return get_recommendations(df, sku, lead_time)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


@app.get("/insights")
def insights(sku: Optional[str] = None):
    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=400, detail="No data uploaded yet.")
    try:
        df = pd.read_csv(DATA_PATH)
        return get_insights(df, sku)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")


@app.get("/portfolio")
def portfolio():
    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=400, detail="No data uploaded yet.")
    try:
        df = pd.read_csv(DATA_PATH)
        return get_portfolio(df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating portfolio: {str(e)}")


@app.get("/history")
def get_history():
    return []


@app.get("/status")
def status():
    return {"status": "ok"}
