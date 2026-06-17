## image-api

Small NestJS REST API for image uploads. Upload endpoints are not implemented yet.

### Requirements

- Docker and Docker Compose
- Node.js 22 if running outside Docker

### Environment

Copy the example environment file before running locally:

```sh
cp .env.example .env
```

### Run with Docker Compose

```sh
docker compose up --build
```

The API runs on `http://localhost:3000`.

Swagger documentation is available at `http://localhost:3000/docs`.

Health check:

```sh
curl http://localhost:3000/health
```

Database migrations run automatically when the API starts. This keeps schema creation explicit while avoiding a separate migration command for the current small setup.

### Local Development

```sh
npm install
npm run start:dev
```

### Tests

```sh
npm test
```
