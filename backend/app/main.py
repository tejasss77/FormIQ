import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.init_db import init_db
from app.api.auth import router as auth_router
from app.api.exercises import router as exercises_router
from app.api.workouts import router as workouts_router
from app.api.progress import router as progress_router
from app.api.users import router as users_router
from app.websocket.workout_stream import router as ws_router
from app.vision.pose_engine import PoseEngine

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("formiq")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing FORMIQ database...")
    await init_db()
    logger.info("Database schema & seeds ready.")
    
    # Warm up PoseEngine
    try:
        PoseEngine.get_instance()
        logger.info("MediaPipe Pose Landmarker Engine warmed up and ready.")
    except Exception as e:
        logger.warning(f"PoseEngine warm-up warning (will retry on demand): {e}")

    yield

    logger.info("Shutting down FORMIQ services.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Precision Computer-Vision Fitness Coaching Platform",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include REST Routers under /api
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(exercises_router, prefix=settings.API_V1_STR)
app.include_router(workouts_router, prefix=settings.API_V1_STR)
app.include_router(progress_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)

# Include WebSocket Router
app.include_router(ws_router)

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "FORMIQ API",
        "version": settings.VERSION,
        "engine": "MediaPipe Pose Landmarker + Biomechanics v1.0"
    }
