/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState } from "react";
import { API_URL } from "../lib/config";

export default function Home() {
  const [ticker, setTicker] = useState("SPY");
  const [horizon, setHorizon] = useState(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predicted, setPredicted] = useState<number | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPredicted(null);

    try {
      const res = await fetch(
        `${API_URL}/predict?ticker=${ticker.toUpperCase()}&horizon=${horizon}`
      );

      if (!res.ok) {
        let detail = res.statusText;
        try {
          const data = await res.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          detail = (data as any).detail ?? detail;
        } catch {
          /* ignore */
        }
        throw new Error(`API error (${res.status}): ${detail}`);
      }

      const data: { predicted_price: number } = await res.json();
      setPredicted(data.predicted_price);
    } catch (err: unknown) {
      setError((err as Error).message);
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
          onClick={handlePredict}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Loading…" : "Predict"}
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {predicted !== null && !loading && (
        <p className="text-lg">
          {ticker.toUpperCase()} predicted price (next {horizon}d):{" "}
          <span className="font-semibold">${predicted.toFixed(2)}</span>
        </p>
      )}
    </main>
  );
}