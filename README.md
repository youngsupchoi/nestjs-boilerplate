<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# NestJSApiBoilerplateJWT

An API Boilerplate to create a ready-to-use REST API in seconds with NestJS 10.x and JWT Auth System :heart_eyes_cat:

## Installation

```bash
   pnpm install
```

## Set Environment for secret key JWT and other configurations

```bash
   cp .env.example .env
```

To set up on multiple environments, such as dev, stage or prod, we do as follows:

```bash
   cp .env.example .env.dev # or .env.stage, etc
```

## Config settings .env for sending a notification when a user registers, forgets password or changes password

```
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_AUTH_USER=[:user]
   EMAIL_AUTH_PASSWORD=[:password]
   EMAIL_DEBUG=true
   EMAIL_LOGGER=true
```

## Config settings .env for Claude AI Chat Service

To use the Claude AI chat functionality, add your Anthropic API key:

```
   ANTHROPIC_API_KEY=[:your_anthropic_api_key]
```

Get your API key from [Anthropic Console](https://console.anthropic.com/). If not provided, the chat service will return a demo message.

## 🔮 사주 (Four Pillars of Destiny) Service

이 API는 정확한 사주팔자 계산을 위한 고급 명리학 서비스를 제공합니다.

### ✨ 주요 개선사항 (2024년 8월 업데이트)

#### 🌸 24절기 기반 정확한 계산
- **정확한 입춘 계산**: 단순 2월 4일 고정이 아닌 천체역학 공식 기반 정확한 입춘 날짜 계산
- **절기 기준 월주**: 달력 월이 아닌 24절기 기준으로 정확한 월주 계산
- **년도별 보정**: 윤년과 태양년 차이를 고려한 정밀한 절기 계산

#### 🌙 야자시(夜子時) 로직 적용
- **23시 이후 출생**: 23시 이후 출생 시 일주를 다음 날로 계산
- **정확한 시주**: 자정 기준이 아닌 전통 사주 이론에 따른 하루 구분

#### 🕐 시간대 처리 개선
- **KST 기준 통일**: 모든 계산을 한국 표준시(UTC+9) 기준으로 통일
- **시간대 오차 방지**: 서버/클라이언트 시간대 차이로 인한 계산 오류 방지

### 🎯 사용 예제

```typescript
import { SajuService } from './src/saju/saju.service';
import { Gender } from './src/saju/enums';

const sajuService = new SajuService();

const userInfo = {
  gender: Gender.MALE,
  birthDateTime: new Date(1990, 0, 15, 14, 30),
  isSolar: true,
  birthPlace: '서울특별시',
};

// 기본 8자 계산
const eightCharacters = sajuService.calculateEightCharacters(userInfo);
console.log('사주:', sajuService.formatEightCharacters(eightCharacters));

// 절기 정보 포함 상세 분석
const detailedAnalysis = sajuService.getDetailedSajuAnalysis(userInfo);
console.log('디버깅 정보:', detailedAnalysis.debugInfo);
```

### 🔍 디버깅 기능

새로운 `getCalculationDebugInfo()` 메서드로 계산 과정을 상세히 확인할 수 있습니다:

- 절기 정보 (현재/다음 절기, 절기 시작일)
- 입춘 날짜와 입춘 이후 여부
- 야자시 적용 여부
- 시간대 변환 과정
- 사주 연도/월 계산 과정

## Config settings .env to connect MySQL

Once the database has been configured, start the Nest App via `pnpm run start:dev` it automatically synchronizes the entities so it is ready to use. :heart_eyes_cat:

```
   TYPEORM_CONNECTION = "mysql"
   TYPEORM_HOST = "localhost"
   TYPEORM_PORT = 3306
   TYPEORM_USERNAME = [:user]
   TYPEORM_PASSWORD = [:password]
   TYPEORM_DATABASE = [:database]
   TYPEORM_AUTO_SCHEMA_SYNC = true
   TYPEORM_ENTITIES = "dist/**/*.entity.js"
   TYPEORM_SUBSCRIBERS = "dist/subscriber/**/*.js"
   TYPEORM_MIGRATIONS = "dist/migrations/**/*.js"
   TYPEORM_ENTITIES_DIR = "src/entity"
   TYPEORM_MIGRATIONS_DIR = "src/migration"
   TYPEORM_SUBSCRIBERS_DIR = "src/subscriber"
```

## Install TypeScript Node

```bash
   pnpm install -g ts-node
```

## Running migrations with typeorm

```bash
   ts-node node_modules/.bin/typeorm migration:run -d dist/typeorm-cli.config
```

or

```bash
   node_modules/.bin/typeorm migration:run -d dist/typeorm-cli.config
```

## Running the app

```bash
    # development
    $ pnpm start

    # watch mode
    $ pnpm start:dev

    # production mode
    $ pnpm start:prod
```

## Running the app in REPL mode

```bash
   pnpm start --entryFile repl
```

or

```bash
   pnpm start:repl
```

## Docker

There is a `docker-compose.yml` file for starting MySQL with Docker.

`$ docker-compose up db`

After running, you can stop the Docker container with

`$ docker-compose down`

## Url Swagger for Api Documentation

```

http://127.0.0.1:3000/docs

```

or

```

http://127.0.0.1:3000/docs-json

```

or

```

http://127.0.0.1:3000/docs-yaml

```

Configure `SWAGGER_USER` and `SWAGGER_PASSWORD` in the .env file and set `NODE_ENV` to `local` or `dev` or `staging` to access the SWAGGER(Open API) documentation with basic authentication.

```
NODE_ENV=[:enviroments]
SWAGGER_USER=[:user]
SWAGGER_PASSWORD=[:password]

```

If you want to add more environments, include them in the `SWAGGER_ENVS` array in `main.ts`, see the following:

```typescript
const SWAGGER_ENVS = ['local', 'dev', 'staging'];
```

## Configuring the SERVER_PORT environment variable as the default port if you don't want to use the default

```
   SERVER_PORT=3333
```

## Configuring the ENDPOINT_URL_CORS environment variable for app frontend

```
   ENDPOINT_URL_CORS='http://127.0.0.1:4200'
```

## Getting secure resource with Curl

```bash
    curl -H 'content-type: application/json' -v -X GET http://127.0.0.1:3000/api/secure  -H 'Authorization: Bearer [:token]'
```

## Generate Token JWT Authentication with Curl

```bash
   curl -H 'content-type: application/json' -v -X POST -d '{"email": "tony_admin@nest.com", "password": "mysecret"}' http://127.0.0.1:3000/api/auth/login
```

## Registration user with Curl

```bash
   curl -H 'content-type: application/json' -v -X POST -d '{"name": "tony", "email": "tony_admin@nest.com", "username":"tony_admin", "password": "mysecret"}' http://127.0.0.1:3000/api/auth/register
```

## Refresh token with curl

```bash
   curl -H 'content-type: application/json' -v -X POST -d '{"refreshToken": "[:token]"}' http://127.0.0.1:3000/api/auth/refresh-tokens
```

## Forgot password with curl

```bash
   curl -H 'content-type: application/json' -v -X POST -d '{"email": "tony_admin@nest.com"}' http://127.0.0.1:3000/api/auth/forgot-password
```

## Change password User with curl

```bash
   curl -H 'content-type: application/json' -v -X POST -d '{"email": "tony_admin@nest.com", "password": "new_password"}' http://127.0.0.1:3000/api/auth/change-password  -H 'Authorization: Bearer [:token]'
```

## Update profile User with curl

```bash
   curl -H 'content-type: application/json' -v -X PUT -d '{"name": "tony", "email": "tony_admin@nest.com", "username": "tony_admin"}' http://127.0.0.1:3000/api/users/:id/profile  -H 'Authorization: Bearer [:token]'
```

## Users list with Curl

```bash
   curl -H 'content-type: application/json' -H 'Accept: application/json' -v -X GET http://127.0.0.1:3000/api/users  -H 'Authorization: Bearer [:token]'
```

## User by Id with Curl

```bash
   curl -H 'content-type: application/json' -H 'Accept: application/json' -v -X GET http://127.0.0.1:3000/api/users/:id  -H 'Authorization: Bearer [:token]'
```

## Update User with Curl

```bash
   curl -H 'content-type: application/json' -v -X PUT -d '{"name": "tony", "email": "tony_admin@nest.com", "username": "tony_admin", "password":"password_update"}' http://127.0.0.1:3000/api/users/:id  -H 'Authorization: Bearer [:token]'
```

## Delete User by Id with Curl

```bash
   curl -H 'content-type: application/json' -H 'Accept: application/json' -v -X DELETE http://127.0.0.1:3000/api/users/:id  -H 'Authorization: Bearer [:token]'
```

## Chat API with Claude AI

### Create Chat Session

```bash
   curl -H 'content-type: application/json' -v -X POST -d '{"title": "My Chat Session"}' http://127.0.0.1:3000/api/chat/sessions -H 'Authorization: Bearer [:token]'
```

### Send Message to Chat

```bash
   curl -H 'content-type: application/json' -v -X POST -d '{"sessionId": 1, "content": "안녕하세요!"}' http://127.0.0.1:3000/api/chat/messages -H 'Authorization: Bearer [:token]'
```

### Get Chat Sessions

```bash
   curl -H 'content-type: application/json' -H 'Accept: application/json' -v -X GET http://127.0.0.1:3000/api/chat/sessions -H 'Authorization: Bearer [:token]'
```

### Get Chat Session with Messages

```bash
   curl -H 'content-type: application/json' -H 'Accept: application/json' -v -X GET http://127.0.0.1:3000/api/chat/sessions/:sessionId -H 'Authorization: Bearer [:token]'
```

## License

[MIT licensed](LICENSE)
