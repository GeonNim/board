from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch

# FastAPI 앱
app = FastAPI()

# Hugging Face 모델 로드
model_name = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# 입력 데이터 구조 정의
class PredictionRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}


@app.post("/predict")
async def predict(request: PredictionRequest):
    inputs = tokenizer(request.text, return_tensors="pt")
    outputs = model(**inputs)
    predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
    labels = ["negative", "positive"]
    result = {
        "text": request.text,
        "predictions": [
            {"label": labels[i], "score": float(predictions[0][i])}
            for i in range(len(labels))
        ],
    }
    return result
