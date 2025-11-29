const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const {
    generateImage
} = require('../services/replicateService');
const {
    styles,
    fofrStyles
} = require('../services/styleService');

async function uploadImage(req, res, next) {
    try {
        const {
            selectedStyle,
            customPrompt,
            model
        } = req.body;
        const imageUrlInput = req.body.imageUrl?.trim();
        let imageUrl;
        let rgbPath;

        if (!req.file && !imageUrlInput) {
            console.log('No file or image URL provided');
            return res.status(400).json({
                success: false,
                error: 'No image provided'
            });
        }

        if (imageUrlInput) {
            imageUrl = imageUrlInput;
        } else {
            console.log('File uploaded:', req.file);
            const originalPath = req.file.path;
            rgbPath = `${originalPath}-rgb.jpg`;

            let width, height;
            if (model === 'photomaker') {
                width = 512;
                height = 512;
            } else if (model === 'fofr') {
                width = 768;
                height = 768;
            } else {
                width = 768;
                height = 1024;
            }

            await sharp(originalPath)
                .resize(width, height)
                .toColorspace('srgb')
                .jpeg()
                .toFile(rgbPath);

            await fs.promises.unlink(originalPath);

            const isLocal = req.get('host').includes('localhost') || req.hostname === '127.0.0.1';

            if (isLocal) {
                console.log('Local run');
                const buffer = await fs.promises.readFile(rgbPath);
                const base64 = buffer.toString('base64');
                imageUrl = `data:image/jpeg;base64,${base64}`;
            } else {
                console.log('Web run');
                const filename = path.basename(rgbPath);
                imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
            }
        }

        const fallbackStyle = model === 'fofr' ?
            fofrStyles[Math.floor(Math.random() * fofrStyles.length)] :
            styles[Math.floor(Math.random() * styles.length)];

        const validStyleList = model === 'fofr' ? fofrStyles : styles;
        const chosenStyle = validStyleList.includes(selectedStyle) ? selectedStyle : fallbackStyle;

        const isPhotomaker = model === 'photomaker';
        const prompt = model === 'fofr' ?
            `A portrait image in the style of ${chosenStyle}` :
            (customPrompt && customPrompt.trim()) ?
            customPrompt.trim() :
            `A portrait ${isPhotomaker ? 'img' : 'image'} in the style of ${chosenStyle}`;


        console.log(`Prompt to send: "${prompt}"`);

        const finalImage = await generateImage(imageUrl, prompt, model, chosenStyle);

        res.json({
            success: true,
            message: `Image processed in ${chosenStyle}`,
            imageUrl: finalImage
        });

        if (rgbPath) {
            try {
                await fs.promises.unlink(rgbPath);
                console.log('Uploaded image deleted after processing');
            } catch (err) {
                console.error('Failed to delete uploaded image:', err);
            }
        }
    } catch (err) {
        console.error('Upload handler error:', err);
        next(err);
    }
}

const axios = require('axios');

async function createCollage(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image provided'
            });
        }

        const originalPath = req.file.path;
        const rgbPath = `${originalPath}-rgb.jpg`;

        await sharp(originalPath)
            .resize(1024, 1024)
            .toColorspace('srgb')
            .jpeg()
            .toFile(rgbPath);

        await fs.promises.unlink(originalPath);

        const isLocal = req.get('host').includes('localhost') || req.hostname === '127.0.0.1';
        let imageUrl;
        if (isLocal) {
            const buffer = await fs.promises.readFile(rgbPath);
            const base64 = buffer.toString('base64');
            imageUrl = `data:image/jpeg;base64,${base64}`;
        } else {
            const filename = path.basename(rgbPath);
            imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
        }

        const shuffledStyles = styles.sort(() => 0.5 - Math.random());
        const selectedStyles = shuffledStyles.slice(0, 4);

        const imagePromises = selectedStyles.map(style => {
            const prompt = `A portrait image in the style of ${style}`;
            return generateImage(imageUrl, prompt, 'pulid', style);
        });

        const generatedImages = await Promise.all(imagePromises);

        const imageBuffers = await Promise.all(generatedImages.map(async (url) => {
            const response = await axios({
                url,
                responseType: 'arraybuffer'
            });
            return sharp(response.data)
                .resize(1024, 1024, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 1 }
                })
                .toBuffer();
        }));

        const collagePath = `${rgbPath}-collage.jpg`;
        await sharp({
                create: {
                    width: 2048,
                    height: 2048,
                    channels: 4,
                    background: {
                        r: 255,
                        g: 255,
                        b: 255,
                        alpha: 1
                    }
                }
            })
            .composite([{
                input: imageBuffers[0],
                top: 0,
                left: 0
            }, {
                input: imageBuffers[1],
                top: 0,
                left: 1024
            }, {
                input: imageBuffers[2],
                top: 1024,
                left: 0
            }, {
                input: imageBuffers[3],
                top: 1024,
                left: 1024
            }])
            .toFile(collagePath);

        const collageFilename = path.basename(collagePath);
        const collageUrl = `${req.protocol}://${req.get('host')}/uploads/${collageFilename}`;

        res.json({
            success: true,
            message: 'Collage created successfully',
            imageUrl: collageUrl
        });

        await fs.promises.unlink(rgbPath);

    } catch (err) {
        console.error('Collage creation error:', err);
        next(err);
    }
}

module.exports = {
    uploadImage,
    createCollage
};