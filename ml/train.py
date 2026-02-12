# ===============================
# STEP 1: Import required libraries
# ===============================

import tensorflow as tf
from tensorflow.keras.layers import Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
import os

# ===============================
# STEP 2: Set paths and parameters
# ===============================

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(SCRIPT_DIR, "dataset")   # folder containing crop images (script-relative)
IMAGE_SIZE = (224, 224)    # image size for CNN
BATCH_SIZE = 32
EPOCHS = 15                # you can increase later

# ===============================
# STEP 3: Prepare image data
# ===============================

datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    validation_split=0.2,
    rotation_range=40,
    zoom_range=0.3,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    brightness_range=[0.6, 1.4],
    horizontal_flip=True,
    vertical_flip=True
)


# Ensure dataset path exists and provide a helpful error if not
if not os.path.isdir(DATASET_PATH):
    raise FileNotFoundError(
        f"Dataset directory not found: {DATASET_PATH}\n"
        "Make sure the dataset is located at this path. "
        "If you keep the dataset under the `ml` folder, run the script from the repository root or set DATASET_PATH accordingly."
    )

train_data = datagen.flow_from_directory(
    DATASET_PATH,
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="training"
)
import json

# Save class indices (IMPORTANT)
class_indices = train_data.class_indices
class_names = list(class_indices.keys())

# Save to backend so API can read it
BACKEND_DIR = os.path.join(os.path.dirname(__file__), "..", "backend")
os.makedirs(BACKEND_DIR, exist_ok=True)

with open(os.path.join(BACKEND_DIR, "class_names.json"), "w") as f:
    json.dump(class_names, f)

print("✅ Saved class names:", class_names)


val_data = datagen.flow_from_directory(
    DATASET_PATH,
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="validation"
)

# ===============================
# STEP 4: Load pretrained CNN model
# ===============================

base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

# Freeze most of the model
for layer in base_model.layers[:-20]:
    layer.trainable = False

# Unfreeze last 20 layers for fine-tuning
for layer in base_model.layers[-20:]:
    layer.trainable = True

# ===============================
# STEP 5: Add our custom layers
# ===============================

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation="relu")(x)
x = Dropout(0.5)(x)
output = Dense(train_data.num_classes, activation="softmax")(x)

model = Model(inputs=base_model.input, outputs=output)

# ===============================
# STEP 6: Compile the model
# ===============================

model.compile(
    optimizer=Adam(learning_rate=0.00001),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

# ===============================
# STEP 7: Train the model
# ===============================
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


# ===============================
# STEP 8: Save the trained model
# ===============================

model.save("crop_disease_model.h5")

print("✅ Model training completed and saved as crop_disease_model.h5")
