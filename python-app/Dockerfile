FROM python:3

# 작업 디렉토리 설정
WORKDIR /app

# 애플리케이션 코드 복사
COPY . .

# requirements.txt를 먼저 복사하여 캐싱 활용
COPY requirements.txt .

# 종속성 설치
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 실행
CMD ["/bin/bash", "-c", "source /app/.env && uvicorn app:app --host 0.0.0.0 --port 4000"]

