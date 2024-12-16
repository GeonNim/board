# PostgreSQL Alpine 기본 이미지 사용
FROM postgres:17.2-alpine

# 필수 패키지 설치: envsubst 제공을 위한 gettext 설치
RUN apk add --no-cache gettext

# 환경 변수 처리 및 기본 entrypoint 설정
ENTRYPOINT ["/bin/sh", "-c", "if [ -f /app/.env ]; then source /app/.env; fi && exec docker-entrypoint.sh postgres"]

# PostgreSQL 기본 포트 노출
EXPOSE 5432
