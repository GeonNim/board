from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch
from dotenv import load_dotenv
import os
import asyncpg

# 환경 변수 로드
env_path = os.getenv("ENV_PATH", "./.env")  # 기본값 설정
load_dotenv(env_path)

# 환경 변수 설정
db_host = os.getenv("DB_HOST", "localhost")
db_user = os.getenv("DB_USER", "user")
db_password = os.getenv("DB_PASSWORD", "password")
db_name = os.getenv("DB_NAME", "database")
db_port = os.getenv("DB_PORT", "5432")
model_name = os.getenv("MODEL_NAME", "distilbert-base-uncased")

# FastAPI 앱
app = FastAPI()

# 모델 초기화
try:
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)
    model.eval()  # 추론 모드로 설정
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    print(f"Model '{model_name}' loaded on {device}")
except Exception as e:
    print(f"Error loading model: {e}")
    raise RuntimeError("Failed to load the model.")

# 데이터베이스 연결
conn = None

@app.on_event("startup")
async def startup_event():
    global conn
    try:
        conn = await asyncpg.connect(
            user=db_user,
            password=db_password,
            database=db_name,
            host=db_host,
            port=db_port,
        )
        print("Database connection successful")
    except Exception as e:
        print(f"Database connection failed: {e}")
        raise RuntimeError("Failed to connect to the database.")

@app.on_event("shutdown")
async def shutdown_event():
    global conn
    if conn:
        await conn.close()
        print("Database connection closed.")

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
