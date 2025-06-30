# Photobooth

A simple web app that lets users upload photos and generate portrait art in various styles using the PuLID model, the PhotoMaker model, and the Face to Many model, using the Replicate API.

**Demo:** https://ai-art-style-generator-production.up.railway.app/

---

## Features

- Upload a photo or use your camera to capture one
- Choose from many creative art styles or use a custom prompt
- Generates stylized art based on your input image
- Displays generated image instantly
- Responsive, clean, and styled frontend UI
- Shows loading spinner during image generation
- Graceful error handling

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

- NodeJS v16 or higher (using npm or yarn)
- A Replicate API token ([sign up here](https://replicate.com/signin))

### Installation

Clone the repository:

```bash
git clone https://github.com/emaxsaun/ai-art-style-generator.git
cd ai-art-style-generator
```

Install dependencies:

```bash
npm install
```

Create a `.env` file with your Replicate API token:

```env
REPLICATE_API_TOKEN=<YOUR_ACTUAL_API_TOKEN>
```

Build the project:

```bash
npm run build
```

Start the development server:

```bash
npm run dev
```

---

**Note:** Image generation requires deployment on a public URL (like Railway). It does not work on localhost. Message me if you want this added.

**Tip:** When using a custom prompt with the PhotoMaker model, include the word `img`. The custom prompt is disabled for the Face to Many model.