/* One conventional schematic per preset. Geometry is illustrative, not surveyed data. */
'use strict';
let terrainCache;
function terrainGeometry() {
  if(terrainCache)return terrainCache;
  // Two asymmetric hills and a connecting ridge; all isolines sample the same field.
  const height=(u,v)=>{const a=(u-.65+.055*Math.sin(v*9))/.235,b=(v-.34)/.29,c=(u-.25)/.22,d=(v-.73+.035*Math.sin(u*12))/.25,e=(v-(.78-.65*u+.04*Math.sin(u*11)))/.14,f=(u-.5)/.52;return Math.exp(-(a*a+b*b))+.73*Math.exp(-(c*c+d*d))+.22*Math.exp(-e*e)*Math.exp(-f*f);};
  const nx=86,ny=52,values=[];let low=Infinity,high=-Infinity;
  for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++){const h=height(x/nx,y/ny);values.push(h);low=Math.min(low,h);high=Math.max(high,h);}
  const scale=v=>(v-low)/(high-low),point=(x,y)=>[35+x*435/nx,32+y*250/ny];
  const lines=[];
  for(let k=1;k<=13;k++) {
    const level=k/14;let d='';
    for(let y=0;y<ny;y++)for(let x=0;x<nx;x++) {
      const h=[values[y*(nx+1)+x],values[y*(nx+1)+x+1],values[(y+1)*(nx+1)+x+1],values[(y+1)*(nx+1)+x]].map(scale);
      const corners=[point(x,y),point(x+1,y),point(x+1,y+1),point(x,y+1)],edges=[];
      for(let e=0;e<4;e++){const j=(e+1)%4;if((h[e]>=level)!==(h[j]>=level)){const t=(level-h[e])/(h[j]-h[e]);edges.push({e,p:corners[e].map((v,a)=>v+(corners[j][a]-v)*t)});}}
      const segment=(a,b)=>{d+=`M${a.map(v=>v.toFixed(2)).join(' ')}L${b.map(v=>v.toFixed(2)).join(' ')}`;};
      if(edges.length===2)segment(edges[0].p,edges[1].p);
      if(edges.length===4){const mask=h.reduce((sum,v,i)=>sum+(v>=level?1<<i:0),0),centre=h.reduce((a,b)=>a+b,0)/4>=level;if((mask===5)===centre){segment(edges[0].p,edges[1].p);segment(edges[2].p,edges[3].p);}else{segment(edges[0].p,edges[3].p);segment(edges[1].p,edges[2].p);}}
    }
    lines.push({d,major:k%3===0});
  }
  const cells=[];for(let y=0;y<22;y++)for(let x=0;x<36;x++)cells.push({x:35+x*435/36,y:32+y*250/22,value:Math.max(0,Math.min(1,scale(height((x+.5)/36,(y+.5)/22))))});
  terrainCache={lines,cells};return terrainCache;
}
function renderSchematic(key, palette, greyscale = false) {
  const paper = '#F8F7F2', ink = '#424A42', context = '#E4E3DB';
  const escapeText = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const colour = i => palette[i % palette.length].hex;
  const paint = (i, attribute = 'fill') => `${attribute}="${colour(i)}" data-copy="${colour(i)}"`;
  const label = (x,y,value,size=10,extra='') => `<text x="${x}" y="${y}" fill="${ink}" font-size="${size}" ${extra}>${escapeText(value)}</text>`;
  const marker = (i,x,y) => `<g data-copy="${colour(i)}"><circle cx="${x}" cy="${y}" r="11" fill="${paper}" stroke="${colour(i)}" stroke-width="2"/>${label(x,y+3,String(i%palette.length+1).padStart(2,'0'),8,'text-anchor="middle"')}</g>`;
  const rect = (x,y,w,h,i,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${paint(i)} ${extra}/>`;
  const path = (d,i,width=4,extra='') => `<path d="${d}" fill="none" ${paint(i,'stroke')} stroke-width="${width}" ${extra}/>`;
  const neutral = (x,y,w,h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${context}"/>`;
  const north = `<path d="M480 55V30l-4 8m4-8 4 8" fill="none" stroke="${ink}" stroke-width="1"/>${label(480,23,'N',9,'text-anchor="middle"')}`;
  const mapFrame = `<rect x="28" y="26" width="464" height="292" fill="none" stroke="${context}" stroke-width="1"/>`;
  const baseBlocks = () => [[56,55,76,52],[155,55,80,52],[264,55,66,52],[367,55,76,52],[56,155,76,61],[159,155,76,61],[275,155,55,61],[367,155,76,61]].map(b=>neutral(...b)).join('');
  const renderers = {
    circulation() {
      let s = baseBlocks();
      s += path('M28 132H492',0,16) + `<path d="M28 132H492" fill="none" stroke="${ink}" stroke-width=".6" stroke-dasharray="11 8"/>`;
      s += path('M253 26V250',1,9);
      s += `<path d="M52 242H440" fill="none" stroke="${ink}" stroke-opacity=".24" stroke-width="5"/>` + path('M52 242H440',2,3.5,'stroke-dasharray="7 5"');
      s += path('M342 38V220H440',3,4,'stroke-dasharray="2 4"');
      s += path('M35 286H480M35 291H480',4,2);
      for(let x=45;x<480;x+=17)s+=path(`M${x} 282V295`,4,1.5);
      s += `<circle cx="253" cy="132" r="11" ${paint(5)} stroke="${paper}" stroke-width="2"/>`;
      return s+marker(0,75,132)+marker(1,253,65)+marker(2,110,242)+marker(3,342,182)+marker(4,413,288)+marker(5,285,132)+north;
    },
    morphology() {
      let s = `<path d="M28 141H462M251 30V293M29 242H251" fill="none" stroke="${context}" stroke-width="13"/>`;
      // Continuous street frontage and a shared courtyard, rather than isolated icons.
      s+=`<path d="M48 44H223V123H48Z M68 62V105H204V62Z" ${paint(0)} fill-rule="evenodd" stroke="${ink}" stroke-opacity=".22" stroke-width=".7"/>`;
      s+=`<path d="M106 44V62M166 44V62M106 105V123M166 105V123M48 84H68M204 84H223" stroke="${paper}" stroke-width="1.3"/>`;
      for(let i=0;i<6;i++) {
        const x=282+i*28;
        s+=rect(x,45,24,31,1)+rect(x,92,24,31,1);
        s+=`<path d="M${x-2} 36v94" stroke="${ink}" stroke-opacity=".12" stroke-width=".6"/>`;
      }
      for(const x of [49,110,171]) {
        s+=`<rect x="${x}" y="163" width="48" height="66" fill="none" stroke="${ink}" stroke-opacity=".2" stroke-width=".7"/>`;
        s+=rect(x+8,175,31,29,2)+`<path d="M${x+24} 205v24" stroke="${ink}" stroke-opacity=".22" stroke-width="1.8"/>`;
      }
      s+=rect(283,163,165,64,3,'stroke="#424A4235" stroke-width=".8"');
      for(let x=306;x<448;x+=24)s+=`<path d="M${x} 163v64" stroke="${paper}" stroke-width="1"/>`;
      s+=rect(48,257,175,38,4)+`<path d="M48 283Q130 263 223 281" fill="none" stroke="${paper}" stroke-width="3"/>`;
      for(const x of [66,86,190,209])s+=`<circle cx="${x}" cy="268" r="5" fill="none" stroke="${ink}" stroke-opacity=".25" stroke-width=".6"/>`;
      s+=path('M29 323Q170 296 299 317T479 305',5,18);
      return s+marker(0,135,84)+marker(1,359,84)+marker(2,134,187)+marker(3,365,196)+marker(4,139,278)+marker(5,301,317)+north;
    },
    landscape() {
      let s=rect(42,42,407,256,2)+rect(55,53,159,102,1)+rect(232,202,204,83,4);
      s+=`<path d="M55 175Q90 151 130 173T200 231Q161 264 104 254T55 175Z" ${paint(3)}/>`;
      for(const[x,y]of [[246,71],[280,64],[314,81],[352,62],[389,82],[260,112],[299,122],[342,118],[389,120]])s+=`<circle cx="${x}" cy="${y}" r="18" ${paint(0)} stroke="${paper}" stroke-width="2"/>`;
      s+=`<path d="M50 167H220V298M220 165H449" fill="none" stroke="${paper}" stroke-width="10"/>`;
      s+=`<circle cx="329" cy="242" r="31" ${paint(5)}/><circle cx="329" cy="242" r="20" fill="none" stroke="${ink}" stroke-width=".7"/>`;
      for(let x=67;x<200;x+=16)for(let y=64;y<145;y+=18)s+=`<path d="M${x} ${y}l3 6 3-6" stroke="${ink}" stroke-opacity=".28" fill="none" stroke-width=".7"/>`;
      return s+marker(0,321,90)+marker(1,132,102)+marker(2,175,278)+marker(3,116,211)+marker(4,417,265)+marker(5,329,242)+north;
    },
    typology() {
      let s=`<path d="M28 171H465M248 34V311" stroke="${context}" stroke-width="17"/>`;
      const buildings=[[57,57,155,73,0],[281,57,70,73,1],[369,57,70,73,2],[57,209,155,73,3],[281,209,70,73,4],[369,209,70,73,5]];
      buildings.forEach(([x,y,w,h,i])=>{s+=rect(x,y,w,h,i,'stroke="#424A4230" stroke-width=".8"');});
      s+=`<path d="M109 57V130M161 57V130M57 246H212" fill="none" stroke="${paper}" stroke-width="3"/>`;
      buildings.forEach(([x,y,w,h,i])=>{s+=marker(i,x+w/2,y+h/2);});
      return s+north;
    },
    historical() {
      let s='';
      const forms=[[44,41,395,258,4],[80,71,323,199,3],[116,102,251,137,2],[154,125,175,91,1],[201,146,83,49,0]];
      forms.forEach(([x,y,w,h,i])=>{s+=rect(x,y,w,h,i,`stroke="${paper}" stroke-width="3"`);s+=marker(i,x+17,y+17);});
      s+=`<path d="M30 321H453" stroke="${ink}" stroke-width=".7"/>`+label(31,340,'Earlier',10)+label(453,340,'Later',10,'text-anchor="end"');
      return s+north;
    },
    climate() {
      let s=`<path d="M88 280A172 172 0 0 1 432 280" fill="none" ${paint(0,'stroke')} stroke-width="5"/><path d="M133 280A127 127 0 0 1 387 280" fill="none" ${paint(1,'stroke')} stroke-width="3" stroke-dasharray="6 4"/>`;
      s+=`<circle cx="260" cy="108" r="13" ${paint(0)}/><path d="M260 135L231 208H289Z" ${paint(2)} fill-opacity=".6"/>`;
      s+=`<rect x="217" y="208" width="86" height="68" fill="${context}" stroke="${ink}" stroke-width="1.4"/>`+path('M217 208H303',5,5);
      for(let i=0;i<3;i++){const y=51+i*24;s+=path(`M50 ${y}H151l-9-5m9 5-9 5`,3,2.5);}
      s+=`<path d="M226 280L201 307H318L294 280Z" ${paint(4)} fill-opacity=".65"/>`;
      return s+marker(0,397,177)+marker(1,359,219)+marker(2,260,178)+marker(3,100,75)+marker(4,260,292)+marker(5,309,207)+north+label(260,331,'S',10,'text-anchor="middle"');
    },
    biodiversity() {
      const wood='M42 42H266C280 73 253 102 220 112C174 127 190 160 146 169C108 177 88 131 42 148Z';
      const wet='M327 71C375 39 447 61 454 109C463 164 417 180 377 166C334 150 292 108 327 71Z';
      const restore='M309 214C345 187 385 205 420 192C461 175 474 232 453 267C425 311 366 284 331 302C298 320 278 268 309 214Z';
      let s=rect(36,36,430,274,1)+`<defs><clipPath id="woodland"><path d="${wood}"/></clipPath><clipPath id="restoration"><path d="${restore}"/></clipPath></defs>`;
      s+=`<path d="${wood}" ${paint(0)}/><path d="${wet}" ${paint(2)}/><path d="${restore}" ${paint(5)}/>`;
      s+=`<path d="M42 219C106 183 134 229 185 218C233 207 242 147 283 150C323 152 307 202 351 210" fill="none" ${paint(3,'stroke')} stroke-width="29"/>`;
      s+=`<path d="M36 186C99 151 134 199 178 183C220 168 226 113 270 117C300 120 296 170 339 183C374 194 430 177 467 164" fill="none" stroke="${paper}" stroke-width="8"/>`;
      s+=`<path d="M272 37V95H319M249 310V257H294" fill="none" stroke="${paper}" stroke-width="8"/>`;
      s+='<g clip-path="url(#woodland)">';for(let y=49;y<174;y+=19)for(let x=50;x<283;x+=21)s+=`<circle cx="${x+(y%2?6:0)}" cy="${y}" r="6.5" fill="none" stroke="${ink}" stroke-opacity=".2" stroke-width=".65"/>`;s+='</g>';
      s+='<g clip-path="url(#restoration)">';for(let x=286;x<481;x+=12)s+=`<path d="M${x} 316l48-137" stroke="${ink}" stroke-opacity=".17" stroke-width=".7"/>`;s+='</g>';
      s+=`<path d="M64 265C78 239 112 254 119 277C124 296 89 309 71 293Z M157 264C174 240 203 256 204 279C204 301 168 305 158 289Z" ${paint(4)} stroke="${paper}" stroke-width="3"/>`;
      return s+marker(0,131,92)+marker(1,257,212)+marker(2,390,111)+marker(3,161,217)+marker(4,92,276)+marker(5,379,250)+north;
    },
    topography() {
      const terrain=terrainGeometry(),channels=palette.map(c=>[1,3,5].map(i=>parseInt(c.hex.slice(i,i+2),16)));
      const fill=value=>{const t=value*(palette.length-1),a=Math.floor(t),b=Math.min(a+1,palette.length-1),f=t-a;return 'rgb('+channels[a].map((v,i)=>Math.round(v+(channels[b][i]-v)*f)).join(',')+')';};
      let s=`<defs><filter id="terrain-soft"><feGaussianBlur stdDeviation="3.5"/></filter><linearGradient id="terrain-key">${palette.map((c,i)=>`<stop offset="${palette.length===1?0:i/(palette.length-1)}" stop-color="${c.hex}"/>`).join('')}</linearGradient><clipPath id="terrain-clip"><rect x="35" y="32" width="435" height="250"/></clipPath></defs><g clip-path="url(#terrain-clip)"><g filter="url(#terrain-soft)">`;
      terrain.cells.forEach(c=>{s+=`<rect x="${c.x.toFixed(2)}" y="${c.y.toFixed(2)}" width="14" height="14" fill="${fill(c.value)}"/>`;});s+='</g>';
      terrain.lines.forEach(line=>{s+=`<path class="contour" d="${line.d}" fill="none" stroke="${ink}" stroke-width="${line.major?1.1:.6}" stroke-opacity=".55"/>`;});
      return s+`</g>${label(310,118,'HIGH',8,'text-anchor="middle"')}${label(141,214,'HIGH',8,'text-anchor="middle"')}${label(60,266,'LOW',8)}<rect x="65" y="309" width="363" height="10" fill="url(#terrain-key)"/>${label(65,338,'Lower elevation',9)}${label(428,338,'Higher elevation',9,'text-anchor="end"')}`;
    },
    geology() {
      let s='';
      const edges=['M40 60Q145 75 250 55T470 65','M40 102Q155 111 260 99T470 108','M40 145Q160 153 265 143T470 154','M40 190Q150 181 267 196T470 199','M40 235Q153 216 273 237T470 245','M40 277Q169 256 275 283T470 286'];
      for(let i=0;i<6;i++)s+=`<path d="${edges[i]}L470 313H40Z" ${paint(i)}/>`;
      edges.forEach(d=>s+=`<path d="${d}" fill="none" stroke="${ink}" stroke-width=".8" stroke-opacity=".45"/>`);
      for(let i=0;i<6;i++)s+=marker(i,438,85+i*43);
      for(let x=61;x<380;x+=23){s+=`<path d="M${x} 168h8M${x} 176h8" stroke="${ink}" stroke-opacity=".25" stroke-width=".8"/>`;s+=`<circle cx="${x}" cy="259" r="1.3" fill="${ink}" fill-opacity=".3"/>`;}
      return s+label(41,39,'GROUND SECTION',9)+label(40,337,'Material types · illustrative strata',9);
    },
    zoning() {
      let s=`<path d="M28 167H466M245 30V313" stroke="${context}" stroke-width="17"/>`;
      [[48,48,174,95,0],[269,48,84,95,1],[366,48,81,95,2],[48,191,77,103,3],[140,191,82,103,4],[269,191,178,103,5]].forEach(([x,y,w,h,i])=>{s+=rect(x,y,w,h,i);s+=marker(i,x+w/2,y+h/2);});
      s+=`<path d="M36 35H460V307H36Z" fill="none" stroke="${ink}" stroke-width="1.2" stroke-dasharray="6 4"/>`;
      return s+north;
    },
    accessibility() {
      let s=neutral(270,64,189,162)+`<path d="M270 64H459V226H270" fill="none" stroke="${ink}" stroke-opacity=".35" stroke-width="1"/>`+label(365,151,'BUILDING',10,'text-anchor="middle"');
      s+=`<path d="M35 299H470" stroke="${context}" stroke-width="35"/><path d="M35 299H470" stroke="${ink}" stroke-opacity=".3" stroke-width=".7" stroke-dasharray="10 6"/>`;
      s+=rect(126,280,34,38,2);for(let y=284;y<317;y+=7)s+=`<path d="M128 ${y}h30" stroke="${paper}" stroke-width="3.5"/>`;
      s+=`<path d="M143 341V325M143 274V250H200V130H270" fill="none" stroke="${ink}" stroke-opacity=".15" stroke-width="10"/>`+path('M143 341V325M143 274V250H200V130H270',0,7);
      s+=path('M143 250H327V226',1,4,'stroke-dasharray="6 4"');
      for(let y=228;y<250;y+=4)s+=`<path d="M316 ${y}h22" stroke="${ink}" stroke-width=".8"/>`;
      s+=path('M244 177V235',3,5);for(let y=180;y<235;y+=13)s+=path(`M239 ${y}h10`,3,1.2);
      s+=`<path d="M200 173H176" fill="none" ${paint(0,'stroke')} stroke-width="3"/>`+rect(157,163,27,5,5)+path('M161 168v10M181 168v10',5,2.5);
      s+=`<circle cx="270" cy="130" r="8" ${paint(4)} stroke="${ink}" stroke-width="1"/><circle cx="327" cy="226" r="6" ${paint(4)} stroke="${ink}" stroke-width=".8"/>`;
      s+=path('M200 206v-18l-4 7m4-7 4 7M236 130h17l-7-4m7 4-7 4',0,1.5);
      return s+marker(0,200,217)+marker(1,289,250)+marker(2,143,299)+marker(3,244,202)+marker(4,290,114)+marker(5,163,147)+north;
    },
    landmarks() {
      const routes='M33 278L240 226L458 113M129 37L134 183L240 226L419 307M34 183H134L173 307';
      let s=`<rect x="29" y="30" width="439" height="282" fill="#F0EFE8"/>`;
      // Closed urban blocks, terraces and a courtyard give the landmarks a legible setting.
      const blocks=['M43 46H105V119H85V68H43Z','M158 45H226V101H158Z','M248 46H309V87H248Z',
        'M48 219L107 205L119 237L58 252Z','M181 124H223V184L164 164V145H181Z',
        'M57 290L128 271L140 305H57Z','M190 267L226 255L276 292V306H190Z',
        'M288 227L339 203L389 242L342 269Z','M384 179L443 149V216L420 230Z',
        'M361 287L388 269L447 305H393Z'];
      blocks.forEach(d=>{s+=`<path d="${d}" ${paint(5)} stroke="${ink}" stroke-opacity=".22" stroke-width=".7"/>`;});
      for(let x=46;x<103;x+=14)s+=`<path d="M${x} 47V67" stroke="${ink}" stroke-opacity=".23" stroke-width=".6"/>`;
      s+=`<path d="${routes}" fill="none" stroke="${context}" stroke-width="22"/><path d="${routes}" fill="none" stroke="${paper}" stroke-width="17"/>`;
      s+=`<path d="M37 277L240 226L454 115" fill="none" stroke="${ink}" stroke-opacity=".24" stroke-dasharray="4 5" stroke-width=".8"/>`;
      // An open sightline starts at the meeting point and terminates at the civic tower.
      s+=`<path class="view-corridor" d="M240 226L360 62L427 108Z" ${paint(4)} fill-opacity=".32"/>`;
      s+=path('M240 226L390 87',4,1.4,'stroke-dasharray="5 4"')+`<path d="M382 90L390 87L386 95" fill="none" ${paint(4,'stroke')} stroke-width="1.4"/>`;
      // Primary landmark: tower, podium and entrance steps. Secondary: a courtyard hall.
      s+=`<path d="M363 96H418V117H363Z" ${paint(0)} stroke="${ink}" stroke-width="1.2"/><rect x="374" y="63" width="33" height="43" ${paint(0)} stroke="${ink}" stroke-width="1.8"/><path d="M379 68H402V100H379Z M371 121H410M375 125H406" fill="none" stroke="${ink}" stroke-opacity=".6" stroke-width=".7"/>`;
      s+=`<path d="M80 131H119V143H145V168H80Z" ${paint(1)} stroke="${ink}" stroke-width="1.1"/><path d="M88 138H112V160H88Z M121 149H138V160H121Z" fill="none" stroke="${ink}" stroke-opacity=".5" stroke-width=".7"/>`;
      // Nodes occupy actual route intersections; ring size expresses their different importance.
      s+=`<circle class="major-node" cx="240" cy="226" r="27" fill="${paper}" ${paint(2,'stroke')} stroke-width="2"/><circle cx="240" cy="226" r="20" ${paint(2)} stroke="${ink}" stroke-width=".8"/><circle class="local-node" cx="134" cy="183" r="13" ${paint(3)} stroke="${ink}" stroke-width=".8"/>`;
      s+=marker(0,390,83)+marker(1,112,152)+marker(2,240,226)+marker(3,134,183)+marker(4,309,148)+marker(5,277,66);
      s+=`<path d="M356 46H391V60M76 113H102V128M270 248L290 263H324M104 184H72" fill="none" stroke="${ink}" stroke-width=".65"/>`;
      s+=label(317,42,'CIVIC TOWER',9)+label(44,108,'LOCAL HALL',9)+label(293,276,'MEETING POINT',9)+label(43,199,'JUNCTION',8);
      return s+north+label(34,338,'Footprints = landmarks · circles = nodes · cone = view',9);
    },
    difference() {
      let s='';const n=palette.length;const w=406/n;
      for(let i=0;i<n;i++){s+=rect(50+i*w,72,w,185,i,`stroke="${paper}" stroke-width="2"`);}
      s+=`<path d="M50 283H456M50 283l7-4m-7 4 7 4M456 283l-7-4m7 4-7 4" fill="none" stroke="${ink}" stroke-width=".9"/>`;
      s+=label(50,310,'Constraint',10)+label(456,310,'Opportunity',10,'text-anchor="end"');
      if(n%2)s+=`<path d="M253 57V270" stroke="${ink}" stroke-width="1" stroke-dasharray="4 4"/>${label(253,44,'NEUTRAL',9,'text-anchor="middle"')}`;
      return s+label(50,340,'Relative assessment · define criteria in your key',9);
    },
    programme() {
      let s=path('M174 117H346',3,13)+path('M352 127L270 257',4,13)+path('M168 127L250 257',5,13);
      [[148,110,0,'THINK'],[372,110,1,'MAKE'],[260,272,2,'SHOW']].forEach(([x,y,i,t])=>{s+=`<circle cx="${x}" cy="${y}" r="52" ${paint(i)} stroke="${ink}" stroke-opacity=".25" stroke-width=".8"/>${label(x,y+4,t,13,'text-anchor="middle" letter-spacing="1"')}`;});
      return s+marker(3,260,110)+marker(4,322,192)+marker(5,198,192)+label(260,345,'Programme relationships',10,'text-anchor="middle"');
    },
    accommodation() {
      let s='';
      accommodationRooms.forEach((room,i)=>{s+=rect(room.x,room.y,room.w,room.h,i);});
      s+=`<rect x="46" y="44" width="428" height="256" fill="none" stroke="${ink}" stroke-width="4"/><path d="M179 48V151M325 48V151M50 151H470M50 189H470M169 189V296M255 189V296M349 189V296M409 189V296M409 243H470" fill="none" stroke="${ink}" stroke-width="1.4"/>`;
      // Door gaps and swing arcs distinguish the floor plan from a colour chart.
      for(const x of [108,242,385])s+=`<path d="M${x} 151h17" stroke="${paper}" stroke-width="4"/><path d="M${x} 151v-17a17 17 0 0 1 17 17" fill="none" stroke="${ink}" stroke-width=".65"/>`;
      for(const x of [91,207,290,369,430])s+=`<path d="M${x} 189h15" stroke="${paper}" stroke-width="4"/><path d="M${x} 189v15a15 15 0 0 0 15-15" fill="none" stroke="${ink}" stroke-width=".65"/>`;
      s+=`<path d="M409 267v15M208 300h21" stroke="${paper}" stroke-width="6"/><path d="M208 300v-21a21 21 0 0 1 21 21" fill="none" stroke="${ink}" stroke-width=".7"/>`;
      const labels=[['01 · Quiet studio',114,91,10],['02 · Workshop',252,91,10],['03 · Seminar',398,91,10],['04 · Exhibition',109,234,9],['05 · Lobby',212,234,9],['06 · Kitchen',302,234,8],['07',379,228,9],['Office',379,242,8],['08 · WC',440,212,8],['09 · Store',440,268,8],['10 · Circulation',260,174,9]];
      labels.forEach(([t,x,y,size])=>{s+=label(x,y,t,size,'text-anchor="middle"');});
      for(const [i,x,y]of [[0,114,107],[1,252,107],[2,398,107],[3,109,250],[4,212,250],[5,302,250],[6,379,257],[7,440,227],[8,440,283]])s+=label(x,y,`${accommodationRooms[i].area} m²`,8,'text-anchor="middle"');
      s+=`<path d="M218 326V307l-4 7m4-7 4 7" fill="none" stroke="${ink}" stroke-width="1"/>`+label(218,341,'ENTRANCE',8,'text-anchor="middle"');
      return s;
    },
    structure() {
      let s=rect(42,282,427,25,5)+rect(119,100,271,180,4)+rect(107,90,12,190,2)+rect(390,90,12,190,2);
      s+=rect(116,96,13,187,0)+rect(367,96,13,187,0)+rect(107,87,295,15,0);
      s+=rect(129,184,238,9,1)+rect(161,102,5,82,1)+rect(327,102,5,82,1);
      s+=`<path d="M196 281v-12h15v-13h15v-13h15v-13h15v-13h15v-13h15v-13" fill="none" ${paint(3,'stroke')} stroke-width="5"/>`;
      s+=`<path d="M42 308H469" stroke="${ink}" stroke-width="1.5"/>`;
      return s+marker(0,122,143)+marker(1,290,188)+marker(2,398,240)+marker(3,243,241)+marker(4,247,143)+marker(5,431,294)+label(43,340,'STRUCTURAL SECTION',9);
    },
    annotation() {
      let s=`<path d="M154 102H359V257H154Z M254 102V199H359" fill="none" stroke="${ink}" stroke-width="2"/><path d="M254 223v34m0-34a34 34 0 0 1 34 34" fill="none" stroke="${ink}" stroke-width=".8"/>`;
      s+=rect(39,42,173,31,0)+label(49,62,'01  Main annotation',11);
      s+=`<path d="M156 75L175 102" fill="none" stroke="${ink}" stroke-width=".8"/>`;
      s+=rect(377,140,111,29,1)+label(385,159,'02  Note',10)+`<path d="M377 155H359" stroke="${ink}" stroke-width=".8"/>`;
      s+=path('M154 294H359',2,8)+`<path d="M154 279V305M359 279V305M154 294H359m-4-4 8 8M150 290l8 8" fill="none" stroke="${ink}" stroke-width=".8"/>`+label(257,316,'03  Dimension',10,'text-anchor="middle"');
      s+=rect(282,37,151,31,3)+label(291,57,'04  Revised area',10)+`<path d="M359 71V96" stroke="${ink}" stroke-width=".8"/>`;
      s+=`<rect x="278" y="116" width="67" height="67" rx="8" fill="none" ${paint(3,'stroke')} stroke-width="3" stroke-dasharray="5 4"/>`;
      return s;
    },
    materials() {
      let s='';
      for(let i=0;i<9;i++) {
        const x=47+(i%3)*151,y=33+Math.floor(i/3)*106,w=125,h=69;
        s+=`<defs><clipPath id="material-${i}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs>`+rect(x,y,w,h,i,`stroke="${ink}" stroke-opacity=".25" stroke-width=".7"`);
        let texture='';
        if(i===0)for(let k=0;k<7;k++)texture+=`<path d="M${x-5} ${y+8+k*10}q38-10 63 0t75-1"/>`;
        if(i===1)for(let k=0;k<6;k++){texture+=`<path d="M${x} ${y+k*14}h${w}"/>`;for(let j=0;j<5;j++)texture+=`<path d="M${x+j*34+(k%2?17:0)} ${y+k*14}v14"/>`;}
        if(i===2)for(let k=0;k<6;k++)texture+=`<path d="M${x-25+k*38} ${y+h}l70-${h}"/>`;
        if(i===3)for(let k=0;k<16;k++)texture+=`<path d="M${x-70+k*17} ${y+h}l80-${h}"/>`;
        if(i===4||i===8)for(let k=0;k<32;k++){const px=x+((k*37)%123),py=y+((k*23)%67);texture+=i===4?`<circle cx="${px}" cy="${py}" r=".9"/>`:`<path d="M${px} ${py}l4 2-2 3Z"/>`;}
        if(i===5){for(let k=1;k<5;k++)texture+=`<path d="M${x+k*25} ${y}v${h}"/>`;for(let k=1;k<3;k++)texture+=`<path d="M${x} ${y+k*23}h${w}"/>`;}
        if(i===6)texture+=`<path d="M${x} ${y+27}l35-7 28 13 33-15 30 12M${x+35} ${y+20}l4-21M${x+63} ${y+33}l-9 36M${x+96} ${y+18}l4-18M${x} ${y+52}l29 8 25-5M${x+78} ${y+37}l30 13 20-7"/>`;
        if(i===7)for(let k=0;k<5;k++)texture+=`<path d="M${x} ${y+9+k*14}q31-7 62 0t65 0"/>`;
        s+=`<g clip-path="url(#material-${i})" fill="none" stroke="${ink}" stroke-width=".65" stroke-opacity=".35">${texture}</g>`+label(x,y+86,`${String(i+1).padStart(2,'0')} · ${presets.materials.roles[i]}`,10);
      }
      return s;
    },
    portfolio() {
      let s=`<rect x="59" y="27" width="399" height="303" fill="#FFFEFA" stroke="${context}"/>`;
      s+=rect(79,47,22,4,0)+rect(79,69,225,23,3)+label(85,85,'Workspace / Site and programme',12);
      s+=rect(79,111,221,154,5)+`<path d="M111 220L178 161L266 188V243H111Z" ${paint(1)}/><path d="M178 161V222L111 220M178 222L266 243" fill="none" stroke="${paper}" stroke-width="1.5"/>`;
      s+=rect(321,112,112,7,0)+rect(317,128,120,110,4)+label(324,145,'Site strategy',11);
      for(let i=0;i<8;i++)s+=`<path d="M324 ${159+i*9}h${i%3===2?75:108}" stroke="${ink}" stroke-opacity=".28" stroke-width="1.5"/>`;
      s+=path('M79 271H300',2,3);
      s+=label(79,287,'Programme, access and surrounding context.',8)+label(432,314,'01',8);
      return s+marker(0,94,48)+marker(1,190,212)+marker(2,287,271)+marker(3,315,79)+marker(4,431,133)+marker(5,282,250);
    }
  };
  const shapes = renderers[presets[key].portfolio?'portfolio':key]();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 360" role="img" aria-labelledby="diagram-title-svg diagram-desc-svg"><title id="diagram-title-svg">${escapeText(presets[key].name)}</title><desc id="diagram-desc-svg">Schematic ${escapeText(presets[key].name.toLowerCase())} diagram. Numbered symbols refer to the palette key. Illustrative geometry, not measured site data.</desc><defs><filter id="greyscale"><feColorMatrix type="saturate" values="0"/></filter></defs><rect width="520" height="360" fill="${paper}"/><g font-family="Segoe UI,Arial,sans-serif" stroke-linejoin="round"${greyscale?' filter="url(#greyscale)"':''}>${shapes}</g></svg>`;
}
