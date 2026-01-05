import json 
from pathlib import Path 

BASE_DIR = Path(__file__).resolve().parent.parent 
MODELS_DIR = BASE_DIR / "models" 
CONFIG_PATH = MODELS_DIR / "skinai_config.json" 

def load_config() -> dict: 
    if not CONFIG_PATH.exists(): 
        raise FileNotFoundError(f"Missing configuration file: {CONFIG_PATH}")
    with open(CONFIG_PATH, "r", encoding="utf-8") as f: 
        return json.load(f)
    
CONFIG = load_config()

IMAGE_SIZE = tuple(CONFIG.get("image_size", [128, 128]))
CHOSEN_THRESHOLD = float(CONFIG.get("chosen_threshold", 0.5))
LABELS = CONFIG.get("labels", {"0": "benign", "1": "malignant"})
NORMALIZATION = CONFIG.get("normalization", "x/255.0")