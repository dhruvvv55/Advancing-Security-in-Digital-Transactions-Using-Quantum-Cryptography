from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import time

# ✅ Dictionary to track request timestamps per IP
REQUEST_LOGS = {}

# ✅ Rate Limiting Middleware
class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit_per_minute=20):
        super().__init__(app)
        self.limit_per_minute = limit_per_minute

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        current_time = time.time()

        # ✅ If IP is not in logs, initialize it
        if client_ip not in REQUEST_LOGS:
            REQUEST_LOGS[client_ip] = []

        # ✅ Remove old requests older than 1 min
        REQUEST_LOGS[client_ip] = [t for t in REQUEST_LOGS[client_ip] if current_time - t < 60]

        # ✅ If limit exceeded, raise error
        if len(REQUEST_LOGS[client_ip]) >= self.limit_per_minute:
            raise HTTPException(status_code=429, detail="Too many requests. Slow down!")

        # ✅ Log the request timestamp
        REQUEST_LOGS[client_ip].append(current_time)
        
        return await call_next(request)

# ✅ Function to Check DDoS (For Manual Calls)
def check_ddos(client_ip: str, limit_per_minute=20):
    current_time = time.time()

    if client_ip not in REQUEST_LOGS:
        REQUEST_LOGS[client_ip] = []

    REQUEST_LOGS[client_ip] = [t for t in REQUEST_LOGS[client_ip] if current_time - t < 60]

    if len(REQUEST_LOGS[client_ip]) >= limit_per_minute:
        return True  # DDoS detected
    return False
