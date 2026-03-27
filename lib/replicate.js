import Replicate from 'replicate';

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || 'demo',
});

export const STYLE_PROMPTS = {
  chibi: {
    label: 'Chibi',
    emoji: '🌸',
    prompt: `Super-deformed chibi art style — giant oversized head (70% of total body), tiny stubby body and limbs, enormous sparkling glossy eyes with star reflections, rosy blushing cheeks, simple cute nose, pastel-colored backdrop with floating stars and hearts, soft cel-shaded lighting, ultra-clean anime line art, adorable accessories like tiny bow or miniature item, full portrait composition.`,
    negative: `realistic, photorealistic, normal proportions, dark, gritty, scary, complex background, blurry, watermark`,
  },
  naiveart: {
    label: 'Naive Art',
    emoji: '🎨',
    prompt: `Naive Art painting — flat simplified forms, bold outlines, childlike perspective without foreshortening, vivid non-realistic colors, patterned decorative background with flowers and geometric shapes, primitive brushwork with visible texture, reminiscent of Henri Rousseau or Grandma Moses, folk-naive charm, full portrait composition.`,
    negative: `realistic, photorealistic, sophisticated shading, perspective, 3D, blurry, watermark`,
  },
  kawaii: {
    label: 'Kawaii',
    emoji: '🍬',
    prompt: `Japanese Kawaii style — wrapped in an adorable pastel outfit with bows, frills, and star accessories, holding a cute tiny object, surrounded by floating candy, clouds, and sparkles, dreamy soft-focus pastel background in pink and lavender, big dewy eyes, blush marks, gentle glowing light, sugar-sweet aesthetic, full portrait composition.`,
    negative: `realistic, dark, gritty, scary, complex, blurry, watermark, adult`,
  },
  mosaic: {
    label: 'Mosaic',
    emoji: '🔷',
    prompt: `Byzantine-Roman mosaic artwork — body and background composed entirely of small colorful tesserae tiles with visible grout lines, rich jewel tones of gold, cobalt blue, ruby red, and emerald green, flat frontal perspective in the Byzantine style, ornate decorative tile border framing the portrait, ancient mosaic texture, regal and timeless, full portrait composition.`,
    negative: `realistic, photorealistic, smooth gradients, 3D, blurry, modern, watermark`,
  },
  steampunk: {
    label: 'Steampunk',
    emoji: '⚙️',
    prompt: `Steampunk world — dressed in a Victorian-era brass-buttoned coat with leather straps and aviator goggles pushed up on the head, surrounded by spinning clockwork gears, copper pipes, and steam vents, warm amber and sepia tones with glowing gas-lamp light, industrial Victorian backdrop with airships in the sky, painterly detail, full portrait composition.`,
    negative: `modern, futuristic, cartoonish, flat, blurry, watermark`,
  },
  doodleart: {
    label: 'Doodle Art',
    emoji: '✏️',
    prompt: `Intricate hand-drawn doodle art illustration — black ink pen lines on white or cream paper, the entire image filled edge-to-edge with dense zentangle-style patterns, swirls, flowers, geometric shapes, tiny stars, and abstract fills inside every shape, the subject's form built entirely from layered doodle patterns, playful and hypnotic, full portrait composition.`,
    negative: `realistic, photorealistic, color photograph, blurry, watermark, simple, sparse`,
  },
  folkart: {
    label: 'Folk Art',
    emoji: '🌻',
    prompt: `Traditional Folk Art painting — bold flat colors with decorative floral and geometric motifs covering the body and background, symmetrical folk patterns, hand-painted imperfect charm, warm earthy palette mixed with vibrant reds and yellows, reminiscent of Mexican Otomi, Ukrainian Petrykivka, or Scandinavian Rosemaling traditions, full portrait composition.`,
    negative: `realistic, photorealistic, 3D, blurry, modern, watermark`,
  },
  lofiart: {
    label: 'Lofi Art',
    emoji: '🎧',
    prompt: `Cozy Lo-fi aesthetic illustration — relaxing at a cluttered wooden desk with a glowing laptop, steaming coffee mug, houseplants, fairy lights, and rain-streaked window in the background, soft muted pastel palette with warm amber lamp glow, city pop Japanese anime-inspired art style, grainy film texture overlay, nostalgic and peaceful atmosphere, full portrait composition.`,
    negative: `realistic, photorealistic, bright harsh lighting, blurry, watermark, ugly`,
  },
  comicbook: {
    label: 'Comic Book',
    emoji: '💥',
    prompt: `Marvel/DC comic book panel — bold thick black ink outlines, Ben-Day halftone dot shading, flat primary colors with high contrast, dynamic action pose with speed lines radiating outward, dramatic low-angle perspective, bold onomatopoeia text effects like POW and ZAP in the background, classic American comic book aesthetic, full portrait composition.`,
    negative: `realistic, photorealistic, soft shading, blurry, watermark, anime`,
  },
  dadaism: {
    label: 'Dadaism',
    emoji: '🎭',
    prompt: `Dadaist artwork — surreal absurdist collage combining impossible objects, floating clocks, random typography fragments, geometric shapes, found imagery, and contradictory textures layered chaotically, provocative and anti-rational, mixed media collage aesthetic inspired by Marcel Duchamp and Hannah Höch, full portrait composition.`,
    negative: `realistic, conventional, orderly, blurry, watermark, boring`,
  },
  renaissance: {
    label: 'Renaissance',
    emoji: '🖼️',
    prompt: `Renaissance Old Master oil painting — wearing period aristocratic clothing with lace collar and velvet robe, dramatic chiaroscuro lighting with a dark shadowed background opening onto a classical landscape, sfumato soft edges, rich jewel-toned palette, craquelure texture of aged canvas, compositional style of Leonardo da Vinci or Raphael, full portrait composition.`,
    negative: `modern, cartoon, anime, flat, blurry, watermark, photorealistic`,
  },
};
