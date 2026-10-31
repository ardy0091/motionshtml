'use strict';
(() => {
 const $=id=>document.getElementById(id), status=s=>$('im-status').textContent=s;
 let image=null, mime=null, busy=false;
 $('im-clear').onclick=()=>{$('im-key').value='';$('im-model').innerHTML='<option value="">Cek koneksi terlebih dahulu</option>';status('API Key dihapus dari input.');};
 $('im-file').onchange=async()=>{const f=$('im-file').files?.[0];image=null;mime=null;$('im-preview').hidden=true;if(!f)return;if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>10*1024*1024){status('File harus JPG/PNG/WebP dan maksimal 10 MB.');return;}const reader=new FileReader();reader.onload=()=>{const url=String(reader.result);image=url.split(',')[1];mime=f.type;$('im-preview').src=url;$('im-preview').hidden=false;status('Gambar siap dianalisis.');};reader.onerror=()=>status('Gagal membaca gambar.');reader.readAsDataURL(f);};
 const key=()=> $('im-key').value.trim();
 async function api(path,body){if(!key())throw Error('Masukkan Gemini API Key terlebih dahulu.');const ctrl=new AbortController(), timer=setTimeout(()=>ctrl.abort(),90000);try{const r=await fetch('https://generativelanguage.googleapis.com/v1beta/'+path,{method:body?'POST':'GET',headers:{'x-goog-api-key':key(),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:ctrl.signal});const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.error?.message||`HTTP ${r.status}`);return j;}finally{clearTimeout(timer);}}
 $('im-models').onclick=async()=>{status('Memeriksa model Gemini...');try{let models=[],token='';do{const j=await api('models?pageSize=100'+(token?'&pageToken='+encodeURIComponent(token):''));models.push(...(j.models||[]));token=j.nextPageToken||'';}while(token&&models.length<500);models=models.filter(m=>m.supportedGenerationMethods?.includes('generateContent')&&/gemini/i.test(m.name));const sel=$('im-model');sel.replaceChildren();for(const m of models){const opt=document.createElement('option');opt.value=m.name;opt.textContent=m.displayName?`${m.displayName} (${m.name})`:m.name;sel.append(opt);}status(models.length?`Koneksi berhasil. ${models.length} model ditemukan. Pilih model yang mendukung input gambar.`:'Tidak ditemukan model generateContent.');}catch(e){status('Gagal cek model: '+e.message);}};
 async function generate(parts,json=false){
  const model=$('im-model').value;
  if(!/^models\/[a-zA-Z0-9._-]+$/.test(model))throw Error('Pilih model dari hasil cek koneksi.');
  const body={contents:[{role:'user',parts}],generationConfig:{temperature:0.2,maxOutputTokens:8192,...(json?{responseMimeType:'application/json'}:{})}};
  let lastError;
  for(let attempt=0;attempt<2;attempt++){
   try{
    const j=await api(model+':generateContent',body);
    const result=(j.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('');
    if(!result)throw Error('Respons Gemini kosong atau diblokir: '+(j.promptFeedback?.blockReason||'unknown'));
    return result;
   }catch(e){lastError=e;
    const temporary=/high demand|overloaded|resource exhausted|rate limit|HTTP 429|HTTP 503|temporarily unavailable/i.test(e.message);
    if(attempt===0&&temporary){status('Server Gemini sibuk. Mencoba sekali lagi dalam 3 detik...');await new Promise(r=>setTimeout(r,3000));continue;}
    break;
   }
  }
  throw lastError;
 }
 function parseJson(raw,stage){try{return JSON.parse(raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));}catch{throw Error(stage+' mengembalikan JSON tidak valid. Silakan ulangi.');}}
 const sceneInstruction=`You are a precision visual analyst for commercial 2D technology motion graphics. The user will later supply this SAME image to an HTML Canvas code generator. Describe only what is visually present. Your job is not to make a prettier or simpler redesign. Preserve the reference's exact composition, device silhouette, perspective, relative positions, number and arrangement of recognizable objects, palette, decorative shapes, UI subdivisions, and key details. Distinguish visible facts from uncertain interpretation. NEVER invent labels, controls, logos, or interactions that are not supported by the image.
For each visible object record a concise distinctive appearance, relative position (normalized approximate x,y and bounding region if feasible), depth/layer, static/movable status, and interaction possibilities. Identify an unambiguous PRIMARY ACTION that conveys the illustrated process. Prefer a maximum of 1 primary motion and 1-2 restrained secondary effects. Do NOT animate the entire device, camera, all decorative objects, or unrelated objects. When the image is too complex for a faithful Canvas reconstruction, flag that clearly. Return JSON ONLY with keys: scene_description (string), main_objects (array of objects with name, visual_details, position, must_remain_static), supporting_objects (same structure), motion_candidates (array of objects with object, visual_reason, start_state, end_state, direction, path, easing), visual_fidelity_risks (array of strings), primary_action (string), static_elements (array of strings), forbidden_changes (array of strings), fidelity_feasibility (string).`;
 const master=(duration,motion,loop,visual)=>`ROLE: Senior HTML5 Canvas 2D motion engineer and precision reference illustrator.\nMISSION: Reproduce the uploaded reference as faithfully as possible, then animate ONLY the explicitly described meaningful actions. The reference image MUST also be uploaded to the HTML-generating AI; this prompt alone is not a substitute for that image.\n\nNON-NEGOTIABLE VISUAL RULES:\n- Before coding, identify every major visible object's silhouette, proportions, position, color, perspective, UI layout, and layered relationship. Keep those details recognizable in EVERY frame.\n- The original image is the visual authority. The animation plan is the motion authority. Do not simplify complex devices into generic cards, plain rectangles, icons, or placeholder boxes. Do not add new scenery, labels, brands, or unrelated objects.\n- Do not move the camera, entire laptop/phone/monitor, screen bezel, or major static objects. Avoid random float, bounce, zoom, rotation, excessive glow, or simultaneous motion of all elements.\n- Primary action must be unmistakably visible at its specified time. Follow exact object identity, direction, path, timing, layering, masking/occlusion, and final state. Secondary effects must not distract.\n- If moving an object already painted into a static image, prevent double images: use a properly isolated moving layer or carefully reconstruct the background under it. Do not simply paint a duplicate on top of the original.\n- At each stage, preserve scene geometry; do not substitute a new visual design.\n\nSETTINGS: ${duration}-second animation; intensity ${motion}; playback ${loop}. Use the storyboard's time intervals exactly. At 0 seconds, show the complete scene, not a blank canvas.\nTECHNICAL: Output ONE complete runnable HTML document only. One canvas id="stage"; 1920x1080 internal resolution, responsive 16:9 display; Canvas 2D only; deterministic time-based animation using performance.now() and requestAnimationFrame, target 60fps. Scale coordinates with canvas.width and canvas.height. No external libraries, network, audio, CSS-based visual animation, logos or watermarks.\nVISUAL MODE: ${visual==='canvas'?'Standalone Canvas reconstruction. The uploaded chat image is NOT automatically an HTML runtime asset. Rebuild visible elements with detailed Canvas shapes, layered paths, and gradients, retaining key details. If faithful reconstruction is infeasible, do not claim it is pixel-perfect.':'Original image background with transparent Canvas motion overlays. Embed the actual image bytes as a data URI inside the delivered HTML OR explicitly require a locally provided image asset. A chat attachment alone is NOT available to browser runtime. Do not fake the background or invent a missing asset. Any moving element baked into the reference must be masked or isolated to avoid ghosting.'}\n\nQUALITY CHECK BEFORE OUTPUT: Does the composition match the reference? Are the main objects still recognizable? Does the primary action clearly happen? Are static objects stationary? Is the transition logically continuous? Does the loop/reset avoid visible popping? Fix any issue before output.\n\n`;
 function validatePlan(plan,duration,analysis){
  if(!Array.isArray(plan.storyboard)||!plan.storyboard.length||typeof plan.detailed_english_prompt!=='string'||plan.detailed_english_prompt.length<400)throw Error('Storyboard atau prompt AI terlalu pendek/tidak lengkap.');
  const beats=plan.storyboard;
  let prev=0;
  for(const beat of beats){
   const a=Number(beat.start_second),b=Number(beat.end_second);
   if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||b<=a||b>duration+0.05||a>prev+0.15)throw Error('Timeline AI tidak konsisten. Coba Generate ulang.');
   prev=Math.max(prev,b);
  }
  if(prev<duration-0.15)throw Error('Storyboard AI belum mencakup seluruh durasi.');
  if(!analysis.primary_action)throw Error('Analisis AI belum menentukan gerakan utama.');
 }
 $('im-go').onclick=async()=>{
  if(busy)return;
  if(!image){status('Upload gambar terlebih dahulu.');return;}
  if(!key()||!$('im-model').value){status('Isi API Key dan cek model terlebih dahulu.');return;}
  busy=true;$('im-go').disabled=true;
  try{
   const d=+$('im-duration').value,m=$('im-motion').value,l=$('im-loop').value,v=$('im-visual').value;
   status('Tahap 1/2: Mengidentifikasi objek dan gerakan utama...');
   const raw=await generate([{text:sceneInstruction},{inline_data:{mime_type:mime,data:image}}],true);
   const analysis=parseJson(raw,'Analisis gambar');
   if(!analysis.scene_description||!Array.isArray(analysis.main_objects)||!analysis.main_objects.length||!analysis.primary_action)throw Error('Analisis objek tidak lengkap. Coba generate ulang.');
   status('Tahap 2/2: Membuat dan memvalidasi storyboard spesifik...');
   const second=`You are a meticulous motion storyboard director. Work ONLY from the supplied grounded image analysis. Create a ${d}-second ${m} animation, loop preference ${l}. Do not invent unseen objects or simplify their geometry. Use EXACTLY ONE clear primary motion process (${analysis.primary_action}) and at most TWO subtle secondary effects. Explicitly describe the START/END visual states, relative location, motion path (including curves/waypoints if appropriate), timing, easing, layering, masking, and visual continuity for each beat. Keep stationary elements stationary. Include a setup, unmistakable action, result/confirmation, and reset/hold if looping. Avoid generic phrases like "animate naturally", "objects move", or "add some particles". Do not move entire device or camera. Cover time 0 through ${d} with chronologically ordered, non-overlapping beats. No temporal gaps. If an object is already visible in the image, specify how it is hidden/isolated before moving so no duplicate appears.\nReturn JSON ONLY: {"storyboard":[{"start_second":0,"end_second":1,"object":"specific visible object","initial_position":"relative location","final_position":"relative location","movement":"precise action or hold","path":"exact route or stationary","easing":"specific easing","visual_change":"visible change","interaction":"specific relationship","final_state":"exact resulting appearance"}],"animation_rules":["concrete constraint"],"detailed_english_prompt":"at least 700 words of image-specific English instructions identifying visible shapes, layout, palette, fixed elements, exact timed beats, how the main action looks, occlusion, masking, and smooth reset. Include NO unsupported objects. Do not contradict the storyboard."}. The timeline MUST end at ${d}.\nIMAGE ANALYSIS:\n${JSON.stringify(analysis)}`;
   const secondRaw=await generate([{text:second}],true);
   const plan=parseJson(secondRaw,'Storyboard');
   validatePlan(plan,d,analysis);
   $('im-analysis').value=JSON.stringify({analysis,storyboard:plan.storyboard,animation_rules:plan.animation_rules},null,2);
   $('im-output').value=master(d,m,l,v)+'REFERENCE ANALYSIS (VISIBLE FACTS):\n'+JSON.stringify(analysis,null,2)+'\n\nDETAILED SCENE-SPECIFIC ANIMATION INSTRUCTIONS:\n'+plan.detailed_english_prompt+'\n\nEXACT TIMELINE (AUTHORITATIVE):\n'+JSON.stringify(plan.storyboard,null,2)+'\n\nFINAL INSTRUCTION: Deliver full executable HTML code, not a concept illustration or pseudocode. Do not claim the output is identical to the reference if it is not.';
   status('Selesai! Periksa analisis dan storyboard, lalu salin prompt. Upload juga gambar asli ke Gemini pembuat HTML.');
  }catch(e){status('Gagal: '+(e.name==='AbortError'?'Waktu tunggu API habis (90 detik). Coba model lain.':e.message));}
  finally{busy=false;$('im-go').disabled=false;}
 };
 $('im-copy').onclick=async()=>{const t=$('im-output').value;if(!t)return status('Belum ada prompt.');try{await navigator.clipboard.writeText(t);status('Prompt berhasil disalin.');}catch{ $('im-output').focus();$('im-output').select();status('Salin manual dari kolom prompt (clipboard tidak tersedia).');}};
 $('im-download').onclick=()=>{const t=$('im-output').value;if(!t)return status('Belum ada prompt.');const u=URL.createObjectURL(new Blob([t],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='image-motion-prompt.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
})();
