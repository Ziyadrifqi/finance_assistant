from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    PredictionRequest,
    PredictionResponse,
    AnomalyRequest,
    AnomalyResponse,
    OcrResponse,
)
from app.ml import predict_next_month, detect_anomalies
from app.ocr import extract_receipt_data

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


@app.post("/ocr/receipt", response_model=OcrResponse)
async def ocr_receipt(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar")

    image_bytes = await file.read()
    result = extract_receipt_data(image_bytes)
    return OcrResponse(**result)