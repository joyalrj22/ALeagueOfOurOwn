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
#
# Netlify's Python function runtime expects a callable named `handler(event, context)`.
# Exporting a plain `handler = Mangum(app)` object can fail function detection/invocation,
# so we provide an explicit wrapper function.
mangum_handler = Mangum(app)


def handler(event, context):
  return mangum_handler(event, context)


# Some runtimes/documentation refer to `lambda_handler`; keep an alias for compatibility.
lambda_handler = handler

