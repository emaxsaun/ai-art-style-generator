# Photobooth

A simple web app that lets users upload photos and generate portrait art in various styles using the PuLID model, the PhotoMaker model, and the Face to Many model, using the Replicate API.

**Demo App** https://ai-art-style-generator.onrender.com/

---

## Features

- Upload a photo or use your camera to capture one
- Choose from many creative art styles or use a custom prompt
- Generates stylized art based on your input image
- Displays generated image instantly
- Responsive, clean, and styled frontend UI
- Shows loading spinner during image generation
- Graceful error handling
- Download button
- Image generation works on localhost

---

## Technologies Used

- Node.js & Express — backend server and API proxy
- Multer — file upload handling
- Axios — HTTP requests to Replicate API
- Replicate API — image generation service
- HTML/CSS/JavaScript — frontend UI and interactions

---

## Getting Started

### Prerequisites

- NodeJS v16 or higher (using npm or yarn) - I used NodeJS v22.16.0
- A Replicate API token ([sign up here](https://replicate.com/signin)) - You MUST have this in order for the app to function!

### Installation

Clone the repository

```bash
git clone https://github.com/emaxsaun/ai-art-style-generator.git
cd ai-art-style-generator
```

Install dependencies

```bash
npm install
```

Create a `.env` file with your Replicate API token

```env
REPLICATE_API_TOKEN=<YOUR_ACTUAL_API_TOKEN>
```

Build the project

```bash
npm run build
```

Start the development server

```bash
npm run dev
```

---

**Tips** When using a custom prompt with the PhotoMaker model, the word `img` must be included. The custom prompt is disabled for the Face to Many model.