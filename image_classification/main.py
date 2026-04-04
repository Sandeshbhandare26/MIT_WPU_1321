import os
from src.predict import predict_image
from src.severity import calculate_severity

def get_valid_image_path():
    while True:
        img_path = input("\n📂 Enter image path (or drag & drop): ").strip()

        # Remove quotes
        img_path = img_path.strip('"').strip("'")

        # Convert to absolute path
        img_path = os.path.abspath(img_path)

        # Validate
        if not os.path.exists(img_path):
            print("❌ File not found! Try again.")
            continue

        if not os.path.isfile(img_path):
            print("❌ Not a file! Select an image.")
            continue

        if not img_path.lower().endswith((".jpg", ".jpeg", ".png")):
            print("❌ Invalid format! Use JPG/PNG.")
            continue

        return img_path


def get_case_type():
    while True:
        print("\nSelect Case Type:")
        print("1. Trauma/Accident")
        print("2. Burn")

        choice = input("Enter choice (1/2): ").strip()

        if choice == "1":
            return "trauma"
        elif choice == "2":
            return "burn"
        else:
            print("❌ Invalid choice!")


def main():
    print("\n===== Emergency Severity Prediction System =====")

    img_path = get_valid_image_path()
    case_type = get_case_type()

    try:
        predicted_type, confidence = predict_image(img_path)
        severity_label, severity_score = calculate_severity(img_path, case_type)

        print("\n--- RESULT ---")
        print(f"📌 Model Prediction : {predicted_type}")
        print(f"📊 Confidence       : {confidence:.2f}")
        print(f"📌 Selected Case    : {case_type}")
        print(f"🔥 Severity         : {severity_label}")
        print(f"📊 Severity Score   : {severity_score}/100")

    except Exception as e:
        print(f"\n❌ Error: {e}")


if __name__ == "__main__":
    main()