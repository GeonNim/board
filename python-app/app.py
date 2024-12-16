from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch

# FastAPI 앱
app = FastAPI()

# 모델 초기화
try:
    model_name = "bert-base-uncased"  # 모델 이름을 직접 지정
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)
    model.eval()  # 추론 모드로 설정
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    print(f"Model '{model_name}' loaded on {device}")
except Exception as e:
    print(f"Error loading model: {e}")
    raise RuntimeError("Failed to load the model.")

# 입력 데이터 구조 정의
class PredictionRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/predict")
async def predict(request: PredictionRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")
    
    try:
        inputs = tokenizer(request.text, return_tensors="pt", truncation=True, max_length=512)
        inputs = {key: tensor.to(device) for key, tensor in inputs.items()}  # GPU로 전송
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
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Prediction failed.")
