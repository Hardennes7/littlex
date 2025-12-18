from fastapi import FastAPI
from app.routes.walker import router as walker_router

app = FastAPI(title="LittleX Backend")

app.include_router(walker_router)
