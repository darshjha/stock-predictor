"use client";

import { useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

type DataPoint = {
  date: string;
  close: number;
};

export default function Home() {
  const [ticker, setTicker] = useState("SPY");
  const [horizon, setHorizon] = useState(5);
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [predicted, setPredicted] = useState<number | null>(null);

  const fetchPrediction = async () => {
    try {
      // Fetch prediction
      const res = await axios.get(
        `/predict?ticker=${ticker.toUpperCase()}&horizon=${horizon}`
      );
      setPredicted(res.data.predicted_price);

      // Fetch historical prices for chart (last 60d)
      const hist = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=2mo&interval=1d`
      );
      const candles = hist.data.chart.result[0];
      const prices: DataPoint[] = candles.timestamp.map(
        (t: number, idx: number) => ({
          date: new Date(t * 1000).toLocaleDateString(),
          close: candles.indicators.quote[0].close[idx]
        })
      );

      // Append predicted point (dummy date label "Prediction")
      prices.push({
        date: "Prediction",
        close: res.data.predicted_price
      });

      setChartData(prices);
    } catch (err) {
      // TODO: better error handling / toast
      console.error(err);
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
          onClick={fetchPrediction}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Predict
        </button>
      </div>

      {predicted !== null && (
        <p className="text-lg">
          {ticker.toUpperCase()} predicted price (next&nbsp;
          {horizon}d):{" "}
          <span className="font-semibold">${predicted.toFixed(2)}</span>
        </p>
      )}

      <div className="w-full h-96">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" hide />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#2563eb"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}