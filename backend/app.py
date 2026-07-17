# ==========================================================
# API Klasifikasi Jenis Rempah Indonesia
# Menggunakan Transfer Learning MobileNetV2
# ==========================================================

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

import numpy as np
import tensorflow as tf
import json
import shutil
import os

# ==========================================================
# Load Model
# ==========================================================

model = load_model("best_model.keras")

print("✅ Model berhasil dimuat.")

# ==========================================================
# Load Labels
# ==========================================================

with open("labels.json", "r") as file:
    labels = json.load(file)

print("✅ Labels berhasil dimuat.")

# ==========================================================
# Folder Upload
# ==========================================================

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ==========================================================
# FastAPI
# ==========================================================

app = FastAPI(
    title="API Klasifikasi Jenis Rempah Indonesia",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# Home
# ==========================================================

@app.get("/")
def home():

    return {
        "message": "API Klasifikasi Jenis Rempah Berhasil Berjalan",
        "jumlah_kelas": len(labels)
    }

# ==========================================================
# Endpoint Prediksi
# ==========================================================

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    try:

        # ---------------------------------------
        # Simpan gambar ke folder uploads
        # ---------------------------------------

        file_path = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # ---------------------------------------
        # Load gambar
        # ---------------------------------------

        img = image.load_img(
            file_path,
            target_size=(224, 224)
        )

        # ---------------------------------------
        # Ubah menjadi array
        # ---------------------------------------

        img_array = image.img_to_array(img)

        # ---------------------------------------
        # Tambahkan dimensi batch
        # (1,224,224,3)
        # ---------------------------------------

        img_array = np.expand_dims(
            img_array,
            axis=0
        )

        # ---------------------------------------
        # Preprocessing MobileNetV2
        # ---------------------------------------

        img_array = preprocess_input(img_array)

        # ---------------------------------------
        # Prediksi
        # ---------------------------------------

        prediction = model.predict(img_array)

        print("=" * 50)
        print("Raw Prediction :", prediction)
        print("Predicted Index :", np.argmax(prediction))
        print("=" * 50)

        predicted_index = int(np.argmax(prediction))

        confidence = float(np.max(prediction))

        predicted_class = labels[str(predicted_index)]

        # ---------------------------------------
        # Return hasil
        # ---------------------------------------

        return JSONResponse(
            content={
                "prediction": predicted_class,
                "confidence": round(confidence * 100, 2)
            }
        )

    except Exception as e:

        return JSONResponse(
            status_code=500,
            content={
                "error": str(e)
            }
        )