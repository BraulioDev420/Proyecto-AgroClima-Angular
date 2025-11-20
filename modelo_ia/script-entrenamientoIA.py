
#ENTRENAMIENTO MobileNetV2 96x96


# 1) Preparación
import tensorflow as tf
import os, json
print("TensorFlow version:", tf.__version__)
print("GPU disponible:", tf.config.list_physical_devices('GPU'))

# 2) descargar dataset (kagglehub)
#!pip install kagglehub --quiet
import kagglehub
path = kagglehub.dataset_download("vipoooool/new-plant-diseases-dataset")
print("Dataset descargado en:", path)

# Ajusta esta ruta
TRAIN_DIR = os.path.join(path, "new plant diseases dataset(augmented)",
                         "New Plant Diseases Dataset(Augmented)", "train")
print("Carpeta TRAIN encontrada en:", TRAIN_DIR)

# 3) Parametros de entrenamiento
IMAGE_SIZE = (96, 96)
BATCH_SIZE = 48
EPOCHS = 7
AUTOTUNE = tf.data.AUTOTUNE
SEED = 123

# 4) Crear datasets train / val Divide el dataset en 90% entrenamiento y 10% validación.
train_ds = tf.keras.preprocessing.image_dataset_from_directory(
    TRAIN_DIR,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    validation_split=0.10,
    subset="training",
    seed=SEED
)

val_ds = tf.keras.preprocessing.image_dataset_from_directory(
    TRAIN_DIR,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    validation_split=0.10,
    subset="validation",
    seed=SEED
)

class_names = train_ds.class_names
num_classes = len(class_names)
print("Número de clases:", num_classes)
print("Ejemplo de clases:", class_names[:10])

# Guardar classes.json (lista de nombres en orden)
with open("classes.json", "w", encoding="utf-8") as f:
    json.dump(class_names, f, ensure_ascii=False, indent=2)
print("classes.json creado correctamente!")

# 5) Optimización del pipeline mejora la eficiencia del entrenamiento con cache, shuffle y prefetch.
def prepare(ds, shuffle=False, augment=False):
    ds = ds.cache()
    if shuffle:
        ds = ds.shuffle(1024)
    ds = ds.prefetch(buffer_size=AUTOTUNE)
    return ds

train_ds = prepare(train_ds, shuffle=True, augment=False)
val_ds = prepare(val_ds, shuffle=False, augment=False)

# 6) Definir modelo Usa MobileNetV2 preentrenado en ImageNet como base
IMG_SIZE = IMAGE_SIZE  # (96,96)

base_model = tf.keras.applications.MobileNetV2(
    input_shape=IMG_SIZE + (3,),
    include_top=False,
    weights="imagenet"
)

# Congela un bloque inicial (60 capas) y dejar el resto entrenable (fine-tuning parcial)
for layer in base_model.layers[:60]:
    layer.trainable = False
for layer in base_model.layers[60:]:
    layer.trainable = True

# definir el modelo con input_shape en Rescaling para que quede completamente construido
inputs = tf.keras.Input(shape=IMG_SIZE + (3,), name="input_image")
x = tf.keras.layers.Rescaling(1.0 / 255)(inputs) #se normalizan las imagenes
x = base_model(x, training=False)
x = tf.keras.layers.GlobalAveragePooling2D()(x)
x = tf.keras.layers.Dropout(0.3)(x) #evitar overfitting / sobreajustes
outputs = tf.keras.layers.Dense(num_classes, activation="softmax")(x) # salida con probabilidades para cada clase

model = tf.keras.Model(inputs, outputs, name="plant_mobilenetv2_96")
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0008),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# 7) Callbacks 
checkpoint_cb = tf.keras.callbacks.ModelCheckpoint(
    "plant_model_best.keras", monitor="val_accuracy", save_best_only=True, verbose=1
)
early_cb = tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=3, restore_best_weights=True)

# 8) Entrenar 
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    callbacks=[checkpoint_cb, early_cb]
)

# 9) Evaluación final
loss_val, acc_val = model.evaluate(val_ds)
print("\n==============================")
print(" VALIDATION RESULTS")
print("==============================")
print("Validation Accuracy:", acc_val)
print("Validation Loss:", loss_val)
print("==============================\n")

# 10) Guardar modelos: .keras y .h5
# Guardar formato.keras
model.save("plant_model.keras")
print("Modelo guardado como plant_model.keras !")

# Guardar también .h5

model.build((None, IMG_SIZE[0], IMG_SIZE[1], 3))
model.save("plant_model.h5")
print("Modelo guardado como plant_model.h5 !")



