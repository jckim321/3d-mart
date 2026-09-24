# 3D 마트 프로젝트

Three.js를 사용한 3D 가상 마트 웹 애플리케이션입니다.

## 기능

- 3D 가상 마트 공간 탐험
- 아바타 이동 및 3인칭 백뷰 시점
- 다양한 색상의 상품 아이템
- 근접 시 상점 아이템 팝업 표시
- 실내 마트 공간 (벽, 천장, 타일 바닥)
- 진열대 및 계산대 배치
- Firebase 통합
- Cloudflare R2 통합

## 설정

### 1. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 실제 값을 입력하세요:

```bash
cp .env.example .env
```

`.env` 파일에 다음 값을 설정하세요:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# Cloudflare R2 Configuration
R2_BUCKET_NAME=3d-mart-assets
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_ENDPOINT=https://your_endpoint.r2.cloudflarestorage.com
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 실행

#### 클라이언트 (3D 마트)

```bash
# 파일 직접 열기
# index.html을 브라우저에서 열기

# 또는 로컬 서버 사용
python -m http.server 8080
```

#### 서버 (R2 통합)

```bash
npm run server
```

## Firebase 사용

Firebase Manager를 통해 다음 작업을 수행할 수 있습니다:

```javascript
// 파일 업로드
const result = await firebaseManager.uploadFile(file, 'assets/image.jpg');

// 파일 다운로드
const result = await firebaseManager.downloadFile('assets/image.jpg');

// 파일 목록
const result = await firebaseManager.listFiles('assets/');

// 파일 삭제
const result = await firebaseManager.deleteFile('assets/image.jpg');
```

## Cloudflare R2 사용

서버를 통해 R2에 파일을 업로드할 수 있습니다:

```bash
# 서버 시작
npm run server

# 파일 업로드 API
POST http://localhost:3001/upload
Content-Type: multipart/form-data

# 파일 목록 API
GET http://localhost:3001/files
```

## 보안 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요
- `.gitignore`에 `.env`가 포함되어 있는지 확인하세요
- 프로덕션 환경에서는 환경 변수를 직접 설정하세요
- R2 자격 증명은 서버 측에서만 사용하세요

## 프로젝트 구조

```
3d-mart/
├── index.html              # 메인 HTML 파일
├── app.js                  # Three.js 3D 로직
├── style.css               # 스타일시트
├── firebase-integration.js # Firebase 통합
├── r2-config.js           # R2 설정
├── server.js              # R2 서버
├── package.json           # 프로젝트 설정
├── .env                   # 환경 변수 (Git 제외)
├── .env.example          # 환경 변수 예시
└── .gitignore            # Git 제외 파일
```

## 라이선스

MIT