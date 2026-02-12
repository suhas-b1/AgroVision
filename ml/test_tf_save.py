import tensorflow as tf
import os

print("TensorFlow version:", tf.__version__)

# Simple dummy model
model = tf.keras.Sequential([
    tf.keras.layers.Dense(1, input_shape=(1,))
])

# Save using NEW keras format
SAVE_PATH = r"E:\PROJECTS\AgroVision\backend\TEST_MODEL.keras"

print("Saving test model...")
model.save(SAVE_PATH)

if os.path.exists(SAVE_PATH):
    print("✅ SUCCESS: Test model file created")
else:
    print("❌ FAILED: Test model not saved")
