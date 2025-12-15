import sys
import json
import joblib
import warnings
import os

# --- DEFINE THE ABSOLUTE PATH TO THE SCRIPT'S DIRECTORY ---
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, 'inventory_models.pkl')

warnings.filterwarnings("ignore")

def predict(inventory_id, quantity):
    try:
        # --- USE THE ABSOLUTE PATH TO LOAD THE MODEL ---
        models = joblib.load(MODEL_PATH)
    except FileNotFoundError:
        return {"error": f"Model file not found at {MODEL_PATH}"}
    except Exception as e:
        return {"error": f"Failed to load model: {str(e)}"}

    if inventory_id in models:
        model = models[inventory_id]
        predicted_days = model.predict([[quantity]])[0]
        predicted_days = max(0, predicted_days)
        return {"inventoryId": inventory_id, "predictedStockingDays": predicted_days}
    else:
        return {"inventoryId": inventory_id, "predictedStockingDays": None, "info": "No model available for this item."}

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Invalid number of arguments."}))
        sys.exit(1)
    try:
        inventory_id_arg = int(sys.argv[1])
        quantity_arg = float(sys.argv[2])
    except ValueError:
        print(json.dumps({"error": "Invalid argument types."}))
        sys.exit(1)
    
    prediction_result = predict(inventory_id_arg, quantity_arg)
    print(json.dumps(prediction_result))