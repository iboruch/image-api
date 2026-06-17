# image-api

Small NestJS REST API for uploading images and reading their metadata.

Uploaded images are resized/cropped with Sharp, stored locally as WebP files, and exposed under `/uploads`. Image metadata is stored in PostgreSQL.

## Tech Stack

* NestJS
* TypeScript
* PostgreSQL
* TypeORM
* Sharp
* Docker Compose
* Swagger / OpenAPI
* Jest

## Requirements

* Docker and Docker Compose
* Node.js 22 if running outside Docker
* npm

Use the project Node version:

```sh
nvm use
```

## Setup

Copy the example environment file:

```sh
cp .env.example .env
```

Install dependencies for local development:

```sh
npm install
```

## Environment Variables

| Variable            | Description                             | Default                 |
| ------------------- | --------------------------------------- | ----------------------- |
| `API_PORT`          | Host port for the API container         | `3000`                  |
| `POSTGRES_PORT`     | Host port for PostgreSQL                | `5432`                  |
| `DATABASE_HOST`     | PostgreSQL host for local app runs      | `localhost`             |
| `DATABASE_PORT`     | PostgreSQL port                         | `5432`                  |
| `DATABASE_USER`     | PostgreSQL user                         | `image_api`             |
| `DATABASE_PASSWORD` | PostgreSQL password                     | `image_api`             |
| `DATABASE_NAME`     | PostgreSQL database name                | `image_api`             |
| `PUBLIC_BASE_URL`   | Base URL used when returning image URLs | `http://localhost:3000` |
| `UPLOAD_DIR`        | Directory for processed image files     | `uploads`               |

## Docker Usage

Start the API and PostgreSQL:

```sh
docker compose up --build
```

The API runs at:

```text
http://localhost:3000
```

Swagger is available at:

```text
http://localhost:3000/docs
```

PostgreSQL is exposed on the configured `POSTGRES_PORT`.

Database migrations run automatically when the API starts. This keeps schema changes explicit while keeping local setup simple.

Uploaded files are stored in a Docker volume when running through Docker Compose.

Stop the stack:

```sh
docker compose down
```

To remove containers and volumes:

```sh
docker compose down -v
```

## API Documentation

OpenAPI documentation is available through Swagger UI:

```text
http://localhost:3000/docs
```

## API Examples

### Upload an image

```sh
curl -X POST http://localhost:3000/images \
  -F "title=Profile photo" \
  -F "width=800" \
  -F "height=600" \
  -F "file=@/path/to/image.jpg"
```

Supported upload formats are:

* `jpg`
* `jpeg`
* `png`
* `webp`

The uploaded image is resized/cropped to the requested width and height before it is saved. Processed files are stored as WebP.

Example response:

```json
{
  "id": "2d69d8a8-51e9-447d-a0a0-eec4a2c99b7f",
  "url": "http://localhost:3000/uploads/image.webp",
  "title": "Profile photo",
  "width": 800,
  "height": 600
}
```

The returned `url` can be opened in a browser to view the processed image.

### List images

```sh
curl "http://localhost:3000/images?page=1&limit=10"
```

Example response:

```json
{
  "data": [
    {
      "id": "2d69d8a8-51e9-447d-a0a0-eec4a2c99b7f",
      "url": "http://localhost:3000/uploads/image.webp",
      "title": "Profile photo",
      "width": 800,
      "height": 600
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Filter images by title

```sh
curl "http://localhost:3000/images?title=profile&page=1&limit=10"
```

The `title` filter matches records where the title contains the provided text. The match is case-insensitive.

### Get one image

```sh
curl "http://localhost:3000/images/2d69d8a8-51e9-447d-a0a0-eec4a2c99b7f"
```

Example response:

```json
{
  "id": "2d69d8a8-51e9-447d-a0a0-eec4a2c99b7f",
  "url": "http://localhost:3000/uploads/image.webp",
  "title": "Profile photo",
  "width": 800,
  "height": 600
}
```

If the image does not exist, the API returns `404`.

## Local Development

Run PostgreSQL with Docker:

```sh
docker compose up postgres
```

Run the API locally:

```sh
nvm use
npm install
npm run start:dev
```

If the API is running outside Docker, make sure the `DATABASE_*` values point to the running PostgreSQL instance.

## Tests

Run tests:

```sh
npm test
```

Run lint and build checks:

```sh
npm run lint
npm run build
```

## Storage Decision

Local filesystem storage was chosen to keep the project self-contained and easy to run locally. When using Docker Compose, uploaded files are stored in a Docker volume mounted to the API container.

The storage logic is isolated in `LocalImagesStorageService`, so it can be replaced later with S3, Azure Blob Storage, Google Cloud Storage, or another object storage provider without changing the controller layer.

## Known Limitations

* There is no authentication or authorization.
* There is no delete endpoint or metadata update endpoint.
* File size limits are not configured yet.
* Tests focus on controller and service behavior. Full image processing and filesystem writes can be verified through Docker/manual upload checks.

## Possible Future Improvements

* Add object storage support.
* Add file size limits and stricter upload constraints.
* Add delete and update endpoints.
* Add request logging and production-ready observability.
* Add authentication if the API is exposed outside local development.
