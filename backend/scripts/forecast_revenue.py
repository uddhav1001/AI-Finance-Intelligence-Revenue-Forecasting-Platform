import sys
import json
import pandas as pd
from prophet import Prophet
import logging
import os

# Suppress Prophet logs
logging.getLogger('cmdstanpy').setLevel(logging.WARNING)
logging.getLogger('prophet').setLevel(logging.WARNING)

def forecast_revenue():
    try:
        # Read data from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            return

        try:
            transactions = json.loads(input_data)
        except json.JSONDecodeError:
            print(json.dumps({"error": "Invalid JSON input"}))
            return
        
        if not transactions or len(transactions) < 2:
             print(json.dumps({"error": "Not enough data points for forecasting (minimum 2)"}))
             return

        # Prepare DataFrame
        df = pd.DataFrame(transactions)
        
        # Ensure we have required columns
        if 'date' not in df.columns or 'amount' not in df.columns:
            print(json.dumps({"error": "Input data must contain 'date' and 'amount' fields"}))
            return

        df['ds'] = pd.to_datetime(df['date']).dt.tz_localize(None)
        df['y'] = df['amount']
        
        # Aggregate by day
        df = df.groupby('ds')['y'].sum().reset_index()

        if len(df) < 2:
             print(json.dumps({"error": "Not enough daily data points (minimum 2 days)"}))
             return

        # Initialize and fit model
        # daily_seasonality=True if enough data, but auto is usually fine.
        m = Prophet()
        m.fit(df)

        # Create future dataframe (Next 30 days)
        future = m.make_future_dataframe(periods=30)
        forecast = m.predict(future)

        # Extract relevant columns for the NEXT 30 days (excluding history)
        # forecast contains history + future. We just want the future component mostly, 
        # but user might want to see the trend line over history too.
        # Requirement says "Future Trend".
        # Let's return the last 30 entries which should be the future prediction if we added 30 periods.
        # Actually make_future_dataframe appends periods.
        
        future_forecast = forecast.tail(30)
        
        # Convert to JSON friendly format
        forecast_result = []
        for index, row in future_forecast.iterrows():
            forecast_result.append({
                "date": row['ds'].strftime('%Y-%m-%d'),
                "forecast": round(row['yhat'], 2),
                "lower": round(row['yhat_lower'], 2),
                "upper": round(row['yhat_upper'], 2),
                "trend": "upward" if row['yhat'] > df['y'].mean() else "downward" # Simplified trend tag per point, but comprehensive trend logic is better handled in JS or via slope
            })
            
        # Calculate overall linear trend slope logic if needed, but for now just returning the data points
        # The frontend/backend can determine if it's "Upward/Downward" based on the first and last point of the forecast.

        print(json.dumps(forecast_result))

    except Exception as e:
        # Print error as JSON so backend can parse it safely
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    forecast_revenue()
