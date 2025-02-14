'use client';

import { useState } from 'react';
import { API_BASE_URL } from '../config/api';
import PriceChart from '../components/PriceChart';
import TimeDisplay from '../components/TimeDisplay';

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card">
            <div className="stat-label">Selected Asset</div>
            <div className="stat-value">{crypto.toUpperCase()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Timeframe</div>
            <div className="stat-value">{timeframe}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Last Updated</div>
            <TimeDisplay />
          </div>
        </div>

        <div className="finance-card p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="crypto" className="block text-sm font-medium mb-2">
                  Select Cryptocurrency
                </label>
                <select
                  id="crypto"
                  value={crypto}
                  onChange={(e) => setCrypto(e.target.value)}
                  className="finance-input"
                >
                  <option value="bitcoin">Bitcoin (BTC)</option>
                  <option value="ethereum">Ethereum (ETH)</option>
                  <option value="binancecoin">Binance Coin (BNB)</option>
                  <option value="cardano">Cardano (ADA)</option>
                  <option value="solana">Solana (SOL)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="timeframe" className="block text-sm font-medium mb-2">
                  Prediction Timeframe
                </label>
                <select
                  id="timeframe"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="finance-input"
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
              className="finance-button w-full md:w-auto md:ml-auto md:block"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                'Get Price Prediction'
              )}
            </button>
          </form>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {priceData && (
              <div className="finance-card p-6 mb-8">
                <PriceChart 
                  historicalPrices={priceData.historicalPrices}
                  predictedRange={priceData.predictedRange}
                  timeframe={timeframe}
                />
              </div>
            )}
            {prediction && (
              <div className="finance-card p-6">
                <h2 className="text-lg font-semibold mb-4">Analysis & Prediction</h2>
                <div className="prose prose-blue max-w-none">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[var(--foreground)]">
                    {prediction}
                  </pre>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
