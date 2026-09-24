# Postman testing with HTTP-only JWT cookie

Base URL: http://localhost:5000

Postman automatically stores cookies in its cookie jar. Do NOT add an Authorization Bearer header for protected routes.

## 1. Health
GET /api/health

## 2. Register
POST /api/auth/register
Body -> raw -> JSON:
{
  "name":"Test User",
  "email":"test@example.com",
  "password":"password123"
}

The server sets an HTTP-only `token` cookie.

## 3. Me
GET /api/auth/me

Postman should send the stored cookie automatically.

## 4. Logout
POST /api/auth/logout

This clears the token cookie.

## 5. Login
POST /api/auth/login
Body -> raw -> JSON:
{
  "email":"test@example.com",
  "password":"password123"
}

A fresh token cookie is created.

## 6. Analyze
POST /api/analyses

Body -> form-data:
resume = File -> choose a PDF
jobTitle = MERN Stack Developer

No Authorization header is needed.

## 7. History
GET /api/analyses

## 8. One analysis
GET /api/analyses/ANALYSIS_ID

## 9. Delete
DELETE /api/analyses/ANALYSIS_ID

If a protected endpoint returns 401, open Postman's Cookies manager for localhost:5000 and check whether the `token` cookie exists.
