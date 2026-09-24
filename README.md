# AI Resume Analyzer Backend — HTTP-only JWT Cookie Version

## Included
- Express
- MongoDB/Mongoose
- Register/login/logout
- bcrypt password hashing
- JWT stored in HTTP-only cookie
- cookie-parser
- CORS credentials
- Protected analysis routes
- PDF upload and text extraction
- Zod validation
- Mock AI provider for free Postman testing
- Analysis history
- Rate limiting
- Development API limit defaults to 1000 requests per 15 minutes to avoid Vite/React development reloads triggering 429 errors.
- Production API limit defaults to 100 requests per 15 minutes.
- Login/register have a separate failed-attempt limiter (100 in development, 20 in production); successful authentication requests are not counted.
- Override with API_RATE_LIMIT and AUTH_RATE_LIMIT in `.env`.
- Central error handling

## Setup

1. Install Node.js and MongoDB.
2. Copy `.env.example` to `.env`.
3. Generate a JWT secret locally:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
4. Put it in JWT_SECRET.
5. Keep AI_PROVIDER=mock for initial testing.
6. Run:
   npm install
   npm run dev

## Authentication

JWT is never returned in the JSON response and is not stored in localStorage.
The backend sends it as an HTTP-only cookie named `token`.

Development cookie:
- httpOnly: true
- secure: false
- sameSite: lax

Production cookie:
- httpOnly: true
- secure: true
- sameSite: none

For production, serve frontend/backend over HTTPS and configure the exact frontend origin in CLIENT_URL.

## Postman

See postman/README.md.
