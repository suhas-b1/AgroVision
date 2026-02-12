import cv2
import numpy as np
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

def preprocess_image(image_path):
    # Read image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Invalid image")

    # Convert BGR → RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Resize to model input
    img = cv2.resize(img, (224, 224))

    # Convert to array
    img = np.array(img, dtype=np.float32)

    # Expand dims for model
    img = np.expand_dims(img, axis=0)

    # MobileNet preprocessing
    img = preprocess_input(img)

    return img
