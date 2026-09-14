import re
import easyocr
import numpy as np
from PIL import Image
import io

# Inisialisasi reader sekali saja saat module di-load (biar nggak re-load model tiap request)
# 'id' = Indonesia, 'en' = Inggris (jaga-jaga ada teks Inggris di struk)
_reader = easyocr.Reader(["id", "en"], gpu=False)

# Kata kunci yang biasanya muncul dekat nominal total di struk Indonesia
TOTAL_KEYWORDS = ["total", "jumlah", "grand total", "total bayar", "total belanja", "bayar"]


def extract_receipt_data(image_bytes: bytes) -> dict:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)

    results = _reader.readtext(image_np, detail=0)  # detail=0 -> cuma teksnya aja
    raw_text = results

    detected_amount = _guess_total_amount(raw_text)
    detected_date = _guess_date(raw_text)

    return {
        "raw_text": raw_text,
        "detected_amount": detected_amount,
        "detected_date": detected_date,
    }


def _clean_number(text: str) -> float | None:
    """Ubah teks seperti 'Rp 45.000' atau '45,000' jadi angka 45000.0"""
    cleaned = re.sub(r"[^\d]", "", text)
    if not cleaned:
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def _guess_total_amount(lines: list[str]) -> float | None:
    candidates = []

    for i, line in enumerate(lines):
        lower = line.lower()
        if any(keyword in lower for keyword in TOTAL_KEYWORDS):
            # Coba ambil angka dari baris yang sama dulu
            numbers = re.findall(r"[\d.,]+\d", line)
            if numbers:
                amount = _clean_number(numbers[-1])
                if amount and amount > 100:  # filter angka kekecilan (misal nomor struk)
                    candidates.append(amount)
            # Kalau nggak ada di baris yang sama, coba baris berikutnya
            elif i + 1 < len(lines):
                numbers = re.findall(r"[\d.,]+\d", lines[i + 1])
                if numbers:
                    amount = _clean_number(numbers[-1])
                    if amount and amount > 100:
                        candidates.append(amount)

    if candidates:
        # Ambil yang terbesar dari kandidat dekat kata kunci "total" (biasanya itu yang benar)
        return max(candidates)

    # Fallback: kalau nggak ketemu kata kunci sama sekali, ambil angka terbesar di seluruh struk
    all_numbers = []
    for line in lines:
        numbers = re.findall(r"[\d.,]+\d", line)
        for n in numbers:
            amount = _clean_number(n)
            if amount and amount > 100:
                all_numbers.append(amount)

    return max(all_numbers) if all_numbers else None


def _guess_date(lines: list[str]) -> str | None:
    date_patterns = [
        r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}",  # 12/07/2026 atau 12-07-26
        r"\d{4}[/-]\d{1,2}[/-]\d{1,2}",     # 2026-07-12
    ]
    for line in lines:
        for pattern in date_patterns:
            match = re.search(pattern, line)
            if match:
                return match.group()
    return None