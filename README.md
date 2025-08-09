# Stock-Predictor

A toy project demonstrating end-to-end stock-price prediction with a FastAPI backend, Next.js frontend, and CI/CD pipeline.

> **Disclaimer**  
> This project is for educational use only and **NOT financial advice**.

## Quick-start

```bash
# clone & install
git clone https://github.com/your-org/stock-predictor.git
cd stock-predictor
pip install -r requirements.txt

# train initial model
python src/train.py

# run API
uvicorn app.main:app --reload
```

### Front-end development

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

> **Tip:** create `/frontend/.env.local` so the frontend knows where the FastAPI backend lives:
>
> ```bash
> NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
> ```

### Docker

```bash
docker build -t stock-predictor -f deploy/Dockerfile .
docker run -p 8000:8000 stock-predictor
```

### CI / Deployment
* GitHub Actions workflow in `deploy/ci.yml` runs tests, lint, and (placeholder) deploy steps.  
* Suggested targets: **Render** for the FastAPI container, **Vercel** for the Next.js frontend.

### Repository Structure

```
├─ app/              # FastAPI service
├─ src/              # training + helpers
├─ frontend/         # Next.js 14 + Tailwind UI
├─ tests/            # pytest suite
├─ deploy/           # Dockerfile, CI workflow
├─ data/, models/    # runtime artifacts (ignored in Git)
└─ docs/             # model card & architecture
```

### Roadmap
* Expand feature engineering (TA-Lib, lag features)  
* Sequence models (LSTM/Transformer) for multi-step forecasting  
* Real-time streaming data ingestion  