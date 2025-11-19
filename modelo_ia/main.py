from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
from PIL import Image
import io
import json
import tensorflow as tf
import os

#APP FASTAPI

app = FastAPI(title="API IA - Plagas y Enfermedades de Plantas")

# CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#MODELO 1 PREDICCION DE PLAGAS


model_plagas = joblib.load("modelo_plagas.pkl")

class DatosClima(BaseModel):
    temperatura: float
    humedad: float
    dias_sin_lluvia: float

@app.post("/ia/prediccion-plagas")
def predecir_plagas(datos: DatosClima):
    pred = model_plagas.predict([[datos.temperatura, datos.humedad, datos.dias_sin_lluvia]])
    riesgo = ["bajo", "medio", "alto"][int(pred[0])]
    return {"riesgo": riesgo}



#MODELO 2 DETECCION DE ENFERMEDADES EN HOJAS

# archivos del modelo
BASE_DIR = os.path.dirname(__file__)
MODEL_PLANT_PATH = os.path.join(BASE_DIR, "plant_model_best.keras")
CLASSES_PATH = os.path.join(BASE_DIR, "classes.json")

# Variables globales
plant_model = None
plant_classes = None

# Cargar el modelo una vez
def load_plant_detection():
    global plant_model, plant_classes

    if plant_model is None:
        print("Cargando modelo plant_model_best.keras ...")
        plant_model = tf.keras.models.load_model(MODEL_PLANT_PATH)
        print("Modelo cargado.")
        #print("OUTPUT SHAPE DEL MODELO:", plant_model.output_shape)


    if plant_classes is None:
        print("Cargando classes.json ...")
        with open(CLASSES_PATH, "r", encoding="utf-8") as f:
            plant_classes = json.load(f)
        print("Clases cargadas:", len(plant_classes))

load_plant_detection()


# Preprocesamiento de imagen 
def preprocess_image(image_bytes: bytes, target_size):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(target_size)
    arr = np.array(image).astype(np.float32)
    arr = np.expand_dims(arr, axis=0)
    return arr


@app.post("/ia/predict-plant")
async def predict_plant(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")

    contents = await file.read()

    # Tamaño del modelo
    _, h, w, _ = plant_model.input_shape
    target_size = (w, h)

    # Preprocesar imagen
    x = preprocess_image(contents, target_size)

    # Predicción
    preds = plant_model.predict(x)
    probs = preds[0]

    top_idx = int(np.argmax(probs))
    top_score = float(probs[top_idx])
    label = plant_classes[top_idx]

    # Top-3
    top_k_idx = np.argsort(probs)[-3:][::-1]
    top_k = [
        {"label": plant_classes[i], "score": float(probs[i])}
        for i in top_k_idx
    ]

    return {
        "label": label,
        "score": top_score,
        "top_k": top_k
    }



#HEALTH CHECK

@app.get("/health")
def health():
    return {"status": "ok"}
