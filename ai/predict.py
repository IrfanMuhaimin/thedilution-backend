import sys
import json
import joblib
import warnings

# Suppress harmless "feature names" warnings from scikit-learn
warnings.filterwarnings("ignore")

def predict(inventory_id, quantity):
    """
    Loads the pre-trained model and makes a prediction for a single inventory item.
    """
    try:
        # Load the dictionary of models from the .pkl file
        models = joblib.load('ai/inventory_models.pkl')
    except FileNotFoundError:
        return {"error": "Model file 'ai/inventory_models.pkl' not found."}
    except Exception as e:
        return {"error": f"Failed to load model: {str(e)}"}

    # Check if a model exists for the given inventory ID
    if inventory_id in models:
        model = models[inventory_id]
        
        # The model expects a 2D array, so we wrap [quantity] in another list
        predicted_days = model.predict([[quantity]])[0]
        
        # Ensure the prediction is not negative
        predicted_days = max(0, predicted_days)

        # Return the result in a dictionary
        return {"inventoryId": inventory_id, "predictedStockingDays": predicted_days}
    else:
        # Handle cases where a new inventory item doesn't have a trained model yet
        return {"inventoryId": inventory_id, "predictedStockingDays": None, "info": "No model available for this item."}


if __name__ == "__main__":
    # This block executes when the script is run from the command line
    
    # Expecting two arguments: script_name.py <inventory_id> <quantity>
    if len(sys.argv) != 3:
        # Print error as a JSON string for consistency
        print(json.dumps({"error": "Invalid number of arguments. Expected inventory_id and quantity."}))
        sys.exit(1)

    try:
        # Convert command-line arguments to the correct types
        inventory_id_arg = int(sys.argv[1])
        quantity_arg = float(sys.argv[2])
    except ValueError:
        print(json.dumps({"error": "Invalid argument types. inventory_id must be an integer, quantity must be a number."}))
        sys.exit(1)

    # Call the prediction function
    prediction_result = predict(inventory_id_arg, quantity_arg)
    
    # Print the final result as a JSON string to standard output.
    # Node.js will read this output.
    print(json.dumps(prediction_result))