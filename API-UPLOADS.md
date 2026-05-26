# API Documentation: Advanced Seller Upload Endpoints

## Chunked Upload
POST `/api/seller/uploads/chunk`
- Uploads a single chunk of a file. Requires `uploadId`, `chunkIndex`, `totalChunks`, and `chunk` (File).

## Virus/Malware Scan
POST `/api/seller/uploads/virus-scan`
- Triggers a virus scan on the assembled file. Requires `uploadId`.

## Metadata Extraction
POST `/api/seller/uploads/metadata-extract`
- Extracts video metadata using ffprobe. Requires `uploadId`.

## Thumbnail Generation
POST `/api/seller/uploads/thumbnail`
- Generates a video thumbnail using ffmpeg. Requires `uploadId`.

## Save Upload Record
POST `/api/seller/uploads`
- Saves the upload record. Accepts all form fields and `uploadId`.

## Transcoding Status
GET `/api/seller/uploads/transcode-status/[id]`
- Returns status and progress for a transcode job.

## Storage Usage
GET `/api/seller/uploads/storage-usage`
- Returns current user storage usage and quota.

## Moderation
POST `/api/seller/uploads/moderate`
- Admin endpoint to approve/takedown uploads. Requires `uploadId`, `action`, `reason`.

## Webhook/Event
POST `/api/seller/uploads/webhook`
- Accepts upload completion/failure events.

---
All endpoints require authentication. Rate limiting and audit logging are enforced. See code for details.
