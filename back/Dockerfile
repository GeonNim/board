# 1단계: 빌드 환경
FROM node:20.15.1-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 종속성 파일 복사 및 설치
COPY package*.json ./
RUN npm install --production

# 애플리케이션 파일 복사
COPY . .

# 2단계: 런타임 환경
FROM node:20.15.1-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 빌드 단계에서 필요한 파일만 복사
COPY --from=builder /app /app

# 포트 설정
EXPOSE 8000

# 애플리케이션 실행
CMD ["npm", "start"]
