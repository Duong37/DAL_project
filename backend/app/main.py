from fastapi import FastAPI
from app.controller import router as controller_router

# FastAPI entry point. Creates the app and registers routes from controller.py

app = FastAPI(title="Decentralized Active Learning API")

# Register API endpoints
app.include_router(controller_router)
