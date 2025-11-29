const axios = require('axios');

const replicate = axios.create({
    baseURL: "https://api.replicate.com/v1",
    headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
    },
});

async function generateImage(imageUrl, prompt, model, chosenStyle) {
    let version;
    if (model === 'photomaker') {
        version = "ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4";
    } else if (model === 'fofr') {
        version = "a07f252abbbd832009640b27f063ea52d87d7a23a185ca165bec23b5adc8deaf";
    } else {
        version = "43d309c37ab4e62361e5e29b8e9e867fb2dcbcec77ae91206a8d95ac5dd451a0";
    }

    const negative_prompt = 'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, flaws in the eyes, flaws in the face, flaws, non-HDRi, artifacts noise, glitch, deformed, mutated, ugly, disfigured, hands, low resolution, partially rendered objects, deformed or partially rendered eyes, deformed eyeballs, cross-eyed';

    let input;
    if (model === 'photomaker') {
        input = {
            input_image: imageUrl,
            prompt,
            negative_prompt,
            style_name: '(No style)',
            num_steps: 50,
            style_strength_ratio: 20,
            num_outputs: 1,
            guidance_scale: 5,
            width: 512,
            height: 512
        };
    } else if (model === 'fofr') {
        input = {
            image: imageUrl,
            prompt,
            style: chosenStyle,
            negative_prompt,
            denoising_strength: 0.65,
            prompt_strength: 4.5,
            control_depth_strength: 0.8,
            instant_id_strength: 0.8,
            lora_scale: 1,
            width: 768,
            height: 768
        };
    } else {
        input = {
            main_face_image: imageUrl,
            prompt,
            negative_prompt,
            cfg_scale: 1.2,
            identity_scale: 0.8,
            generation_mode: 'fidelity',
            output_format: 'jpg',
            output_quality: 80,
            num_steps: 4,
            num_samples: 1,
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

    if (!finalImage || typeof finalImage !== 'string' || !finalImage.startsWith('http')) {
        throw new Error('Invalid final image URL received.');
    }

    return finalImage;
}

module.exports = {
    generateImage
};