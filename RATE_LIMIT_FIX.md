# Rate-limit fix

The previous backend applied `100 requests / 15 minutes` to every `/api` endpoint.
That shared limit can be exhausted quickly during Vite/React development because
page reloads, effects, retries, and `/auth/me` checks all count against it.

## Changes

- Development `/api` limit is now 1000 requests / 15 minutes by default.
- Production `/api` limit remains 100 / 15 minutes by default.
- `/auth/login` and `/auth/register` use a separate failed-attempt limiter.
- Successful login/register requests are not counted by the auth limiter.
- Limits can be changed with:
  - `API_RATE_LIMIT`
  - `AUTH_RATE_LIMIT`

After replacing the backend, restart it so the in-memory rate-limit store is reset.
