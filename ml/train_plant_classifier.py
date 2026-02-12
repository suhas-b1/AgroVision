# ======================================
# PLANT CLASSIFIER TRAINING SCRIPT
# ======================================

import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
import os
import json

# ======================================
# PATHS & PARAMETERS
# ======================================

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(SCRIPT_DIR, "dataset", "plant_classifier")

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10

# ======================================
# DATA GENERATOR
# ======================================

datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    validation_split=0.2,
    rotation_range=20,
    zoom_range=0.2,
    horizontal_flip=True
)

if not os.path.isdir(DATASET_PATH):
    raise FileNotFoundError(
        f"Dataset not found at {DATASET_PATH}\n"
        "Create dataset/plant_classifier with subfolders Tomato, Potato, Pepper"
    )

train_data = datagen.flow_from_directory(
    DATASET_PATH,
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="training"
)

val_data = datagen.flow_from_directory(
    DATASET_PATH,
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="validation"
)

# ======================================
# SAVE CLASS NAMES (IMPORTANT)
# ======================================

class_names = list(train_data.class_indices.keys())

BACKEND_DIR = os.path.join(SCRIPT_DIR, "..", "backend")
os.makedirs(BACKEND_DIR, exist_ok=True)

with open(os.path.join(BACKEND_DIR, "plant_classes.json"), "w") as f:
    json.dump(class_names, f)

print("✅ Plant classes:", class_names)

# ======================================
# MODEL (MobileNetV2)
# ======================================

base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

# Freeze most layers
for layer in base_model.layers[:-20]:
    layer.trainable = False

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation="relu")(x)
output = Dense(len(class_names), activation="softmax")(x)

model = Model(inputs=base_model.input, outputs=output)

# ======================================
# COMPILE
# ======================================

model.compile(
    optimizer=Adam(learning_rate=0.0001),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

# ======================================
# TRAIN
# ======================================

early_stop = EarlyStopping(
    monitor="val_loss",
    patience=3,
    restore_best_weights=True
)

model.fit(
    train_data,
    validation_data=val_data,
    epochs=EPOCHS,
    callbacks=[early_stop]
)

# ======================================
# SAVE MODEL (Keras format – RECOMMENDED)
# ======================================

MODEL_PATH = r"E:\PROJECTS\AgroVision\backend\plant_classifier.keras"

print("💾 Saving plant classifier model...")
model.save(MODEL_PATH)

# Verify save
if os.path.exists(MODEL_PATH):
    print("✅ SUCCESS: plant_classifier.keras saved")
else:
    print("❌ ERROR: model file not created")



