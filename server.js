require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

if (!process.env.REPLICATE_API_TOKEN) {
    console.error('Missing REPLICATE_API_TOKEN in .env file');
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const upload = multer({
    dest: 'uploads/'
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/upload', upload.single('photo'), async (req, res) => {
    const imagePath = req.file.path;
    const filename = req.file.filename;
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

    const styles = [
        'Van Gogh style',
        'Cyberpunk portrait',
        'Studio Ghibli character',
        '80s comic book art',
        'Fantasy oil painting',
        'Pencil sketch',
        'Watercolor painting',
        'Pixar-style 3D character',
        'Futuristic hologram',
        'Pop art portrait',
        'Charcoal drawing',
        'Baroque oil painting',
        'Modern minimalism',
        'Neon-lit synthwave',
        'Dark fantasy concept art',
        'Line art illustration',
        'Manga character',
        'Surreal dreamscape',
        'Ink and wash drawing',
        'Comic strip style',
        'Vaporwave aesthetic',
        'Impressionist brush strokes',
        'Post-apocalyptic wasteland',
        'Mythical creature transformation',
        'Photorealistic render',
        'Low-poly 3D style',
        'Art nouveau flourish',
        'Renaissance portrait',
        'Cubist interpretation',
        'Steampunk gear-laden design',
        'Afrofuturism vision',
        'Vintage newspaper print',
        'Graffiti street art',
        'Cel-shaded anime',
        'Ethereal fairy world',
        'Dreamlike double exposure',
        'Moody film noir'
    ];

    const selectedStyle = styles[Math.floor(Math.random() * styles.length)];
    console.log(`Selected style for this generation: ${selectedStyle}`);

    try {
        const replicate = axios.create({
            baseURL: "https://api.replicate.com/v1",
            headers: {
                Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        const version = "82bbb4595458d6be142450fc6d8c4d79c936b92bd184dd2d6dd71d0796159819";

        console.log('Sending Replicate request with input:', {
            image: imageUrl,
            prompt: `a portrait photo in ${selectedStyle}`,
            negative_prompt: "blurry, distorted, ugly, disfigured, low quality",
            prompt_strength: 0.1,
            scheduler: "DPMSolver++",
            num_inference_steps: 25,
            guidance_scale: 7,
            width: 768,
            height: 768
          });          

        const start = await replicate.post('/predictions', {
            version,
            input: {
                image: imageUrl,
                prompt: `a portrait photo in ${selectedStyle}`,
                negative_prompt: "blurry, distorted, ugly, disfigured, low quality",
                prompt_strength: 0.1,
                scheduler: "DPMSolver++",
                num_inference_steps: 25,
                guidance_scale: 7,
                width: 768,
                height: 768
            }
        });

        const predictionUrl = start.data.urls.get;

        let finalImage;
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
            const result = await axios.get(predictionUrl, {
                headers: {
                    Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`
                },
            });

            console.log(`Polling status: ${result.data.status}`);

            if (result.data.status === 'succeeded') {
                finalImage = result.data.output[0];
                break;
            } else if (result.data.status === 'failed') {
                console.error('Replicate response:', result.data);
                throw new Error('Image generation failed.');
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
        }

        if (!finalImage) {
            throw new Error('Image generation timed out.');
        }

        res.json({
            success: true,
            message: `Image processed in ${selectedStyle}`,
            imageUrl: finalImage
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            success: false,
            error: err?.message || 'Image generation failed.'
        });
    }
    try {
        await fs.promises.unlink(imagePath);
        console.log('Uploaded image deleted after processing');
    } catch (err) {
        console.error('Failed to delete uploaded image:', err);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});