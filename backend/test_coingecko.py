import requests

def test_coingecko():
    try:
        url = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart"
        params = {
            "vs_currency": "usd",
            "days": "7",
            "interval": "daily"
        }
        response = requests.get(url, params=params)
        data = response.json()
        print("CoinGecko API test successful!")
        print(data)
    except Exception as e:
        print(f"CoinGecko API test failed: {str(e)}")

if __name__ == "__main__":
    test_coingecko() 