/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState } from "react";
import { api, API_URL } from "../lib/api";

type Prediction = {
  ticker: string;
  horizon: number;
  predicted_price: number;
};

export default function Home() {
  const [ticker, setTicker] = useState("SPY");
  const [horizon, setHorizon] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Prediction | null>(null);

  const onPredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const r = await api.get<Prediction>("/predict", {
        params: { ticker: ticker.toUpperCase(), horizon },
      });
      setResult(r.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-6 space-y-6 bg-gray-50">
      <h1 className="text-3xl font-bold">Stock Predictor</h1>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="border p-2 rounded w-32 text-center"
        />

        <select
          value={horizon}
          onChange={(e) => setHorizon(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {[1, 5, 10].map((d) => (
            <option key={d} value={d}>
              {d} day{d > 1 && "s"}
            </option>
          ))}
        </select>

        <button
          onClick={onPredict}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Loading…" : "Predict"}
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {result && !loading && (
        <p className="text-lg">
          {result.ticker} predicted price (next {result.horizon}d): {" "}
          <span className="font-semibold">
            ${result.predicted_price.toFixed(2)}
          </span>
        </p>
      )}

      <p className="text-xs text-gray-400 mt-4">API_URL: {API_URL}</p>
    </main>
  );
}