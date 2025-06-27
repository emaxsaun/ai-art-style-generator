# Photobooth

A simple web app that lets users upload a photo and generates art in various styles using the PuLID: Pure and Lightning ID Customization via Contrastive Alignment model and the PhotoMaker model on the Replicate API.

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

Note - Make sure to add a `.env` file with `REPLICATE_API_TOKEN=<YOUR_ACTUAL_API_TOKEN>`

Please note, if using a custom prompt, the word "img" must be part of it! Have fun!