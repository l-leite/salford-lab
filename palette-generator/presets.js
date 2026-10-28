/* Curated pastel anchors. TMS colours match tms-guide/index.html. */
'use strict';
const presets = {
  circulation: {
    name:'Circulation & networks',group:'Site analysis',
    roles:['Main road','Local street','Quiet path','Cycle route','Rail / transit','Movement node'],
    hex:['#D99473','#E2BC87','#EDE2B4','#A3C6B7','#A4AEC8','#C7A1B0'],
    note:'The main road uses a stronger orange and a heavier line. The quiet path uses pale yellow and a fine dashed line. Keep this hierarchy consistent across drawings.'
  },
  morphology: {
    name:'Urban morphology',group:'Site analysis',
    roles:['Perimeter block','Terrace','Detached form','Large footprint','Open space','Water'],
    hex:['#CBA18D','#DBC1A0','#E7D7BA','#B8A9A1','#BCCAB1','#ADC9CE'],
    note:'Compare the grain of courtyard blocks, terraces, detached buildings and larger footprints. Building edges, plot divisions and street frontage help explain morphology as much as colour.'
  },
  landscape: {
    name:'Landscape & public space',group:'Site analysis',
    roles:['Tree canopy','Meadow','Lawn','Water','Hard landscape','Gathering space'],
    hex:['#9AB69B','#C7CEA2','#D5DDC1','#A7C8CF','#D3CBB9','#D8B09C'],
    note:'Separate landscape types with colour and texture. Use a warmer accent for gathering spaces and a consistent blue for water.'
  },
  typology: {
    name:'Building typology',group:'Site analysis',
    roles:['Housing','Education','Workspace','Retail / leisure','Civic / cultural','Infrastructure'],
    hex:['#D6AAA1','#DDD0A3','#A6C4CC','#C4AFCA','#B8C9A9','#C8C4BA'],
    note:'Building uses are categories. Give them similar visual weight rather than implying that one use is more important.'
  },
  historical: {
    name:'Historical development',group:'Site analysis',mode:'sequential',
    roles:['Earliest fabric','Early expansion','Industrial period','Later additions','Recent development'],
    hex:['#EEE4D6','#E0CDB6','#D1B498','#BE9A7E','#A98269'],
    note:'A light-to-dark scale shows a sequence. Replace period names with dates in your final drawing; darker means later here, not more valuable.'
  },
  climate: {
    name:'Sun path & wind',group:'Site analysis',
    roles:['Summer sun','Winter sun','Solar gain','Prevailing wind','Shelter','Exposed edge'],
    hex:['#E9D49C','#DDBB91','#D7A598','#A1BFCC','#BDCFBF','#B8ACC9'],
    note:'Use warm colours for sun and cool colours for wind. Add directions, dates and labels to the final drawing. The preview is schematic, not a solar or wind calculation.'
  },
  biodiversity: {
    name:'Biodiversity & habitats',group:'Site analysis',
    roles:['Woodland','Grassland','Wetland','Habitat corridor','Fragmented habitat','Opportunity area'],
    hex:['#9EB99E','#CDDBB8','#A4C6C3','#D9CEA1','#C5B0A3','#C6A8B4'],
    note:'Interlocking planting masses, curved paths and a wetland form an abstract garden plan inspired by Roberto Burle Marx. Colours distinguish habitats; patterns and corridors explain their relationships. This is an illustrative composition, not ecological survey data.'
  },
  topography: {
    name:'Topography / slope',group:'Site analysis',mode:'sequential',
    roles:['Low / flat','Gentle','Moderate','Steep','High / very steep'],
    hex:['#EBEFE0','#D4DEC1','#BCCBA3','#A2B58B','#879F75'],
    note:'Contours follow a continuous model of two hills and the saddle between them. Closely spaced lines indicate steeper ground. This scale represents relative elevation; add real heights and units to a measured drawing.'
  },
  geology: {
    name:'Soil & geology',group:'Site analysis',
    roles:['Alluvium','Clay','Sand','Gravel','Sandstone','Made ground'],
    hex:['#DFD0AC','#D0A99B','#EBDBB9','#B9B8AE','#D1B799','#B8ACC2'],
    note:'Use separate colours and hatches for material types. This is an illustrative section, not a formal geological survey colour convention.'
  },
  zoning: {
    name:'Zoning & land use',group:'Site analysis',
    roles:['Residential','Mixed use','Employment','Community','Green space','Utilities'],
    hex:['#E3D0A0','#D0ACBD','#ACC2D6','#C2B5D0','#B8CBA8','#C9C7BB'],
    note:'Use discrete colours for land uses. Draw boundaries clearly, and check any official planning legend before using these colours in a formal map.'
  },
  accessibility: {
    name:'Access & barriers',group:'Site analysis',
    roles:['Step-free route','Stepped route','Crossing','Barrier','Entrance','Rest point'],
    hex:['#9BBFB9','#DFCA9F','#BEB0D0','#D6A6A0','#A4B8D3','#C6D2B2'],
    note:'Follow the solid step-free route from the crossing to the entrance. A separate dashed route uses steps. Barriers, entrances and rest points have different symbols as well as colours. Verify access and gradients on site.'
  },
  landmarks: {
    name:'Landmarks & nodes',group:'Site analysis',
    roles:['Primary landmark','Secondary landmark','Major node','Local node','View corridor','Context'],
    hex:['#D7A08D','#DFC1A8','#B9A7CA','#D0C2D8','#A9C6CD','#DEDACD'],
    note:'A civic tower and a neighbourhood hall anchor a connected street network. Large and small circles mark a major meeting point and a local junction. The view cone runs from the meeting point towards the tower. Landmark footprints, node size and numbered callouts distinguish meanings without relying on colour alone. This is an invented urban example.'
  },
  difference: {
    name:'Opportunity & constraint',group:'Site analysis',mode:'divergent',
    roles:['Strong constraint','Some constraint','Neutral','Some opportunity','Strong opportunity'],
    hex:['#D5A28D','#E7CABC','#F1EFE6','#BDD4D0','#94BAB5'],
    note:'A divergent palette needs a meaningful midpoint. Label what constraint, neutral and opportunity mean in your analysis; use an odd count for a centre swatch.'
  },
  programme: {
    name:'THINK / MAKE / SHOW',group:'Architectural diagrams',
    roles:['THINK','MAKE','SHOW','THINK + MAKE','MAKE + SHOW','THINK + SHOW'],
    hex:['#9CAFD9','#DFA39B','#A7C6AC','#C4A7D2','#E3D39C','#9FCBD0'],
    note:'The three main modes and their overlaps use the guide’s colour key. Reset restores strength 3 and the exact guide colours; Random offers variations.'
  },
  accommodation: {
    name:'Programme plan / room functions',group:'Architectural diagrams',
    roles:['Quiet studio','Workshop','Seminar room','Exhibition','Lobby','Kitchen / social','Office','Accessible WC','Store','Circulation'],
    hex:['#A7BBD6','#D7AD98','#C7B5D4','#D9C991','#B4CFBF','#DCB5C0','#B7C7A3','#ACCACD','#CCC2B2','#E6E0D0'],
    note:'Each room function has its own colour, matched to the schedule of accommodation. Keep circulation legible and reuse this key across floor plans. Areas are illustrative net areas, not a dimensioned building proposal.'
  },
  structure: {
    name:'Structure & spatial hierarchy',group:'Architectural diagrams',
    roles:['Primary frame','Secondary frame','Envelope','Circulation','Occupied space','Context'],
    hex:['#C79D8D','#D9BDA4','#DCD1B6','#A7C3C6','#D4DCC8','#E2DFD5'],
    note:'The frame uses the strongest colour and line weight. Keep occupied space, the envelope and surrounding context lighter.'
  },
  annotation: {
    name:'Annotation hierarchy',group:'Drawing & portfolio',
    roles:['Main note','Secondary note','Dimensions','Revision / focus'],
    hex:['#ACC0C7','#CBD6D4','#DDDCCF','#D7AA99'],
    note:'Use pastel colour for note backgrounds and highlights. Keep small text and dimension labels dark so they remain legible.'
  },
  portfolio: {
    name:'Portfolio · pastel',group:'Drawing & portfolio',portfolio:true,
    roles:['Primary · headings / focus','Secondary · diagrams','Third · detail / emphasis','Primary · light fill','Secondary · light fill','Third · light fill'],
    hex:['#D3A194','#A4BCC3','#C4B6A0'],
    note:'Three main colours each have a lighter supporting tone. Use the main colours for emphasis and diagrams, and their tints for backgrounds and larger fields. Keep small body text dark.'
  },
  'portfolio-bright': {
    name:'Portfolio · bright contrast',group:'Drawing & portfolio',portfolio:true,character:'bright',
    roles:['Orange · main accent','Blue · diagrams / links','Yellow · emphasis','Orange · light fill','Blue · light fill','Yellow · light fill'],
    hex:['#EA4C2A','#3157CB','#EDBA26'],
    note:'Use three stronger accents sparingly, balanced by their pale supporting tones. Large areas of white space keep the hierarchy clear; check small text contrast separately.'
  },
  'portfolio-earth': {
    name:'Portfolio · earth',group:'Drawing & portfolio',portfolio:true,character:'earth',
    roles:['Terracotta · main accent','Olive · diagrams','Umber · detail','Terracotta · light fill','Olive · light fill','Umber · light fill'],
    hex:['#A7664B','#727953','#85705D'],
    note:'Terracotta, olive and umber share a restrained material character. Their lighter companions work as background fields, leaving the main colours for the content that needs attention.'
  },
  'portfolio-mono': {
    name:'Portfolio · black & white',group:'Drawing & portfolio',portfolio:true,character:'mono',
    roles:['Black · primary','Grey · secondary','Light grey · detail','Black · light fill','Grey · light fill','Light grey · light fill'],
    hex:['#171717','#707070','#B4B4B4'],
    note:'Three neutral values each have a lighter supporting tone. Separate elements through line weight, pattern, spacing and typography as well as value.'
  },
  materials: {
    name:'Material schedule',group:'Architectural diagrams',
    roles:['Wood','Brick','Glass','Steel','Soil','Tile','Stone','Plastic','Concrete'],
    hex:['#D3B38B','#CC9B8B','#ACCBD0','#B0B9C1','#BEAC8E','#C2BDCE','#C9C6B7','#B4CAB6','#D6D3C8'],
    note:'Pair material colours with a labelled texture or hatch. These samples distinguish material families; they do not represent a product specification, physical texture or measured finish.'
  }
};

// Extra suggestions preserve the reference roles, default counts and existing colour indices.
// All 22 presets have 16 distinct-mode labels; these are adaptable drawing keys, not site facts.
const portfolioRoleExtensions=['Body text','Caption text','Page background','Panel background','Rule / divider','Drawing outline','Image frame','Section marker','Link / cross-reference','Revision highlight'];
const paletteRoleExtensions = {
  circulation:['Bus route','Tram corridor','Service access','Emergency access','Pedestrian crossing','Shared surface','Arrival point','Cycle parking','Vehicle parking','Loading bay'],
  morphology:['Courtyard','Urban square','Street frontage','Rear plot','Alley / passage','Tower form','Slab block','Industrial shed','Fine-grain infill','Vacant plot'],
  landscape:['Rain garden','Bioswale','Community garden','Play space','Sports ground','Orchard','Hedgerow','Planted roof','Seating area','Permeable paving'],
  typology:['Healthcare','Hospitality','Sports / recreation','Worship','Transport hub','Storage / logistics','Workshop / industry','Student accommodation','Mixed-use building','Vacant building'],
  historical:['Pre-industrial fabric','Early industrial fabric','Factory expansion','Railway-era development','Warehouse development','Interwar additions','Post-war rebuilding','Late twentieth-century fabric','Adaptive reuse','Infill development','Proposed development'],
  climate:['Morning sun','Afternoon sun','Evening sun','Summer shade','Winter shade','Wind channel','Windbreak','Reflected glare','Cool refuge','Heat accumulation'],
  biodiversity:['Scrub','Hedgerow habitat','Pond','Stream margin','Wildflower verge','Deadwood habitat','Pollinator planting','Nesting area','Green roof habitat','Ecological buffer'],
  topography:['Valley floor','Floodplain','Lower terrace','Upper terrace','Gentle hillside','Upper hillside','Shoulder','Ridge','Saddle','Summit','Plateau'],
  geology:['Silt','Peat','Limestone','Shale','Chalk','Granite','Basalt','Mudstone','Bedrock','Topsoil'],
  zoning:['Town centre','Education zone','Health campus','Industrial zone','Transport corridor','Conservation area','Flood management zone','Recreation zone','Agricultural land','Future development area'],
  accessibility:['Ramp','Lift','Accessible WC','Accessible parking','Drop-off point','Tactile paving','Hearing assistance','Wayfinding sign','Controlled gate','Uneven surface'],
  landmarks:['Gateway','District edge','Civic square','Transit interchange','Bridge landmark','Public artwork','Neighbourhood centre','Wayfinding point','Terminating vista','Local meeting place'],
  difference:['Noise exposure','Flood exposure','Contamination risk','Access conflict','Heritage sensitivity','Overlooking risk','Solar potential','Reuse potential','Habitat enhancement','Public-space potential','Connection potential'],
  programme:['Research','Reflection','Individual study','Discussion','Prototyping','Assembly','Testing','Review','Presentation','Shared support'],
  accommodation:['Meeting room','Reading room','Digital fabrication','Plant room','Changing room','Outdoor work area'],
  structure:['Load-bearing wall','Column','Beam','Floor slab','Roof structure','Core / bracing','Foundation','Threshold','Void / atrium','External terrace'],
  annotation:['Drawing title','Subtitle','Section reference','Detail reference','Level marker','Grid reference','Material tag','Room tag','Keynote','Figure caption','Legend text','Source / credit'],
  portfolio:portfolioRoleExtensions,
  'portfolio-bright':portfolioRoleExtensions,
  'portfolio-earth':portfolioRoleExtensions,
  'portfolio-mono':portfolioRoleExtensions,
  materials:['Cork','Lime plaster','Earth block','Bamboo','Insulation','Fabric','Recycled composite']
};
// Scale modes describe relative quantities instead of implying that categories have an order.
const paletteScaleMetrics = {
  circulation:'Movement intensity',morphology:'Built density',landscape:'Planting density',typology:'Use intensity',
  historical:'Development sequence',climate:'Exposure',biodiversity:'Habitat quality',topography:'Relative elevation',
  geology:'Layer depth',zoning:'Development intensity',accessibility:'Access difficulty',landmarks:'Visual prominence',
  difference:'Relative assessment',programme:'Activity intensity',accommodation:'Occupancy intensity',structure:'Structural emphasis',
  annotation:'Annotation emphasis',portfolio:'Visual emphasis','portfolio-bright':'Visual emphasis','portfolio-earth':'Visual emphasis','portfolio-mono':'Visual emphasis',materials:'Material emphasis'
};
const relativeScaleLabels=['Lowest','Very low','Low','Lower','Lower-middle','Below middle','Just below middle','Lower midpoint','Upper midpoint','Just above middle','Above middle','Upper-middle','High','Very high','Near maximum','Highest'];
const chronologyLabels=['Earliest surviving fabric','First expansion','Early additions','Established settlement','Pre-industrial growth','Early industrial growth','Industrial expansion','Mature industrial fabric','Later industrial additions','Early modern additions','Mid-century additions','Later twentieth-century fabric','Recent reuse','Recent infill','Latest completed work','Proposed development'];

// Shared room data keeps the schematic plan and accommodation schedule consistent.
const accommodationRooms = [
  {name:'Quiet studio',area:110,x:50,y:48,w:128,h:102},
  {name:'Workshop',area:150,x:180,y:48,w:144,h:102},
  {name:'Seminar room',area:90,x:326,y:48,w:144,h:102},
  {name:'Exhibition',area:90,x:50,y:190,w:118,h:106},
  {name:'Lobby',area:40,x:170,y:190,w:84,h:106},
  {name:'Kitchen / social',area:45,x:256,y:190,w:92,h:106},
  {name:'Office',area:20,x:350,y:190,w:58,h:106},
  {name:'Accessible WC',area:20,x:410,y:190,w:60,h:52},
  {name:'Store',area:15,x:410,y:244,w:60,h:52},
  {name:'Circulation',area:70,x:50,y:152,w:420,h:36}
];
