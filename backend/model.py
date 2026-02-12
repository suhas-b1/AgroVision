import tensorflow as tf
import numpy as np
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# =============================
# LOAD PLANT CLASSIFIER
# =============================
plant_model = tf.keras.models.load_model(
    os.path.join(BASE_DIR, "plant_classifier.keras")
)

with open(os.path.join(BASE_DIR, "plant_classes.json")) as f:
    PLANT_CLASSES = json.load(f)


# =============================
# LOAD TOMATO DISEASE MODEL
# =============================
tomato_model = tf.keras.models.load_model(
    os.path.join(BASE_DIR, "tomato_disease.keras")
)

with open(os.path.join(BASE_DIR, "tomato_classes.json")) as f:
    TOMATO_CLASSES = json.load(f)


# =============================
# LOAD POTATO DISEASE MODEL
# =============================
potato_model = tf.keras.models.load_model(
    os.path.join(BASE_DIR, "potato_disease.keras")
)

with open(os.path.join(BASE_DIR, "potato_classes.json")) as f:
    POTATO_CLASSES = json.load(f)


# =============================
# LOAD PEPPER DISEASE MODEL
# =============================
pepper_model = tf.keras.models.load_model(
    os.path.join(BASE_DIR, "pepper_disease.keras")
)

with open(os.path.join(BASE_DIR, "pepper_classes.json")) as f:
    PEPPER_CLASSES = json.load(f)


# =============================
# PREDICT PLANT
# =============================
def predict_plant(image):
    preds = plant_model.predict(image, verbose=0)
    idx = int(np.argmax(preds))
    confidence = float(np.max(preds))
    return PLANT_CLASSES[idx], confidence


# =============================
# PREDICT DISEASE BASED ON PLANT
# =============================
def predict_disease(plant, image):

    if plant == "Tomato":
        preds = tomato_model.predict(image)
        idx = int(np.argmax(preds))
        confidence = float(np.max(preds))
        if idx < len(TOMATO_CLASSES):
            return TOMATO_CLASSES[idx], confidence
        return "Unknown", 0.0

    if plant == "Potato":
        preds = potato_model.predict(image)
        idx = int(np.argmax(preds))
        confidence = float(np.max(preds))
        if idx < len(POTATO_CLASSES):
            return POTATO_CLASSES[idx], confidence
        return "Unknown", 0.0

    if plant == "Pepper":
        preds = pepper_model.predict(image)
        idx = int(np.argmax(preds))
        confidence = float(np.max(preds))
        if idx < len(PEPPER_CLASSES):
            return PEPPER_CLASSES[idx], confidence
        return "Unknown", 0.0

    return "Unknown", 0.0
