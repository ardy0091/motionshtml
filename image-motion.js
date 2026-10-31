'use strict';

(() => {
  const $ = id => document.getElementById(id);

  const required = [
    'im-status', 'im-key', 'im-clear', 'im-model',
    'im-models', 'im-file', 'im-preview', 'im-go',
    'im-duration', 'im-motion', 'im-loop', 'im-visual',
    'im-analysis', 'im-output', 'im-copy', 'im-download'
  ];

  const missing = required.filter(id => !$(id));

  if (missing.length) {
    console.error('Image Motion V5: Missing HTML elements:', missing);
    return;
  }

  const VERSION = '5.0';
  const API = 'https://generativelanguage.googleapis.com/v1beta/';

  const state = {
    image: null,
    mime: null,
    busy: false
  };

  const status = message => {
    $('im-status').textContent = `[V${VERSION}] ${message}`;
  };

  const apiKey = () => $('im-key').value.trim();

  const sleep = ms => new Promise(resolve => {
    setTimeout(resolve, ms);
  });

  const clamp = (value, min, max) => {
    return Math.max(min, Math.min(max, value));
  };

  function getSettings() {
    const duration = Number($('im-duration').value);

    return {
      duration: Number.isFinite(duration)
        ? clamp(duration, 10, 30)
        : 10,

      motion: $('im-motion').value || 'Balanced',
      loop: $('im-loop').value || 'seamless',
      visual: $('im-visual').value || 'canvas'
    };
  }

  function visualMode(value) {
    return value === 'canvas'
      ? 'canvas'
      : 'original-image';
  }

  $('im-clear').onclick = () => {
    $('im-key').value = '';

    $('im-model').innerHTML =
      '<option value="">Cek koneksi terlebih dahulu</option>';

    status('API Key dibersihkan dari input.');
  };

  $('im-file').onchange = () => {
    const file = $('im-file').files?.[0];

    state.image = null;
    state.mime = null;

    $('im-preview').hidden = true;

    if (!file) return;

    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowed.includes(file.type)) {
      status('Format gambar harus JPG, PNG, atau WebP.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      status('Ukuran gambar maksimal 10 MB.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const dataURL = String(reader.result || '');
      const encoded = dataURL.split(',')[1];

      if (!encoded) {
        status('Gagal membaca data gambar.');
        return;
      }

      state.image = encoded;
      state.mime = file.type;

      $('im-preview').src = dataURL;
      $('im-preview').hidden = false;

      status('Gambar siap dianalisis oleh V5.');
    };

    reader.onerror = () => {
      status('Gagal membaca gambar.');
    };

    reader.readAsDataURL(file);
  };

  async function api(path, body = null) {
    if (!apiKey()) {
      throw new Error('Masukkan Gemini API Key.');
    }

    const controller = new AbortController();

    const timer = setTimeout(() => {
      controller.abort();
    }, 90000);

    try {
      const response = await fetch(API + path, {
        method: body ? 'POST' : 'GET',

        headers: {
          'x-goog-api-key': apiKey(),
          ...(body
            ? { 'Content-Type': 'application/json' }
            : {})
        },

        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.error?.message ||
          `Gemini API HTTP ${response.status}`
        );
      }

      return result;

    } finally {
      clearTimeout(timer);
    }
  }

  $('im-models').onclick = async () => {
    status('Memeriksa model Gemini...');

    try {
      const models = [];
      let token = '';

      do {
        const query =
          'models?pageSize=100' +
          (token
            ? '&pageToken=' + encodeURIComponent(token)
            : '');

        const response = await api(query);

        models.push(...(response.models || []));

        token = response.nextPageToken || '';

      } while (token && models.length < 500);

      const available = models.filter(model => {
        return (
          model.supportedGenerationMethods?.includes(
            'generateContent'
          ) &&
          /gemini/i.test(model.name)
        );
      });

      const select = $('im-model');

      select.replaceChildren();

      for (const model of available) {
        const option = document.createElement('option');

        option.value = model.name;

        option.textContent = model.displayName
          ? `${model.displayName} (${model.name})`
          : model.name;

        select.append(option);
      }

      status(
        available.length
          ? `${available.length} model ditemukan. Pilih model yang mendukung gambar.`
          : 'Tidak ditemukan model yang sesuai.'
      );

    } catch (error) {
      status('Gagal memeriksa model: ' + error.message);
    }
  };

  async function generate(parts, json = true) {
    const model = $('im-model').value;

    if (!/^models\/[a-zA-Z0-9._-]+$/.test(model)) {
      throw new Error('Pilih model Gemini terlebih dahulu.');
    }

    const body = {
      contents: [
        {
          role: 'user',
          parts
        }
      ],

      generationConfig: {
        temperature: 0.15,
        maxOutputTokens: 8192,
        ...(json
          ? { responseMimeType: 'application/json' }
          : {})
      }
    };

    let lastError;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await api(
          model + ':generateContent',
          body
        );

        const candidate = response.candidates?.[0];

        const result = (
          candidate?.content?.parts || []
        ).map(part => part.text || '').join('');

        if (!result) {
          throw new Error(
            'Respons Gemini kosong. Finish reason: ' +
            (candidate?.finishReason || 'unknown')
          );
        }

        return result;

      } catch (error) {
        lastError = error;

        const temporary =
          /429|503|overload|high demand|resource exhausted|temporarily unavailable/i
            .test(error.message);

        if (attempt === 0 && temporary) {
          status('Server sibuk. Mencoba ulang sekali...');
          await sleep(3000);
          continue;
        }

        break;
      }
    }

    throw lastError;
  }

  function parseJSON(raw, stage) {
    try {
      const clean = raw
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      return JSON.parse(clean);

    } catch {
      throw new Error(
        `${stage}: JSON tidak valid atau terpotong. Coba model lain.`
      );
    }
  }

  // =====================================================
  // V5 — PRECISION OBJECT MAPPING
  // =====================================================

  function analysisInstruction(settings) {
    return `
YOU ARE IMAGE MOTION ANALYST V5.

ROLE:
Precision visual analyst, motion director,
object mapper and commercial 2D animation planner.

Analyze the attached image itself.

Do not rely on generic assumptions about technology graphics.

PRIMARY PRIORITIES:
1. Visual fidelity.
2. Accurate object detection.
3. Precise object coordinates.
4. Meaningful functional animation.
5. Layer separation feasibility.
6. Seamless motion continuity.

IMAGE COORDINATES:
Use normalized coordinates from 0 to 1.

Origin:
x=0 at left edge.
y=0 at top edge.

For every important object provide:

- unique object ID
- exact visual identity
- bounding box x,y,w,h
- center x,y
- parent object ID if applicable
- foreground/background relationship
- static or animated classification
- whether it is baked into the raster image
- whether it can move without ghosting
- required masking or restoration
- confidence level

Bounding boxes must refer to the actual visible
object, not the entire parent region.

For example:
A folder inside a laptop screen must receive
its own box, separate from the laptop screen.

Do not identify an entire folder grid as
one moving object if individual folders are visible.

Inspect:
- Laptop hardware
- Laptop screen
- Screen panels
- Individual folder icons
- Individual document icons
- Upload/download indicators
- Cloud graphics
- Floating objects
- Decorative circuits
- Sync indicators

Only include objects actually visible.

OBJECT CLASSIFICATION:
STATIC_STRUCTURE:
Objects that should never move.

MOVABLE_CHILD:
A small independent object that can animate.

RASTER_BAKED:
Object already integrated into source pixels.

OVERLAY_TARGET:
Static object that can receive animated overlays.

DECORATIVE:
Visual decoration, not primary action.

CRITICAL:
An object being visible does NOT mean it
can safely be moved.

A baked object must not simply be duplicated
over the original image.

MOTION PLANNING:
Select one meaningful primary process.

Prefer:
selection -> transfer -> progress -> completion.

But only use steps supported by visible evidence.

A rotating icon is not sufficient as the
primary process if more meaningful interactions
are visually supported.

Do not invent unseen interface components.

Do not move the laptop, camera or major
structural elements.

VISUAL FIDELITY:
Evaluate the two modes independently:

MODE A:
Standalone Canvas reconstruction.

MODE B:
Original image drawn onto Canvas as background,
with animated overlay layers.

Be realistic about fidelity.

A complex raster illustration cannot be
guaranteed pixel-identical when reconstructed
using Canvas drawing commands.

If the original image is required to preserve
visual detail, explicitly say so.

DURATION:
${settings.duration} seconds.

MOTION INTENSITY:
${settings.motion}.

RETURN VALID JSON ONLY.

SCHEMA:

{
  "scene_description": "",
  "visual_style": {
    "palette": [],
    "composition": "",
    "perspective": "",
    "lighting": ""
  },
  "objects": [
    {
      "id": "obj_001",
      "name": "",
      "visual_details": "",
      "bbox": {
        "x": 0,
        "y": 0,
        "w": 0,
        "h": 0
      },
      "center": {
        "x": 0,
        "y": 0
      },
      "parent_id": null,
      "classification": "STATIC_STRUCTURE",
      "baked_into_image": true,
      "can_move_without_ghosting": false,
      "masking_requirement": "",
      "confidence": "high"
    }
  ],
  "primary_process": {
    "name": "",
    "purpose": "",
    "source_object_id": "",
    "target_object_id": "",
    "functional_steps": [],
    "visual_evidence": [],
    "limitations": []
  },
  "motion_candidates": [
    {
      "object_id": "",
      "action": "",
      "functional_role": "",
      "start_state": "",
      "end_state": "",
      "safe_for_overlay": true,
      "requires_isolation": false
    }
  ],
  "static_object_ids": [],
  "layer_plan": {
    "background": [],
    "static_foreground": [],
    "animated_overlays": [],
    "masking_required": []
  },
  "fidelity": {
    "canvas_reconstruction": "",
    "original_image_overlay": "",
    "recommended_mode": "",
    "risks": []
  },
  "forbidden_changes": []
}

IMPORTANT:
No invented objects.
No unsupported movements.
No claims of guaranteed pixel-perfect
Canvas reconstruction.
`;
  }

  // =====================================================
  // V5 — VISUAL FIDELITY ENGINE
  // =====================================================

  function fidelityInstruction(settings) {
    const mode = visualMode(settings.visual);

    if (mode === 'canvas') {
      return `
VISUAL MODE: STANDALONE CANVAS RECONSTRUCTION.

The original uploaded image is a visual reference,
not an automatically available browser asset.

Reconstruct the illustration using Canvas 2D.

Preserve:
- major silhouettes
- proportions
- recognizable object details
- object counts
- relative positions
- perspective
- interface layout
- visual hierarchy
- color palette

Do not replace a complex laptop illustration
with a generic rectangle.

Do not invent a new composition.

If the reference cannot be reconstructed faithfully,
acknowledge that limitation.

Do not claim original pixels are preserved.

Draw the static scene first.

Then animate independent elements.

Avoid moving objects that cannot be reconstructed
with a clean background.
`;
    }

    return `
VISUAL MODE: ORIGINAL IMAGE + MOTION OVERLAYS.

The original uploaded image must be used
as the actual Canvas background.

IMPORTANT:
The image attached in the AI chat is not
automatically available inside HTML.

The generated HTML must either:

A. Contain the actual image as an embedded
data URI, if those bytes are available.

OR

B. Reference a real image asset supplied
alongside the HTML.

Never invent a fake base64 image.

Never silently replace the original image
with a simplified Canvas reconstruction.

Draw the original image onto Canvas
at its correct aspect ratio.

Apply animation overlays on top.

Use coordinate mapping that matches
the original image dimensions.

Do not move baked-in objects without
masking and background restoration.

If masking cannot be done reliably,
keep the object stationary and animate
a non-destructive overlay instead.

Original image fidelity is preserved only
where the actual source image remains
unchanged and correctly displayed.
`;
  }

  // =====================================================
  // V5 — MASTER PROMPT ENGINE
  // =====================================================

  function masterPrompt(settings) {
    return `
ROLE:
Senior HTML5 Canvas 2D Motion Engineer.
Precision Reference Illustrator.
Commercial Motion Graphics Director.

VERSION:
IMAGE MOTION MASTER PROMPT V5.

MISSION:
Create a professional ${settings.duration}-second
commercial motion graphic based on the uploaded image.

PRIORITY ORDER:

1. Preserve reference composition.
2. Preserve recognizable visual details.
3. Animate a meaningful functional process.
4. Maintain precise object alignment.
5. Prevent ghosting and duplicated objects.
6. Maintain timing continuity.
7. Optimize smooth playback.

REFERENCE AUTHORITY:
The uploaded original image defines appearance.

STORYBOARD AUTHORITY:
The validated motion timeline defines animation.

Do not substitute unrelated designs.

${fidelityInstruction(settings)}

TECHNICAL SPECIFICATIONS:

- One complete HTML document.
- Canvas 2D only.
- Canvas ID: stage.
- Resolution: 1920x1080.
- Aspect ratio: 16:9.
- Responsive display.
- Target playback: 60 FPS.
- Duration: ${settings.duration} seconds.
- No audio.
- No external JavaScript libraries.
- No CSS animations for visual elements.
- No logos or watermarks.
- No invented brand names.

ANIMATION ENGINE:

Use requestAnimationFrame.

Use performance.now() for time-based animation.

Use deterministic animation state.

All movement must be calculated from time,
not frame count.

Do not use random motion that changes
unpredictably between loops.

OBJECT POSITIONING:

Use normalized object coordinates
from the analysis.

Convert to Canvas positions:

pixelX = normalizedX * canvas.width
pixelY = normalizedY * canvas.height

Convert bounding box width and height
using canvas dimensions.

If the image is fitted with letterboxing
or cropping, transform the coordinates
to match that image placement.

Never confuse image coordinates
with screen-local coordinates.

PARENT AND CHILD OBJECTS:

Keep static parent objects fixed.

Animate only designated child objects.

Do not rotate the whole laptop
to animate a sync indicator.

Do not move the entire folder grid
to animate one selected folder.

FUNCTIONAL MOTION:

The primary animation should demonstrate
a coherent visible process.

Use the actual visible objects.

Prefer state transitions over
decorative animation.

When supported by the image:

- select a source object
- show process initiation
- indicate transfer or processing
- show destination response
- show completion

Do not invent unsupported interface states.

If only overlay animation is feasible,
make that limitation explicit.

LAYER AND MASKING RULES:

Do not duplicate an object already baked
into the source image.

Do not cover complex artwork with
unmatched opaque rectangles.

Use isolated object layers when available.

When object isolation is impossible,
prefer highlight, progress or
status overlays without moving the
original object.

Maintain correct occlusion and clipping.

SEAMLESS LOOP RULES:

Requested playback:
${settings.loop}

For a seamless loop:

- first and last visible states must match
- position must match
- brightness must match
- opacity must match
- rotation phase must match
- velocity must match where motion crosses
  the loop boundary

Use periodic mathematical functions
for continuous loop effects.

For continuously rotating objects,
use constant angular velocity.

Do not use ease-in-out on a continuous
rotation that crosses the loop boundary.

A one-way transfer may require
a controlled reset or nonloop ending.

Do not falsely claim seamlessness
when the states do not match.

CANVAS QUALITY RULES:

Canvas globalAlpha must remain
between 0 and 1.

Use additional glow layers rather than
alpha values above 1.

Avoid excessive bloom.

Avoid flicker.

Avoid unnecessary particle clutter.

Maintain crisp shapes and clean edges.

Keep major objects fully visible.

TIMELINE RULES:

Every storyboard beat must have:

- exact start time
- exact end time
- target object ID
- visible starting state
- visible ending state
- movement path
- easing
- layer strategy
- masking requirements
- functional purpose

Never leave unexplained timeline gaps.

Do not animate unsupported objects.

QUALITY VERIFICATION:

Before output, verify:

1. Main objects match the reference.
2. Object placement is accurate.
3. Static elements remain static.
4. Primary functional action is visible.
5. No duplicated baked objects appear.
6. No visual elements disappear unexpectedly.
7. Animation timing is coherent.
8. Loop continuity is plausible.
9. HTML is complete and executable.

OUTPUT:
Return one complete HTML document.

Do not return pseudocode.

Do not return an explanation instead of code.

Do not claim pixel-perfect fidelity
unless the original image is actually
used as the background.
`;
  }

  // =====================================================
  // V5 — STORYBOARD DIRECTOR
  // =====================================================

  function storyboardInstruction(analysis, settings) {
    return `
YOU ARE MOTION DIRECTOR V5.

Build an accurate ${settings.duration}-second
storyboard from the supplied image analysis.

The storyboard must use actual object IDs.

Never refer vaguely to "a folder"
when multiple folders are visible.

Specify which object ID is animated.

PRIMARY PROCESS:
${JSON.stringify(analysis.primary_process || {})}

OBJECT MAP:
${JSON.stringify(analysis.objects || [])}

MOTION CANDIDATES:
${JSON.stringify(analysis.motion_candidates || [])}

LAYER PLAN:
${JSON.stringify(analysis.layer_plan || {})}

VISUAL MODE:
${visualMode(settings.visual)}

MOTION INTENSITY:
${settings.motion}

LOOP PREFERENCE:
${settings.loop}

REQUIREMENTS:

1. Meaningful primary action.
2. Accurate object IDs.
3. Precise normalized coordinates.
4. No unsupported object movement.
5. Clear functional state changes.
6. No duplicated raster objects.
7. Correct masking strategy.
8. Exact timeline coverage.
9. Realistic loop continuity.

IMPORTANT:
Do not automatically select the most
dramatic movement.

Select the best movement that can
actually be implemented.

If the image has complex baked-in objects,
prefer non-destructive overlays.

But do not reduce every animation
to meaningless glow or rotation.

Choose a coherent process that has
a clear beginning, progression and result.

Each beat must include:
start_second,
end_second,
object_id,
action,
initial_state,
final_state,
position,
movement_path,
easing,
layer_strategy,
masking_strategy,
functional_result.

TIMELINE:

Start at exactly 0.

End at exactly ${settings.duration}.

No gaps.

No overlaps.

At least 3 meaningful phases.

A decorative-only storyboard is unacceptable
when a supported functional process exists.

LOOP VALIDATION:

Do not claim a seamless loop merely
because overlays fade out.

Check whether all active animations
have compatible start/end states.

For nonperiodic motion,
describe a legitimate reset or hold.

RETURN JSON ONLY:

{
  "storyboard": [
    {
      "start_second": 0,
      "end_second": 1,
      "object_id": "",
      "action": "",
      "initial_state": "",
      "final_state": "",
      "position": {
        "x": 0,
        "y": 0
      },
      "movement_path": "",
      "easing": "",
      "layer_strategy": "",
      "masking_strategy": "",
      "functional_result": ""
    }
  ],
  "animation_rules": [],
  "loop_assessment": {
    "seamless_feasible": false,
    "reason": "",
    "reset_strategy": ""
  },
  "visual_fidelity_notes": [],
  "detailed_english_prompt": ""
}

DETAILED ENGLISH PROMPT:

Write a scene-specific implementation description.

Identify exact object IDs and visual positions.

Describe every animation phase.

Describe masking and clipping.

Describe how visual fidelity is maintained.

Do not contradict the storyboard.

Do not guarantee impossible fidelity.
`;
  }

  // =====================================================
  // V5 — VALIDATION
  // =====================================================

  function validateAnalysis(analysis) {
    if (!analysis || typeof analysis !== 'object') {
      throw new Error('Analisis gambar tidak valid.');
    }

    if (!analysis.scene_description) {
      throw new Error('Deskripsi gambar tidak tersedia.');
    }

    if (
      !Array.isArray(analysis.objects) ||
      analysis.objects.length < 2
    ) {
      throw new Error('Pemetaan objek tidak lengkap.');
    }

    const ids = new Set();

    for (const object of analysis.objects) {
      if (!object.id || ids.has(object.id)) {
        throw new Error('ID objek kosong atau duplikat.');
      }

      ids.add(object.id);

      const box = object.bbox;

      if (!box) {
        throw new Error(
          `Bounding box objek ${object.id} tidak tersedia.`
        );
      }

      const values = [
        box.x,
        box.y,
        box.w,
        box.h
      ].map(Number);

      if (values.some(value => !Number.isFinite(value))) {
        throw new Error(
          `Koordinat objek ${object.id} tidak valid.`
        );
      }

      const [x, y, w, h] = values;

      if (
        x < 0 || y < 0 ||
        w <= 0 || h <= 0 ||
        x + w > 1.02 ||
        y + h > 1.02
      ) {
        throw new Error(
          `Bounding box objek ${object.id} di luar gambar.`
        );
      }
    }

    if (!analysis.primary_process?.name) {
      throw new Error('Proses animasi utama belum ditentukan.');
    }

    return ids;
  }

  function validateStoryboard(plan, duration, ids) {
    if (!Array.isArray(plan.storyboard)) {
      throw new Error('Storyboard tidak ditemukan.');
    }

    if (plan.storyboard.length < 3) {
      throw new Error('Storyboard terlalu sederhana.');
    }

    const beats = plan.storyboard;

    let previousEnd = 0;

    for (const beat of beats) {
      const start = Number(beat.start_second);
      const end = Number(beat.end_second);

      if (
        !Number.isFinite(start) ||
        !Number.isFinite(end)
      ) {
        throw new Error('Waktu storyboard tidak valid.');
      }

      if (Math.abs(start - previousEnd) > 0.05) {
        throw new Error(
          'Timeline memiliki gap atau overlap.'
        );
      }

      if (end <= start || end > duration + 0.05) {
        throw new Error('Durasi beat tidak valid.');
      }

      if (!ids.has(beat.object_id)) {
        throw new Error(
          `Storyboard menggunakan ID objek tidak dikenal: ${beat.object_id}`
        );
      }

      if (!beat.action || !beat.final_state) {
        throw new Error('Detail gerakan tidak lengkap.');
      }

      previousEnd = end;
    }

    if (Math.abs(previousEnd - duration) > 0.05) {
      throw new Error(
        'Storyboard tidak mencakup seluruh durasi.'
      );
    }

    if (
      typeof plan.detailed_english_prompt !== 'string' ||
      plan.detailed_english_prompt.length < 300
    ) {
      throw new Error('Detail Master Prompt terlalu pendek.');
    }

    return true;
  }

  function qualityWarnings(analysis, plan, settings) {
    const warnings = [];

    const mode = visualMode(settings.visual);

    if (mode === 'canvas') {
      warnings.push(
        'Standalone Canvas tidak menjamin ilustrasi identik dengan gambar Flow.'
      );
    }

    if (
      mode === 'original-image' &&
      analysis.fidelity?.original_image_overlay
    ) {
      warnings.push(
        'Mode gambar asli memerlukan aset gambar yang benar-benar tersedia saat HTML dijalankan.'
      );
    }

    if (
      settings.loop.toLowerCase().includes('seamless') &&
      plan.loop_assessment?.seamless_feasible === false
    ) {
      warnings.push(
        'Storyboard menilai seamless loop tidak sepenuhnya memungkinkan.'
      );
    }

    return warnings;
  }

  // =====================================================
  // V5 — MAIN GENERATOR
  // =====================================================

  $('im-go').onclick = async () => {
    if (state.busy) return;

    if (!state.image) {
      status('Upload gambar terlebih dahulu.');
      return;
    }

    if (!apiKey()) {
      status('Masukkan Gemini API Key.');
      return;
    }

    if (!$('im-model').value) {
      status('Pilih model Gemini terlebih dahulu.');
      return;
    }

    state.busy = true;
    $('im-go').disabled = true;

    $('im-analysis').value = '';
    $('im-output').value = '';

    try {
      const settings = getSettings();

      status(
        'Tahap 1/2: Precision Object Mapping & Visual Fidelity...'
      );

      const rawAnalysis = await generate([
        {
          text: analysisInstruction(settings)
        },
        {
          inline_data: {
            mime_type: state.mime,
            data: state.image
          }
        }
      ]);

      const analysis = parseJSON(
        rawAnalysis,
        'Precision Object Mapping'
      );

      const ids = validateAnalysis(analysis);

      status(
        'Tahap 2/2: Functional Motion & Storyboard Validation...'
      );

      const rawStoryboard = await generate([
        {
          text: storyboardInstruction(
            analysis,
            settings
          )
        }
      ]);

      const plan = parseJSON(
        rawStoryboard,
        'Motion Storyboard'
      );

      validateStoryboard(
        plan,
        settings.duration,
        ids
      );

      const warnings = qualityWarnings(
        analysis,
        plan,
        settings
      );

      const analysisOutput = {
        version: VERSION,
        settings,
        analysis,
        storyboard: plan.storyboard,
        animation_rules: plan.animation_rules,
        loop_assessment: plan.loop_assessment,
        quality_warnings: warnings
      };

      $('im-analysis').value = JSON.stringify(
        analysisOutput,
        null,
        2
      );

      const prompt = [
        masterPrompt(settings),

        '\nREFERENCE OBJECT MAP:\n',
        JSON.stringify(analysis.objects, null, 2),

        '\nREFERENCE SCENE ANALYSIS:\n',
        JSON.stringify({
          scene_description: analysis.scene_description,
          visual_style: analysis.visual_style,
          primary_process: analysis.primary_process,
          layer_plan: analysis.layer_plan,
          fidelity: analysis.fidelity,
          forbidden_changes: analysis.forbidden_changes
        }, null, 2),

        '\nEXACT MOTION STORYBOARD:\n',
        JSON.stringify(plan.storyboard, null, 2),

        '\nANIMATION RULES:\n',
        JSON.stringify(plan.animation_rules || [], null, 2),

        '\nLOOP ASSESSMENT:\n',
        JSON.stringify(plan.loop_assessment || {}, null, 2),

        '\nSCENE-SPECIFIC MOTION INSTRUCTIONS:\n',
        plan.detailed_english_prompt,

        '\nQUALITY WARNINGS:\n',
        warnings.join('\n') || 'No additional warnings.',

        '\nFINAL REQUIREMENT:\n',
        'Generate a complete executable HTML document.',
        'Preserve reference composition.',
        'Use the object map and storyboard.',
        'Do not invent missing image assets.',
        'Do not claim unverified visual fidelity.'
      ].join('\n');

      $('im-output').value = prompt;

      status(
        `Selesai! ${analysis.objects.length} objek dipetakan, ` +
        `${plan.storyboard.length} tahap animasi dibuat.`
      );

    } catch (error) {
      status(
        'Gagal: ' +
        (
          error.name === 'AbortError'
            ? 'Waktu tunggu API habis (90 detik).'
            : error.message
        )
      );

    } finally {
      state.busy = false;
      $('im-go').disabled = false;
    }
  };

  // =====================================================
  // COPY MASTER PROMPT
  // =====================================================

  $('im-copy').onclick = async () => {
    const text = $('im-output').value;

    if (!text) {
      status('Belum ada Master Prompt.');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      status('Master Prompt V5 berhasil disalin.');

    } catch {
      $('im-output').focus();
      $('im-output').select();

      status(
        'Clipboard tidak tersedia. Salin manual dari kolom prompt.'
      );
    }
  };

  // =====================================================
  // DOWNLOAD GENERATED PROMPT
  // =====================================================

  $('im-download').onclick = () => {
    const text = $('im-output').value;

    if (!text) {
      status('Belum ada Master Prompt.');
      return;
    }

    const blob = new Blob([text], {
      type: 'text/plain;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = 'image-motion-master-v5.txt';

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    status('Master Prompt V5 siap disimpan.');
  };

  status('Image Motion Generator V5 siap.');
})();
