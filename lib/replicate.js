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
  rembrandt: {
    label: 'Rembrandt',
    emoji: '🕯️',
    prompt: `Rembrandt oil painting — dramatic tenebrism with deep velvety shadows and a single warm candlelight source illuminating one side of the face, impasto thick brushwork on textured canvas, rich earth tones of umber, ochre, burnt sienna, and black, soulful introspective gaze, loose gestural collar or period garment catching the light, inspired by Rembrandt van Rijn's late self-portraits, full portrait composition.`,
    negative: `modern, cartoon, anime, flat, bright, blurry, watermark, photorealistic`,
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
  neoclassicism: {
    label: 'Neoclassicism',
    emoji: '🏛️',
    prompt: `Neoclassical oil painting — depicted as a noble subject in the manner of Jacques-Louis David or Ingres, crisp precise draftsmanship, idealized calm expression, draped in Greco-Roman toga or Empire-period costume, cool restrained palette of ivory, stone grey, and muted gold, smooth academic brushwork with flawless skin, marble columns and antique drapery in the background, heroic and dignified full portrait composition.`,
    negative: `modern, impressionist, sketchy, distorted, blurry, watermark, cartoon`,
  },
  fauvism: {
    label: 'Fauvism',
    emoji: '🦁',
    prompt: `Fauvist oil painting — explosive non-naturalistic colors applied straight from the tube in thick bold strokes, vivid clashing hues of crimson, cobalt, emerald, and cadmium orange used freely regardless of local color, visible energetic brushwork, simplified flat forms with bold outlines, inspired by Henri Matisse and André Derain, spontaneous joyful intensity, full portrait composition.`,
    negative: `realistic, photorealistic, muted, blurry, watermark, dark, gloomy`,
  },
  romanticism: {
    label: 'Romanticism',
    emoji: '🌹',
    prompt: `Romantic era oil painting — dramatic stormy sky with billowing clouds and atmospheric golden light breaking through, emotional brooding expression, flowing cape or period costume whipped by wind, lush painterly brushwork with rich warm shadows and luminous highlights, inspired by Eugène Delacroix and Caspar David Friedrich, sublime mood, full portrait composition.`,
    negative: `modern, flat, cartoon, blurry, watermark, cheerful, bland`,
  },
  expressionism: {
    label: 'Expressionism',
    emoji: '😱',
    prompt: `Expressionist painting — distorted angular forms and exaggerated emotional features conveying inner psychological tension, bold gestural brushstrokes with raw impasto texture, jagged lines and dissonant colors of deep prussian blue, harsh yellow, and blood red, dark swirling agitated background, inspired by Ernst Ludwig Kirchner and Edvard Munch, raw visceral mood, full portrait composition.`,
    negative: `calm, realistic, smooth, photorealistic, blurry, watermark, cheerful`,
  },
  rococo: {
    label: 'Rococo',
    emoji: '🎀',
    prompt: `Rococo painting — depicted as an 18th-century aristocrat in an ornate powdered wig and pastel silk costume with lace ruffles and embroidered flowers, soft feathery brushwork in the manner of François Boucher and Jean-Honoré Fragonard, delicate palette of rose, pale blue, and cream, elaborate gilded decorative swirls and garden roses in the background, charming playful elegance, full portrait composition.`,
    negative: `modern, dark, gritty, flat, blurry, watermark, harsh`,
  },
};
