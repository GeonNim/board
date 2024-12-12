# Node.js 이미지 사용
FROM node:20.15.1

# 작업 디렉토리 설정
WORKDIR /app

# package.json 복사 및 종속성 설치
COPY package*.json ./
RUN npm install
RUN npm install dotenv

# 애플리케이션 파일 복사
COPY . .

# 포트 설정
EXPOSE 8000

# 애플리케이션 실행
CMD ["npm", "start"]
