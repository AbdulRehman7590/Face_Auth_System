from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from face_recognition_utils import verify_face, encode_image, match_encodings
from liveness import check_liveness
from pydantic import BaseModel
import base64
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def extract_image_bytes(request: Request, file: UploadFile = None):
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        if file is None:
            raise HTTPException(status_code=400, detail="No file uploaded")
        return await file.read()
    elif "application/octet-stream" in content_type:
        data = await request.body()
        if not data:
            raise HTTPException(status_code=400, detail="No image data in body")
        return data
    else:
        raise HTTPException(status_code=415, detail="Unsupported Content-Type")


@app.post("/check-liveness")
async def check_liveness_route(request: Request, file: UploadFile = File(None)):
    image_bytes = await extract_image_bytes(request, file)
    return {"live": check_liveness(image_bytes)}


@app.post("/verify-face")
async def verify_face_route(request: Request, file: UploadFile = File(None)):
    image_bytes = await extract_image_bytes(request, file)
    return {"verified": verify_face(image_bytes)}


@app.post("/extract-encoding")
async def extract_encoding(request: Request, file: UploadFile = File(None)):
    image_bytes = await extract_image_bytes(request, file)
    return encode_image(image_bytes)


class MatchRequest(BaseModel):
    encodings: list
    target: str


@app.post("/match-face")
async def match_face_route(data: MatchRequest):
    target_bytes = base64.b64decode(data.target)
    target_np = np.frombuffer(target_bytes, np.uint8)
    return match_encodings(data.encodings, target_np)
