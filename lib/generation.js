import OpenAI from 'openai';
import { replicate, STYLE_PROMPTS } from '@/lib/replicate';
import { uploadToS3 } from '@/lib/s3';
import { getConfig } from '@/lib/config';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseOutputUrl(output) {
  if (!output) return null;
  if (Array.isArray(output) && output[0]?.url) {
    return typeof output[0].url === 'function' ? output[0].url() : output[0].url;
  }
  if (Array.isArray(output)) return typeof output[0] === 'object' ? String(output[0]) : output[0];
  if (typeof output === 'string') return output;
  return String(output);
}

// ─── Fun cinematic scenarios ───────────────────────────────────────────────────
const FUN_SCENARIOS = [
  { scene: 'a suave secret agent in a tailored tuxedo holding a gadget, city skyline at night behind them', mood: 'cool and mysterious', title: 'License to Woof' },
  { scene: 'a fearless space explorer in a gleaming astronaut suit standing on an alien planet with two moons rising', mood: 'epic and adventurous', title: 'Intergalactic Paws' },
  { scene: 'a legendary pirate captain at the helm of a golden galleon, stormy sea and lightning behind', mood: 'bold and dramatic', title: 'Paws of the Caribbean' },
  { scene: 'a time-traveling scientist in a wild lab coat with sparks flying and a giant glowing clock in the background', mood: 'manic and genius', title: 'Back to the Fur-ture' },
  { scene: 'a martial arts grandmaster meditating on a misty mountain peak at sunrise, robes flowing in the wind', mood: 'serene and powerful', title: 'Kung Fu Paws' },
  { scene: 'a rock star center stage at a sold-out stadium, crowd going wild, guitars and fireworks everywhere', mood: 'electric and wild', title: 'Bark to the Stage' },
  { scene: 'a hardboiled detective in a trench coat inspecting clues in a rainy noir alley, neon signs glowing', mood: 'dark and brooding', title: 'The Big Pawshank' },
  { scene: 'a royal king seated on a jeweled throne in a vast golden castle hall, crown gleaming', mood: 'regal and majestic', title: 'The Crown Paws' },
  { scene: 'a wild west outlaw standing alone at high noon in a dusty desert town, tumbleweed rolling by', mood: 'tense and cinematic', title: 'The Good, the Bad & the Fluffy' },
  { scene: 'a superhero soaring through storm clouds above a glowing city, cape billowing, lightning crackling behind', mood: 'powerful and inspiring', title: 'Superpaws' },
  { scene: 'a fearless jungle explorer hacking through dense vines, ancient glowing temple ruins behind them', mood: 'thrilling and mysterious', title: 'Paws of the Lost Ark' },
  { scene: 'a wizard in a towering magical library with a glowing spellbook open, sparks of every color swirling', mood: 'magical and whimsical', title: 'Hairy Paw-ter' },
  { scene: 'a race car driver in full gear revving up at the starting line, neon pit lane, crowd roaring', mood: 'fast and thrilling', title: 'Furious & Fast' },
  { scene: 'a five-star chef in a dramatic kitchen surrounded by impossibly tall gourmet dishes, flames rising', mood: 'intense and passionate', title: 'Ratatouille Unleashed' },
  { scene: 'a Viking warrior standing tall on a longship at sea, stormy sky overhead, shield and axe raised high', mood: 'fierce and heroic', title: 'Vikingpaws' },
  { scene: 'a world-famous archaeologist in a dusty fedora inside a booby-trapped ancient tomb, torch in hand', mood: 'daring and adventurous', title: 'Paws Raider' },
  { scene: 'a charming spy at a glamorous casino table, champagne glass in hand, rivals watching', mood: 'suave and suspenseful', title: 'Casino Pawale' },
  { scene: 'a lone samurai standing in a misty bamboo forest at dawn, katana drawn, cherry blossoms falling', mood: 'peaceful yet deadly', title: 'The Last Pawbender' },
];

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Pick a random style that is different from the excluded key
export function pickRandomStyle(excludeKey = null) {
  const keys = Object.keys(STYLE_PROMPTS).filter((k) => k !== excludeKey);
  return keys[Math.floor(Math.random() * keys.length)];
}

// ─── Build final prompt ────────────────────────────────────────────────────────
export function buildFinalPrompt(petDesc, styleConfig) {
  const scenario = pickRandom(FUN_SCENARIOS);
  console.log(`[pipeline] scenario picked: "${scenario.title}"`);

  const prompt =
    `Epic movie poster: ${petDesc}, starring as the main character in "${scenario.title}". ` +
    `Scene: ${scenario.scene}. Mood: ${scenario.mood}. ` +
    `The subject is a REAL ANIMAL with a fully animal body — paws, fur, tail, snout, animal legs — NOT a human and NOT humanoid. ` +
    `STRICT RULE: absolutely NO human body parts anywhere in the image — no human hands, no human feet, no human face, no human skin, no human torso, no human fingers. ` +
    `The animal wears the costume or holds the props of the role (e.g. a tiny hat, a collar, a cape draped over fur) but retains a completely natural quadruped or natural animal body and posture. ` +
    `Do NOT draw the animal standing upright on two legs like a human. Keep it on all four paws or in a natural resting/crouching/leaping animal pose. ` +
    `CRITICAL — preserve 60% of the subject's real appearance: keep their EXACT facial structure, ` +
    `distinctive markings, fur colors and patterns, eye color and shape, and ear style faithful to the real animal. ` +
    `DO NOT generalize or substitute generic features — this specific individual must be recognizable. ` +
    `Render entirely in this art style: ${styleConfig.prompt}. ` +
    `STRICTLY NO TEXT OF ANY KIND in the image — no words, no letters, no numbers, no titles, no subtitles, no movie title, no character name, no tagline, no watermark, no signature, no caption, no label, no banner, no speech bubble, no logo, no brand name. ` +
    `The image must be completely free of all written characters. Do not render any typography or glyphs anywhere, including on props, clothing, signs, or background elements.`;

  console.log('[pipeline] final prompt:\n', prompt);
  return prompt;
}

// ─── GPT-4o vision analysis ────────────────────────────────────────────────────
export async function analyzePetWithVision(imageUrl) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 20000 });
  console.log('[pipeline] analyzing pet with GPT-4o vision...');

  const res = await openai.chat.completions.create({
    model:      'gpt-4o',
    max_tokens: 300,
    messages: [{
      role:    'user',
      content: [
        { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
        {
          type: 'text',
          text: `Analyze this pet photo very carefully. Return ONLY these fields, one per line:
SPECIES: [dog/cat/rabbit/etc]
BREED: [specific breed or mix]
SIZE: [tiny/small/medium/large]
FUR_TEXTURE: [fluffy/short/curly/wavy/silky/wiry]
FUR_COLORS: [describe ALL colors and exactly where they appear on the body and face]
EYE_COLOR: [exact color]
EYE_SHAPE: [round/almond/wide/narrow]
EYE_EXPRESSION: [bright/soulful/playful/gentle/mischievous]
NOSE: [color and shape, e.g. black button nose, pink wide nose]
EAR_STYLE: [floppy/upright/semi-floppy/feathered]
FACE_SHAPE: [round/long/flat/angular]
DISTINCTIVE_FEATURES: [every unique marking — patches, spots, blaze, beard, eyebrow dots, freckles]
OVERALL_VIBE: [cute/majestic/goofy/regal/sweet/scruffy]`,
        },
      ],
    }],
  });

  const raw = res.choices[0].message.content.trim();
  console.log('[pipeline] pet analysis:\n', raw);

  const attrs = {};
  raw.split('\n').forEach((line) => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) attrs[key.trim()] = rest.join(':').trim();
  });
  return attrs;
}

export function attrsToDescription(attrs) {
  return [
    `A ${attrs.SIZE || ''} ${attrs.BREED || attrs.SPECIES || 'animal'}`.trim(),
    attrs.FUR_TEXTURE && attrs.FUR_COLORS ? `with ${attrs.FUR_TEXTURE} ${attrs.FUR_COLORS} fur` : attrs.FUR_COLORS ? `with ${attrs.FUR_COLORS} fur` : '',
    attrs.FACE_SHAPE ? `${attrs.FACE_SHAPE} face` : '',
    attrs.EYE_COLOR ? `${attrs.EYE_SHAPE || ''} ${attrs.EYE_COLOR} ${attrs.EYE_EXPRESSION || ''} eyes`.trim() : '',
    attrs.NOSE ? `${attrs.NOSE}` : '',
    attrs.EAR_STYLE ? `${attrs.EAR_STYLE} ears` : '',
    attrs.DISTINCTIVE_FEATURES || '',
    attrs.OVERALL_VIBE ? `overall ${attrs.OVERALL_VIBE} character` : '',
  ].filter(Boolean).join(', ');
}

// ─── gpt-image-1 ──────────────────────────────────────────────────────────────
export async function generateWithGPTImage(prompt, sourceImageUrl = null) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 120000 });

  // When a source image is provided, use images.edit so the model has a direct
  // visual reference of the specific pet, improving likeness beyond just the prompt.
  if (sourceImageUrl) {
    try {
      console.log('[pipeline] generating with gpt-image-1 (edit mode — reference image)...');
      const imgRes  = await fetch(sourceImageUrl);
      const imgBuf  = Buffer.from(await imgRes.arrayBuffer());
      const mime    = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0];
      const ext     = mime.includes('png') ? 'png' : 'jpg';
      const refFile = await OpenAI.toFile(imgBuf, `reference.${ext}`, { type: mime });
      const res = await openai.images.edit({
        model:   'gpt-image-1',
        image:   [refFile],
        prompt,
        size:    '1024x1536',
        quality: 'high',
        n:       1,
      });
      const b64 = res.data[0].b64_json;
      if (!b64) throw new Error('no image data');
      const buffer = Buffer.from(b64, 'base64');
      const key    = `generated/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
      console.log('[pipeline] uploading gpt-image-1 edit result to S3...');
      const url = await uploadToS3(buffer, key, 'image/png');
      console.log('[pipeline] gpt-image-1 edit done:', url);
      return url;
    } catch (e) {
      console.warn('[gpt-image-1 edit failed — falling back to generate]', e.message);
      // fall through to text-only generate below
    }
  }

  console.log('[pipeline] generating with gpt-image-1...');
  const res = await openai.images.generate({
    model:   'gpt-image-1',
    prompt,
    size:    '1024x1536',
    quality: 'high',
    n:       1,
  });

  const b64 = res.data[0].b64_json;
  if (!b64) throw new Error('gpt-image-1 returned no image data');

  const buffer = Buffer.from(b64, 'base64');
  const key    = `generated/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
  console.log('[pipeline] uploading gpt-image-1 result to S3...');
  const url = await uploadToS3(buffer, key, 'image/png');
  console.log('[pipeline] gpt-image-1 done:', url);
  return url;
}

// ─── Flux fallback ─────────────────────────────────────────────────────────────
export async function generateWithFlux(prompt, sourceImageUrl = null) {
  console.log('[pipeline] generating with flux-1.1-pro...');
  const input = {
    prompt,
    aspect_ratio:      '2:3',
    output_format:     'jpg',
    output_quality:    95,
    prompt_upsampling: true,
    safety_tolerance:  3,
  };
  if (sourceImageUrl) {
    input.image_prompt          = sourceImageUrl;
    input.image_prompt_strength = 0.35;
  }
  const out = await replicate.run('black-forest-labs/flux-1.1-pro', { input });
  const url = parseOutputUrl(out);
  if (!url) throw new Error('flux-1.1-pro returned no output');
  console.log('[pipeline] flux generated:', url);
  return url;
}

// ─── Upscale ───────────────────────────────────────────────────────────────────
export async function upscaleImage(imageUrl) {
  try {
    console.log('[pipeline] upscaling with real-esrgan...');
    const out = await replicate.run('nightmareai/real-esrgan', {
      input: { image: imageUrl, scale: 2, face_enhance: false },
    });
    const url = parseOutputUrl(out);
    if (!url) throw new Error('no output');
    console.log('[pipeline] upscaled:', url);
    return url;
  } catch (e) {
    console.warn('[real-esrgan skipped]', e.message);
    return imageUrl;
  }
}

// ─── Full pipeline (vision → prompt → generate) ───────────────────────────────
export async function runGenerationPipeline(imageUrl, styleKey) {
  const styleConfig = STYLE_PROMPTS[styleKey];
  if (!styleConfig) throw new Error(`Unknown style: ${styleKey}`);

  // Read active model from DB config (defaults to gpt-image-1)
  const activeModel = await getConfig('ai_model');
  console.log(`[pipeline] active model: ${activeModel}`);

  let petDesc = `a ${styleConfig.label}-style animal character`;
  try {
    const attrs = await analyzePetWithVision(imageUrl);
    petDesc = attrsToDescription(attrs);
    console.log('[pipeline] pet description:', petDesc);
  } catch (e) {
    console.warn('[vision analysis failed — using generic description]', e.message);
  }

  const finalPrompt = buildFinalPrompt(petDesc, styleConfig);

  let generatedUrl;

  if (activeModel === 'flux') {
    console.log('[pipeline] model override: flux-1.1-pro');
    const fluxUrl = await generateWithFlux(finalPrompt, imageUrl);
    generatedUrl  = await upscaleImage(fluxUrl);
  } else {
    // Default: gpt-image-1 with flux fallback
    try {
      generatedUrl = await generateWithGPTImage(finalPrompt, imageUrl);
    } catch (e) {
      console.warn('[gpt-image-1 failed — falling back to flux]', e.message);
      const fluxUrl = await generateWithFlux(finalPrompt, imageUrl);
      generatedUrl  = await upscaleImage(fluxUrl);
    }
  }

  return { generatedUrl, finalPrompt, styleKey, styleConfig };
}
