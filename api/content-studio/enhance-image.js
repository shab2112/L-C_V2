const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.end(JSON.stringify(payload));
};

const getBody = req => {
  if (!req.body) return {};
  if (typeof req.body === 'string') return req.body.trim() ? JSON.parse(req.body) : {};
  return req.body;
};

const stripDataUrl = value => String(value || '').replace(/^data:[^;]+;base64,/, '');

const imageInputToDataUrl = async image => {
  if (image.startsWith('data:image/')) return image;
  if (!/^https?:\/\//i.test(image)) return image;

  const response = await fetch(image);
  if (!response.ok) throw new Error(`Unable to fetch source image: ${response.status}`);
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  if (!contentType.startsWith('image/')) throw new Error(`Source URL is not an image (${contentType}).`);
  const base64 = Buffer.from(await response.arrayBuffer()).toString('base64');
  return `data:${contentType};base64,${base64}`;
};

const extractImage = parsed => {
  const candidates = [
    parsed?.image,
    parsed?.url,
    parsed?.image_url,
    parsed?.images?.[0],
    parsed?.data?.[0]?.b64_json,
    parsed?.data?.[0]?.url,
    parsed?.artifacts?.[0]?.base64,
    parsed?.artifacts?.[0]?.url,
    parsed?.output?.[0]?.b64_json,
    parsed?.output?.[0]?.url,
  ].filter(Boolean);

  const value = candidates.find(item => typeof item === 'string');
  if (!value) return null;
  if (value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://')) return value;
  return `data:image/png;base64,${value}`;
};

const buildPrompt = input => {
  const projectName = String(input.projectName || 'the selected property').trim();
  const developer = String(input.developer || '').trim();
  const keywords = String(input.keywords || '').trim();
  const templateName = String(input.templateName || 'Lockwood & Carter brand template').trim();

  return [
    'Enhance this real estate project image for a premium Lockwood & Carter social media campaign.',
    `Project: ${projectName}.`,
    developer ? `Developer: ${developer}.` : '',
    keywords ? `Creative focus: ${keywords}.` : '',
    `The final image will sit under the "${templateName}" brand layout, so keep the scene clean with usable negative space.`,
    'Keep the architecture, property type, layout, skyline, and materials accurate.',
    'Improve lighting, contrast, sharpness, colour balance, and editorial luxury feel.',
    'Do not add text, logos, badges, watermarks, people, vehicles, signage, flags, impossible views, or unrealistic objects.',
    'Do not alter the building design or misrepresent the development.',
    'Output a clean square background image suitable for a deterministic branded overlay.',
  ].filter(Boolean).join('\n');
};

const postNvidiaImageEdit = async ({ image, prompt, aspectRatio = '1:1' }) => {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY;
  const endpoint = process.env.NVIDIA_IMAGE_ENDPOINT || 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b';
  const model = process.env.NVIDIA_IMAGE_MODEL || 'black-forest-labs/flux.2-klein-4b';

  if (!apiKey) throw new Error('NVIDIA API key is not configured');

  const imagePayload = await imageInputToDataUrl(image);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      image: imagePayload,
      aspect_ratio: aspectRatio,
      width: 1024,
      height: 1024,
      samples: 1,
      steps: 30,
      cfg_scale: 3.5,
    }),
  });

  const text = await response.text();
  let parsed = {};
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { error: text };
  }

  if (!response.ok) throw new Error(`NVIDIA image request failed: ${response.status} ${text.slice(0, 500)}`);
  const imageUrl = extractImage(parsed);
  if (!imageUrl) throw new Error('NVIDIA image response did not include an image output.');

  return { imageUrl, raw: parsed, endpoint, model };
};

const postHuggingFaceImageEdit = async ({ image, prompt }) => {
  const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || process.env.HUGGING_FACE_API_KEY;
  const model = process.env.HF_IMAGE_MODEL || 'black-forest-labs/FLUX.2-klein-base-9B';
  if (!token) throw new Error('Hugging Face token is not configured. Add HF_TOKEN.');

  const imagePayload = await imageInputToDataUrl(image);
  const encodedModel = model.split('/').map(encodeURIComponent).join('/');
  const endpoint = process.env.HF_IMAGE_ENDPOINT || `https://router.huggingface.co/fal-ai/models/${encodedModel}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: stripDataUrl(imagePayload),
      parameters: {
        prompt,
        guidance_scale: Number(process.env.HF_IMAGE_GUIDANCE_SCALE || 3.5),
        num_inference_steps: Number(process.env.HF_IMAGE_STEPS || 28),
        negative_prompt: 'text, logos, watermarks, badges, signage, people, vehicles, unrealistic objects, distorted architecture, low quality, blurry',
        target_size: { width: 1024, height: 1024 },
      },
    }),
  });

  const contentType = response.headers.get('content-type') || '';
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!response.ok) throw new Error(`Hugging Face image request failed: ${response.status} ${buffer.toString('utf8').slice(0, 500)}`);
  if (contentType.startsWith('image/')) return { imageUrl: `data:${contentType};base64,${buffer.toString('base64')}`, raw: null, endpoint, model };

  const text = buffer.toString('utf8');
  const parsed = text ? JSON.parse(text) : {};
  const imageUrl = extractImage(parsed);
  if (!imageUrl) throw new Error(`Provider response did not include an image output: ${text.slice(0, 300)}`);
  return { imageUrl, raw: parsed, endpoint, model };
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { success: false, error: 'Method not allowed' });
    return;
  }

  const body = getBody(req);
  const image = typeof body.image === 'string' ? body.image.trim() : '';
  const keywords = typeof body.keywords === 'string' ? body.keywords.trim() : '';

  if (!image) {
    sendJson(res, 400, { success: false, error: 'Image is required.' });
    return;
  }

  if (!keywords) {
    sendJson(res, 400, { success: false, error: 'Keywords are required for image enhancement.' });
    return;
  }

  const prompt = buildPrompt(body);

  try {
    const providerPreference = (process.env.CONTENT_STUDIO_IMAGE_PROVIDER || 'huggingface').toLowerCase();
    let provider = 'huggingface';
    let result;

    if (providerPreference === 'nvidia') {
      provider = 'nvidia';
      result = await postNvidiaImageEdit({ image, prompt, aspectRatio: body.aspectRatio || '1:1' });
    } else {
      try {
        result = await postHuggingFaceImageEdit({ image, prompt });
      } catch (error) {
        if (providerPreference === 'huggingface-only') throw error;
        provider = 'nvidia';
        result = await postNvidiaImageEdit({ image, prompt, aspectRatio: body.aspectRatio || '1:1' });
      }
    }

    sendJson(res, 200, {
      success: true,
      imageUrl: result.imageUrl,
      prompt,
      provider,
      model: result.model,
      endpoint: result.endpoint,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image enhancement failed.';
    sendJson(res, 502, {
      success: false,
      error: message,
      fallbackImageUrl: image,
      fallbackReason: 'The original image can still be used for template rendering.',
    });
  }
}
