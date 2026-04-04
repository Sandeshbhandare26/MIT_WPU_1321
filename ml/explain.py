import numpy as np
import base64
import cv2

def generate_explanation(img_path):
    """
    Mock implementation of SHAP/Grad-CAM.
    In a real scenario, this uses SHAP's DeepExplainer or Grad-CAM 
    over the keras model loaded in image_classification.
    """
    # 1. Read the image
    img = cv2.imread(img_path)
    if img is None:
        return None, ["Could not read image for explanation."]
        
    img = cv2.resize(img, (224, 224))
    
    # 2. Simulate Grad-CAM heatmap generation
    heatmap = np.zeros((224, 224), dtype=np.uint8)
    
    # Create some mock focal points (simulating high activation areas)
    cv2.circle(heatmap, (112, 112), 50, 255, -1)
    heatmap = cv2.GaussianBlur(heatmap, (51, 51), 0)
    
    # Apply colormap
    heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    
    # Superimpose on original image
    superimposed = cv2.addWeighted(img, 0.6, heatmap_color, 0.4, 0)
    
    # 3. Encode to base64
    _, buffer = cv2.imencode('.png', superimposed)
    img_b64 = base64.b64encode(buffer).decode('utf-8')
    
    # 4. Generate some text explanations based on mock intensity
    explanations = [
        "High model activation around the central visual features.",
        "Detected pattern consistent with heavy blunt trauma or structural deformation.",
        "Confidence increased due to high contrast edges in the activation zone."
    ]
    
    return img_b64, explanations
