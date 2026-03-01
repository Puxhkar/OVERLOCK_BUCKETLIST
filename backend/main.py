import os
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from services import process_upload, generate_forecast, get_recommendations, get_insights

app = FastAPI(title="SmartStock AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("data", exist_ok=True)
DATA_PATH = "data/uploaded_data.csv"
SKU_STATE_PATH = "data/skus.txt"


def get_skus():
    if os.path.exists(SKU_STATE_PATH):
        with open(SKU_STATE_PATH, "r") as f:
            return [line.strip() for line in f.readlines() if line.strip()]
    return []


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
        df, skus, summary = process_upload(df)
        df.to_csv(DATA_PATH, index=False)
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating forecast: {str(e)}")


@app.get("/recommend")
def recommend(sku: str, lead_time: int = 7):
    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=400, detail="No data uploaded yet.")
    try:
        df = pd.read_csv(DATA_PATH)
        return get_recommendations(df, sku, lead_time)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


@app.get("/insights")
def insights(sku: Optional[str] = None):
    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=400, detail="No data uploaded yet.")
    try:
        df = pd.read_csv(DATA_PATH)
        return get_insights(df, sku)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")


@app.get("/history")
def get_history():
    return []


@app.get("/status")
def status():
    return {"status": "ok"}
