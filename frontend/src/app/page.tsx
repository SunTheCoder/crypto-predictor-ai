'use client';

import { useState } from 'react';
import { API_BASE_URL } from '../config/api';
import PriceChart from '../components/PriceChart';

function LoadingSkeleton() {
  return (
    <div 
      className="bg-white border border-zinc-200 shadow-sm animate-pulse"
      role="status"
      aria-label="Loading predictions"
    >
      <div className="p-8 space-y-4">
        <div className="h-6 bg-zinc-100 rounded w-1/4" aria-hidden="true"></div>
        <div className="h-4 bg-zinc-100 rounded w-3/4" aria-hidden="true"></div>
        <div className="space-y-3">
          <div className="h-4 bg-zinc-100 rounded w-full" aria-hidden="true"></div>
          <div className="h-4 bg-zinc-100 rounded w-5/6" aria-hidden="true"></div>
          <div className="h-4 bg-zinc-100 rounded w-4/6" aria-hidden="true"></div>
        </div>
        <div className="pt-4">
          <div className="h-6 bg-zinc-100 rounded w-1/4" aria-hidden="true"></div>
          <div className="h-4 bg-zinc-100 rounded w-3/4 mt-2" aria-hidden="true"></div>
          <div className="space-y-3 mt-3">
            <div className="h-4 bg-zinc-100 rounded w-full" aria-hidden="true"></div>
            <div className="h-4 bg-zinc-100 rounded w-5/6" aria-hidden="true"></div>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading crypto prediction...</span>
    </div>
  );
}

export default function Home() {
  const [crypto, setCrypto] = useState('bitcoin');
  const [timeframe, setTimeframe] = useState('7d');
  const [prediction, setPrediction] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [priceData, setPriceData] = useState<{
    historicalPrices: [number, number][];
    predictedRange?: { min: number; max: number; date: number };
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ crypto, timeframe }),
      });

      const data = await response.json();
      
      if (data.success) {
        const formattedResult = data.result
          .split('\n')
          .map((line: string) => line.trim())
          .join('\n');
        setPrediction(formattedResult);
        
        if (data.market_data?.prices) {
          setPriceData({
            historicalPrices: data.market_data.prices,
            predictedRange: data.predicted_range,
          });
        }
      } else {
        console.error('Error:', data.error);
        setPrediction('Sorry, there was an error getting the prediction.');
      }
    } catch (error) {
      console.error('Error:', error);
      setPrediction('Sorry, there was an error getting the prediction.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-light mb-12 text-zinc-800 text-center">
          Crypto Price Predictor
        </h1>

        <form 
          onSubmit={handleSubmit} 
          className="space-y-6 mb-12"
          aria-label="Prediction input form"
        >
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="crypto" 
                className="block text-sm font-medium text-zinc-600"
              >
                Select Cryptocurrency
              </label>
              <select
                id="crypto"
                value={crypto}
                onChange={(e) => setCrypto(e.target.value)}
                className="w-full p-2 bg-white border border-zinc-200 text-zinc-800 text-base outline-none focus:border-zinc-400 transition-colors"
              >
                <option value="bitcoin">Bitcoin (BTC)</option>
                <option value="ethereum">Ethereum (ETH)</option>
                <option value="binancecoin">Binance Coin (BNB)</option>
                <option value="cardano">Cardano (ADA)</option>
                <option value="solana">Solana (SOL)</option>
              </select>
            </div>
            
            <div>
              <label 
                htmlFor="timeframe" 
                className="block text-sm font-medium text-zinc-600"
              >
                Prediction Timeframe
              </label>
              <select
                id="timeframe"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full p-2 bg-white border border-zinc-200 text-zinc-800 text-base outline-none focus:border-zinc-400 transition-colors"
              >
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-1/2 py-3 px-4 bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors mx-auto block"
            aria-busy={isLoading}
          >
            {isLoading ? 'Getting prediction...' : 'Get Price Prediction'}
          </button>
        </form>

        <div className="max-w-4xl mx-auto px-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {priceData && (
                <div className="mb-8">
                  <PriceChart 
                    historicalPrices={priceData.historicalPrices}
                    predictedRange={priceData.predictedRange}
                    timeframe={timeframe}
                  />
                </div>
              )}
              {prediction && (
                <div 
                  className="bg-white border border-zinc-200 shadow-sm"
                  role="region"
                  aria-label="Crypto prediction"
                >
                  <pre className="whitespace-pre-wrap font-serif text-base leading-relaxed text-zinc-700 p-8">
                    {prediction}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
