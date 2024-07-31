from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from order.router.item import router

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:8002"
    "http://127.0.0.1:8001",

]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
