from fastai.vision.all import *
import gradio as gr
from PIL import Image
import io
import json
import os

# Load the trained model
model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
learn = load_learner(model_path)

def predict_image(image):
    """
    Predict whether Jangle will eat the uploaded image
    Returns prediction and confidence scores
    """
    if image is None:
        return "Please upload an image"

    try:
        # Make prediction directly with the PIL image
        pred_class, pred_idx, probs = learn.predict(image)

        # Create confidence dictionary
        confidence_scores = {}
        for i, label in enumerate(learn.dls.vocab):
            confidence_scores[label] = float(probs[i])

        # Determine Jangle's verdict
        if pred_class == 'durian':
            verdict = "🚫 Jangle will NOT eat this! (It's durian)"
        elif pred_class == 'inedible':
            verdict = "🚫 Jangle will NOT eat this! (It's not food)"
        else:  # non_durian_edible
            verdict = "✅ Jangle will eat this!"

        return {
            "prediction": verdict,
            "confidence_scores": confidence_scores,
            "predicted_class": pred_class
        }

    except Exception as e:
        return {"error": f"Error processing image: {str(e)}"}

# Create Gradio interface
demo = gr.Interface(
    fn=predict_image,
    inputs=gr.Image(type="pil"),
    outputs=gr.JSON(label="Jangle's Verdict"),
    title="Will Jangle Eat This? 🤔",
    description="Upload an image to see if Jangle (who eats almost anything except durian) would consume it!",
    examples=None
)

# For Vercel deployment
app = demo

if __name__ == "__main__":
    demo.launch()
