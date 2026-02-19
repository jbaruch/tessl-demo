---
alwaysApply: true
---

# Express API Security

- Always use parameterized queries with `?` placeholders — never concatenate user input into SQL
- Whitelist allowed column names for dynamic ORDER BY clauses
- Load all secrets from environment variables — never hardcode secrets, API keys, or JWT signing keys
- Fail fast at startup if required secrets (`JWT_SECRET`, etc.) are missing
- Hash passwords with bcrypt (12+ salt rounds) — never base64 or plaintext
- Never include passwords or sensitive data in JWT payloads — only id, username, role
- Return 401 on authentication failure — never silently pass unauthenticated requests
- Validate all request input at the boundary using zod schemas
- Never use `eval()`, `new Function()`, or pass user input to `child_process.exec()`
- Never construct file paths from user-controlled input
- Return proper HTTP status codes (400, 401, 403, 404) — never 200 for errors
- Never leak stack traces in production responses
- Use helmet for security headers on every response
