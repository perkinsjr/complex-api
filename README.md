# Express TypeScript API Demo

A clean, production-ready Express TypeScript API with comprehensive OpenAPI documentation, designed for deployment on Unkey's cloud platform.

## Features

- **Express.js** with TypeScript for type-safe backend development
- **OpenAPI 3.0** specification with Swagger UI documentation
- **Modular route structure** with organized endpoint separation
- **Security middleware** with Helmet for HTTP security headers
- **Compression middleware** for optimized response sizes
- **Health check endpoint** for monitoring and deployment readiness
- **Docker support** for containerized deployment
- **Production-ready** configuration for Unkey platform

## API Endpoints

### Core Endpoints
- `GET /health` - Health check and system status
- `GET /docs` - Interactive API documentation

### Data Endpoints
- `GET /api/users` - Paginated user listings
- `GET /api/products` - Product catalog with filtering
- `GET /api/orders` - Order management with status filtering
- `GET /api/articles` - Content management system
- `GET /api/notifications` - User notifications

### Analytics & Reports
- `GET /api/analytics` - Comprehensive analytics dashboard
- `GET /api/search` - Multi-entity search functionality
- `GET /api/reports` - Business report generation

### Configuration
- `GET /api/integrations` - Third-party integration status
- `GET /api/settings` - Application configuration

### Documentation
- `GET /openapi.yaml` - OpenAPI specification in YAML format

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Access the API:**
   - API Base URL: `http://localhost:3000`
   - Documentation: `http://localhost:3000/docs`
   - Health Check: `http://localhost:3000/health`

### Production Build

1. **Build TypeScript:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

## Docker Deployment

Build and run the containerized application:

```bash
# Build the Docker image
docker build -t complex-api .

# Run the container
docker run -p 3000:3000 complex-api
```

## Unkey Platform Deployment

This API is optimized for deployment on Unkey's auto-scaling cloud platform:

1. **Dockerfile included** - Ready for containerized deployment
2. **Health check endpoint** - Enables proper load balancer integration
3. **Environment variable support** - Configurable for different environments
4. **Production optimizations** - Security headers, compression, and error handling

### Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)
- `API_URL` - Base API URL for OpenAPI spec

## Project Structure

```
src/
├── routes/           # Route handlers organized by feature
│   ├── index.ts      # Route setup and configuration
│   ├── health.ts     # Health check endpoints
│   ├── users.ts      # User management routes
│   ├── products.ts   # Product catalog routes
│   ├── orders.ts     # Order management routes
│   ├── analytics.ts  # Analytics and metrics
│   ├── articles.ts   # Content management
│   ├── notifications.ts # Notification system
│   ├── search.ts     # Search functionality
│   ├── reports.ts    # Report generation
│   ├── integrations.ts # Third-party integrations
│   ├── settings.ts   # Application settings
│   └── openapi.ts    # OpenAPI spec endpoint
├── types/            # TypeScript type definitions
├── utils/            # Utility functions and helpers
└── index.ts          # Main application entry point
```

## API Response Format

All API endpoints return responses in a consistent format:

```json
{
  "data": {}, // Response data (object, array, or null)
  "success": true, // Operation success status
  "message": "Operation completed successfully" // Descriptive message
}
```

Paginated responses include additional pagination metadata:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "success": true,
  "message": "Data retrieved successfully"
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint code analysis
- `npm test` - Run test suite

### Code Quality

- **ESLint** configuration for code consistency
- **TypeScript** for type safety
- **Organized route structure** for maintainable code
- **Consistent API patterns** across all endpoints

## Security

- **Helmet.js** for HTTP security headers
- **Input validation** on API endpoints
- **Error handling** without sensitive data exposure
- **Health check** endpoint for monitoring

## Performance

- **Compression middleware** for response optimization
- **Efficient route organization** for fast request handling
- **Lightweight Alpine Docker image** for quick deployments
- **Production-ready optimizations**

## Documentation

Interactive API documentation is available at `/docs` when the server is running. The documentation includes:

- Complete endpoint reference
- Request/response schemas
- Example requests and responses
- Authentication requirements
- Error response formats

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ for deployment on [Unkey](https://unkey.dev) - the modern cloud platform for auto-scaling applications.