import sys
import json
import pandas as pd
from prophet import Prophet

def get_prediction():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            return

        data = json.loads(input_data)
        
        if not data:
            print(json.dumps({'error': 'No data provided'}))
            return

        df = pd.DataFrame(data)
        
        # Prophet requires columns 'ds' and 'y'
        # Group by date to handle multiple entries on same day
        df = df.groupby('ds')['y'].sum().reset_index()

        m = Prophet()
        m.fit(df)

        future = m.make_future_dataframe(periods=30)
        forecast = m.predict(future)

        # Filter for future dates only
        last_date = df['ds'].max()
        future_forecast = forecast[forecast['ds'] > last_date]

        result = future_forecast[['ds', 'yhat']].to_dict(orient='records')
        
        # Convert Timestamps to strings
        for item in result:
            item['ds'] = item['ds'].strftime('%Y-%m-%d')

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}))

if __name__ == '__main__':
    get_prediction()
