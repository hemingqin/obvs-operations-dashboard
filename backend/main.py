import logging

from fastapi import Request
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from db import init_db
from errors import ApiError
from logging_utils import configure_logging, log_event
from routers.auth import router as auth_router
from routers.donations import router as donations_router
from routers.notifications import router as notifications_router
from routers.service_requests import router as service_request_router
from routers.volunteer import router as volunteer_router

configure_logging()
logger = logging.getLogger("app")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(donations_router)
app.include_router(notifications_router)
app.include_router(service_request_router)
app.include_router(volunteer_router)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.middleware("http")
async def log_requests(request: Request, call_next):
    log_event(logger, "request", method=request.method, path=request.url.path)
    response = await call_next(request)
    log_event(
        logger,
        "response",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
    )
    return response


@app.exception_handler(ApiError)
async def handle_api_error(_request: Request, exc: ApiError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
            }
        },
    )


@app.get('/health')
def health() -> dict:
    return {'ok': True}
