from pydantic import BaseModel
from typing import List, Optional


class MonthlyExpense(BaseModel):
    month: int
    year: int
    total_expense: float


class PredictionRequest(BaseModel):
    history: List[MonthlyExpense]


class PredictionResponse(BaseModel):
    predicted_next_month: float
    confidence: str


class TransactionForAnomaly(BaseModel):
    id: int
    amount: float
    category_name: str
    transaction_date: str


class AnomalyRequest(BaseModel):
    transactions: List[TransactionForAnomaly]


class AnomalyResult(BaseModel):
    id: int
    amount: float
    category_name: str
    transaction_date: str
    is_anomaly: bool
    reason: Optional[str] = None


class AnomalyResponse(BaseModel):
    anomalies: List[AnomalyResult]