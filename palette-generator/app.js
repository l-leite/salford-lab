/* Local prototype. Only explicitly copied links retain state; no browser storage. */
'use strict';
const $ = id => document.getElementById(id);
const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initial = () => ({preset:'circulation',mode:'distinct',count:6,strength:3,hue:1,variation:0,grayscale:false,highContrast:false,custom:[],harmony:0,harmonyHue:1,harmonyValue:4,legacy:false});
const hues = [
  {name:'Rose',hex:'#D6A1AE'},{name:'Orange',hex:'#D99473'},{name:'Ochre',hex:'#DCCB92'},
  {name:'Green',hex:'#A8C09B'},{name:'Teal',hex:'#9FC5C1'},{name:'Blue',hex:'#A3B8D8'},{name:'Violet',hex:'#C1ADD3'}
];
// Stable IDs are part of the numeric seed format. Append new presets; do not reorder.
const seedPresets = ['circulation','morphology','landscape','typology','historical','climate','biodiversity','topography','geology','zoning','accessibility','landmarks','difference','programme','structure','annotation','portfolio','accommodation','portfolio-bright','portfolio-earth','portfolio-mono','materials'];
const modes = ['distinct','sequential','divergent'];
// Angles use the OKLCH hue circle. Rectangle and tetradic are related; the latter is the square variant.
const harmonies = [
  {description:'Use the colours supplied by the selected preset.',angles:[]},
  {description:'Neighbouring hues on the colour wheel create a closely related palette.',angles:[-30,0,30]},
  {description:'Two hues opposite one another create contrast.',angles:[0,180]},
  {description:'Two adjacent hues and their two opposites create two split complementary pairs.',angles:[-30,30,150,210]},
  {description:'Four hues form a rectangle: two complementary pairs with unequal spacing.',angles:[0,60,180,240]},
  {description:'One hue is paired with the two hues on either side of its opposite.',angles:[0,150,210]},
  {description:'A square tetradic scheme uses four hues spaced evenly around the wheel.',angles:[0,90,180,270]},
  {description:'Three hues spaced evenly around the wheel form a triangle.',angles:[0,120,240]}
];
const defaultHues = {circulation:1,morphology:2,landscape:3,typology:5,historical:1,climate:2,biodiversity:3,topography:3,geology:2,zoning:6,accessibility:4,landmarks:1,difference:4,programme:5,structure:1,annotation:4,portfolio:0,accommodation:5,'portfolio-bright':1,'portfolio-earth':2,'portfolio-mono':5,materials:2};
const hints = {distinct:'Different categories, with no implied order.',sequential:'A light-to-dark scale for increasing values.',divergent:'Two directions from a neutral midpoint.'};
let state = initial();
let colours = [];
const categoryCache = new Map();

function rgb(h) { return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16)); }
function hex(channels) { return '#'+channels.map(x=>Math.round(clamp(x,0,255)).toString(16).padStart(2,'0')).join('').toUpperCase(); }
function linear(x) { x/=255; return x<=.04045?x/12.92:((x+.055)/1.055)**2.4; }
function luminance(h) { const [r,g,b]=rgb(h).map(linear); return .2126*r+.7152*g+.0722*b; }

// OKLab/OKLCH: control perceived lightness and saturation independently of hue.
function lab(h) {
  const [r,g,b]=rgb(h).map(linear);
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b);
  const m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b);
  const s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];
}
function lch(h) { const [L,a,b]=lab(h); return [L,Math.hypot(a,b),Math.atan2(b,a)*180/Math.PI]; }
function fromLch(L,C,H) {
  const a=C*Math.cos(H*Math.PI/180), b=C*Math.sin(H*Math.PI/180);
  const l=(L+.3963377774*a+.2158037573*b)**3;
  const m=(L-.1055613458*a-.0638541728*b)**3;
  const s=(L-.0894841775*a-1.291485548*b)**3;
  return [4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s];
}
function gamut(L,C,H) {
  if(C<.000001){const value=255*(L**3<=.0031308?12.92*L**3:1.055*L**(3/2.4)-.055);return hex([value,value,value]);}
  let channels=fromLch(L,C,H);
  // Chroma compression preserves hue and lightness at the sRGB boundary.
  for(let i=0;i<55&&channels.some(x=>x<0||x>1);i++){C*=.92;channels=fromLch(L,C,H);}
  return hex(channels.map(x=>255*(x<=.0031308?12.92*x:1.055*Math.max(0,x)**(1/2.4)-.055)));
}
function distance(a,b) { return Math.hypot(...a.map((x,i)=>x-b[i])); }
function mix(a,b,t) {
  const values=lab(a).map((v,i)=>v+(lab(b)[i]-v)*t);
  return gamut(values[0],Math.hypot(values[1],values[2]),Math.atan2(values[2],values[1])*180/Math.PI);
}
function tone(h,strength=state.strength) {
  // The curated reference colours (including all six TMS colours) are exact at 3.
  if(strength===3)return h;
  const [L,C,H]=lch(h),step=strength-3,kind=presets[state.preset].character;
  const low=kind==='mono' ? .04 : kind ? .24 : .54,high=.985;
  return gamut(clamp(L-.03*step,low,high),kind==='mono'?0:clamp(C*(1+.11*step),0,kind==='bright'?.28:.15),H);
}

function seededRandom(seed) {
  let value=seed>>>0;
  return () => {value=(value+0x6D2B79F5)|0;let t=Math.imul(value^(value>>>15),1|value);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};
}
function variationParameters() {
  if(state.variation===0)return {hue:0,lightness:0,chroma:1};
  const random=seededRandom(state.variation);
  return {hue:state.legacy?(random()-.5)*24:random()*360,lightness:(random()-.5)*.03,chroma:.9+random()*.2};
}
function variedAnchor(h,index=0) {
  if(state.variation===0)return h;
  const [L,C,H]=lch(h),p=variationParameters(),random=seededRandom(state.variation^Math.imul(index+1,0x85EBCA6B));
  return gamut(clamp(L+p.lightness+(random()-.5)*.012,presets[state.preset].character ? .12 : .69,.95),C*p.chroma,H+p.hue+(random()-.5)*4);
}

// A versioned numeric recipe packs a 24-bit random variation and all palette controls.
// The check digits catch mistyped seeds. BigInt avoids rounding the copied number.
function paletteSeed() {
  const flags=(state.highContrast?2:0)|(state.grayscale?1:0);
  let bits=BigInt(state.variation);
  for(const [value,width]of [[seedPresets.indexOf(state.preset),5],[modes.indexOf(state.mode),2],[state.count-1,5],[state.strength-1,3],[state.hue,3]])bits=(bits<<BigInt(width))|BigInt(value);
  let body;
  if(state.custom.length){let extra=BigInt(flags?4+(state.legacy?4:0)+flags:state.legacy?1:2);for(const h of state.custom)extra=(extra<<24n)|BigInt('0x'+h.slice(1));extra=(extra<<5n)|BigInt(state.custom.length-1);body=(extra<<44n)|(3n<<42n)|bits;}
  else if(state.legacy&&!flags)body=(2n<<42n)|bits;
  else {let extra=BigInt(flags?4+(state.legacy?4:0)+flags:1);for(const value of [state.harmony,state.harmonyHue-1,state.harmonyValue-1])extra=(extra<<3n)|BigInt(value);body=(extra<<44n)|bits;}
  return String(body*97n+body%97n);
}
function decodeSeed(raw) {
  const text=String(raw).trim();if(!/^\d{1,300}$/.test(text))throw Error('Invalid seed');
  const code=BigInt(text),body=code/97n,version=Number((body>>42n)&3n);if(code%97n!==body%97n)throw Error('Invalid seed');
  const custom=[];let extra=body>>44n,legacy=version===1||version===2,harmony=0,harmonyHue=1,harmonyValue=4,flags=0;
  const readMarker=marker=>{if(marker>=5n&&marker<=11n&&marker!==8n){flags=Number(marker&3n);legacy=marker>=9n;}else if(marker!==1n&&!(version===3&&marker===2n))throw Error('Invalid seed');else legacy=version===3&&marker===1n;};
  if(version===3){const count=Number(extra&31n)+1;extra>>=5n;for(let i=0;i<count;i++){custom.unshift('#'+Number(extra&0xFFFFFFn).toString(16).padStart(6,'0').toUpperCase());extra>>=24n;}readMarker(extra);}
  else if(version===0){harmonyValue=Number(extra&7n)+1;extra>>=3n;harmonyHue=Number(extra&7n)+1;extra>>=3n;harmony=Number(extra&7n);extra>>=3n;readMarker(extra);if(harmonyHue>7||harmonyValue>7||harmony>=harmonies.length)throw Error('Invalid harmony seed');}
  else if(extra!==0n)throw Error('Invalid seed');
  let bits=body&((1n<<42n)-1n);
  const take=width=>{const value=Number(bits&((1n<<BigInt(width))-1n));bits>>=BigInt(width);return value;};
  const hue=take(3),strength=take(3)+1,count=take(5)+1,mode=take(2),preset=take(5),variation=Number(bits);
  if(hue>=hues.length||strength>7||mode>=modes.length||preset>=seedPresets.length)throw Error('Invalid seed');
  return {...initial(),preset:seedPresets[preset],mode:modes[mode],count,strength,hue,variation,custom,harmony,harmonyHue,harmonyValue,legacy,highContrast:!!(flags&2),grayscale:!!(flags&1)};
}
function loadSeed(raw) {
  try {
    state=decodeSeed(raw);render();$('seed-input').value='';$('seed-input').removeAttribute('aria-invalid');$('copy-seed').focus();toast('Seed loaded');return true;
  }catch{$('seed-input').setAttribute('aria-invalid','true');$('seed-input').focus();toast('Seed not recognised. Paste the full seed number.');return false;}
}
function randomise() {
  const values=new Uint32Array(3);crypto.getRandomValues(values);
  let next=1+values[0]%0xFFFFFF;if(next===state.variation)next=1+next%0xFFFFFF;
  state.variation=next;state.legacy=false;
  state.hue=(state.hue+1+values[1]%6)%7;
  state.harmonyHue=1+(state.harmonyHue-1+1+values[2]%6)%7;
  render();
}

function harmonyAnchors() {
  const angles=harmonies[state.harmony].angles,base=(state.harmonyHue-1)*360/7+30+variationParameters().hue;
  const count=Math.max(6,angles.length*2),L=.56+(state.harmonyValue-1)*.06-.012*(state.strength-3),C=.075+(state.strength-1)*.012;
  return Array.from({length:count},(_,i)=>gamut(clamp(L+[-.055,.055,0][Math.floor(i/angles.length)%3],.38,.98),C,base+angles[i%angles.length]));
}
function categoryPalette() {
  const cacheKey=[state.preset,state.strength,state.variation,state.legacy,state.harmony,state.harmonyHue,state.harmonyValue,state.custom.join('')].join(':');
  if(categoryCache.has(cacheKey))return categoryCache.get(cacheKey);
  const p=presets[state.preset];let selected=state.harmony?harmonyAnchors():state.custom.length?(state.legacy?[...state.custom]:state.custom.map(variedAnchor)):p.hex.map(variedAnchor).map(h=>tone(h));
  if(p.portfolio&&!state.custom.length&&!state.harmony)selected.push(...selected.map(h=>mix(h,p.character==='mono'?'#FFFFFF':'#FFFEFA',.78)));
  const anchors=[...selected];
  const used=new Set(selected), selectedLab=selected.map(lab), candidates=[];
  // Preserve the complete existing prefix. New colours are close relatives of these anchors.
  const variation=variationParameters();
  for(const anchor of anchors) {
    const [baseL,C,H]=lch(anchor);
    for(const offset of [-6,0,6])for(const lightness of [-.075,-.045,-.02,.02,.045,.075])for(const saturation of [.8,1,1.12]) {
      const adjustment=state.legacy?variation.hue*.12:(((variation.hue+180)%360)-180)*.012;
      const h=gamut(clamp(baseL+lightness+variation.lightness*.5,.025,.985),C*saturation*variation.chroma,H+offset+adjustment);
      if(!candidates.some(c=>c.hex===h))candidates.push({hex:h,lab:lab(h)});
    }
  }
  if(anchors.every(h=>lch(h)[1]<.004))for(let i=1;i<129;i++){const h=gamut(.14+.84*i/128,0,0);if(!candidates.some(c=>c.hex===h))candidates.push({hex:h,lab:lab(h)});}
  const anchorLab=anchors.map(lab);
  while(selected.length<32) {
    let best=-Infinity,winner=-1;
    candidates.forEach((c,i)=>{
      if(used.has(c.hex))return;
      const separation=Math.min(...selectedLab.map(s=>distance(s,c.lab)));
      const familyDistance=Math.min(...anchorLab.map(a=>distance(a,c.lab)));
      const score=separation-.12*familyDistance;
      if(score>best){best=score;winner=i;}
    });
    const next=candidates[winner];
    selected.push(next.hex);used.add(next.hex);selectedLab.push(next.lab);candidates.splice(winner,1);
  }
  if(categoryCache.size>=128)categoryCache.delete(categoryCache.keys().next().value);
  categoryCache.set(cacheKey,selected);
  return selected;
}
function sequential(t) {
  const p=variationParameters(),H=lch(hues[state.hue].hex)[2]+p.hue*.5;
  const hi=clamp(.975-.0025*(state.strength-1)+p.lightness,.93,.985),lo=clamp(.795-.026*(state.strength-1)+p.lightness,.60,.83);
  const L=hi+(lo-hi)*t,C=(.055+.007*state.strength)*(.2+.8*Math.sqrt(t))*p.chroma;
  return gamut(L,C,H);
}
function divergent(t) {
  const v=variationParameters(),H1=lch(hues[state.hue].hex)[2]+v.hue*.5,H2=H1+170;
  const neutral=gamut(.975,.006,90);
  const side=gamut(.83-.026*state.strength+v.lightness,(.055+.007*state.strength)*v.chroma,t<.5?H1:H2);
  return mix(neutral,side,Math.abs(2*t-1));
}
function role(i) {
  const p=presets[state.preset],metric=paletteScaleMetrics[state.preset];
  if(state.mode==='distinct')return p.roles[i]||paletteRoleExtensions[state.preset][i-p.roles.length]||`Additional colour ${i+1}`;
  if(state.mode==='sequential') {
    if(state.count===1)return `${metric} · Mid value`;
    if(p.mode==='sequential'&&state.count===p.roles.length)return p.roles[i];
    const step=Math.round(i/(state.count-1)*15),name=state.preset==='historical'?chronologyLabels[step]:`${metric} · ${relativeScaleLabels[step]}`;
    return state.count<=16?name:`${name} · ${i+1}`;
  }
  if(state.count===1||i===(state.count-1)/2)return `Neutral · ${metric}`;
  if(state.preset==='difference'&&state.count===5)return p.roles[i];
  const offset=i-(state.count-1)/2,half=Math.floor(state.count/2),rank=offset<0?half-1-i:i-Math.ceil(state.count/2);
  const degrees=['Slightly','Moderately','Clearly','Substantially','Strongly','Very strongly','Extremely','Most strongly'];
  const degree=degrees[Math.round(rank/Math.max(1,half-1)*7)],direction=offset<0?'below reference':'above reference';
  const name=state.preset==='difference'?`${degree} ${offset<0?'constrained':'favourable'}`:`${metric} · ${degree.toLowerCase()} ${direction}`;
  return state.count<=16?name:`${name} · ${i+1}`;
}
function generate() {
  const values=state.mode==='distinct'?categoryPalette().slice(0,state.count):Array.from({length:state.count},(_,i)=>{
    const t=state.count===1?.5:i/(state.count-1);
    return state.mode==='sequential'?sequential(t):divergent(t);
  });
  return values.map((h,i)=>{
    let [L,C,H]=lch(h);
    if(state.highContrast) {
      // Lift lightness gently and boost chroma for vivid colour; keep neutrals neutral.
      L+=.10*L*(1-L);
      C=C<.015?C:Math.min(.28,C*2.1+.015);
      h=gamut(L,C,H);
    }
    if(state.grayscale){const v=luminance(h),channel=255*(v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055);h=hex([channel,channel,channel]);}
    return {hex:h,role:role(i)};
  });
}

function populatePresets() {
  const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='Select a preset';placeholder.disabled=true;$('preset').append(placeholder);
  for(const group of [...new Set(Object.values(presets).map(p=>p.group))]) {
    const opt=document.createElement('optgroup');opt.label=group;
    for(const [key,p]of Object.entries(presets))if(p.group===group&&(!p.portfolio||key==='portfolio')){const el=document.createElement('option');el.value=key;el.textContent=p.portfolio?'Portfolio':p.name;opt.append(el);}
    $('preset').append(opt);
  }
}
function applyPreset(key,reset=false) {
  const p=presets[key];
  state={...initial(),preset:key,count:p.roles.length,mode:p.mode||'distinct',strength:reset?3:state.strength,hue:defaultHues[key],variation:reset?0:state.variation,grayscale:state.grayscale,highContrast:state.highContrast};
  render();
}
function render() {
  colours=generate();
  $('preset').value=presets[state.preset].portfolio?'portfolio':state.preset;$('preset').title=presets[state.preset].name;
  $('portfolio-field').hidden=!presets[state.preset].portfolio;
  document.querySelectorAll('[data-portfolio]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.portfolio===state.preset)));
  $('count').value=state.count;
  for(const [id,enabled]of [['grayscale',state.grayscale],['high-contrast',state.highContrast]]){$(id).setAttribute('aria-checked',String(enabled));$(id).querySelector('[data-toggle-state]').textContent=enabled?'On':'Off';}
  $('mode-hint').textContent=hints[state.mode];$('strength-value').textContent=`${state.strength} / 7`;
  $('palette-count').textContent=`${state.count} COLOUR${state.count===1?'':'S'}`;
  $('less').disabled=state.count===1;$('more').disabled=state.count===32;
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode)));
  document.querySelectorAll('[data-strength]').forEach(b=>{
    const step=Number(b.dataset.strength);b.setAttribute('aria-pressed',String(step===state.strength));
    const h=tone(variedAnchor(state.mode!=='distinct'?hues[state.hue].hex:presets[state.preset].hex[0]),step);
    b.style.setProperty('--tone',h);b.style.color=luminance(h)<.179?'#FFFFFF':'#000000';
  });
  $('hue-field').hidden=state.mode==='distinct';$('hue-help').hidden=state.mode!=='divergent';$('hue-label').textContent=state.mode==='divergent'?'Divergent hue pair':'Hue';
  document.querySelectorAll('[data-hue]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.hue)===state.hue)));
  const seed=paletteSeed();$('seed-value').textContent=seed;$('copy-seed').setAttribute('aria-label',`Copy palette seed ${seed}`);
  $('ribbon').innerHTML=colours.map(c=>`<button type="button" style="background:${c.hex}" data-copy="${c.hex}" title="Copy ${c.hex}" aria-label="Copy ${esc(c.role)} HEX ${c.hex}"></button>`).join('');
  $('colours').innerHTML=colours.map(c=>`<button type="button" class="colour-row" data-copy="${c.hex}" aria-label="Copy ${esc(c.role)} HEX ${c.hex}"><span class="colour-chip" style="background:${c.hex}"></span><span class="colour-data"><span class="role">${esc(c.role)}</span><span class="value-row"><span>${c.hex}</span><span class="rgb-label">${rgb(c.hex).join(' / ')}</span></span></span><span class="copy-icon" aria-hidden="true">⧉</span></button>`).join('');
  renderDiagram();renderSchedule();updateChecks();renderHarmony();
}
function renderHarmony() {
  $('harmony').value=String(state.harmony);$('harmony-controls').hidden=!state.harmony;
  $('harmony-controls').disabled=state.mode!=='distinct';
  $('harmony-description').textContent=harmonies[state.harmony].description+(state.harmony&&state.mode!=='distinct'?' Select Distinct to use this harmony.':'');
  $('harmony-hue-value').textContent=`${state.harmonyHue} / 7`;$('harmony-value-value').textContent=`${8-state.harmonyValue} / 7`;
  document.querySelectorAll('[data-harmony-hue]').forEach(b=>{const n=Number(b.dataset.harmonyHue);b.setAttribute('aria-pressed',String(n===state.harmonyHue));b.style.setProperty('--tone',gamut(.77,.09,(n-1)*360/7+30+variationParameters().hue));});
  document.querySelectorAll('[data-harmony-value]').forEach(b=>{const n=Number(b.dataset.harmonyValue);b.setAttribute('aria-pressed',String(n===state.harmonyValue));const h=gamut(.56+(n-1)*.06,.08,(state.harmonyHue-1)*360/7+30+variationParameters().hue);b.style.setProperty('--tone',h);b.style.color=luminance(h)<.179?'#FFFFFF':'#000000';});
}
function renderSchedule() {
  $('room-schedule').hidden=state.preset!=='accommodation';if(state.preset!=='accommodation')return;
  $('schedule-body').innerHTML=accommodationRooms.map((room,i)=>{const c=colours[i%colours.length];return `<tr><td><button type="button" data-copy="${c.hex}" aria-label="Copy ${esc(room.name)} HEX ${c.hex}"><i style="background:${c.hex}"></i><span class="room-number">${String(i+1).padStart(2,'0')}</span>${esc(room.name)}</button></td><td>${room.area} m²</td></tr>`;}).join('');
  $('schedule-total').textContent=`${accommodationRooms.reduce((sum,r)=>sum+r.area,0)} m²`;
}
function schematic() { return renderSchematic(state.preset,colours); }
function renderDiagram() {
  const p=presets[state.preset];
  $('drawing').innerHTML=schematic();$('diagram-title').textContent=p.name;
  const used=['topography','difference'].includes(state.preset)?state.count:Math.min(state.count,p.roles.length);
  $('diagram-caption').textContent='Graphics and labels are illustrative only'+(state.count>used?` · showing ${used} of ${state.count} colours`:'');
  $('preview-key').innerHTML=colours.map((c,i)=>`<button type="button" data-copy="${c.hex}" aria-label="Copy ${esc(c.role)} HEX ${c.hex}"><i style="background:${c.hex}"></i><span class="key-number">${String(i+1).padStart(2,'0')}</span><span>${esc(c.role)}</span></button>`).join('');
  $('purpose-note').textContent=p.note;
  $('tms-source').hidden=state.preset!=='programme';
}
function updateChecks() {
  const messages=[];
  if(state.count>12)messages.push('<p class="warning">For 13–32 categories, add labels or patterns and group related items.</p>');
  if(state.mode==='divergent'&&state.count%2===0)messages.push('<p class="warning">Use an odd number of colours for a neutral centre swatch.</p>');
  if(state.preset==='accommodation'&&state.count<accommodationRooms.length)messages.push(`<p class="warning">Use at least ${accommodationRooms.length} colours to give every room function its own colour.</p>`);
  if(state.mode==='distinct'&&state.count>1&&state.count<=12){let min=1;for(let i=0;i<colours.length;i++)for(let j=0;j<i;j++)min=Math.min(min,distance(lab(colours[i].hex),lab(colours[j].hex)));if(min<.04)messages.push('<p class="warning">Some colours are similar. Use patterns or fewer categories.</p>');}
  messages.push('<p>Use labels, outlines and patterns alongside colour.</p>');
  $('checks').innerHTML=messages.join('');
}

let toastTimer;
function toast(message) {
  $('status').textContent=message;$('status').classList.add('visible');clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>$('status').classList.remove('visible'),3000);
}
async function copy(value,message=`${value} copied`) {
  try { if(!navigator.clipboard)throw Error();await navigator.clipboard.writeText(value);toast(message); }
  catch {
    const focused=document.activeElement,ta=document.createElement('textarea');ta.value=value;ta.style.position='fixed';ta.style.top='0';
    document.body.append(ta);ta.select();const ok=document.execCommand('copy');ta.remove();focused?.focus();
    toast(ok?message:'Copy unavailable. Download the CSV instead.');
  }
}
function download(content,type,extension) {
  const blob=content instanceof Blob?content:new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');
  const seed=paletteSeed();a.href=url;a.download=`slab-${state.preset}-${state.count}-${seed.length>20?'custom':seed}.${extension}`;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),10000);toast(`${extension.toUpperCase()} downloaded`);
}
function jpg() {
  const canvas=document.createElement('canvas');canvas.width=2400;canvas.height=280+colours.length*135;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#FFFEFA';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#292D29';ctx.font='bold 48px Arial';ctx.fillText(presets[state.preset].name,80,95);
  ctx.font='25px Arial';ctx.fillText(`S—LAB / ${state.count} colours / ${state.mode} / Strength ${state.strength} of 7${state.highContrast?' / High contrast':''}${state.grayscale?' / Greyscale':''} / RGB`,80,155);
  const seed=paletteSeed();ctx.font='23px Consolas,monospace';ctx.fillText(seed.length>60?'Custom palette · complete seed included in CSV export':`Seed ${seed}`,80,198);
  colours.forEach((c,i)=>{const y=230+i*135;ctx.fillStyle=c.hex;ctx.fillRect(80,y,240,96);ctx.fillStyle='#292D29';ctx.font='30px Arial';ctx.fillText(c.role,365,y+53);ctx.font='28px Consolas,monospace';ctx.fillText(c.hex,1730,y+38);ctx.font='22px Arial';ctx.fillText(`RGB ${rgb(c.hex).join(', ')}`,1730,y+75);});
  canvas.toBlob(blob=>{if(blob)download(blob,'image/jpeg','jpg');else toast('Image export unavailable. Try CSV instead.');},'image/jpeg',.95);
}
function csv() {
  const cell=x=>'"'+String(x).replace(/"/g,'""')+'"';
  return '\uFEFF'+[['Number','Role','HEX','R','G','B','Seed'],...colours.map((c,i)=>[i+1,c.role,c.hex,...rgb(c.hex),paletteSeed()])].map(row=>row.map(cell).join(',')).join('\r\n');
}
function cad() {
  const lines=['; S-LAB pastel palette. Run with SCRIPT in desktop AutoCAD.','; Seed '+paletteSeed(),'; Named layers use RGB True Color. Set objects to ByLayer.'];
  colours.forEach((c,i)=>{
    const role=c.role.normalize('NFKD').replace(/[^a-zA-Z0-9 _-]/g,'').trim().replace(/\s+/g,'_').slice(0,45)||'Colour';
    const name=`SLAB_${String(i+1).padStart(2,'0')}_${role}`;
    lines.push('_.-LAYER','_New',name,'_Color','_Truecolor',rgb(c.hex).join(','),name,'');
  });
  return lines.join('\r\n')+'\r\n';
}
function share() {
  const u=new URL(location.href);u.searchParams.delete('variant');u.searchParams.set('s',JSON.stringify(state));
  copy(u.href,'Palette link copied');
}
function restore() {
  try {
    const raw=new URL(location.href).searchParams.get('s');if(!raw)return;
    const s=JSON.parse(raw);if(!s||typeof s!=='object'||!Object.hasOwn(presets,s.preset))throw Error();
    const n=initial();n.preset=s.preset;
    if(['distinct','sequential','divergent'].includes(s.mode))n.mode=s.mode;
    n.hue=defaultHues[n.preset];
    for(const [key,min,max]of [['count',1,32],['strength',1,7],['hue',0,6],['variation',0,0xFFFFFF],['harmony',0,7],['harmonyHue',1,7],['harmonyValue',1,7]])if(Number.isFinite(s[key]))n[key]=clamp(Math.round(s[key]),min,max);
    n.grayscale=s.grayscale===true;n.highContrast=s.highContrast===true;
    if(Array.isArray(s.custom)&&s.custom.length<=32&&s.custom.every(h=>typeof h==='string'&&/^#[0-9A-F]{6}$/i.test(h)))n.custom=s.custom.map(h=>h.toUpperCase());
    n.legacy=s.legacy===true||(!Object.hasOwn(s,'harmony')&&s.variation!==0);if(n.harmony)n.custom=[];
    state=n;
  }catch{toast('Invalid palette link. Showing the starting palette.');}
}
function setCount(n) { state.count=clamp(Math.round(Number(n)||1),1,32);render(); }
function dockPreview(open) {
  document.body.classList.toggle('preview-docked',open);$('toggle-preview').setAttribute('aria-expanded',String(open));
  if(open)$('close-preview').focus();else $('toggle-preview').focus();
}
populatePresets();
$('hue-options').innerHTML=hues.map((h,i)=>`<button type="button" data-hue="${i}" aria-pressed="false" aria-label="${h.name} hue family"><span class="hue-dot" style="background:${h.hex}"></span>${h.name}</button>`).join('');
for(const [id,attribute,name]of [['harmony-hue','harmony-hue','hue'],['harmony-value','harmony-value','value']])$(id).innerHTML=Array.from({length:7},(_,i)=>`<button type="button" data-${attribute}="${name==='value'?7-i:i+1}" aria-pressed="false" aria-label="Harmony ${name} ${i+1} of 7${name==='value'?(i===0?' · lightest':i===6?' · darkest':''):''}">${i+1}</button>`).join('');
restore();render();
$('preset').addEventListener('change',e=>applyPreset(e.target.value));
document.querySelectorAll('[data-portfolio]').forEach(b=>b.addEventListener('click',()=>applyPreset(b.dataset.portfolio,true)));
$('reset').addEventListener('click',()=>applyPreset(state.preset,true));
$('random').addEventListener('click',randomise);
$('copy-seed').addEventListener('click',()=>copy(paletteSeed(),'Seed copied'));
$('seed-form').addEventListener('submit',e=>{e.preventDefault();loadSeed($('seed-input').value);});
$('seed-input').addEventListener('input',()=>$('seed-input').removeAttribute('aria-invalid'));
$('harmony').addEventListener('change',e=>{state.harmony=Number(e.target.value);state.custom=[];state.legacy=false;if(state.harmony)state.mode='distinct';render();});
document.querySelectorAll('[data-harmony-hue]').forEach(b=>b.addEventListener('click',()=>{state.harmonyHue=Number(b.dataset.harmonyHue);state.legacy=false;render();}));
document.querySelectorAll('[data-harmony-value]').forEach(b=>b.addEventListener('click',()=>{state.harmonyValue=Number(b.dataset.harmonyValue);state.legacy=false;render();}));
$('count').addEventListener('change',e=>setCount(e.target.value));
$('less').addEventListener('click',()=>setCount(state.count-1));$('more').addEventListener('click',()=>setCount(state.count+1));
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.mode;render();}));
document.querySelectorAll('[data-strength]').forEach(b=>b.addEventListener('click',()=>{state.strength=Number(b.dataset.strength);render();}));
document.querySelectorAll('[data-hue]').forEach(b=>b.addEventListener('click',()=>{state.hue=Number(b.dataset.hue);render();}));
$('grayscale').addEventListener('click',()=>{state.grayscale=!state.grayscale;render();});
$('high-contrast').addEventListener('click',()=>{state.highContrast=!state.highContrast;render();});
document.addEventListener('click',e=>{const target=e.target.closest('[data-copy]');if(target)copy(target.dataset.copy);});
$('jpg').addEventListener('click',jpg);$('csv').addEventListener('click',()=>download(csv(),'text/csv;charset=utf-8','csv'));
$('cad').addEventListener('click',()=>download(cad(),'text/plain;charset=us-ascii','scr'));
$('indesign').addEventListener('click',()=>download(PaletteExports.ase(colours),'application/octet-stream','ase'));
$('illustrator').addEventListener('click',()=>download(PaletteExports.ase(colours),'application/octet-stream','ase'));
$('photoshop').addEventListener('click',()=>download(PaletteExports.aco(colours),'application/octet-stream','aco'));
$('revit').addEventListener('click',()=>download(PaletteExports.revit(colours,paletteSeed()),'text/plain;charset=utf-8','py'));
$('sketchup').addEventListener('click',()=>download(PaletteExports.sketchup(colours,paletteSeed()),'text/plain;charset=utf-8','rb'));
$('hex').addEventListener('click',()=>copy(colours.map(c=>c.hex).join('\n'),'All HEX values copied'));$('share').addEventListener('click',share);
$('toggle-preview').addEventListener('click',()=>dockPreview(true));$('close-preview').addEventListener('click',()=>dockPreview(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('preview-docked'))dockPreview(false);});
