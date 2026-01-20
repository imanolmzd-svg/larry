# API Reference

Base URL: `http://localhost:4000/` (dev)

All endpoints require authentication via session cookie.

## Documents

### Upload Flow
1. `POST /documents/init` - Get presigned S3 URL
2. Upload file directly to S3 using presigned URL
3. `POST /documents/complete` - Trigger processing

### List Documents
`GET /documents` - Returns user's documents with status

### Delete Document
`DELETE /documents/:id` - Removes document and all chunks

## Chat

### Ask Question
`POST /chat/ask`
- Body: `{ "question": "string" }`
- Returns: `{ "answer": "string", "sources": [...] }`

## User

### Get Limits
`GET /user/limits`
- Returns: `{ "documents": {...}, "questions": {...} }`

## Health

### Health Check
`GET /health` - Returns service status

For detailed schemas, see OpenAPI spec (coming soon).
