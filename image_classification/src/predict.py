import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import os

# Load model once
model = load_model("model/emergency_model.h5")

classes = ['burn', 'trauma']

def predict_image(img_path):
    try:
        # Check file exists
        if not os.path.exists(img_path):
            raise ValueError("Image path does not exist!")

        # Load and preprocess image
        img = image.load_img(img_path, target_size=(224, 224))
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Predict
        pred = model.predict(img_array)

        class_index = np.argmax(pred)
        confidence = float(np.max(pred))

        return classes[class_index], confidence

    except Exception as e:
        print(f"❌ Prediction Error: {e}")
        return None, None