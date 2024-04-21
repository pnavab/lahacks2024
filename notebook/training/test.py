import json
import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib

# Step 1: Load and preprocess the data
def load_ndjson_file(file_path):
    with open(file_path, 'r') as file:
        data = [json.loads(line) for line in file]
    return data

# Step 3: Feature Engineering
def extract_stroke_features(drawing):
    num_strokes = len(drawing)
    total_length = 0
    
    for stroke in drawing:
        num_points = len(stroke[0])  # Number of points in the stroke
        length = 0
        for i in range(num_points - 1):
            # Calculate the Euclidean distance between consecutive points
            length += ((stroke[0][i] - stroke[0][i+1])**2 + (stroke[1][i] - stroke[1][i+1])**2)**0.5
        total_length += length
    
    return [num_strokes, total_length]

# Load the NDJSON file
data = load_ndjson_file('../full_raw_book.ndjson')

# Extract features and create DataFrame
features = [extract_stroke_features(sample['drawing']) for sample in data]
df = pd.DataFrame(features, columns=['recognized', 'drawing'])

# Step 4: Prepare data for training
X = df[['recognized', 'recognized']]
Y = [1 if sample['recognized'] else 0 for sample in data]

# Step 5: Choose and train a model
model = LinearRegression()
model.fit(X, Y)

# Step 6: Save the trained model to a .model file
joblib.dump(model, 'trained_model_linear_regression.model')
