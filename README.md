# SmartStock AI

AI-powered Inventory Demand Forecasting Web Application for intelligent SKU-level demand prediction and automated restocking recommendations.

---

# 1. Problem Statement

## Problem Title

Unpredictable Inventory Demand & Stock Imbalance in SMEs

## Problem Description

Small and medium businesses struggle to accurately forecast product demand using historical sales data. Manual forecasting and spreadsheet-based methods fail to capture trend shifts, seasonality, and demand variability. This results in overstocking (increased holding costs and capital lock-in) or understocking (lost revenue and customer dissatisfaction).

Without structured forecasting:

- Stockouts increase
- Overstock waste increases
- Revenue opportunities are missed
- Supply chain planning becomes reactive

## Target Users

- Retail Store Managers
- Inventory Planners
- E-commerce Store Owners
- FMCG Distributors
- D2C Brands

## Existing Gaps

- Excel-based forecasting ignores seasonality
- Manual prediction introduces bias
- Enterprise ERP systems are expensive
- AI solutions require heavy infrastructure
- Most tools do not quantify forecast uncertainty

---

# 2. Problem Understanding & Approach

## Root Cause Analysis

Inventory demand is time-series data composed of:

- Trend (long-term growth/decline)
- Seasonality (periodic patterns)
- Residual noise (random fluctuations)

Most SMEs:

- Do not decompose time-series components
- Do not evaluate models scientifically
- Do not compute safety stock statistically
- Lack interpretable forecasting tools

## Solution Strategy

Build a full-stack AI-powered forecasting system that:

- Accepts historical SKU-level CSV data
- Automatically preprocesses and validates schema
- Trains multiple forecasting models
- Selects the best model using RMSE
- Computes statistically valid safety stock
- Generates actionable restocking insights
- Visualizes forecasts with confidence intervals

---

# 3. Proposed Solution

## Solution Overview

SmartStock AI is a SaaS-style predictive analytics platform built with React and FastAPI that performs ensemble time-series forecasting and delivers intelligent inventory recommendations.

## Core Idea

Empower small businesses with enterprise-level demand forecasting models through an accessible, interpretable, and automated web dashboard.

## Key Features

- CSV Data Upload with validation
- SKU-Level Forecasting
- Ensemble Forecasting Engine (Moving Average, Holt-Winters, Prophet)
- Automatic Model Selection via RMSE
- Seasonality Decomposition
- Confidence Interval Visualization
- Safety Stock & Reorder Point Calculation
- Smart Business Insights Engine

---

# 4. System Architecture

## High-Level Flow

User → Frontend → Backend → Model → Database → Response

## Architecture Description

- **Frontend (React + Vite)**  
  Handles UI, SKU selection, chart visualization, KPI cards.

- **Backend (FastAPI)**  
  Processes CSV uploads, executes forecasting models, calculates metrics.

- **Model Layer**  
  Implements Moving Average, Holt-Winters, Prophet, and RMSE-based selection.

- **Database Layer (MVP)**  
  In-memory processing with optional local caching.

- **Response Layer**  
  Returns forecast values, confidence intervals, and restocking recommendations in JSON format.

## Architecture Diagram

(Add system architecture diagram image here)

---

# 5. Database Design

## ER Diagram

(Add ER diagram image here)

## ER Diagram Description

The MVP version uses in-memory processing to maximize speed and protect data privacy. Sales data is parsed into structured objects and grouped by SKU. Future versions can integrate PostgreSQL for persistent SKU storage and Redis for caching predictions.

---

# 6. Dataset Selected

## Dataset Name

Retail SKU Demand Dataset (Generated Sample Data)

## Source

Custom-generated test datasets (`example_data.csv`, `advanced_retail_demand.csv`)

## Data Type

Time-Series CSV

## Selection Reason

Contains realistic SKU-level historical demand patterns with seasonal variation and trend behavior suitable for forecasting.

## Preprocessing Steps

1. Date parsing and validation
2. Chronological sorting
3. Missing value handling
4. Frequency detection
5. SKU grouping
6. Conversion into structured time-series arrays

---

# 7. Model Selected

## Model Name

Ensemble Time-Series Forecasting Model

(Components: Moving Average, Holt-Winters, Meta Prophet)

## Selection Reasoning

- Moving Average provides baseline smoothing
- Holt-Winters captures trend and seasonality efficiently
- Prophet handles multiple seasonalities and change points
- Ensemble selection improves reliability

## Alternatives Considered

- ARIMA (computationally heavier, parameter tuning complex)
- LSTM (requires large datasets and GPU resources)
- Simple Moving Average alone (too basic, ignores trend)

## Evaluation Metrics

- Root Mean Squared Error (RMSE)
- Standard deviation of residuals
- 95% Confidence Interval bounds

---

# 8. Technology Stack

## Frontend

- React
- Vite
- Recharts
- Lucide-React

## Backend

- FastAPI
- Uvicorn

## ML/AI

- Pandas
- NumPy
- statsmodels
- Prophet
- scikit-learn

## Database

- In-memory processing
- Optional local data caching

## Deployment

- Render (Backend)
- Vercel / Netlify (Frontend)

---

# 9. API Documentation & Testing

## API Endpoints List

### Endpoint 1: POST /upload

- Accepts CSV file
- Validates schema
- Returns dataset summary

### Endpoint 2: POST /forecast

Input:

- SKU
- Forecast horizon
- Lead time

Output:

- Forecast values
- Lower & upper confidence bounds
- Selected model
- RMSE score
- Safety stock
- Reorder point

### Endpoint 3: GET /insights

- Returns NLP-based business insights based on forecast results

## API Testing Screenshots

(Add Postman / Thunder Client screenshots here)

---

# 10. Module-wise Development & Deliverables

## Checkpoint 1: Research & Planning

Deliverables:

- Finalized forecasting models
- Defined evaluation metric (RMSE)
- Designed system architecture

## Checkpoint 2: Backend Development

Deliverables:

- FastAPI endpoints
- CSV parsing logic
- Forecast engine implementation

## Checkpoint 3: Frontend Development

Deliverables:

- Dashboard UI
- SKU selector
- Forecast visualization charts
- KPI cards

## Checkpoint 4: Model Training

Deliverables:

- Moving Average implementation
- Holt-Winters model
- Prophet integration
- RMSE comparison logic

## Checkpoint 5: Model Integration

Deliverables:

- Frontend-backend integration
- JSON response handling
- Dynamic chart binding

## Checkpoint 6: Deployment

Deliverables:

- Backend deployment
- Frontend hosting
- Environment configuration

---

# 11. End-to-End Workflow

1. User uploads historical sales CSV.
2. Backend validates and preprocesses data.
3. Data grouped by SKU.
4. Ensemble models trained.
5. Best model selected via RMSE.
6. Forecast generated with confidence intervals.
7. Safety stock and reorder point calculated.
8. Smart insights generated.
9. Results visualized on dashboard.

---

# 12. Demo & Video

Live Demo Link:  
Demo Video Link:  
GitHub Repository: https://github.com/Puxhkar/OVERLOCK_BUCKETLIST

---

# 13. Hackathon Deliverables Summary

- Fully functional full-stack forecasting system
- Ensemble model selection
- Confidence interval visualization
- SKU-level forecasting
- Automated restocking recommendations
- SaaS-style modern dashboard UI

---

# 14. Team Roles & Responsibilities

| Member Name     | Role                  | Responsibilities                                |
| --------------- | --------------------- | ----------------------------------------------- |
| Harshit Agrawal | ML & System Architect | Model design, backend logic, evaluation metrics |
| Pushkar Gupta   | Frontend Developer    | React UI, dashboard development                 |
| Neha Sharma     | Data & Testing Lead   | Dataset validation, API testing                 |

---

# 15. Future Scope & Scalability

## Short-Term

- Batch multi-SKU forecasting
- Downloadable PDF reports
- Stockout alert notifications

## Long-Term

- LSTM / Deep Learning forecasting
- AutoML parameter tuning
- ERP integration
- Multi-warehouse optimization
- Cloud-native microservices architecture

---

# 16. Known Limitations

- Requires clean historical data
- Cannot predict black swan events
- Prophet increases computational load
- No real-time external demand signal integration

---

# 17. Impact

SmartStock AI enables:

- Reduced stockouts
- Optimized working capital
- Data-driven decision making
- Improved operational efficiency
- Increased profitability

It transforms businesses from reactive inventory management to predictive intelligence-driven operations.
