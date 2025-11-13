import joblib
from sklearn.tree import DecisionTreeClassifier

# Datos de entrenamiento ampliados (más realistas y variados)
X = [
    [80, 25, 0],
    [70, 28, 1],
    [40, 18, 5],
    [45, 20, 3],
    [90, 30, 0],
    [85, 27, 1],
    [50, 22, 4],
    [60, 24, 2],
    [55, 19, 6],
    [75, 29, 0],
    [65, 26, 1],
    [35, 15, 7],
    [30, 12, 8],
    [95, 32, 0],
    [88, 28, 1],
    [42, 18, 5],
    [48, 21, 3],
    [52, 23, 4],
    [78, 27, 0],
    [68, 25, 2],
    [38, 16, 6],
    [33, 14, 8],
    [82, 30, 1],
    [59, 20, 3],
    [47, 22, 5],
    [90, 31, 0],
    [85, 29, 1],
    [50, 18, 7],
    [55, 21, 4],
    [72, 26, 2],
]

# Etiquetas de riesgo: 1 = riesgo, 0 = sin riesgo
y = [
    1, 1, 0, 0, 1, 1, 0, 
    1, 0, 1, 1, 0, 0, 1, 
    1, 0, 0, 0, 1, 1, 0, 
    0, 1, 0, 0, 1, 1, 0, 0, 1
]

# Entrenamiento del modelo
modelo = DecisionTreeClassifier()
modelo.fit(X, y)

# Guardar modelo
joblib.dump(modelo, "modelo_plagas.pkl")

print("✅ Modelo entrenado y dataset ampliado.")
