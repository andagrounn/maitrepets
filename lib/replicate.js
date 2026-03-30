import Replicate from 'replicate';

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || 'demo',
});

export const STYLE_PROMPTS = {
  enhanced: {
    label: 'Enhanced',
    emoji: '✨',
    prompt: `Professional studio pet portrait — the animal photographed in crisp photorealistic detail: soft natural lighting with a subtle studio key light gently separating the subject from a clean neutral background, true-to-life fur or feather texture rendered with fine micro-detail, natural eye color vivid and sharp with accurate catchlight, no artistic stylization, no painterly effects, no art-historical references — simply the animal looking its absolute best as if captured by a professional photographer with a high-end DSLR, color-graded with warm natural tones and perfect exposure.`,
    negative: `painting, illustration, artistic, stylized, watercolor, oil paint, sketch, cartoon, anime, blurry, watermark, human hands, human fingers`,
  },
  naiveart: {
    label: 'Naive Art',
    emoji: '🎨',
    prompt: `Naive Art folk painting — the animal depicted with the sincere unschooled charm of Henri Rousseau or Grandma Moses: flattened perspective without foreshortening, bold black outlines enclosing pure unmixed colors, patterned decorative background of stylized flowers, vines, and geometric shapes, visible house-paint texture on rough canvas, innocent wide-eyed expression, sky filled with coin-shaped sun or crescent moon, the scene framed by a border of repeating folk motifs; if any limbs are visible they must be the animal's natural paws, claws, or hooves — never human hands.`,
    negative: `realistic, photorealistic, sophisticated shading, perspective, 3D, blurry, watermark, human hands, human fingers`,
  },
  cubism: {
    label: 'Cubism',
    emoji: '🔲',
    prompt: `Analytic Cubist painting in the style of Picasso and Braque circa 1910–1912 — the animal fractured into simultaneous overlapping geometric viewpoints: faceted angular planes in a restricted palette of raw sienna, slate grey, khaki brown, and cool blue-grey, the face and features decomposed into rhomboid and triangular shards that orbit a central axis, passages of faux-bois or newsprint texture collaged into the background, bold charcoal-black outlines grid the composition, multiple light sources creating contradictory shadows, unmistakably portrait-like yet radically abstract; if any limbs are visible they must be the animal's natural paws, claws, or hooves — never human hands.`,
    negative: `realistic, photorealistic, smooth, rounded, soft, blurry, watermark, human hands, human fingers`,
  },
  mosaic: {
    label: 'Mosaic',
    emoji: '🔷',
    prompt: `Byzantine imperial mosaic — the animal composed of individually visible tesserae tiles in gold smalti, cobalt, ruby, and emerald, each tile catching light at a slightly different angle to create the characteristic Byzantine shimmer, stark frontal hieratic pose against a glowing gold-leaf background, bold black outline tesserae defining features, ornate geometric border of interlocking guilloche and meander patterns, the face rendered with large stylized eyes and simplified features in the manner of Ravenna's Sant'Apollinare mosaics, solemn and eternal; if any limbs are visible they must be the animal's natural paws, claws, or hooves — never human hands.`,
    negative: `realistic, photorealistic, smooth gradients, 3D, blurry, modern, watermark, human hands, human fingers`,
  },
  steampunk: {
    label: 'Steampunk',
    emoji: '⚙️',
    prompt: `Steampunk Victorian illustration — the animal in a richly detailed brass-buttoned leather greatcoat with copper rivets, aviator goggles pushed up on the brow, a pocket watch chain glinting, surrounded by spinning clockwork escapements, pressure gauges, glass vacuum tubes, and hissing steam vents; warm amber gas-lamp light rakes across the scene, an airship flotilla visible through a porthole or arched industrial window, the whole composition rendered in the engraving-inspired cross-hatched painterly style of a Victorian scientific journal, sepia-warm with copper and verdigris accents; if any limbs are visible they must be the animal's natural paws, claws, or hooves — never human hands.`,
    negative: `modern, futuristic, cartoonish, flat, blurry, watermark, human hands, human fingers`,
  },
  weirdcore: {
    label: 'Weirdcore',
    emoji: '🌀',
    prompt: `Weirdcore surreal digital art — the animal in a deeply unsettling liminal environment: washed-out desaturated palette of institutional beige, faded cyan, and wrong-orange, punctuated by jarring neon glitch artifacts; impossible architecture with repeating patterned carpet that tiles incorrectly, fluorescent tube lighting that flickers and bleeds, JPEG compression artifacts visible in background detail, lo-fi texture reminiscent of scanned photographs or MS-Paint fills, cryptic floating text fragments in obsolete fonts, distorted proportion and impossible perspective, a profound sense of being somewhere that should not exist at 3am; if any limbs are visible they must be the animal's natural paws, claws, or hooves — never human hands.`,
    negative: `realistic, photorealistic, polished, clean, cheerful, blurry, watermark, human hands, human fingers`,
  },
  vernacularart: {
    label: 'Vernacular Art',
    emoji: '🏚️',
    prompt: `Vernacular outsider art in the tradition of Howard Finster, Mose Tolliver, and Henry Darger — the animal painted on weathered wood board, flattened tin, or found cardboard with house enamel or craft paint; naive flat perspective with no foreshortening, vivid clashing colors applied in bold unsophisticated strokes, hand-lettered spiritual or personal text woven into the borders, decorative folk symbols — hex signs, spirals, painted eyes — repeated across the surface, deep personal sincerity radiating from every mark, deeply idiosyncratic visual language that belongs to no formal art movement; if any limbs are visible they must be the animal's natural paws, claws, or hooves — never human hands.`,
    negative: `academic, refined, photorealistic, 3D, blurry, watermark, sophisticated, human hands, human fingers`,
  },
  artinformel: {
    label: 'Art Informel',
    emoji: '🌊',
    prompt: `Art Informel gestural abstraction in the manner of Jean Fautrier, Alberto Burri, and Wols — the animal barely emergent from turbulent impasto built up with palette knife, rag, and trowel: thick ridges of charcoal black, raw umber, ash grey, burnt sienna, and smoldering crimson oil paint mixed with sand and plaster for gritty material presence, the support — raw linen or burlap — visible through torn passages and incised scratches, no deliberate compositional geometry, only the primal energy of mark-making, somber and emotionally raw in the post-war European manner; if any limbs are visible they must be the animal's natural paws, claws, or hooves — never human hands.`,
    negative: `clean, precise, flat, cartoon, photorealistic, blurry, watermark, cheerful, human hands, human fingers`,
  },
  rembrandt: {
    label: 'Rembrandt',
    emoji: '🕯️',
    prompt: `Rembrandt van Rijn oil painting — the animal in a richly painted Dutch Golden Age portrait: deep tenebrism with velvety shadow engulfing three-quarters of the composition and a single warm candlelight or north-window source illuminating the face and catching the edge of a starched linen ruff or velvet collar, broad impasto brushwork for highlights melting into thin glazes in shadow, rich palette of burnt umber, raw sienna, ivory black, and warm lead white, soulful introspective gaze that seems to look directly through the viewer, aged craquelure on dark oak panel, the background a luminous brown void; if any limbs are visible they must be the animal's natural paws, claws, or hooves — never human hands.`,
    negative: `modern, cartoon, anime, flat, bright, blurry, watermark, photorealistic, human hands, human fingers`,
  },
  dadaism: {
    label: 'Dadaism',
    emoji: '🎭',
    prompt: `Dadaist photomontage and collage in the manner of Hannah Höch, Raoul Hausmann, and Marcel Duchamp — the animal at the center of a provocative anti-rational composition: fragments of period newspaper, propaganda posters, and fashion magazine illustrations cut and repasted at clashing scales, contradictory serif and sans-serif typefaces colliding, clock faces, scissors, industrial machinery parts, and geometric shapes layered chaotically, found photographic fragments with deliberate misregistration, the whole composition a visual declaration of absurdist anarchy against bourgeois convention, printed on newsprint with deliberately crude reproduction quality; if any limbs are visible they must be the animal's natural paws, claws, or hooves — never human hands.`,
    negative: `realistic, conventional, orderly, blurry, watermark, boring, human hands, human fingers`,
  },
  renaissance: {
    label: 'Renaissance',
    emoji: '🖼️',
    prompt: `Renaissance Old Master oil painting in the manner of Leonardo, Raphael, or Titian — the animal in period aristocratic costume: lace collar, velvet robe in deep crimson or forest green with gold brocade, posed in three-quarter view against a dark interior opening onto an Italianate landscape with cypress trees, Roman arches, and misty hills receding into sfumato atmosphere; dramatic chiaroscuro with soft warm light on the face, flawless academic drawing with imperceptible brushwork, rich craquelure of aged oil on walnut panel, the composition faithful to the portrait conventions of a Florentine or Venetian commission; if any limbs are visible they must be the animal's natural paws, claws, or hooves — never human hands.`,
    negative: `modern, cartoon, anime, flat, blurry, watermark, photorealistic, human hands, human fingers`,
  },
  neoclassicism: {
    label: 'Neoclassicism',
    emoji: '🏛️',
    prompt: `Neoclassical oil painting in the manner of Jacques-Louis David and Jean-Auguste-Dominique Ingres — the animal as a noble subject in Greco-Roman toga or Empire-period costume, posed with crisp academic draftsmanship and idealized calm gravitas, cool restrained palette of Pompeiian ivory, stone grey, Prussian blue, and muted gold, marble columns and antique draped velvet in the background with precisely rendered surface texture, heroic compositional clarity, the contour of every form drawn with the precision of a sculptor's chisel, absolutely no loose or expressive brushwork — smooth and lapidary finish throughout; if any limbs are visible they must be the animal's natural paws, claws, or hooves — never human hands.`,
    negative: `modern, impressionist, sketchy, distorted, blurry, watermark, cartoon, human hands, human fingers`,
  },
  davinci: {
    label: 'Leonardo da Vinci',
    emoji: '🎨',
    prompt: `Portrait in the unmistakable hand of Leonardo da Vinci — the animal in a three-quarter pose with the sfumato technique at its most refined: imperceptible transitions between light and shadow achieved through innumerable transparent glazes of lead white, raw umber, and smalt, the eyes holding a calm enigmatic intelligence that seems to shift as you move, delicate cross-hatched silverpoint underdrawing barely visible at the hairline and ruff; misty atmospheric landscape receding behind into Leonardo's signature warm-to-cool atmospheric perspective with jagged rock formations and winding river; warm ochre and umber flesh tones on aged walnut panel with craquelure, red chalk preparatory study quality; if any limbs are visible they must be the animal's natural paws, claws, or hooves — never human hands.`,
    negative: `modern, cartoon, anime, flat, harsh lines, blurry, watermark, photorealistic, garish colors, human hands, human fingers`,
  },
  romanticism: {
    label: 'Romanticism',
    emoji: '🌹',
    prompt: `Romantic era oil painting in the manner of Eugène Delacroix, Théodore Géricault, and Caspar David Friedrich — the animal as the sublime protagonist in a scene of natural grandeur or historical drama: towering storm clouds with a shaft of golden Claudian light breaking through, billowing cape or period military uniform, lush painterly brushwork with warm impasto highlights and deep transparent shadows in Prussian blue and bitumen, the landscape itself emotionally charged — churning sea, volcanic mountain, misty gothic ruin — reflecting the inner life of the subject, the Romantic ideal of individual freedom against the infinite; if any limbs are visible they must be the animal's natural paws, claws, or hooves — never human hands.`,
    negative: `modern, flat, cartoon, blurry, watermark, cheerful, bland, human hands, human fingers`,
  },
  expressionism: {
    label: 'Expressionism',
    emoji: '😱',
    prompt: `German Expressionist painting in the manner of Ernst Ludwig Kirchner, Emil Nolde, and Edvard Munch — the animal amid a scene of psychological intensity: distorted angular architecture leaning inward, jagged brushstrokes of dissonant color — deep Prussian blue clashing with cadmium yellow and blood crimson — the background itself alive and agitated, swirling and pulsing with the emotional state of the subject, bold black contour lines scratching through wet paint, the face exaggerated and mask-like, raw impasto applied with almost violent energy, the composition a direct externalization of inner anguish or primal power; if any limbs are visible they must be the animal's natural paws, claws, or hooves — never human hands.`,
    negative: `calm, realistic, smooth, photorealistic, blurry, watermark, cheerful, human hands, human fingers`,
  },
  rococo: {
    label: 'Rococo',
    emoji: '🎀',
    prompt: `Rococo painting in the manner of François Boucher, Jean-Honoré Fragonard, and Antoine Watteau — the animal as an 18th-century French aristocrat in an extravagant powdered wig with silk ribbon, pastel embroidered costume in rose, sky blue, and cream with delicate lace cascading at cuffs and collar, posed in a sun-dappled garden at Versailles or a gilded salon interior; feathery soft brushwork dissolving edges into atmospheric light, the background a lush cascade of climbing roses, topiary, and a marble fountain glimpsed through columns, decorative cartouche with painted putti and garlands framing the composition, irreducibly charming and impossibly elegant; if any limbs are visible they must be the animal's natural paws, claws, or hooves — never human hands.`,
    negative: `modern, dark, gritty, flat, blurry, watermark, harsh, human hands, human fingers`,
  },
};
