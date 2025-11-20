# 🌱 AgroClima – Angular + FastAPI + IA

Predicción de plagas y detección de enfermedades en plantas

Este proyecto integra:

✅ Frontend Angular

✅ Backend FastAPI

✅ Modelo IA de plagas (Árbol de Decisión)

✅ Modelo IA de enfermedades en hojas (MobileNetV2)


Todo funcionando mediante una API sencilla y optimizada.

## 📦 Estructura del Proyecto

Proyecto-AgroClima/

│── src/

│── modelo_ia/

│     ├── main.py

│     ├── modelo_plagas.pkl

│     ├── plant_model_best.keras

│     ├── classes.json

│     ├── requirements.txt

│     └── ...

└── README.md

### 🚀 1. Requisitos Previos

Antes de iniciar, debes tener instalado:

🔧 Backend

Python 3.11

pip

🎨 Frontend

Node.js (18+)

Angular CLI

🧪 IA

TensorFlow

Scikit-learn

Joblib

### ⚙️ 2. Instalación del Backend (FastAPI)
#### 1️⃣ Clonar el repositorio
git clone https://github.com/BraulioDev420/Proyecto-AgroClima-Angular

cd Proyecto-AgroClima

cd modelo_ia

#### 2️⃣ Crear entorno virtual
Windows:

python -m venv venv

activar entorno virtual: 

venv\Scripts\activate

Linux / Mac

python3 -m venv venv

source venv/bin/activate

#### 3️⃣ Instalar dependencias

pip install -r requirements.txt

##### 4️⃣ Ejecutar FastAPI

Desde la carpeta modelo_ia:

uvicorn main:app --reload --port 8000


El backend estará disponible en:

👉 http://localhost:8000

👉 Documentación automática Swagger: http://localhost:8000/docs

### 🎨 3. Instalación del Frontend (Angular)

En la raiz de la carpeta Proyecto-AgroClima-Angular/:

npm install


Ejecutar el servidor:

ng serve


El frontend estará disponible en:

👉 http://localhost:4200

### 📡 4. Endpoints Principales (FastAPI)
🔍 Health Check

Verifica que la API está activa.

GET /health


Respuesta:

{"status": "ok"}

🐞 Predicción de Plagas (IA)

Endpoint:

POST http://localhost:8000/ia/prediccion-plagas


Body (JSON):

{

  "temperatura": 28,
  
  "humedad": 60,
  
  "dias_sin_lluvia": 3
  
}


Respuesta:

{

  "riesgo": "medio"
  
}

🍃 Detección de Enfermedades en Hojas

Endpoint:

POST http://localhost:8000/ia/predict-plant


Body: Subir imagen (multipart/form-data)

Respuesta:

{

  "label": "Apple___Apple_scab",
  
  "score": 0.95,
  
  "top_k": [
    {"label": "Apple___Apple_scab", "score": 0.95},
    {"label": "Apple___Black_rot", "score": 0.03},
    {"label": "Apple___Cedar_apple_rust", "score": 0.02}
    
  ]
  
}

### 🧠 5. Modelos de Inteligencia Artificial

#### ✔️ Modelo 1: Predicción de Plagas

Entrenado con datos sintéticos.

Basado en reglas climáticas realistas.

Algoritmo: DecisionTreeClassifier

Salida: bajo / medio / alto

Archivo generado:

modelo_plagas.pkl

#### ✔️ Modelo 2: Detección de Enfermedades en Hojas

Dataset: New Plant Diseases Dataset (Augmented)

Arquitectura: MobileNetV2 (96×96)

Entrenamiento con fine-tuning parcial

Accuracy validación ~94%

Archivos:

plant_model_best.keras
classes.json

### 🧩 6. Tecnologías Utilizadas

#### ⚙️Backend

FastAPI

TensorFlow

Scikit-Learn

Joblib

Pillow (manejo de imágenes)

NumPy

#### 🎨Frontend

Angular 17

HttpClient

Servicios de consumo REST

### 👥 7. Autores

Proyecto desarrollado por 

Ingeniería de Sistemas – 2025

### 💬 8. Soporte

Si necesitas ayuda, abre un issue en el repositorio o pregunta por el grupo del proyecto.
