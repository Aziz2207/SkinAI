import io 
from pathlib import Path

import numpy as np 
import tensorflow as tf 
from PIL import Image 

from .config import IMAGE_SIZE, CHOSEN_THRESHOLD, LABELS, BASE_DIR 

MODEL_PATH = BASE_DIR / "models" / "skinai_best.keras"

_model = None 

def get_model(): 
    "load the model once and reuse it." 
    global _model 
    if _model is None: 
        if not MODEL_PATH.exists(): 
            raise FileNotFoundError(f"Missing model file: {MODEL_PATH}")
        _model = tf.keras.models.load_model(MODEL_PATH)
    return _model 

def preprocess_image(image_bytes: bytes) -> np.ndarray: 
    "Convert raw image bytes -> model input tensor (1, H, W, 3)."
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMAGE_SIZE)
    x = np.asarray(img).astype("float32") / 255.0 
    x = np.expand_dims(x, axis=0)
    return x 

def predict(image_bytes: bytes) -> dict: 
    model = get_model() 
    x = preprocess_image(image_bytes)

    score = float(model.predict(x, verbose=0).reshape(-1)[0])
    pred = 1 if score >= CHOSEN_THRESHOLD else 0 

    return { 
        "risk_score": score, 
        "label_id": pred, 
        "label": LABELS.get(str(pred), str(pred)), 
        "threshold": CHOSEN_THRESHOLD, 
        "image_size": list(IMAGE_SIZE),
    }