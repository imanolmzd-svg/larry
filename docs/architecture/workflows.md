# Larry System Workflows

This document describes the three main workflows in the Larry RAG chatbot system: document upload, worker processing, and chat/query.

## 1. Document Upload Flow

User uploads a PDF file → Stored in S3 → Enqueued for processing in SQS

```mermaid
flowchart TD
    Start([User selects PDF file]) --> Init[POST /documents/init]
    Init --> CheckLimits{Check upload limit}
    CheckLimits -->|Limit reached| Error1[Return 403 error]
    CheckLimits -->|OK| CreateDoc[Create Document record<br/>status: CREATED]
    CreateDoc --> GenURL[Generate S3 presigned URL<br/>10min expiry]
    GenURL --> ReturnURL[Return uploadUrl to client]
    ReturnURL --> Upload[Client uploads file to S3<br/>direct upload]
    Upload --> Complete[POST /documents/complete]
    Complete --> Verify[Verify file exists in S3]
    Verify -->|Not found| Error2[Return 400 error]
    Verify -->|Found| CreateAttempt[Create IngestionAttempt<br/>Update status: PROCESSING]
    CreateAttempt --> Enqueue[Send message to SQS<br/>documentId + attemptId]
    Enqueue --> Notify[Publish status via Redis]
    Notify --> End([Ready for worker])
```

## 2. Worker Processing Flow

Worker polls SQS → Extracts text from PDF → Generates embeddings → Stores in database

```mermaid
flowchart TD
    Poll[Worker polls SQS queue<br/>long polling 20s] --> Receive{Message received?}
    Receive -->|No| Poll
    Receive -->|Yes| Parse[Parse message<br/>documentId + attemptId]
    Parse --> UpdateStatus[Update status: PROCESSING]
    UpdateStatus --> Download[Download PDF from S3]
    Download --> Extract[Extract text from PDF<br/>with page mapping]
    Extract --> Chunk[Split into chunks<br/>512 tokens, 50 overlap]
    Chunk --> Embed[Generate embeddings<br/>OpenAI text-embedding-3-small]
    Embed --> Store[Store chunks + vectors in DB<br/>pgvector]
    Store --> Ready[Update status: READY]
    Ready --> Publish[Publish status via Redis]
    Publish --> Ack[Acknowledge SQS message]
    Ack --> Poll
    
    Download -->|Error| Fail[Mark as FAILED]
    Extract -->|Error| Fail
    Chunk -->|Error| Fail
    Embed -->|Error| Fail
    Store -->|Error| Fail
    Fail --> Publish
```

## 3. Chat/Query Flow

User asks question → Vector search finds relevant chunks → RAG prompt → LLM generates answer with sources

```mermaid
flowchart TD
    Start([User asks question]) --> CheckLimit{Check question limit}
    CheckLimit -->|Limit reached| Error[Return 403 error]
    CheckLimit -->|OK| EmbedQ[Generate question embedding<br/>OpenAI API]
    EmbedQ --> Search[Vector similarity search<br/>pgvector cosine distance]
    Search --> HasChunks{Chunks found?}
    HasChunks -->|No| NoAnswer[Return: I couldn't find<br/>this information]
    HasChunks -->|Yes| BuildPrompt[Build RAG prompt<br/>System + Context + Question]
    BuildPrompt --> LLM[Generate answer<br/>OpenAI gpt-4o-mini]
    LLM --> CheckAnswer{Answer has<br/>knowledge?}
    CheckAnswer -->|No| NoSources[Return answer<br/>sources: empty]
    CheckAnswer -->|Yes| MapSources[Map chunks to sources<br/>group by document]
    MapSources --> Increment[Increment questionsAsked]
    NoAnswer --> Increment
    NoSources --> Increment
    Increment --> End([Return answer + sources])
```

## Technical Notes

- **Vector search**: Uses PostgreSQL pgvector extension with cosine similarity
- **Embeddings**: OpenAI text-embedding-3-small model (1536 dimensions)
- **Chunking**: 512 tokens target size, 50 tokens overlap between chunks
- **Real-time updates**: Redis pub/sub for document status updates to the web client
- **Queue**: AWS SQS with long polling (20 seconds) for reliable async processing
- **Storage**: AWS S3 for PDF files, presigned URLs for secure direct uploads
- **Database**: PostgreSQL with pgvector extension for vector similarity search
