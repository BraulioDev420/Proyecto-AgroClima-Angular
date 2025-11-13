from fastapi import FastAPI
from pydantic import BaseModel
import joblib
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("modelo_plagas.pkl")

class DatosClima(BaseModel):
    temperatura: float
    humedad: float
    dias_sin_lluvia: float

@app.post("/ia/prediccion-plagas")
def predecir_plagas(datos: DatosClima):
    pred = model.predict([[datos.temperatura, datos.humedad, datos.dias_sin_lluvia]])
    riesgo = ["bajo", "medio", "alto"][int(pred[0])]
    return {"riesgo": riesgo}
