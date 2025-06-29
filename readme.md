# Photobooth

A simple web app that lets users upload a photo and generates art in various styles using the PuLID model, the PhotoMaker model, and the Face to Many model, using the Replicate API.

Demo - https://ai-art-style-generator-production.up.railway.app/

---

## Features

- Upload your own photo / Camera upload
- Randomly applies one of many creative art styles or choose your own styles/prompt
- Generates art based on your input image
- Displays generated image
- Responsive and styled frontend with a clean UI
- Shows loading spinner during image generation
- Handles errors gracefully

---

## Technologies Used

- Node.js & Express — backend server and API proxy
- Multer — file upload handling
- Axios — HTTP requests to Replicate API
- Replicate API — Image generation
- HTML/CSS/JavaScript — frontend UI and interactions

---

## Getting Started

### Prerequisites

- Node.js v16+
- npm or yarn
- A Replicate API token ([sign up here](https://replicate.com/signup))

### Installation

Clone the repository:

```bash
git clone https://github.com/emaxsaun/ai-art-style-generator.git
cd ai-art-style-generator
```

Make sure you have Node.js installed

Run `npm install` 

Make sure to add a `.env` file with `REPLICATE_API_TOKEN=<YOUR_ACTUAL_API_TOKEN>`

Run `npm run build`

Run `npm run dev`

Note - The app needs to be deployed in order for image generation to work correctly. It fails using localhost but works on Railway.

Note - If using a custom prompt, the word 'img' must be included for the PhotoMaker model, and the custom prompt is disabled for the Face to Many model. Have fun!