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
    'Retro',
    'Realistic',
    'Stunning',
	'Steampunk gear-laden design',
	'Afrofuturism vision',
	'Vintage newspaper print',
	'Graffiti street art',
	'Cel-shaded anime',
	'Ethereal fairy world',
	'Dreamlike double exposure',
	'Moody film noir',
	'Cinematic',
	'Disney Character',
	'Digital Illustration',
	'Photographic',
	'Fantasy art',
	'Neon Punk',
	'Enhance',
	'Comic book',
	'Low Poly 3D',
    'Barbiecore Glam Pop',
    'Moebius Line Fantasy',
    'Astronaut'
];

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));

app.use(express.static('public'));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, {
		recursive: true
	});
	console.log('Created uploads directory');
}

app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadsDir),
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		const base = path.basename(file.originalname, ext).replace(/\W+/g, '-');
		cb(null, `${base}-${Date.now()}${ext}`);
	}
});

const upload = multer({
	storage,
	limits: {
		fileSize: 5 * 1024 * 1024
	},
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('Only image files are allowed'));
		}
	}
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/styles', (req, res) => {
	const stylesWithPrompts = styles.map(name => ({
		name,
		prompt: `A portrait image in the style of ${name}`
	}));
	res.json(stylesWithPrompts);
});

app.post('/upload', upload.single('photo'), async (req, res, next) => {
	try {
		if (!req.file) {
			console.log('req.file is undefined:', req.file);
			return res.status(400).json({
				success: false,
				error: 'No file uploaded'
			});
		}

		console.log('File uploaded:', req.file);

		const imagePath = req.file.path;
		const filename = req.file.filename;
		const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

		const {
			selectedStyle,
			customPrompt
		} = req.body;
		const fallbackStyle = styles[Math.floor(Math.random() * styles.length)];
		const chosenStyle = styles.includes(selectedStyle) ? selectedStyle : fallbackStyle;
		const prompt = (customPrompt && customPrompt.trim()) ? customPrompt.trim() : `A portrait img in the style of ${chosenStyle}`;
		console.log(`Prompt to send: "${prompt}"`);

		const replicate = axios.create({
			baseURL: "https://api.replicate.com/v1",
			headers: {
				Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
				"Content-Type": "application/json",
			},
		});

		const version = "43d309c37ab4e62361e5e29b8e9e867fb2dcbcec77ae91206a8d95ac5dd451a0";

		console.log('Sending Replicate request with input:', {
            main_face_image: imageUrl,
            prompt,
            num_samples: 1,
            negative_prompt: 'nsfw, flaws in the eyes, flaws in the face, flaws, lowres, non-HDRi, low quality, worst quality,artifacts noise, text, watermark, glitch, deformed, mutated, ugly, disfigured, hands, low resolution, partially rendered objects,  deformed or partially rendered eyes, deformed, deformed eyeballs, cross-eyed,blurry',
            cfg_scale: 1.2,
            identity_scale: 0.8,
            generation_mode: 'fidelity',
            output_format: 'jpg',
            output_quality: 80,
            num_steps: 4,
            image_height: 1024,
            image_width: 768
		});

		const start = await replicate.post('/predictions', {
			version,
			input: {
				main_face_image: imageUrl,
				prompt,
                num_samples: 1,
				negative_prompt: 'nsfw, flaws in the eyes, flaws in the face, flaws, lowres, non-HDRi, low quality, worst quality,artifacts noise, text, watermark, glitch, deformed, mutated, ugly, disfigured, hands, low resolution, partially rendered objects,  deformed or partially rendered eyes, deformed, deformed eyeballs, cross-eyed,blurry',
                cfg_scale: 1.2,
                identity_scale: 0.8,
                generation_mode: 'fidelity',
                output_format: 'jpg',
                output_quality: 80,
				num_steps: 4,
				image_height: 1024,
                image_width: 768
			}
		});

		const predictionUrl = start.data.urls.get;

		let finalImage;
		let attempts = 0;
		const maxAttempts = 60;

		while (attempts < maxAttempts) {
			const result = await axios.get(predictionUrl, {
				headers: {
					Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`
				},
			});

			console.log(`Polling status: ${result.data.status}`);

			if (result.data.status === 'succeeded') {
				console.log('Replicate output:', result.data.output);
				if (typeof result.data.output === 'string') {
					finalImage = result.data.output;
				} else if (Array.isArray(result.data.output) && result.data.output.length > 0) {
					finalImage = result.data.output[0];
				} else {
					throw new Error('Unexpected output format from Replicate.');
				}
				console.log('Final image URL from Replicate:', finalImage);
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

		if (!finalImage || typeof finalImage !== 'string' || !finalImage.startsWith('http')) {
			throw new Error('Invalid final image URL received.');
		}

		res.json({
			success: true,
			message: `Image processed in ${chosenStyle}`,
			imageUrl: finalImage
		});

		try {
			await fs.promises.unlink(imagePath);
			console.log('Uploaded image deleted after processing');
		} catch (err) {
			console.error('Failed to delete uploaded image:', err);
		}

	} catch (err) {
		console.error('Upload handler error:', err);
		next(err);
	}
});

app.use((err, req, res, next) => {
	console.error('Global error handler:', err);
	res.status(500).json({
		success: false,
		error: err.message || 'Unknown error'
	});
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});