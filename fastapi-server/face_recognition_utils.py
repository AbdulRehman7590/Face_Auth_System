import face_recognition
import numpy as np
import cv2


def verify_face(image_bytes):
    img = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    return len(face_recognition.face_locations(img)) > 0


def encode_image(image_bytes):
    img = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    encodings = face_recognition.face_encodings(img)
    if not encodings:
        return {"encoding": None}
    return {"encoding": encodings[0].tolist()}


def match_encodings(known_encodings, target_image_np):
    image = cv2.imdecode(target_image_np, cv2.IMREAD_COLOR)
    unknown = face_recognition.face_encodings(image)
    if not unknown:
        return {"index": -1}

    target_encoding = unknown[0]
    for i, known in enumerate(known_encodings):
        if face_recognition.compare_faces([np.array(known)], target_encoding)[0]:
            return {"index": i}
    return {"index": -1}
