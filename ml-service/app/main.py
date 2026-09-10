from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    PredictionRequest,
    PredictionResponse,
    AnomalyRequest,
    AnomalyResponse,
)
from app.ml import predict_next_month, detect_anomalies

app = FastAPI(title="Finance AI - ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "UP", "service": "finance-ai-ml-service"}


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    predicted, confidence = predict_next_month(request.history)
    return PredictionResponse(predicted_next_month=predicted, confidence=confidence)


@app.post("/anomaly", response_model=AnomalyResponse)
def anomaly(request: AnomalyRequest):
    results = detect_anomalies(request.transactions)
    return AnomalyResponse(anomalies=results)