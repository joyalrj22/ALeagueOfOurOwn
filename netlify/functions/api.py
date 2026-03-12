from fastapi import FastAPI
from mangum import Mangum
from datetime import datetime, timezone
import os

app = FastAPI(title="Netlify FastAPI Toy")


@app.get("/health")
def health():
  """
  Simple health endpoint to validate that the FastAPI app is
  running correctly inside Netlify Functions.
  """
  return {
    "status": "ok",
    "service": "netlify-fastapi-toy",
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "environment": os.environ.get("NETLIFY", "local-dev"),
  }


@app.get("/echo")
def echo(message: str = "hello from FastAPI on Netlify"):
  """
  Tiny echo endpoint so you can test query params.
  """
  return {"message": message}


# Netlify uses AWS Lambda under the hood; Mangum adapts the ASGI app.
handler = Mangum(app)

