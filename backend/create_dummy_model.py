import os
import tensorflow as tf
from tensorflow.keras import layers, models

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "crop_disease_model.h5")

def build_and_save():
    # Minimal model that accepts (224,224,3) and outputs 3 classes
    model = models.Sequential([
        layers.Input(shape=(224, 224, 3)),
        layers.Conv2D(8, 3, activation="relu"),
        layers.GlobalAveragePooling2D(),
        layers.Dense(3, activation="softmax")
    ])

    model.compile(optimizer="adam", loss="categorical_crossentropy")
    model.save(MODEL_PATH)
    print("Saved dummy model to:", MODEL_PATH)

if __name__ == "__main__":
    build_and_save()
