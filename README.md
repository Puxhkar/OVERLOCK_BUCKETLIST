SmartStock AI

AI-Powered Inventory Demand Forecasting & Intelligent Restocking System

Live Demo: https://overlock-bucketlist-1lbz.vercel.app/

Demo Video: https://www.loom.com/share/7b184df315a444c6818791ee3d9c512a

Presentation (PPT): https://drive.google.com/file/d/1Ycx-lIK1MFiB3f5rxeM9Z6XkC4VnCgyM/view

GitHub Repository: https://github.com/Puxhkar/OVERLOCK_BUCKETLIST

1. Problem Statement
Problem Title

Unpredictable Inventory Demand and Stock Imbalance in SMEs

Problem Description

Small and medium-sized enterprises (SMEs) struggle to forecast product demand accurately using traditional spreadsheet-based or manual methods. These approaches fail to capture seasonality, trends, and demand volatility, leading to inefficient inventory decisions.

As a result, businesses face:

Frequent stockouts and lost sales

Excess inventory and increased holding costs

Capital lock-in and cash flow issues

Reactive and inefficient supply chain planning

Target Users

Retail Store Managers

Inventory Planners

E-commerce Store Owners

FMCG Distributors

Direct-to-Consumer (D2C) Brands

Existing Gaps

Excel-based forecasting ignores seasonality and trends

Manual forecasting introduces human bias

Enterprise-grade ERP systems are costly and complex

Most AI tools require heavy infrastructure

Forecast uncertainty and safety stock are rarely quantified

2. Problem Understanding & Approach
Root Cause Analysis

Inventory demand is inherently time-series data composed of:

Trend: long-term growth or decline

Seasonality: recurring periodic patterns

Residual noise: random fluctuations

Most SMEs lack:

Time-series decomposition techniques

Scientific model evaluation methods

Statistical safety stock computation

Interpretable forecasting tools

Solution Approach

Design a full-stack AI system that:

Accepts historical SKU-level sales data

Automatically validates and preprocesses CSV input

Trains multiple forecasting models

Selects the best-performing model using RMSE

Computes confidence intervals and safety stock

Generates actionable restocking insights

Presents results via an intuitive dashboard

3. Proposed Solution
Solution Overview

SmartStock AI is a SaaS-style web application that provides SKU-level demand forecasting and automated restocking recommendations using ensemble time-series models.

Core Idea

Democratize enterprise-grade inventory forecasting by delivering accurate, interpretable, and automated AI insights through a simple web interface.

Key Features

CSV upload with schema validation

SKU-level demand forecasting

Ensemble forecasting engine

Moving Average

Holt-Winters

Prophet

Automatic model selection using RMSE

Time-series decomposition

Forecast confidence intervals

Safety stock and reorder point calculation

Business insight generation

4. System Architecture
High-Level Flow

User → Frontend → Backend → Forecasting Models → Response

Architecture Description

Frontend (React + Vite)

User interface and dashboard

SKU selection and KPI display

Forecast and confidence interval visualization

Backend (FastAPI)

CSV ingestion and validation

Forecast execution and metric computation

Business logic and insights generation

Model Layer

Multiple forecasting models

RMSE-based model comparison

Confidence interval computation

Database Layer (MVP)

In-memory data processing

Optional local caching

Response Layer

JSON output containing forecasts, metrics, and recommendations

5. Data Management & Design
Data Handling Strategy

The MVP uses in-memory processing to:

Ensure fast computation

Protect user data privacy

Avoid external storage dependency

Sales data is parsed, structured, and grouped by SKU.
Future versions can integrate PostgreSQL for persistence and Redis for caching.

6. Dataset Description
Dataset Used

Retail SKU Demand Dataset (Synthetic Sample Data)

Source

Custom-generated datasets:

example_data.csv

advanced_retail_demand.csv

Data Type

Time-series sales data at SKU level

Preprocessing Steps

Date parsing and validation

Chronological sorting

Missing value handling

Frequency detection

SKU-wise grouping

Time-series array conversion

7. Forecasting Models
Model Architecture

Ensemble Time-Series Forecasting System

Components:

Moving Average

Holt-Winters

Prophet

Model Selection Rationale

Moving Average: baseline smoothing

Holt-Winters: trend and seasonality modeling

Prophet: change-point and multi-seasonality handling

Ensemble approach improves robustness

Alternatives Considered

ARIMA: complex parameter tuning

LSTM: requires large datasets and GPUs

Single-model approaches: insufficient accuracy

Evaluation Metrics

Root Mean Squared Error (RMSE)

Residual standard deviation

95% confidence interval bounds

8. Technology Stack
Frontend

React

Vite

Recharts

Lucide-React

Backend

FastAPI

Uvicorn

Machine Learning

Pandas

NumPy

statsmodels

Prophet

scikit-learn

Deployment

Backend: Render

Frontend: Vercel / Netlify

9. API Design & Testing
API Endpoints

POST /upload

Accepts CSV file

Validates schema

Returns dataset summary

POST /forecast
Inputs:

SKU

Forecast horizon

Lead time

Outputs:

Forecast values

Confidence intervals

Selected model

RMSE score

Safety stock

Reorder point

GET /insights

Returns business insights based on forecast results

10. Development Milestones
Phase 1: Research & Planning

Model selection

Metric definition

Architecture design

Phase 2: Backend Development

API implementation

CSV parsing

Forecast engine

Phase 3: Frontend Development

Dashboard UI

Charts and KPIs

SKU selection

Phase 4: Model Integration

Ensemble logic

RMSE-based selection

Visualization binding

Phase 5: Deployment

Backend hosting

Frontend deployment

Environment setup

11. End-to-End Workflow

User uploads historical sales data

Backend validates and preprocesses input

Data grouped by SKU

Multiple models are trained

Best model selected using RMSE

Forecast generated with confidence bounds

Safety stock and reorder point calculated

Insights generated

Results visualized on dashboard

12. Hackathon Deliverables

Fully functional full-stack forecasting system

Ensemble model-based forecasting

Confidence interval visualization

SKU-level demand prediction

Automated restocking recommendations

SaaS-style modern UI

13. Team Roles
Name	Role	Responsibilities
Harshit Agrawal	ML & System Architect	Model design, backend logic, evaluation
Pushkar Gupta	Frontend Developer	UI development, dashboard implementation
Neha Sharma	Data & Testing Lead	Dataset validation, API testing
14. Future Scope
Short-Term

Multi-SKU batch forecasting

PDF report generation

Stockout alerts

Long-Term

Deep learning models (LSTM)

AutoML tuning

ERP integrations

Multi-warehouse optimization

Microservices-based cloud architecture

15. Limitations

Requires clean historical data

Cannot predict rare black-swan events

Prophet adds computational overhead

No real-time external demand signals

16. Impact

SmartStock AI enables businesses to:

Reduce stockouts

Optimize inventory holding costs

Improve cash flow

Make data-driven inventory decisions

Transition from reactive to predictive inventory management
