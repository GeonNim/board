# Node.js 이미지 사용
FROM node:20.15.1

# 앱 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 애플리케이션 코드 복사
COPY . .

# 앱 실행 포트
EXPOSE 8000

# 애플리케이션 실행
CMD ["npm", "start"]

