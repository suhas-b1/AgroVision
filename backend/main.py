from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import traceback

from .preprocess import preprocess_image
from .model import predict_plant, predict_disease
from .advisory import get_advisory
from .alerts import log_disease, get_heatmap_data


# =========================
# CREATE APP FIRST !!!
# =========================
app = FastAPI()


# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# PATHS
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# =========================
# ROOT
# =========================
@app.get("/")
def root():
    return {"message": "AgroVision backend running"}


# =========================
# PREDICT
# =========================
@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    location: str = "Unknown"
):
    try:

        if file.content_type not in ["image/jpeg", "image/png"]:
            return {"error": "Upload JPG or PNG image"}

        file_path = os.path.join(UPLOAD_DIR, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        image = preprocess_image(file_path)

        # 1️⃣ Predict plant
        plant, plant_conf = predict_plant(image)

        # 2️⃣ Predict disease
        disease, disease_conf = predict_disease(plant, image)

        # 3️⃣ Log for heatmap
        log_disease(disease, disease_conf, location, file_path)

        warning = None
        if disease_conf < 0.4:
            warning = "Low confidence. Upload clearer image."

        return {
            "plant": plant,
            "plant_confidence": round(plant_conf * 100, 2),
            "disease": disease,
            "confidence": round(disease_conf * 100, 2),
            "severity": (
                "High" if disease_conf > 0.75
                else "Medium" if disease_conf > 0.4
                else "Low"
            ),
            "warning": warning,
            "advice": get_advisory(plant, disease)
        }

    except Exception as e:
        print("ERROR:", e)
        traceback.print_exc()
        return {"error": "Internal server error"}


# =========================
# HEATMAP
# =========================
@app.get("/heatmap")
def heatmap():
    return get_heatmap_data()
