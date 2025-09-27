# Backend Modular Structure

## Overview
The backend has been refactored from a single 726-line `server.ts` file into a clean, modular architecture with proper separation of concerns. Each file is kept under 120 lines of code for better maintainability.

## Folder Structure

```
src/
├── app.ts              # Main application entry point (67 lines)
├── index.ts            # Barrel exports (8 lines)
├── config/
│   └── index.ts        # Configuration and blockchain setup (58 lines)
├── types/
│   └── index.ts        # TypeScript interfaces and types (31 lines)
├── services/
│   ├── index.ts        # Service exports (5 lines)
│   ├── blockchain.service.ts    # Blockchain operations (118 lines)
│   ├── ipfs-storage.service.ts  # IPFS storage handling (110 lines)
│   ├── zerog-storage.service.ts # 0G storage mock (15 lines)
│   ├── llm.service.ts  # LLM summarization (35 lines)
│   └── memory.service.ts        # Memory management (119 lines)
├── middleware/
│   ├── index.ts        # Middleware exports (8 lines)
│   └── validation.ts   # Request validation & error handling (50 lines)
├── routes/
│   ├── index.ts        # Route exports (2 lines)
│   ├── memory.routes.ts         # Memory CRUD operations (74 lines)
│   └── health.routes.ts         # Health and status endpoints (44 lines)
└── utils/
    ├── index.ts        # Utils exports (1 line)
    └── helpers.ts      # Utility functions (38 lines)
```

## Key Features Maintained

✅ **All Original Functionality Preserved**
- IPFS storage with Pinata integration
- 0G network storage (mock implementation)
- Blockchain synchronization with retry logic
- Memory write/read operations
- Local file backup system
- Error handling and validation

✅ **Performance & Reliability**
- Automatic blockchain sync on startup
- Retry mechanisms for blockchain operations
- Local caching with IPFS fallback
- Graceful error handling

✅ **API Endpoints**
- `POST /write` - Write memory content
- `GET /read/:agent` - Read memories by agent
- `GET /read?agent=...&reader=...` - Read with query params
- `GET /count/:agent` - Get memory count
- `GET /health` - Health check
- `GET /status` - Detailed status (when implemented)

## Benefits of Refactoring

1. **Maintainability**: Each file has a single responsibility
2. **Testability**: Services can be unit tested independently
3. **Scalability**: Easy to add new features and storage services
4. **Code Reusability**: Services can be imported and used elsewhere
5. **Better Error Handling**: Centralized validation and error middleware
6. **Type Safety**: Proper TypeScript interfaces throughout

## How to Run

```bash
# Development
bun run dev

# Production
bun run build
bun run start
```

## Service Dependencies

- **BlockchainService**: Handles all smart contract interactions
- **MemoryService**: Orchestrates memory operations
- **IPFSStorageService**: Manages IPFS storage with local fallback
- **ZeroGStorageService**: Mock 0G network storage
- **LLMService**: AI summarization capabilities

All services are properly injected and configured in `app.ts` with clean dependency management.