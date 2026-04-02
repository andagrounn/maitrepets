import OpenAI from 'openai';
import sharp from 'sharp';
import { replicate, STYLE_PROMPTS } from '@/lib/replicate';
import { uploadToS3 } from '@/lib/s3';
import { getConfig } from '@/lib/config';

// ─── Watermark ────────────────────────────────────────────────────────────────
async function addWatermark(buffer) {
  const img      = sharp(buffer);
  const { width, height } = await img.metadata();
  const w = width  || 1024;
  const h = height || 1024;

  const fontSize  = Math.round(w * 0.033);   // ~34px on 1024px image
  const padding   = Math.round(w * 0.022);   // ~23px from edges
  const text      = 'maitrepets.com';

  // Measure text width roughly (monospace-ish estimate) to position correctly
  const textW     = Math.round(fontSize * text.length * 0.55);
  const textH     = Math.round(fontSize * 1.3);

  const x = w - textW - padding;
  const y = h - textH - padding;

  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${x - 8}" y="${y - 4}" width="${textW + 16}" height="${textH + 4}"
            rx="4" fill="rgba(0,0,0,0.45)"/>
      <text x="${x}" y="${y + fontSize}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${fontSize}"
            font-weight="bold"
            fill="white"
            opacity="0.92">${text}</text>
    </svg>`;

  return img
    .composite([{ input: Buffer.from(svg), blend: 'over' }])
    .png()
    .toBuffer();
}

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

// ─── Era-matched scenarios keyed by art style ──────────────────────────────────
const STYLE_SCENARIOS = {
  gothic: [
    { scene: 'enthroned before a towering rose window of stained glass in ruby and cobalt, wearing jeweled vestments and embroidered gold thread, a gilded reliquary on the stone altar beside them, incense smoke rising into the vaulted ceiling', mood: 'sacred and austere', title: 'The Divine Guardian' },
    { scene: 'standing in a pointed-arch cathedral alcove, wearing a jeweled mitre and holding a bejeweled crozier staff, golden candlelight glowing against carved stone tracery overhead', mood: 'solemn and regal', title: 'Bishop of the Blessed' },
    { scene: 'bearing a consecrated gonfalon banner before a Gothic fortified city at dusk, the walls and heraldic shields reflected in a silver moat below', mood: 'devout and resolute', title: 'The Sacred Quest' },
    { scene: 'at a candlelit scriptorium desk surrounded by open vellum manuscripts with intricate gold-leaf borders, quill and inkhorn at rest beside an ornate illuminated Bible', mood: 'devoted and contemplative', title: 'The Scriptorium Master' },
    { scene: 'bathed in rays of golden light descending through lancet stained-glass windows onto a stone floor inlaid with memorial brasses, the cathedral nave receding into shadowed silence behind', mood: 'transcendent and humble', title: 'The Vision' },
  ],
  naiveart: [
    { scene: 'presiding over a colorful village festival with hand-painted banners, daisy-chain garlands, and townsfolk dancing around a painted maypole under a coin-yellow sun', mood: 'joyful and festive', title: 'Festival Monarch' },
    { scene: 'seated beside an overflowing folk garden of flat patterned tulips, spotted mushrooms, and coin-round butterflies, a patchwork sky above with stamped cloud shapes', mood: 'cheerful and innocent', title: 'Garden Guardian' },
    { scene: 'keeper of a bright market stall with hand-lettered price signs, stacked painted pots, and improbably large fruit in stripes of red, yellow, and green', mood: 'lively and warm', title: 'The Market Keeper' },
    { scene: 'standing in front of a flat red barn under a smiling sun, rolling green hills in the background with spotted cows and a folk-painted fence border', mood: 'pastoral and peaceful', title: 'Farm Days' },
    { scene: 'depicted on a naively painted wooden carnival sign with decorative folk-painted stars and swooping banner ribbons in primary colors', mood: 'playful and bold', title: 'The Carnival Sign' },
  ],
  cubism: [
    { scene: 'performing at a smoky Montmartre jazz club in 1912 — the brass instruments, cigarette smoke, and geometric spotlights fragmented into overlapping analytic planes around them', mood: 'electric and fractured', title: 'Jazz at the Cubist Club' },
    { scene: 'at the intersection of two Parisian boulevards, the scene exploding into simultaneous viewpoints: cobblestones, café awnings, newspaper kiosks, and street lamps all fractured at once', mood: 'urban and restless', title: 'Boulevard Fracture' },
    { scene: 'in a Montmartre studio surrounded by cubist canvases, palettes, and easels — the whole scene decomposed into rhomboid planes of ochre, grey, and slate', mood: 'creative and analytical', title: 'The Atelier' },
    { scene: 'posed as a modernist chess grandmaster, the board dissolving into angular planes of black and white, the chess pieces fractured into geometric fragments', mood: 'strategic and abstract', title: 'The Grand Master' },
    { scene: 'at an avant-garde Parisian salon, surrounded by fragmented faces of poets and critics, wine glasses and book spines broken into simultaneous geometric facets', mood: 'intellectual and chaotic', title: 'The Salon' },
  ],
  mosaic: [
    { scene: 'enthroned as a Byzantine emperor in a gold-domed Ravenna basilica, flanked by senators in ceremonial chlamys robes, all rendered in glittering gold smalti and jewel-tone tesserae', mood: 'imperial and eternal', title: 'Emperor of the East' },
    { scene: 'depicted as a triumphant Roman general in a processional frieze mosaic, a chariot of white horses, laurel-crowned attendants, and columned temples framing the scene', mood: 'triumphant and classical', title: 'The Triumph' },
    { scene: 'portrayed as a holy apostle in a domed apse mosaic at Ravenna, golden halo radiating outward, deep cobalt robes with crimson mantle, a jeweled gospel book raised high', mood: 'sacred and transcendent', title: 'The Apostle' },
    { scene: 'at the center of a Roman bathhouse floor mosaic, surrounded by radial bands of sea creatures, Nereids, dolphins, and mythological figures in an oceanic scene', mood: 'mythological and opulent', title: 'Lord of the Baths' },
    { scene: 'presiding as a Byzantine empress at a court ceremony, the Empress\'s courtiers and ladies-in-waiting stretching in a golden processional frieze to either side', mood: 'regal and hieratic', title: 'The Empress' },
  ],
  steampunk: [
    { scene: 'commanding the bridge of a colossal brass-and-iron airship over a Victorian city skyline, engine telegraph levers and barometric pressure gauges glowing amber, multiple propeller arrays spinning in the fog behind', mood: 'bold and commanding', title: 'Admiral of the Aethership' },
    { scene: 'in a cluttered Victorian inventor\'s workshop surrounded by sparking electrical coils, glass vacuum tubes, whirring brass automatons, and a half-finished clockwork contraption mid-explosion', mood: 'manic and brilliant', title: 'The Grand Inventor' },
    { scene: 'exhibiting a clockwork marvel at the Great Exhibition of 1851, the Crystal Palace iron-and-glass nave stretching behind, bewildered Victorian spectators in top hats and crinolines', mood: 'proud and eccentric', title: 'The Great Exhibition' },
    { scene: 'piloting a brass submersible through bioluminescent deep-ocean depths, portholes glowing amber-warm, giant mechanical tentacle arms probing the wreck of a sunken galleon', mood: 'mysterious and daring', title: '20,000 Cogs Under the Sea' },
    { scene: 'posed as a steam-powered cavalry officer at a Victorian colonial outpost, clockwork horse beside them, rifle fitted with telescopic brass sight and pressure-valve bayonet', mood: 'adventurous and imperial', title: 'The Clockwork Cavalry' },
  ],
  weirdcore: [
    { scene: 'floating at the end of an infinitely long fluorescent corridor with peeling floral wallpaper, repeating identical numbered doors, a single buzzing tube light casting a flat shadow that points the wrong way', mood: 'eerie and dissociative', title: 'End of the Corridor' },
    { scene: 'alone at a lunch table in an abandoned school cafeteria at 3am, a tray of impossible food in wrong colors, windows showing only white static, the clock reading 25:67', mood: 'uncanny and wrong', title: 'The Lunch That Wasn\'t' },
    { scene: 'in a washed-out suburban backyard where the grass tiles repeat with a visible seam, the sky is the wrong shade of orange-pink, and a swing set casts two shadows in different directions', mood: 'glitchy and dreamlike', title: 'Backyard Error 404' },
    { scene: 'in a hotel lobby with upside-down armchairs bolted to the ceiling, carpet in an impossible pattern that loops on itself, a reception desk with nobody behind it and a bell that rings on its own', mood: 'liminal and haunting', title: 'Check-in Never' },
    { scene: 'at the edge of an empty swimming pool drained of water, the painted blue floor faded to grey, pool ladders going nowhere, a single inflatable toy motionless at the deep end', mood: 'melancholic and surreal', title: 'The Empty Pool' },
  ],
  vernacularart: [
    { scene: 'painted on the side of a cinderblock roadside shrine, surrounded by hand-lettered Bible verses, bottle-cap decorations, painted plastic flowers, and hand-cut tin stars', mood: 'fervent and raw', title: 'Roadside Prophet' },
    { scene: 'seated on a porch as a community elder, hand-painted signs with folk wisdom behind, a Deep South or Appalachian landscape of pines and red clay in the background', mood: 'wise and humble', title: 'The Elder Speaks' },
    { scene: 'depicted on a weathered barn board as a folk guardian, hex signs, hand-painted birds, and vernacular protective symbols surrounding the figure in all directions', mood: 'protective and soulful', title: 'The Barn Keeper' },
    { scene: 'rendered on a refrigerator door turned outsider-art canvas, densely covered in marker-drawn patterns, magazine-cut faces, painted prayers, and layered collage materials', mood: 'personal and unrestrained', title: 'Outsider King' },
    { scene: 'presiding over a handmade yard installation of painted wooden cut-out figures, bottle trees, whirligigs, and folk sculptures in a visionary vernacular garden', mood: 'visionary and joyful', title: 'The Visionary Garden' },
  ],
  artinformel: [
    { scene: 'barely emerging from a violent storm of gestural paint marks in a cramped post-war Parisian studio, raw linen visible through tears in the layered paint surface, ash and plaster embedded in the medium', mood: 'anguished and primal', title: 'L\'Atelier' },
    { scene: 'surfacing from layers of scraped and scored impasto as if rising from rubble, wire and debris pressed into the paint surface, the image barely legible through the material violence', mood: 'traumatic and resilient', title: 'After the Rubble' },
    { scene: 'dissolving into a vortex of raw pigment and found material — sand, ash, burlap fiber — the face the final recognizable point before the composition disintegrates into pure matter', mood: 'existential and turbulent', title: 'The Dissolution' },
    { scene: 'standing at the existential crossroads of a post-war European cityscape rendered entirely in smoldering impasto — thick slabs of tar-black and charred sienna — the figure barely separate from the ruins', mood: 'bleak and defiant', title: 'The Last Stand' },
  ],
  rembrandt: [
    { scene: 'in a wood-paneled Dutch Golden Age study, candlelight catching a starched lace ruff and fine wool coat, the surrounding darkness rich with shadow, a guild charter and wax seal on the oak desk', mood: 'dignified and intimate', title: 'The Guild Portrait' },
    { scene: 'posed as a prosperous Amsterdam merchant surrounded by a celestial globe, brass astronomical instruments, open ledgers, and a Turkish carpet draped over the desk', mood: 'prosperous and intelligent', title: 'The Scholar-Merchant' },
    { scene: 'at a single tallow candle, emerging from velvety surrounding darkness, a worn Hebrew scripture open on the desk beside a skull and a pocket watch', mood: 'contemplative and weathered', title: 'The Philosopher' },
    { scene: 'behind a carved oak pulpit lit by a hanging lantern, the dark interior of an Amsterdam church stretching into shadow behind, an open Bible on the lectern', mood: 'fervent and commanding', title: 'The Sermon' },
    { scene: 'seated in a Leiden anatomicum theatre, a brass candelabra overhead, medical instruments and an open anatomy folio on the draped table beside them', mood: 'solemn and historic', title: 'The Anatomy Lesson' },
  ],
  dadaism: [
    { scene: 'on stage at the Cabaret Voltaire in Zürich 1916, surrounded by noise instruments, phonetic poem banners, and absurdist props — the whole scene collaged from period newsprint and propaganda sheets', mood: 'chaotic and anarchic', title: 'Soirée at the Cabaret' },
    { scene: 'beside a Readymade artwork — a porcelain urinal on a white plinth — in a bourgeois gallery interior, scissored magazine fragments and typographic clippings covering the walls', mood: 'provocative and irreverent', title: 'The Readymade' },
    { scene: 'amid a photomontage of anti-war slogans dissolving into nonsense syllables, flags made of collaged receipts and insurance documents, clocks and scissors floating in the composition', mood: 'absurdist and defiant', title: 'Dada Manifesto' },
    { scene: 'presiding over an absurdist photomontage where clocks melt off pedestals, geometric shapes clash in the background, and scissored propaganda imagery creates a chaotic courtroom setting', mood: 'satirical and bizarre', title: 'The Tribunal' },
  ],
  renaissance: [
    { scene: 'enthroned in a Medici palace altarpiece setting, a gilded Annunciation arch overhead, devotional candles and gold-leaf panels on either side, rich lapis lazuli drapery behind', mood: 'sacred and magnificent', title: 'The Medici Commission' },
    { scene: 'posed in a Florentine loggia against rolling Tuscan hills, dressed in crimson velvet with a laurel wreath, the dome of the Duomo and cypress-lined avenues visible in the hazy sfumato distance', mood: 'noble and serene', title: 'Portrait of a Florentine' },
    { scene: 'depicted as a condottiere general on horseback before a Renaissance fortified city — painted banners, crossed lances in a stand, and a walled Italian cityscape in the background', mood: 'heroic and commanding', title: 'The Condottiere' },
    { scene: 'in a frescoed palazzo library surrounded by an ancient marble bust, draped Flemish tapestry, globes, and an open illuminated codex on a carved lectern', mood: 'intellectual and refined', title: 'The Symposium' },
  ],
  neoclassicism: [
    { scene: 'in a Roman Senate Chamber, toga draped, arm raised in a decisive oratorical gesture, fluted marble columns and a Senate dais receding into cool stone light behind', mood: 'heroic and austere', title: 'The Consul Speaks' },
    { scene: 'on a rearing stallion at the crossing of the Alpine pass, storm-grey mountains and dramatic clouds behind, a Napoleonic tricolor standard planted in the snow', mood: 'epic and triumphant', title: 'Crossing the Alps' },
    { scene: 'in an Athenian stoa, a hemlock cup and rolled papyrus scroll on the stone bench beside them, Doric columns and a sun-bright marble courtyard behind', mood: 'noble and tragic', title: 'The Last Dialogue' },
    { scene: 'in a stone hall of the Roman Republic, raising a gladius toward a laurel wreath above the altar, crossed fasces and marble eagles framing the scene', mood: 'solemn and resolute', title: 'The Oath' },
  ],
  davinci: [
    { scene: 'in Leonardo\'s Florentine workshop among anatomical chalk drawings, scale models of flying machines, hydraulic-pump designs, and open Codex notebooks covered in mirror-script annotations', mood: 'curious and inventive', title: 'In the Workshop of Wonders' },
    { scene: 'depicted on a terracotta study sheet alongside mirror-written anatomical notes and marginal sketches of birds in flight, water vortices, and fortress designs', mood: 'contemplative and meticulous', title: 'The Study Sheet' },
    { scene: 'seated in a sun-dappled Italian garden in three-quarter view, the winding Arno valley and jagged rock formations fading behind into Leonardo\'s characteristic warm-to-cool atmospheric haze', mood: 'enigmatic and timeless', title: 'The Enigma' },
    { scene: 'posed as the ideal proportioned subject within the Vitruvian circle and square, inscribed on aged parchment with marginal Latin annotations in brown ink', mood: 'mathematical and serene', title: 'The Vitruvian Study' },
  ],
  romanticism: [
    { scene: 'standing alone on a rocky clifftop above a churning grey sea, a heavy wool coat billowing in the storm wind, lightning illuminating a towering baroque cloudscape overhead', mood: 'sublime and solitary', title: 'Wanderer Above the Sea' },
    { scene: 'at a revolutionary barricade, a torn tricolor banner raised high, smoke and distant cannon fire behind, fallen cobblestones and spent cartridges in the foreground', mood: 'passionate and defiant', title: 'Liberty at the Barricades' },
    { scene: 'deep in an enchanted Romantic forest, moonlight slanting through ancient oaks, Gothic abbey ruins draped in ivy behind, mist rising from a black still pool at their feet', mood: 'mysterious and melancholic', title: 'In the Enchanted Wood' },
    { scene: 'aboard a stricken ship in a maelstrom sea — the rigging torn, waves crashing over the deck, a Turner-esque vortex of dark water and lightning consuming the horizon', mood: 'dramatic and sublime', title: 'The Shipwreck' },
  ],
  expressionism: [
    { scene: 'center stage at a Weimar-era Berlin cabaret, jagged footlights casting multiple harsh shadows on the empty chairs below, a swirling agitated backdrop of Prussian blue and lurid yellow', mood: 'decadent and anguished', title: 'The Cabaret' },
    { scene: 'alone on a war-ravaged Berlin street at night, tenement buildings leaning at impossible angles, gas lamps bleeding cadmium yellow into rain-slicked black cobblestones', mood: 'traumatic and bleak', title: 'Night Walk' },
    { scene: 'on a bridge at blood-red twilight, the fjord sky a vortex of cadmium orange and prussian blue, the railing vibrating with an existential scream dissolving into swirling agitated air', mood: 'existential and raw', title: 'The Bridge at Twilight' },
    { scene: 'in a psychiatric ward with barred windows casting diagonal prison shadows across the tiled floor, the walls pressing inward at impossible angles, the corridor twisting into warped distorted perspective', mood: 'claustrophobic and desperate', title: 'The Ward' },
  ],
  rococo: [
    { scene: 'on a gilded garden swing at Versailles, silk embroidered coat catching the summer breeze, rose arbors and sculpted topiary in full bloom behind, scattered petals on the lawn below', mood: 'playful and flirtatious', title: 'The Swing' },
    { scene: 'in the Hall of Mirrors wearing an elaborate feathered mask and pale silk embroidered coat, candelabras and gilded pilasters reflected in infinite golden recession behind', mood: 'glamorous and mysterious', title: 'Le Bal Masqué' },
    { scene: 'reclining on a silk chaise in a Louis XV boudoir laden with Sèvres porcelain figurines, ormolu clocks, gilded mirrors, and hand-painted floral wallpaper', mood: 'sensuous and leisurely', title: 'The Boudoir' },
    { scene: 'in an idealized Watteau park beside a marble fountain, a silk parasol overhead, classical garden follies and weeping willows receding into a soft hazy pastel distance', mood: 'idyllic and aristocratic', title: 'Fête Champêtre' },
    { scene: 'presiding over a confectionery-pastel salon spread with porcelain chocolate pots, macarons, and silver candlesticks on a lacquered table, gilded wall panels behind', mood: 'indulgent and charming', title: 'The Salon d\'Or' },
  ],
};

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Pick a random style that is different from the excluded key
export function pickRandomStyle(excludeKey = null) {
  const keys = Object.keys(STYLE_PROMPTS).filter((k) => k !== excludeKey);
  return keys[Math.floor(Math.random() * keys.length)];
}

// ─── Build final prompt ────────────────────────────────────────────────────────
export function buildFinalPrompt(petDesc, styleConfig, styleKey) {
  const scenarios = STYLE_SCENARIOS[styleKey] ?? Object.values(STYLE_SCENARIOS).flat();
  const scenario = pickRandom(scenarios);
  console.log(`[pipeline] scenario picked: "${scenario.title}" (style: ${styleKey})`);

  const prompt =
    `${styleConfig.label} masterwork: ${petDesc}, portrayed as "${scenario.title}". ` +
    `Scene: ${scenario.scene}. Mood: ${scenario.mood}. ` +
    `FRAMING: upper-torso portrait only — head, neck, and chest visible, cropped just below the shoulders or mid-chest. No full body. No legs, hindquarters, or tail in frame. ` +
    `The subject is a REAL ANIMAL — fur, snout, chest — NOT humanoid in any way. ` +
    `ABSOLUTE RULE — ZERO HUMAN OR HUMANOID FIGURES ANYWHERE IN THE IMAGE: no people, no humans, no angels, no cherubs, no saints, no figures, no donors, no onlookers, no crowds, no soldiers, no disciples, no servants, no attendants, no background characters of any kind. ` +
    `The scene contains ONLY the animal subject and inanimate period-appropriate props, architecture, landscape, and objects. ` +
    `STRICT: no human hands, feet, face, skin, torso, or fingers anywhere. ` +
    `Period-appropriate props and costume (tiny hat, collar, draped cape, garment detail) may rest on the animal's natural body but the animal keeps its natural posture and anatomy. ` +
    `CRITICAL — preserve the subject's individual appearance: exact facial structure, distinctive markings, ` +
    `fur colors and patterns, eye color and shape, ear style — this specific animal must be recognizable, not a generic breed stand-in. ` +
    `Art style — render the entire image faithfully in: ${styleConfig.prompt}. ` +
    `Use the visual grammar authentic to this era and movement: the characteristic lighting, palette, surface texture, compositional conventions, and decorative elements of ${styleConfig.label}. ` +
    `STRICTLY NO TEXT OF ANY KIND — no words, letters, numbers, titles, subtitles, taglines, watermarks, signatures, captions, labels, banners, speech bubbles, logos, or brand names anywhere in the image.`;

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
        size:    '1024x1024',
        quality: 'high',
        n:       1,
      });
      const b64 = res.data[0].b64_json;
      if (!b64) throw new Error('no image data');
      const buffer = await addWatermark(Buffer.from(b64, 'base64'));
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
    size:    '1024x1024',
    quality: 'high',
    n:       1,
  });

  const b64 = res.data[0].b64_json;
  if (!b64) throw new Error('gpt-image-1 returned no image data');

  const buffer = await addWatermark(Buffer.from(b64, 'base64'));
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

  const finalPrompt = buildFinalPrompt(petDesc, styleConfig, styleKey);

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
