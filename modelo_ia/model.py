import joblib
from sklearn.tree import DecisionTreeClassifier
import random

X = []
y = []

for _ in range(300):
    temperatura = random.randint(15, 35)
    humedad = random.randint(20, 100)
    dias_sin_lluvia = random.randint(0, 8)

    # Reglas de clasificación
    
    if humedad < 50 and temperatura < 25 and dias_sin_lluvia <= 3:
        etiqueta = 0  # bajo
    elif 50 <= humedad <= 70 and 25 <= temperatura <= 30 and 2 <= dias_sin_lluvia <= 4:
        etiqueta = 1  # medio
    else:
        etiqueta = 2  # alto


    # temperatura, humedad, dias
    X.append([temperatura, humedad, dias_sin_lluvia])
    y.append(etiqueta)

# Entrenar
modelo = DecisionTreeClassifier()
modelo.fit(X, y)

# Guardar
joblib.dump(modelo, "modelo_plagas.pkl")

print("Modelo generado y entrenado correctamente")
