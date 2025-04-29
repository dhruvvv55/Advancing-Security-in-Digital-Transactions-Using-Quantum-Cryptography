from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi import FastAPI, Request, Response
import time

# ✅ Define Metrics
REQUEST_COUNT = Counter("http_requests_total", "Total HTTP Requests", ["method", "endpoint", "http_status"])
REQUEST_LATENCY = Histogram("http_request_latency_seconds", "HTTP Request Latency", ["method", "endpoint"])

def setup_metrics(app: FastAPI):
    """Middleware to track API metrics."""
    
    @app.middleware("http")
    async def prometheus_middleware(request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        REQUEST_COUNT.labels(request.method, request.url.path, response.status_code).inc()
        REQUEST_LATENCY.labels(request.method, request.url.path).observe(process_time)
        
        return response

    # ✅ Expose `/metrics` Endpoint for Prometheus
    @app.get("/metrics")
    async def metrics():
        return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
