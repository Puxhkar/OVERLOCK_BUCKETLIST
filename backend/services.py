import pandas as pd
import numpy as np
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.metrics import mean_squared_error
from prophet import Prophet
import json
import warnings
warnings.filterwarnings("ignore")

def process_upload(df):
    required_cols = ['Date', 'SKU', 'Sales_Quantity', 'Current_Stock']
    if not all(col in df.columns for col in required_cols):
        raise ValueError("CSV must contain columns: Date, SKU, Sales_Quantity, Current_Stock")
        
    skus = df['SKU'].unique().tolist()
    
    
    total_sales = df['Sales_Quantity'].sum()
    total_stock = df.groupby('SKU')['Current_Stock'].last().sum()
    
    summary = {
        "total_skus": len(skus),
        "total_records": len(df),
        "total_sales": int(total_sales),
        "current_stock_valuation": int(total_stock)
    }
    
    return skus, summary

def generate_forecast(df, sku, days_to_forecast=30):
    df_sku = df[df['SKU'] == sku].copy()
    if df_sku.empty:
        raise ValueError(f"SKU {sku} not found in the dataset.")
        
    df_sku['Date'] = pd.to_datetime(df_sku['Date'])
    df_sku = df_sku.sort_values('Date').reset_index(drop=True)
    
  
    df_sku = df_sku.set_index('Date')

    df_ts = df_sku[['Sales_Quantity']].resample('D').sum().fillna(0)
    

    if len(df_ts) < 14:
        raise ValueError("Not enough historical data to generate forecast. Need at least 14 days.")
        
    ts_data = df_ts['Sales_Quantity'].values
    dates = df_ts.index.tolist()
    
  
    period = 7 if len(ts_data) > 14 else 3 
    try:
        decomposition = seasonal_decompose(df_ts['Sales_Quantity'], model='additive', period=period)
        trend = decomposition.trend.fillna(0).tolist()
        seasonality = decomposition.seasonal.fillna(0).tolist()
        residual = decomposition.resid.fillna(0).tolist()
    except:
        trend = []
        seasonality = []
        residual = []

   

    train_size = int(len(ts_data) * 0.8)
    train_data, test_data = ts_data[:train_size], ts_data[train_size:]
    
    models_evaluation = {}
    predictions = {}
    

    window = min(7, len(train_data)//2)

    ma_pred = [np.mean(train_data[-window:])] * len(test_data)
    models_evaluation['Moving Average'] = np.sqrt(mean_squared_error(test_data, ma_pred))


    try:
        hw_model = ExponentialSmoothing(train_data, trend='add', seasonal='add', seasonal_periods=period).fit()
        hw_pred = hw_model.forecast(len(test_data))
        models_evaluation['Exponential Smoothing'] = np.sqrt(mean_squared_error(test_data, hw_pred))
    except Exception as e:
        print(f"HW failed: {e}")
        pass

   
    try:
        prophet_df = df_ts.iloc[:train_size].reset_index()
        prophet_df.columns = ['ds', 'y']
        p_model = Prophet(daily_seasonality=True, yearly_seasonality=False)
        p_model.fit(prophet_df)
        future = p_model.make_future_dataframe(periods=len(test_data))
        forecast_p = p_model.predict(future)
        prophet_pred = forecast_p['yhat'].iloc[-len(test_data):].values
        models_evaluation['Prophet'] = np.sqrt(mean_squared_error(test_data, prophet_pred))
    except Exception as e:
        print(f"Prophet failed: {e}")
        pass

   
    if not models_evaluation:
        models_evaluation['Moving Average'] = 999999 # fallback
    
    best_model_name = min(models_evaluation, key=models_evaluation.get)
   

    future_dates = pd.date_range(start=df_ts.index[-1] + pd.Timedelta(days=1), periods=days_to_forecast)
    future_dates_str = future_dates.strftime('%Y-%m-%d').tolist()

    forecast_outputs = {}
    
    if best_model_name == 'Prophet':
        best_rmse = models_evaluation['Prophet']
        prophet_df = df_ts.reset_index()
        prophet_df.columns = ['ds', 'y']
        p_model = Prophet(daily_seasonality=True, yearly_seasonality=False)
        p_model.fit(prophet_df)
        future = p_model.make_future_dataframe(periods=days_to_forecast)
        forecast_p = p_model.predict(future)
        
        future_forecast = forecast_p['yhat'].iloc[-days_to_forecast:].tolist()
        lower_bound = forecast_p['yhat_lower'].iloc[-days_to_forecast:].tolist()
        upper_bound = forecast_p['yhat_upper'].iloc[-days_to_forecast:].tolist()
        
    elif best_model_name == 'Exponential Smoothing':
        best_rmse = models_evaluation['Exponential Smoothing']
        hw_model = ExponentialSmoothing(ts_data, trend='add', seasonal='add', seasonal_periods=period).fit()
        future_forecast = hw_model.forecast(days_to_forecast).tolist()
        
     

        lower_bound = [max(0, val - 1.96 * best_rmse) for val in future_forecast]
        upper_bound = [val + 1.96 * best_rmse for val in future_forecast]
    else:
        best_rmse = models_evaluation['Moving Average']
        ma_val = np.mean(ts_data[-window:])
        future_forecast = [ma_val] * days_to_forecast
        std_val = np.std(ts_data[-window:]) if len(ts_data[-window:]) > 1 else 10
        lower_bound = [max(0, val - 1.96 * std_val) for val in future_forecast]
        upper_bound = [val + 1.96 * std_val for val in future_forecast]
        best_model_name = 'Moving Average'



    hist_dates = [d.strftime('%Y-%m-%d') for d in df_ts.index]
    hist_values = ts_data.tolist()

    # Anomaly Detection
    mean_val = np.mean(hist_values)
    std_val = np.std(hist_values)
    upper_threshold = mean_val + (2 * std_val)
    lower_threshold = mean_val - (2 * std_val)
    
    anomalies = []
    for d_str, v in zip(hist_dates, hist_values):
        if v > upper_threshold:
            anomalies.append({"date": d_str, "value": float(v), "type": "spike"})
        elif v < lower_threshold and v >= 0:
            anomalies.append({"date": d_str, "value": float(v), "type": "drop"})

    return {
        "sku": sku,
        "best_model": best_model_name,
        "rmse": float(best_rmse),
        "historical": {
            "dates": hist_dates,
            "values": hist_values,
        },
        "anomalies": anomalies,
        "decomposition": {
            "trend": trend,
            "seasonality": seasonality,
            "residual": residual
        },
        "forecast": {
            "dates": future_dates_str,
            "predictions": [round(val, 2) for val in future_forecast],
            "lower_bound": [round(val, 2) for val in lower_bound],
            "upper_bound": [round(val, 2) for val in upper_bound]
        }
    }


def get_recommendations(df, sku, lead_time=7):
  

    df_sku = df[df['SKU'] == sku].copy()
    if df_sku.empty:
        raise ValueError(f"SKU {sku} not found.")
        
    df_sku['Date'] = pd.to_datetime(df_sku['Date'])
    df_sku = df_sku.sort_values('Date')
    
    current_stock = df_sku['Current_Stock'].iloc[-1]
    last_prices = df_sku['Sales_Quantity']
    
  

    avg_daily_demand = last_prices.mean()
    std_daily_demand = last_prices.std()
    
    lead_time_demand = avg_daily_demand * lead_time
    
  

    safety_stock = 1.65 * std_daily_demand * np.sqrt(lead_time)
    reorder_point = lead_time_demand + safety_stock
    
    recommended_restock = 0
    if current_stock < reorder_point:
        recommended_restock = reorder_point - current_stock
        
    stockout_risk = 0.0
    overstock_risk = 0.0
    
    if current_stock < lead_time_demand:
        stockout_risk = 80.0 + min((lead_time_demand - current_stock) / lead_time_demand * 20, 20)
    elif current_stock < reorder_point:
        stockout_risk = 40.0
    else:
        stockout_risk = max(0, 10 - (current_stock - reorder_point)/reorder_point * 10)
        
    if current_stock > reorder_point * 2:
        overstock_risk = min(100.0, ((current_stock - reorder_point * 2) / (reorder_point * 2) * 50) + 50)

    return {
        "sku": sku,
        "current_stock": int(current_stock),
        "lead_time": lead_time,
        "lead_time_demand": round(lead_time_demand, 2),
        "safety_stock": round(safety_stock, 2),
        "reorder_point": round(reorder_point, 2),
        "recommended_restock": int(recommended_restock),
        "stockout_risk_pct": round(stockout_risk, 1),
        "overstock_risk_pct": round(overstock_risk, 1)
    }

def get_insights(df, sku=None):
    if sku:
        df = df[df['SKU'] == sku].copy()
        
    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values('Date')
    
    if df.empty:
        return {"insights": ["No data available to generate insights."]}
        
    insights = []
    
    

    recent_period = df.iloc[-14:]
    past_period = df.iloc[-28:-14]
    
    recent_sales = recent_period['Sales_Quantity'].sum()
    past_sales = past_period['Sales_Quantity'].sum()
    
    if recent_sales > past_sales * 1.1:
        insights.append("Uptrend detected: Sales have grown by more than 10% in the last 14 days compared to the prior period.")
    elif recent_sales < past_sales * 0.9:
        insights.append("Downtrend detected: Sales have decreased by over 10% recently. Consider adjusting inventory down.")
    else:
        insights.append("Sales trend is relatively stable over the last month.")
        


    df['DayOfWeek'] = df['Date'].dt.day_name()
    dow_grouped = df.groupby('DayOfWeek')['Sales_Quantity'].mean().sort_values(ascending=False)
    best_day = dow_grouped.index[0]
    insights.append(f"Seasonal Peak: {best_day} is typically the highest selling day of the week.")
    

    stock = df['Current_Stock'].iloc[-1]
    avg_daily = df['Sales_Quantity'].mean()
    days_of_inventory = stock / avg_daily if avg_daily > 0 else 999
    
    if days_of_inventory > 60:
        insights.append(f"Business Insight: You currently hold over 60 days of inventory ({int(days_of_inventory)} days). Potential overstock risk.")
    elif days_of_inventory < 7:
        insights.append(f"Business Insight: High risk of stockout! Only {int(days_of_inventory)} days of inventory left at current run rate.")
    
    return {
        "insights": insights,
        "metrics": {
            "recent_14_day_sales": int(recent_sales),
            "prior_14_day_sales": int(past_sales),
            "days_of_inventory": round(days_of_inventory, 1)
        }
    }

def get_portfolio(df):
    required_cols = ['Date', 'SKU', 'Sales_Quantity', 'Current_Stock']
    if not all(col in df.columns for col in required_cols):
        raise ValueError("CSV must contain columns: Date, SKU, Sales_Quantity, Current_Stock")
    
    sku_sales = df.groupby('SKU')['Sales_Quantity'].sum().reset_index()
    sku_sales = sku_sales.sort_values(by='Sales_Quantity', ascending=False)
    
    total_sales = sku_sales['Sales_Quantity'].sum()
    if total_sales == 0:
        total_sales = 1
        
    sku_sales['Cumulative_Sales'] = sku_sales['Sales_Quantity'].cumsum()
    sku_sales['Cumulative_Pct'] = sku_sales['Cumulative_Sales'] / total_sales
    
    def classify_abc(pct):
        if pct <= 0.8:
            return 'A'
        elif pct <= 0.95:
            return 'B'
        else:
            return 'C'
            
    sku_sales['ABC_Class'] = sku_sales['Cumulative_Pct'].apply(classify_abc)
    latest_stock = df.sort_values('Date').groupby('SKU')['Current_Stock'].last().reset_index()
    portfolio_df = pd.merge(sku_sales, latest_stock, on='SKU')
    
    days_count = len(df['Date'].unique())
    if days_count == 0: days_count = 1
    
    portfolio = []
    for _, row in portfolio_df.iterrows():
        status = "Healthy"
        if row['Current_Stock'] <= 0:
            status = "Stockout"
        elif row['Current_Stock'] < (row['Sales_Quantity'] / days_count) * 7:
            status = "Low Stock"
            
        portfolio.append({
            "sku": row['SKU'],
            "total_sales": int(row['Sales_Quantity']),
            "current_stock": int(row['Current_Stock']),
            "abc_class": row['ABC_Class'],
            "status": status
        })
        
    return {"portfolio": portfolio}

