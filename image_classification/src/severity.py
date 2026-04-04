import cv2
import numpy as np

def calculate_severity(image_path, case_type):
    img = cv2.imread(image_path)
    img = cv2.resize(img, (224, 224))

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # Detect red regions (important for injuries)
    lower_red1 = np.array([0, 120, 70])
    upper_red1 = np.array([10, 255, 255])

    mask = cv2.inRange(hsv, lower_red1, upper_red1)

    # Calculate ratio
    red_pixels = np.sum(mask > 0)
    total_pixels = 224 * 224
    red_ratio = red_pixels / total_pixels

    # Convert to score (0–100)
    severity_score = int(red_ratio * 100)

    # Assign label based on case type
    if case_type == "burn":
        if severity_score < 10:
            label = "Mild"
        elif severity_score < 30:
            label = "Moderate"
        else:
            label = "Severe"

    elif case_type == "trauma":
        if severity_score < 5:
            label = "Mild"
        elif severity_score < 20:
            label = "Moderate"
        else:
            label = "Severe"

    return label, severity_score