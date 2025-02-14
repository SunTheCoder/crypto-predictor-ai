from langchain_openai import OpenAI
from langchain.prompts import PromptTemplate
import json
from dotenv import load_dotenv
import os
import requests
import sys
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

# CoinGecko API base URL
COINGECKO_API_URL = "https://api.coingecko.com/api/v3"

def get_crypto_data(crypto_id, days=30):
    """Fetch historical price data from CoinGecko"""
    try:
        url = f"{COINGECKO_API_URL}/coins/{crypto_id}/market_chart"
        params = {
            "vs_currency": "usd",
            "days": days,
            "interval": "daily"
        }
        response = requests.get(url, params=params)
        data = response.json()
        
        # Take only the last 7 days of data to reduce tokens
        if 'prices' in data:
            data['prices'] = data['prices'][-7:]
        if 'market_caps' in data:
            data['market_caps'] = data['market_caps'][-7:]
        if 'total_volumes' in data:
            data['total_volumes'] = data['total_volumes'][-7:]
            
        return data
    except Exception as e:
        print(f"Error fetching crypto data: {e}")
        return None

# Initialize OpenAI LLM
llm = OpenAI(
    temperature=0.7,
    max_tokens=2000
)

# Create prompt template
crypto_prompt = PromptTemplate(
    input_variables=["crypto", "timeframe", "market_data"],
    template="""
    You are a cryptocurrency market analyst. Based on the provided market data and trends, 
    provide a detailed analysis and price prediction for the specified cryptocurrency.
    
    Cryptocurrency: {crypto}
    Prediction Timeframe: {timeframe}
    
    Historical Market Data:
    {market_data}
    
    Provide the following analysis:
    1. Price Prediction: Give a specific price range prediction for {timeframe} (Format as 'Price Prediction: $X to $Y')
    2. Market Sentiment: Analyze current market sentiment
    3. Key Factors: List main factors influencing your prediction
    4. Risk Assessment: Provide key risks and considerations
    5. Technical Analysis: Brief technical analysis based on historical data
    
    Important: Make sure to format the Price Prediction line exactly as 'Price Prediction: $X to $Y' for parsing.
    Remember to include appropriate disclaimers about market volatility and investment risks.
    """
)

def predict_crypto(crypto_id, timeframe):
    try:
        # Fetch market data
        market_data = get_crypto_data(crypto_id)
        
        if not market_data:
            return "Error: Unable to fetch market data from CoinGecko", None, None
        
        # Calculate prediction date based on timeframe
        prediction_date = datetime.now()
        if timeframe == "24h":
            prediction_date = prediction_date + timedelta(days=1)
        elif timeframe == "7d":
            prediction_date = prediction_date + timedelta(days=7)
        elif timeframe == "30d":
            prediction_date = prediction_date + timedelta(days=30)
        elif timeframe == "90d":
            prediction_date = prediction_date + timedelta(days=90)
        
        # Create and invoke the chain
        chain = crypto_prompt | llm
        
        # Get prediction
        response = chain.invoke({
            "crypto": crypto_id,
            "timeframe": timeframe,
            "market_data": json.dumps(market_data, indent=2)
        })
        
        return response, market_data, prediction_date.timestamp() * 1000  # Convert to milliseconds
    except Exception as e:
        print(f"Error in predict_crypto: {str(e)}")
        return f"Error: {str(e)}", None, None

if __name__ == "__main__":
    try:
        # Read input from stdin
        input_data = json.loads(input())
        crypto_id = input_data.get("crypto", "bitcoin")
        timeframe = input_data.get("timeframe", "7d")
        
        # Get prediction
        result, market_data, prediction_timestamp = predict_crypto(crypto_id, timeframe)
        
        # Print the response
        json.dump({
            "success": True,
            "result": result,
            "market_data": market_data,
            "prediction_timestamp": prediction_timestamp
        }, sys.stdout, ensure_ascii=False)
        sys.stdout.flush()
        
    except Exception as e:
        json.dump({
            "success": False,
            "error": str(e)
        }, sys.stdout)
        sys.stdout.flush() 