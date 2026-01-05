from fastapi import FastAPI, File, UploadFile, HTTPException 
from fastapi.middleware.cors import CORSMiddleware 

from .inference import predict, get_model 
 
app = FastAPI(title="SkinAI API", version="0.1.0")

app.add_middleware( 
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"],
)

@app.on_event("startup") 
def warmup(): 
    get_model() 

@app.get("/health")
def health(): 
    return {"status": "ok"}

@app.post("/predict")
async def predict_endpoint(file: UploadFile = File(...)): 
    if file.content_type not in ("image/jpeg", "image/png", "image/jpg"): 
        raise HTTPException(status_code=400, detail="Please upload a JPG or PNG image.")
    
    image_bytes = await file.read() 
    if not image_bytes: 
        raise HTTPException(status_code=400, detail="Empty file.")
    
    result = predict(image_bytes)
    result["disclaimer"] = "Educational use only. Not a medical diagnosis."
    return result