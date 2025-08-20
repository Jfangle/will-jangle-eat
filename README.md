# Will Jangle Eat This? - Frontend

This is the Next.js frontend for "Will Jangle Eat This?", a full-stack web application that determines whether Jangle (the author of this repo who eats almost anything) would consume a given food item.

**Live Demo:** https://will-jangle-eat.vercel.app/

---

## Features

- **Image Upload:** Users can upload an image directly from their device.
- **URL Input:** Users can paste a URL to an image.
- **AI-Powered Predictions:** Connects to a backend API to classify the image using a custom-trained model.
- **Dynamic UI:** Displays loading states, previews the selected image, and shows the final verdict with confidence scores.
- **Responsive Design:** Works smoothly on both desktop and mobile devices.

## The Model

The image classification model was trained by the author using the FastAI library, with **ResNet34** as the base model. The complete training process, from data acquisition to model fine-tuning, can be reviewed in the Jupyter Notebook located at `../backend-huggingface/will-jangle-eat.ipynb`.

The model was trained on a combination of:
- The **Food-5K dataset** from Kaggle ([link](https://www.kaggle.com/datasets/trolukovich/food5k-image-dataset)), which contains thousands of images of edible and inedible items.
- A custom set of **durian images** scraped from the web, to teach the model Jangle's one culinary exception.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **API Client:** [@gradio/client](https://www.npmjs.com/package/@gradio/client)
- **Model Hosting:** [Hugging Face Spaces](https://huggingface.co/spaces/DefiJangle/will-jangle-eat/)
- **Base Model:** [ResNet34](https://pytorch.org/hub/pytorch_vision_resnet/)

## Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd will-jangle-eat/will-jangle-eat-fe
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Important Usage Note

The backend for this project is hosted on a free Hugging Face Space, which may go to sleep after a period of inactivity. 

If the application seems unresponsive, **click the "Test with Bus Image" button first.** This will send an initial request to wake the server up. Please allow 1-2 minutes for it to spin up, after which the application will be fully responsive.

## API Connection

This frontend is designed to connect to the Machine Learning backend hosted on Hugging Face Spaces. It communicates via an API that uses the [Gradio](https://www.gradio.app/) client standard.

- **Live API Endpoint:** [https://defijangle-will-jangle-eat.hf.space/](https://defijangle-will-jangle-eat.hf.space/)

The specific replica URL is configured inside the `components/ImageClassifier.js` file.
