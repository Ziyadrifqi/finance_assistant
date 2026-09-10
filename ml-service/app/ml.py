import numpy as np
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from app.schemas import MonthlyExpense, TransactionForAnomaly


def predict_next_month(history: list[MonthlyExpense]) -> tuple[float, str]:
    if len(history) < 3:
        avg = sum(h.total_expense for h in history) / len(history) if history else 0
        return avg, "rendah"

    X = np.array(range(len(history))).reshape(-1, 1)
    y = np.array([h.total_expense for h in history])

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    next_index = np.array([[len(history)]])
    prediction = model.predict(next_index)[0]

    confidence = "tinggi" if len(history) >= 6 else "sedang"

    return float(max(prediction, 0)), confidence


def detect_anomalies(transactions: list[TransactionForAnomaly]) -> list[dict]:
    if len(transactions) < 5:
        return [
            {
                "id": t.id,
                "amount": t.amount,
                "category_name": t.category_name,
                "transaction_date": t.transaction_date,
                "is_anomaly": False,
                "reason": None,
            }
            for t in transactions
        ]

    amounts = np.array([t.amount for t in transactions]).reshape(-1, 1)

    model = IsolationForest(contamination=0.1, random_state=42)
    predictions = model.fit_predict(amounts)

    mean_amount = float(np.mean(amounts))

    results = []
    for t, pred in zip(transactions, predictions):
        is_anomaly = pred == -1
        reason = None
        if is_anomaly:
            if t.amount > mean_amount:
                reason = f"Jumlah jauh lebih besar dari rata-rata transaksi ({mean_amount:,.0f})"
            else:
                reason = f"Jumlah jauh lebih kecil dari rata-rata transaksi ({mean_amount:,.0f})"

        results.append({
            "id": t.id,
            "amount": t.amount,
            "category_name": t.category_name,
            "transaction_date": t.transaction_date,
            "is_anomaly": bool(is_anomaly),
            "reason": reason,
        })

    return results