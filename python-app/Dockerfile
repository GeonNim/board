FROM python:3.10-slim

# 컨테이너 내부 작업 디렉토리 설정
WORKDIR /app

# 애플리케이션 파일 복사
COPY ./python-app/app.py /app/app.py

# 종속성 설치
RUN pip install --no-cache-dir fastapi uvicorn transformers torch

# 컨테이너 실행 시 애플리케이션 시작
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "4000"]
