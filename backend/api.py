from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from crypto_predictor import predict_crypto

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://crypto-predictor-ai.vercel.app"  # Add your frontend deployment URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Crypto Predictor API is running"}

class PredictionRequest(BaseModel):
    crypto: str
    timeframe: str

@app.post("/predict")
async def get_prediction(request: PredictionRequest):
    try:
        print(f"Received request for crypto: {request.crypto}, timeframe: {request.timeframe}")
        result, market_data, prediction_date = predict_crypto(request.crypto, request.timeframe)
        print(f"Prediction result: {result}")
        
        # Extract predicted range from the result
        predicted_range = None
        if "Price Prediction" in result:
            try:
                price_line = [line for line in result.split('\n') if "Price Prediction" in line][0]
                # Extract numbers after $ signs
                numbers = [float(s.replace('$', '').replace(',', '')) for s in price_line.split() if '$' in s]
                if len(numbers) >= 2:
                    predicted_range = {
                        "min": min(numbers),
                        "max": max(numbers),
                        "date": prediction_date
                    }
            except Exception as e:
                print(f"Error parsing prediction: {e}")
                pass

        return {
            "success": True, 
            "result": result,
            "market_data": market_data,
            "predicted_range": predicted_range
        }
    except Exception as e:
        print(f"API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 