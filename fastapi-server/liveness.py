import cv2
import numpy as np
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh


def check_liveness(image_bytes: bytes) -> bool:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img_np is None:
        return False

    face_mesh = mp_face_mesh.FaceMesh(
        static_image_mode=True, max_num_faces=1, refine_landmarks=True
    )
    image_rgb = cv2.cvtColor(img_np, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(image_rgb)

    return bool(results.multi_face_landmarks)
