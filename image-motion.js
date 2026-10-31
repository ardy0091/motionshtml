'use strict';

(() => {
  const VERSION = '6.0';
  const API = 'https://generativelanguage.googleapis.com/v1beta/';
  const $ = id => document.getElementById(id);

  const ids = [
    'im-status', 'im-key', 'im-clear', 'im-model',
    'im-models', 'im-file', 'im-preview', 'im-go',
    'im-duration', 'im-motion', 'im-loop', 'im-visual',
    'im-analysis', 'im-output', 'im-copy', 'im-download'
  ];

  const missing = ids.filter(id => !$(id));

  if (missing.length) {
    console.error('Image Motion V6 missing elements:', missing);
    return;
  }

  const state = {
    image: null,
    mime: null,
    busy: false,
    lastResult: null
  };

  const status = message => {
    $('im-status').textContent = `[V${VERSION}] ${message}`;
  };

  const clamp = (n, min, max) =>
    Math.max(min, Math.min(max, n));

  const sleep = ms =>
    new Promise(resolve => setTimeout(resolve, ms));

  const asText = value =>
    typeof value === 'string' ? value : '';

  const normalize = value =>
    asText(value).trim().toLowerCase();

  const json = value => JSON.stringify(value, null, 2);

  function settings() {
    const duration = Number($('im-duration').value);
    const rawVisual = normalize($('im-visual').value);

    return {
      duration: Number.isFinite(duration)
        ? clamp(duration, 10, 30)
        : 10,

      intensity: $('im-motion').value || 'Balanced',

      loop: $('im-loop').value ||
        'seamless when logically appropriate',

      visualMode:
        rawVisual === 'canvas'
          ? 'canvas'
          : /image|original|overlay|raster|source/.test(rawVisual)
            ? 'original-image'
            : 'unknown'
    };
  }

  function imagePart() {
    if (!state.image || !state.mime) {
      throw new Error('Upload gambar terlebih dahulu.');
    }

    return {
      inline_data: {
        mime_type: state.mime,
        data: state.image
      }
    };
  }

  function getModel() {
    const model = $('im-model').value;

    if (!/^models\/[\w.-]+$/.test(model)) {
      throw new Error('Pilih model Gemini yang valid.');
    }

    return model;
  }

  async function request(path, body) {
    const key = $('im-key').value.trim();

    if (!key) {
      throw new Error('Gemini API Key belum diisi.');
    }

    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      90000
    );

    try {
      const response = await fetch(API + path, {
        method: body ? 'POST' : 'GET',

        headers: {
          'x-goog-api-key': key,
          ...(body
            ? { 'Content-Type': 'application/json' }
            : {})
        },

        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
          `Gemini HTTP ${response.status}`
        );
      }

      return data;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function generate(prompt, includeImage = false) {
    const parts = [{ text: prompt }];

    if (includeImage) {
      parts.push(imagePart());
    }

    const body = {
      contents: [{
        role: 'user',
        parts
      }],

      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      }
    };

    let error;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await request(
          getModel() + ':generateContent',
          body
        );

        const candidate = result.candidates?.[0];

        const raw = (
          candidate?.content?.parts || []
        ).map(part => part.text || '').join('');

        if (!raw) {
          throw new Error(
            'Respons kosong: ' +
            (candidate?.finishReason || 'unknown')
          );
        }

        const cleaned = raw
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/, '')
          .trim();

        return JSON.parse(cleaned);

      } catch (e) {
        error = e;

        if (
          attempt === 0 &&
          /429|503|overload|resource exhausted/i.test(e.message)
        ) {
          await sleep(2500);
          continue;
        }

        break;
      }
    }

    throw error;
  }

  // ====================================================
  // IMAGE UPLOAD
  // ====================================================

  $('im-file').addEventListener('change', () => {
    const file = $('im-file').files?.[0];

    state.image = null;
    state.mime = null;

    $('im-preview').hidden = true;

    if (!file) return;

    if (![
      'image/png',
      'image/jpeg',
      'image/webp'
    ].includes(file.type)) {
      status('Gunakan JPG, PNG, atau WebP.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      status('Ukuran gambar maksimal 10 MB.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const dataURL = String(reader.result || '');
      const base64 = dataURL.split(',')[1];

      if (!base64) {
        status('Gagal membaca gambar.');
        return;
      }

      state.image = base64;
      state.mime = file.type;

      $('im-preview').src = dataURL;
      $('im-preview').hidden = false;

      status('Gambar siap dianalisis.');
    };

    reader.onerror = () => {
      status('File gambar gagal dibaca.');
    };

    reader.readAsDataURL(file);
  });

  // ====================================================
  // MODEL MANAGEMENT
  // ====================================================

  $('im-models').onclick = async () => {
    status('Memeriksa model Gemini...');

    try {
      const models = [];
      let pageToken = '';

      do {
        const path =
          'models?pageSize=100' +
          (pageToken
            ? '&pageToken=' + encodeURIComponent(pageToken)
            : '');

        const result = await request(path);

        models.push(...(result.models || []));
        pageToken = result.nextPageToken || '';

      } while (pageToken && models.length < 500);

      const available = models.filter(model =>
        model.supportedGenerationMethods?.includes(
          'generateContent'
        ) &&
        /gemini/i.test(model.name)
      );

      const select = $('im-model');
      select.replaceChildren();

      for (const model of available) {
        const option = document.createElement('option');

        option.value = model.name;
        option.textContent =
          model.displayName || model.name;

        select.append(option);
      }

      status(
        `${available.length} model ditemukan. ` +
        'Pilih model yang mendukung input gambar.'
      );

    } catch (e) {
      status('Gagal memuat model: ' + e.message);
    }
  };

  $('im-clear').onclick = () => {
    $('im-key').value = '';
    status('API Key dibersihkan dari input.');
  };

  // ====================================================
  // STAGE 1: ADAPTIVE OBJECT MAPPING
  // ====================================================

  function analysisPrompt(s) {
    return `
ROLE: Universal Visual Scene Analyst V6.

Analyze the ATTACHED IMAGE accurately.

The image can contain ANY subject:
technology, nature, machinery, transport,
architecture, abstract shapes, business,
people, animals, objects, interfaces, or others.

DO NOT assume it contains folders, laptops,
clouds, screens, or documents.

OBJECT DETECTION:

Identify visually significant objects.

Use dynamic granularity:
- A single simple object can be one object.
- Independently meaningful visible components
  should be separate objects.
- A complex scene may contain many objects.
- Do not force an arbitrary object count.
- Do not invent invisible objects.
- Do not merge independently actionable
  components merely to reduce output size.

For each object provide:
- unique ID
- name
- visible appearance
- normalized bounding box
- parent ID
- visual role
- motion capability
- raster isolation requirements
- confidence

Coordinate system:
x,y,w,h normalized to [0,1].
Coordinates refer to the entire image.

A bounding box should tightly enclose
the visible object.

OBJECT ROLES:
STATIC_STRUCTURE
MOVABLE_COMPONENT
OVERLAY_TARGET
BACKGROUND
DECORATIVE

Determine which movements are physically,
visually, and contextually meaningful.

Separate:
1. Object motion.
2. Functional state change.
3. Decorative effects.

Do not mistake decorative motion for
a complete functional process.

SCENE UNDERSTANDING:

Describe the actual purpose or visual
meaning of the image.

Identify relationships:
- source and destination
- parent and child
- input and output
- cause and effect
- spatial interaction
- mechanical interaction
- abstract visual relationships

Use only relationships supported by
the image.

VISUAL MODES:

Canvas Reconstruction:
All artwork is recreated using Canvas 2D.

Original Image Overlay:
Actual original image is drawn as background,
with additional animation layers.

A chat image is NOT automatically a
runtime HTML asset.

For raster-baked objects, moving them
requires a clean underlying background
and a separated moving layer.

If these are unavailable, flag the
movement as infeasible.

RETURN JSON ONLY:

{
  "scene": {
    "description": "",
    "category": "",
    "visual_style": "",
    "palette": [],
    "perspective": "",
    "background_details": ""
  },
  "objects": [
    {
      "id": "obj_001",
      "name": "",
      "appearance": "",
      "bbox": {
        "x": 0,
        "y": 0,
        "w": 0.1,
        "h": 0.1
      },
      "parent_id": null,
      "role": "STATIC_STRUCTURE",
      "baked_into_image": true,
      "can_be_reconstructed": true,
      "can_move_as_overlay": false,
      "needs_background_restoration": false,
      "confidence": "high"
    }
  ],
  "relationships": [
    {
      "from": "obj_001",
      "to": "obj_002",
      "type": "",
      "visual_evidence": ""
    }
  ],
  "possible_actions": [
    {
      "object_ids": ["obj_001"],
      "action": "",
      "visible_state_change": "",
      "reason": "",
      "technical_risk": ""
    }
  ],
  "visual_risks": [],
  "reconstruction_notes": [],
  "overlay_notes": []
}

Return actual image observations,
not generic assumptions.
`;
  }

  function validateAnalysis(data) {
    const errors = [];

    if (!data?.scene?.description) {
      errors.push('Scene description missing.');
    }

    if (!Array.isArray(data?.objects) ||
        data.objects.length === 0) {
      errors.push('No objects mapped.');
    }

    const objectIds = new Set();

    for (const obj of data.objects || []) {
      if (!obj.id || objectIds.has(obj.id)) {
        errors.push('Duplicate or missing object ID.');
      }

      objectIds.add(obj.id);

      const b = obj.bbox;

      if (!b) {
        errors.push(`Missing bbox: ${obj.id}`);
        continue;
      }

      const values = [b.x, b.y, b.w, b.h];

      if (values.some(v =>
        typeof v !== 'number' ||
        !Number.isFinite(v)
      )) {
        errors.push(`Invalid bbox: ${obj.id}`);
        continue;
      }

      if (
        b.x < 0 || b.y < 0 ||
        b.w <= 0 || b.h <= 0 ||
        b.x + b.w > 1.02 ||
        b.y + b.h > 1.02
      ) {
        errors.push(`Out-of-range bbox: ${obj.id}`);
      }
    }

    for (const obj of data.objects || []) {
      if (
        obj.parent_id &&
        !objectIds.has(obj.parent_id)
      ) {
        errors.push(`Unknown parent: ${obj.id}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      objectIds
    };
  }

  // ====================================================
  // STAGE 2: MULTI-CONCEPT MOTION ENGINE
  // ====================================================

  function conceptPrompt(analysis, s) {
    return `
ROLE: Universal Motion Concept Director V6.

Create THREE DISTINCT animation concepts
for the analyzed image.

Each concept must be grounded in the
actual objects and visual meaning.

Do not force a business process on an
abstract image.

Do not force translation on a clock,
rotation on a battery, or file transfer
on an unrelated illustration.

A meaningful animation can be:
- mechanical motion
- object transformation
- state change
- material flow
- growth or reduction
- spatial movement
- interaction
- abstract visual transformation
- rotation when functionally appropriate

Avoid selecting decorative effects
as the primary action when more meaningful
motion is feasible.

IMPORTANT:

Three concepts must differ in their
PRIMARY ACTION, not merely colors,
speed, or glow intensity.

For each concept specify:
- actual object IDs
- primary action
- observable beginning and ending states
- motion category
- visible outcome
- technical feasibility
- masking requirements
- whether Canvas reconstruction supports it
- whether original-image overlay supports it

VISUAL MODE:
${s.visualMode}

DURATION:
${s.duration} seconds.

INTENSITY:
${s.intensity}

ANALYSIS:
${json(analysis)}

RETURN JSON ONLY:

{
  "concepts": [
    {
      "id": "concept_1",
      "title": "",
      "description": "",
      "object_ids": [],
      "primary_action": "",
      "motion_category": "",
      "initial_state": "",
      "final_state": "",
      "observable_change": "",
      "functional_purpose": "",
      "technical_strategy": "",
      "requires_isolation": false,
      "requires_inpainting": false,
      "canvas_feasible": true,
      "overlay_feasible": true,
      "risk_level": "low",
      "reason": ""
    }
  ]
}

Return three distinct concepts.
Do not invent objects.
`;
  }

  // ====================================================
  // STAGE 3: DETERMINISTIC CONCEPT SCORING
  // ====================================================

  function scoreConcept(concept, analysis, s) {
    const objectIds = new Set(
      analysis.objects.map(obj => obj.id)
    );

    const selected = Array.isArray(concept.object_ids)
      ? concept.object_ids
      : [];

    const reasons = [];
    let score = 0;

    if (!selected.length) {
      return {
        score: -100,
        rejected: true,
        reasons: ['No target objects.']
      };
    }

    if (selected.some(id => !objectIds.has(id))) {
      return {
        score: -100,
        rejected: true,
        reasons: ['Unknown object ID.']
      };
    }

    if (
      !asText(concept.primary_action).trim() ||
      !asText(concept.observable_change).trim()
    ) {
      return {
        score: -100,
        rejected: true,
        reasons: ['Missing observable action.']
      };
    }

    const category = normalize(concept.motion_category);
    const action = normalize(concept.primary_action);
    const outcome = normalize(concept.observable_change);

    const decorative = /glow|pulse|blink|sparkle|flicker|shimmer/.test(
      category + ' ' + action
    );

    const rotation = /rotat|spin|turn/.test(
      category + ' ' + action
    );

    const outcomeIsDecorative =
      /^(glow|pulse|blink|rotate|spin|shimmer)/.test(outcome);

    const meaningfulCategory =
      /transfer|transform|state|progress|mechanical|growth|flow|interaction|translation|movement|rotation|abstract|reveal|morph|change/.test(
        category
      );

    if (meaningfulCategory) score += 20;

    if (concept.initial_state &&
        concept.final_state &&
        normalize(concept.initial_state) !==
        normalize(concept.final_state)) {
      score += 20;
    }

    if (outcome.length >= 12) score += 15;

    if (concept.functional_purpose) score += 10;

    if (concept.technical_strategy) score += 10;

    if (decorative && outcomeIsDecorative) {
      score -= 35;
      reasons.push('Decorative-only primary action.');
    }

    // Rotation is not automatically bad.
    // It can be correct for clocks, wheels, gears, etc.
    if (rotation) {
      const relevant = selected.some(id => {
        const obj = analysis.objects.find(o => o.id === id);
        return /clock|hand|wheel|gear|fan|turbine|propeller|rotor|dial|spindle|cog|jarum|roda|kipas/i.test(
          (obj?.name || '') + ' ' +
          (obj?.appearance || '')
        );
      });

      if (relevant) score += 20;
      else if (outcomeIsDecorative) score -= 15;
    }

    const risk = normalize(concept.risk_level);

    if (risk === 'low') score += 15;
    if (risk === 'medium') score += 5;
    if (risk === 'high') score -= 15;

    if (s.visualMode === 'canvas') {
      if (concept.canvas_feasible === false) {
        return {
          score: -100,
          rejected: true,
          reasons: ['Not feasible in Canvas mode.']
        };
      }

      if (concept.requires_inpainting === true) {
        return {
          score: -100,
          rejected: true,
          reasons: [
            'Raster inpainting is incompatible with standalone Canvas.'
          ]
        };
      }
    }

    if (s.visualMode === 'original-image') {
      if (concept.overlay_feasible === false) {
        return {
          score: -100,
          rejected: true,
          reasons: ['Not feasible in overlay mode.']
        };
      }

      if (
        concept.requires_isolation === true ||
        concept.requires_inpainting === true
      ) {
        return {
          score: -100,
          rejected: true,
          reasons: [
            'Required image isolation/restoration is not implemented.'
          ]
        };
      }
    }

    return {
      score,
      rejected: score < 15,
      reasons
    };
  }

  function rankConcepts(data, analysis, s) {
    const concepts = Array.isArray(data.concepts)
      ? data.concepts
      : [];

    if (concepts.length < 2) {
      throw new Error(
        'Gemini tidak memberikan cukup alternatif konsep.'
      );
    }

    const ranked = concepts.map(concept => ({
      ...concept,
      evaluation: scoreConcept(
        concept,
        analysis,
        s
      )
    }));

    ranked.sort(
      (a, b) =>
        b.evaluation.score - a.evaluation.score
    );

    return ranked;
  }

  // ====================================================
  // STAGE 4: STORYBOARD GENERATOR
  // ====================================================

  function storyboardPrompt(analysis, concept, s) {
    return `
ROLE: Production Motion Director V6.

Generate a technically realistic storyboard.

Use the SELECTED CONCEPT.
Do not replace it with unrelated rotation,
glow, or decorative motion.

SELECTED CONCEPT:
${json(concept)}

SCENE:
${json(analysis.scene)}

OBJECT MAP:
${json(analysis.objects)}

DURATION:
${s.duration} seconds.

VISUAL MODE:
${s.visualMode}

LOOP REQUEST:
${s.loop}

RULES:

1. Every beat must refer to real object IDs.
2. Each beat must have a visible result.
3. Primary action must be recognizable.
4. Secondary effects must remain secondary.
5. Timeline must cover exactly the duration.
6. No timeline gaps or overlaps.
7. Keep static structures stationary.
8. Do not invent missing image layers.
9. Do not require unsupported inpainting.
10. Do not change the reference composition.

Canvas mode:
Reconstruct static scene and animate
separately drawn components.

Original-image overlay mode:
Keep baked-in objects stationary unless
actual isolated layers and clean background
assets are available.

For overlay mode, do not claim a moving
raster object is feasible without those assets.

For looped animation:
Check visual state AND velocity continuity.

If a seamless loop is not possible,
state that clearly.

RETURN JSON ONLY:

{
  "title": "",
  "duration": ${s.duration},
  "beats": [
    {
      "start": 0,
      "end": 1,
      "object_ids": [],
      "action": "",
      "initial_state": "",
      "final_state": "",
      "visible_change": "",
      "path": "",
      "easing": "",
      "layer_strategy": "",
      "masking_strategy": "",
      "purpose": ""
    }
  ],
  "static_objects": [],
  "loop": {
    "feasible": false,
    "reason": "",
    "position_continuity": "",
    "velocity_continuity": "",
    "reset_strategy": ""
  },
  "implementation_notes": [],
  "visual_fidelity_notes": []
}

Use exact numeric times.
Return at least three beats.
`;
  }

  // ====================================================
  // STAGE 5: QUALITY GATE
  // ====================================================

  function validateStoryboard(plan, analysis, concept, s) {
    const errors = [];
    const beats = plan?.beats;

    if (!Array.isArray(beats) || beats.length < 3) {
      return [
        'Storyboard must contain at least three beats.'
      ];
    }

    const objectIds = new Set(
      analysis.objects.map(o => o.id)
    );

    let previousEnd = 0;
    let meaningfulBeats = 0;

    for (let i = 0; i < beats.length; i++) {
      const beat = beats[i];

      const start = Number(beat.start);
      const end = Number(beat.end);

      if (
        !Number.isFinite(start) ||
        !Number.isFinite(end)
      ) {
        errors.push(`Beat ${i + 1}: invalid time.`);
        continue;
      }

      if (i === 0 && Math.abs(start) > 0.001) {
        errors.push('Timeline must start at zero.');
      }

      if (Math.abs(start - previousEnd) > 0.001) {
        errors.push(
          `Beat ${i + 1}: timeline gap/overlap.`
        );
      }

      if (end <= start || end > s.duration + 0.001) {
        errors.push(
          `Beat ${i + 1}: invalid end time.`
        );
      }

      const targets = Array.isArray(beat.object_ids)
        ? beat.object_ids
        : [];

      if (
        !targets.length ||
        targets.some(id => !objectIds.has(id))
      ) {
        errors.push(
          `Beat ${i + 1}: invalid target objects.`
        );
      }

      if (
        !beat.action ||
        !beat.visible_change ||
        !beat.final_state
      ) {
        errors.push(
          `Beat ${i + 1}: missing motion details.`
        );
      }

      const content = normalize(
        [
          beat.action,
          beat.visible_change,
          beat.purpose
        ].join(' ')
      );

      const decorativeOnly =
        /^(rotate|spin|glow|pulse|blink|shimmer)/.test(
          normalize(beat.action)
        ) &&
        !/transfer|progress|complete|receive|select|change|advance|mechanical|clock|wheel|gear|time|move|transform|grow|fill|reveal|morph/.test(
          content
        );

      if (!decorativeOnly) meaningfulBeats++;

      const masking = normalize(
        beat.masking_strategy
      );

      if (
        s.visualMode === 'canvas' &&
        /inpaint|raster patch|pixel restoration/.test(masking)
      ) {
        errors.push(
          `Beat ${i + 1}: raster masking conflicts with Canvas mode.`
        );
      }

      if (
        s.visualMode === 'original-image' &&
        /inpaint|remove baked|restore background/.test(masking)
      ) {
        errors.push(
          `Beat ${i + 1}: unavailable image restoration.`
        );
      }

      previousEnd = end;
    }

    if (Math.abs(previousEnd - s.duration) > 0.001) {
      errors.push(
        'Timeline does not end at requested duration.'
      );
    }

    if (meaningfulBeats === 0) {
      errors.push(
        'Storyboard contains decorative motion only.'
      );
    }

    const selectedAction = normalize(
      concept.primary_action
    );

    const storyboardText = normalize(
      beats.map(b =>
        [
          b.action,
          b.visible_change,
          b.purpose
        ].join(' ')
      ).join(' ')
    );

    const actionWords = selectedAction
      .split(/\W+/)
      .filter(word => word.length >= 5);

    if (
      actionWords.length &&
      !actionWords.some(word =>
        storyboardText.includes(word)
      )
    ) {
      errors.push(
        'Storyboard may not implement selected concept.'
      );
    }

    return errors;
  }

  // ====================================================
  // STAGE 6: LIMITED REPAIR
  // ====================================================

  async function repairStoryboard(
    plan,
    errors,
    analysis,
    concept,
    s
  ) {
    const prompt = `
ROLE: Storyboard Repair Engineer.

Repair the following storyboard.

Do not change the selected motion concept.

SELECTED CONCEPT:
${json(concept)}

SCENE OBJECTS:
${json(analysis.objects)}

CURRENT STORYBOARD:
${json(plan)}

VALIDATION ERRORS:
${json(errors)}

DURATION:
${s.duration}

VISUAL MODE:
${s.visualMode}

Fix all listed errors.

Preserve real object IDs.

Do not introduce unavailable raster
masking or inpainting.

Do not replace meaningful actions
with decorative rotations.

Return the COMPLETE corrected storyboard
using exactly the same JSON structure.
`;

    return generate(prompt);
  }

  // ====================================================
  // STAGE 7: MASTER PROMPT BUILDER
  // ====================================================

  function visualInstructions(s) {
    if (s.visualMode === 'canvas') {
      return `
VISUAL MODE: STANDALONE CANVAS RECONSTRUCTION.

The uploaded image is the visual reference.

The HTML must rebuild the visible scene
using Canvas 2D drawing commands.

Draw:
- background
- static structures
- visible objects
- fine visual details
- independent moving components

Maintain original geometry, proportions,
palette, and visual hierarchy.

Do not replace complex recognizable
objects with generic placeholders.

The original raster pixels are not
automatically available in HTML.

Do not request raster inpainting.

Canvas reconstruction cannot guarantee
pixel-identical reproduction.
`;
    }

    return `
VISUAL MODE: ORIGINAL IMAGE OVERLAY.

The original image must be available
as a real runtime asset.

Use an actual supplied image file
or an actual embedded data URI.

The chat attachment alone is not a
browser-accessible image asset.

Never invent image bytes or a fake URL.

Draw the source image on Canvas
before drawing animated overlays.

Keep baked-in source objects stationary
unless clean separated layers and
background restoration assets exist.

If the required asset is unavailable,
do not silently replace this mode
with Canvas reconstruction.

Explain the missing asset requirement
rather than fabricating it.
`;
  }

  function buildMasterPrompt(
    analysis,
    ranked,
    selected,
    plan,
    s
  ) {
    return `
ROLE:
Senior HTML5 Canvas 2D Motion Engineer.
Commercial Motion Graphics Director.
Reference Fidelity Specialist.

IMAGE MOTION GENERATOR V6

MISSION:
Create one complete executable HTML
motion graphic based on the uploaded image.

DURATION:
${s.duration} seconds.

MOTION INTENSITY:
${s.intensity}

LOOP REQUEST:
${s.loop}

PRIORITY:
1. Preserve source composition.
2. Preserve recognizable object details.
3. Execute the selected meaningful motion.
4. Respect object coordinates.
5. Maintain layer correctness.
6. Avoid ghosting.
7. Maintain smooth temporal continuity.

${visualInstructions(s)}

TECHNICAL SPECIFICATIONS:

- One standalone HTML document.
- Canvas element id="stage".
- Internal resolution 1920x1080.
- Responsive 16:9 display.
- Canvas 2D rendering only.
- requestAnimationFrame.
- performance.now() timing.
- Target 60fps playback.
- No external libraries.
- No external animation services.
- No CSS visual animation.
- No audio.
- No branding or watermarks.

TIME SYSTEM:

Use time in seconds.

For seamless looping:
t = (elapsedSeconds % duration).

For nonloop animation:
t = min(elapsedSeconds, duration).

Every animated property must derive
from time rather than frame count.

Keep all Canvas globalAlpha values
between 0 and 1.

OBJECT POSITIONING:

Normalized coordinates map to:

x = normalizedX * canvas.width
y = normalizedY * canvas.height

For width and height, use the
corresponding canvas dimensions.

Respect parent-child relationships.

Static parents remain stationary.

Do not move the camera or entire scene
to simulate child animation.

LAYER RULES:

Render static background first.

Render structural elements next.

Render animated objects and effects
in correct depth order.

Clip screen-local animation to
the screen interior when necessary.

Do not duplicate baked-in objects.

Do not invent missing image layers.

MOTION RULES:

The selected concept is authoritative.

Execute the actual functional or
visual transformation.

Do not replace the selected action
with arbitrary icon rotation.

Rotation is allowed when it is the
correct motion for the subject.

Secondary glow, particles and pulses
must not obscure the primary action.

Preserve object identity across frames.

LOOP RULES:

The first and final visible states
must be compatible.

For continuous motion, verify
velocity continuity at the seam.

For a one-way process, use a logically
appropriate reset or nonloop hold.

Do not claim seamlessness solely
because the final rotation is a
multiple of 360 degrees.

REFERENCE SCENE:
${json(analysis.scene)}

PRECISE OBJECT MAP:
${json(analysis.objects)}

OBJECT RELATIONSHIPS:
${json(analysis.relationships || [])}

SELECTED MOTION CONCEPT:
${json(selected)}

EXACT STORYBOARD:
${json(plan.beats)}

STATIC OBJECTS:
${json(plan.static_objects || [])}

LOOP ASSESSMENT:
${json(plan.loop || {})}

IMPLEMENTATION NOTES:
${json(plan.implementation_notes || [])}

VISUAL FIDELITY NOTES:
${json(plan.visual_fidelity_notes || [])}

QUALITY CHECK:

1. Main objects recognizable.
2. Source composition preserved.
3. Primary action clearly visible.
4. No unrelated motion.
5. No duplicate baked objects.
6. No broken masks.
7. No timeline gaps.
8. No unexpected frame jumps.
9. Canvas renders immediately.
10. Complete runnable HTML.

OUTPUT:

Return the complete HTML document only.

No pseudocode.
No concept illustration.
No unrelated explanation.

Do not claim pixel-perfect fidelity
for a manually reconstructed scene.
`.trim();
  }

  // ====================================================
  // MAIN WORKFLOW
  // ====================================================

  $('im-go').onclick = async () => {
    if (state.busy) return;

    if (!state.image) {
      status('Upload gambar terlebih dahulu.');
      return;
    }

    if (!$('im-key').value.trim()) {
      status('Masukkan Gemini API Key.');
      return;
    }

    state.busy = true;
    $('im-go').disabled = true;

    $('im-analysis').value = '';
    $('im-output').value = '';

    try {
      const s = settings();

      if (s.visualMode === 'unknown') {
        throw new Error(
          'Nilai Visual Mode tidak dikenal. ' +
          'Periksa pilihan pada image-motion.html.'
        );
      }

      status('Tahap 1/4: Analisis objek dinamis...');

      const analysis = await generate(
        analysisPrompt(s),
        true
      );

      const check = validateAnalysis(analysis);

      if (!check.valid) {
        throw new Error(
          'Object mapping gagal: ' +
          check.errors.join('; ')
        );
      }

      status('Tahap 2/4: Membuat 3 konsep gerakan...');

      const concepts = await generate(
        conceptPrompt(analysis, s)
      );

      const ranked = rankConcepts(
        concepts,
        analysis,
        s
      );

      const selected = ranked.find(
        concept => !concept.evaluation.rejected
      );

      if (!selected) {
        throw new Error(
          'Tidak ada konsep yang lolos penilaian. ' +
          'Generator tidak akan memaksakan gerakan.'
        );
      }

      status(
        'Tahap 3/4: Menyusun storyboard "' +
        selected.title + '"...'
      );

      let plan = await generate(
        storyboardPrompt(
          analysis,
          selected,
          s
        )
      );

      let errors = validateStoryboard(
        plan,
        analysis,
        selected,
        s
      );

      // One targeted repair attempt.
      if (errors.length) {
        status(
          'Storyboard belum lolos. ' +
          'Mencoba perbaikan terarah...'
        );

        plan = await repairStoryboard(
          plan,
          errors,
          analysis,
          selected,
          s
        );

        errors = validateStoryboard(
          plan,
          analysis,
          selected,
          s
        );
      }

      if (errors.length) {
        $('im-analysis').value = json({
          version: VERSION,
          settings: s,
          analysis,
          concepts: ranked,
          selectedConcept: selected,
          storyboard: plan,
          validationErrors: errors
        });

        throw new Error(
          'Storyboard masih gagal validasi: ' +
          errors.join('; ')
        );
      }

      status('Tahap 4/4: Menyusun Master Prompt...');

      const master = buildMasterPrompt(
        analysis,
        ranked,
        selected,
        plan,
        s
      );

      const report = {
        version: VERSION,
        settings: s,
        scene: analysis.scene,
        objectCount: analysis.objects.length,
        objects: analysis.objects,
        relationships: analysis.relationships,
        motionConcepts: ranked,
        selectedConcept: selected,
        storyboard: plan,
        validation: {
          passed: true,
          errors: []
        },
        limitations: [
          'Concept scoring is heuristic, not proof of animation quality.',
          'Gemini object coordinates require visual verification.',
          'Canvas fidelity cannot be guaranteed from prompt alone.',
          'HTML output must still be tested in a browser.'
        ]
      };

      state.lastResult = report;

      $('im-analysis').value = json(report);
      $('im-output').value = master;

      status(
        'Selesai! ' +
        analysis.objects.length +
        ' objek terdeteksi, ' +
        ranked.length +
        ' konsep dibandingkan. ' +
        'Storyboard lolos pemeriksaan V6.'
      );

    } catch (e) {
      status(
        'Gagal: ' +
        (e.name === 'AbortError'
          ? 'Gemini API timeout.'
          : e.message)
      );

    } finally {
      state.busy = false;
      $('im-go').disabled = false;
    }
  };

  // ====================================================
  // COPY MASTER PROMPT
  // ====================================================

  $('im-copy').onclick = async () => {
    const value = $('im-output').value;

    if (!value) {
      status('Master Prompt masih kosong.');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      status('Master Prompt V6 disalin.');

    } catch {
      $('im-output').focus();
      $('im-output').select();

      status(
        'Clipboard gagal. Teks sudah dipilih untuk salin manual.'
      );
    }
  };

  // ====================================================
  // DOWNLOAD MASTER PROMPT
  // ====================================================

  $('im-download').onclick = () => {
    const value = $('im-output').value;

    if (!value) {
      status('Master Prompt masih kosong.');
      return;
    }

    const blob = new Blob([value], {
      type: 'text/plain;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'image-motion-master-v6.txt';

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    status('Master Prompt V6 disimpan.');
  };

  status('Image Motion Generator V6 siap.');
})();
