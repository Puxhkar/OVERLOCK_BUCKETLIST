# SmartStock AI 📦✨

SmartStock AI is a full-stack AI-powered Inventory Demand Forecasting Web Application designed to look like a modern SaaS analytics platform.
oppp
## Features Included 🚀
- **CSV Data Upload**: Dynamic schema validation and data parsing for historical sales records.
- **Time Series Processing**: Automated frequency detection, decomposition, and plotting hooks.
- **Ensemble Forecasting Engine**: Automatically trains and evaluates Moving Average, Exponential Smoothing (Holt-Winters), and Meta Prophet models and selects the best one via RMSE.
- **SKU-Level Selectors**: Analyzes demand at the exact product level.
- **Restocking Recommendations**: Statistically significant safety stock calculation.
- **Smart Insights**: Rules-based NLP engine for real time business intelligence.

---

## 🏗️ Project Architecture
```text
SmartStock-AI/
├── frontend/                 # React frontend with Vite
│   ├── src/
│   │   ├── components/       # UI Components (Dashboard, UploadSection, etc.)
│   │   ├── App.jsx           # Main Container
│   │   ├── index.css         # Minimal Glassmorphism design system
│   │   └── main.jsx          # Entry Point
│   ├── package.json
│   └── vite.config.js
└── backend/                  # FastAPI Application
    ├── main.py               # REST API Endpoints
    ├── services.py           # Core ML and Business Logic
    ├── generate_data.py      # Utility script for example CSVs
    ├── requirements.txt      # pip packages
    └── data/                 # Data caching directory
```

---

## 🛠️ Setup Instructions

### 1. Start the Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn pandas numpy statsmodels scikit-learn prophet python-multipart pydantic

# Run the backend server
uvicorn main:app --reload --port 8000
```
*Note: The API runs on `http://localhost:8000`*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing the Application
1. Navigate to the `backend` folder and run `python generate_data.py`.
2. This creates `example_data.csv` inside the `backend` directory.
3. Open the UI at `http://localhost:5173`.
4. Drag and Drop the `example_data.csv` into the dashboard to simulate a SaaS workflow.
