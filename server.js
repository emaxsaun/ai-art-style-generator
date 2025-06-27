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
	'70s Psychedelic Poster',
	'80s Comic Book Art',
	'90s Grunge Graphic',
	'Afrofuturism Vision',
	'Acrylic',
	'Art Deco Luxe',
	'Art Nouveau Flourish',
	'Barbiecore Glam Pop',
	'Baroque oil painting',
	'Biopunk Mutation',
	'Brutalist Poster Design',
	'Cartoon Astronaut',
	'Charcoal Drawing',
	'Cel-Shaded Anime',
	'Chrome Techno Armor',
	'Classic Comic Strip',
	'Classic Fantasy Painting',
	'Collage Surrealism',
	'Cinematic',
	'Comic Book',
	'Cubist Interpretation',
	'Cyber Samurai Portrait',
	'Cyberpunk Portrait',
	'Dark Fantasy Concept Art',
	'Dieselpunk Grunge',
	'Digital Illustration',
	'Disney Character',
	'Dreamcore Vibes',
	'Dreamlike Double Exposure',
	'Dramatic Baroque Style',
	'Early 2000s Pop Graphics',
	'Ethereal Fairy World',
	'Expressionist Brush Chaos',
	'Fantasy Oil Painting',
	'Futuristic Hologram',
	'Fantasy art',
	'Film Noir',
	'Glitchcore Distortion',
	'Glitch Vaporwave',
	'Golden Age Comic Strip',
	'Graffiti Street Art',
	'Haunted Vintage Photo',
	'Hypercolor Streetwear',
	'Hyperreal 3D Render',
	'Impressionist Brush Strokes',
	'Ink & Bone Gothic Fantasy',
	'Ink and Wash Drawing',
	'Ink Comic',
	'Line art Illustration',
	'Low-Poly 3D Render',
	'Manga Character',
	'Modern Minimalist',
	'Moebius Line Fantasy',
	'Moody Film',
	'Metal',
	'Mughal Miniature Painting',
	'Mythic Tarot Card',
	'Mythical Creature Transformation',
	'Neon Punk',
	'Neon-lit Synthwave',
	'Painting',
	'Papercut Layered Illustration',
	'Photographic',
	'Photorealistic Render',
	'Pixar-style 3D Character',
	'Pixel Art 8-Bit',
	'Pencil Sketch',
	'Pop Art Portrait',
	'Post-apocalyptic Wasteland',
	'Realistic',
	'Renaissance Portrait',
	'Retro',
	'Retro Pixel Portrait',
	'Retro Sci-Fi Pulp Cover',
	'Stunning',
	'Steampunk Gear-Laden Design',
	'Studio Ghibli Character',
	'Surreal Dreamscape',
	'Urban',
	'Van Gogh Style',
	'Vaporwave Aesthetic',
	'Vintage Newspaper Print',
	'Watercolor Painting',
	'Wireframe Mesh Render',
	'Zbrush Sculpt Render'
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
		prompt: `A portrait img in the style of ${name}`
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
			customPrompt,
			model
		} = req.body;

		const fallbackStyle = styles[Math.floor(Math.random() * styles.length)];
		const chosenStyle = styles.includes(selectedStyle) ? selectedStyle : fallbackStyle;
		const prompt = (customPrompt && customPrompt.trim()) ? customPrompt.trim() : `A portrait img in the style of ${chosenStyle}`;
        const negative_prompt = 'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, flaws in the eyes, flaws in the face, flaws, non-HDRi, artifacts noise, glitch, deformed, mutated, ugly, disfigured, hands, low resolution, partially rendered objects, deformed or partially rendered eyes, deformed eyeballs, cross-eyed';

		console.log(`Prompt to send: "${prompt}"`);

		const replicate = axios.create({
			baseURL: "https://api.replicate.com/v1",
			headers: {
				Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
				"Content-Type": "application/json",
			},
		});

		let version;

		if (model === 'photomaker') {
			version = "ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4";
		} else {
			version = "43d309c37ab4e62361e5e29b8e9e867fb2dcbcec77ae91206a8d95ac5dd451a0";
		}

		let input;

		if (model === 'photomaker') {
			input = {
				input_image: imageUrl,
				prompt,
				negative_prompt: negative_prompt,
				style_name: '(No style)',
				num_steps: 50,
				style_strength_ratio: 20,
				num_outputs: 1,
				guidance_scale: 5,
				width: 512,
				height: 512
			};
		} else {
			input = {
				main_face_image: imageUrl,
				prompt,
				negative_prompt: negative_prompt,
				cfg_scale: 1.2,
				identity_scale: 0.8,
				generation_mode: 'fidelity',
				output_format: 'jpg',
				output_quality: 80,
				num_steps: 4,
				image_height: 1024,
				image_width: 768
			};
		}

		console.log('Sending Replicate request with input:', JSON.stringify(input, null, 2));

		const start = await replicate.post('/predictions', {
			version,
			input
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