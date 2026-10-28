/* Buildless RGB palette exports. Multi-byte binary fields are big-endian. */
'use strict';
const PaletteExports = (() => {
  function writer() {
    const bytes=[];
    const word=n=>bytes.push((n>>>8)&255,n&255);
    const long=n=>{word(n>>>16);word(n&65535);};
    const text=s=>{for(let i=0;i<s.length;i++)word(s.charCodeAt(i));word(0);};
    const float=n=>{const b=new DataView(new ArrayBuffer(4));b.setFloat32(0,n);bytes.push(...new Uint8Array(b.buffer));};
    return {bytes,word,long,text,float};
  }
  const channels=c=>[1,3,5].map(i=>parseInt(c.hex.slice(i,i+2),16));
  const label=(c,i)=>`${String(i+1).padStart(2,'0')} ${c.role} ${c.hex}`;
  const materialName=(c,i)=>`SLAB_${String(i+1).padStart(2,'0')}_${c.role.normalize('NFKD').replace(/[^a-zA-Z0-9 _-]/g,'').trim().replace(/\s+/g,'_').slice(0,45)||'Colour'}_${c.hex.slice(1)}`;

  function ase(colours) {
    const w=writer();w.bytes.push(65,83,69,70);w.word(1);w.word(0);w.long(colours.length);
    colours.forEach((c,i)=>{
      const name=label(c,i);
      w.word(1);w.long(2+(name.length+1)*2+4+12+2);
      w.word(name.length+1);w.text(name);w.bytes.push(82,71,66,32);
      channels(c).forEach(v=>w.float(v/255));w.word(2); // Normal RGB process colour.
    });
    return new Uint8Array(w.bytes);
  }
  function aco(colours) {
    const w=writer();
    for(const version of [1,2]) {
      w.word(version);w.word(colours.length);
      colours.forEach((c,i)=>{
        w.word(0);channels(c).forEach(v=>w.word(v*257));w.word(0);
        if(version===2){const name=label(c,i);w.long(name.length+1);w.text(name);}
      });
    }
    return new Uint8Array(w.bytes);
  }
  function revit(colours,seed) {
    const rows=colours.map((c,i)=>`    (${JSON.stringify(materialName(c,i))}, ${channels(c).join(', ')}),`).join('\n');
    return `# S-LAB RGB palette - run in a Dynamo for Revit Python Script node.
# Open a project, set Dynamo to Manual, paste this file into the node, then Run.
# Creates graphics materials with solid surface/cut fills; no render assets.
# Existing materials with the same names are kept. No model objects are assigned.
# Seed ${seed}
import clr
clr.AddReference('RevitAPI')
clr.AddReference('RevitServices')
from Autodesk.Revit.DB import (Material, Color, FilteredElementCollector,
    FillPatternElement, FillPatternTarget, SubTransaction)
from RevitServices.Persistence import DocumentManager
from RevitServices.Transactions import TransactionManager

doc = DocumentManager.Instance.CurrentDBDocument
if doc is None or doc.IsFamilyDocument:
    raise Exception('Open a Revit project document before running this palette.')
palette = [
${rows}
]
existing = {m.Name: m for m in FilteredElementCollector(doc).OfClass(Material)}
solid = next((p for p in FilteredElementCollector(doc).OfClass(FillPatternElement)
    if p.GetFillPattern().IsSolidFill
    and p.GetFillPattern().Target == FillPatternTarget.Drafting), None)
if solid is None:
    raise Exception('This project needs a solid drafting fill pattern.')
created, kept = [], []
TransactionManager.Instance.EnsureInTransaction(doc)
sub = SubTransaction(doc)
try:
    sub.Start()
    for name, r, g, b in palette:
        if name in existing:
            kept.append(name)
            continue
        material = doc.GetElement(Material.Create(doc, name))
        colour = Color(r, g, b)
        material.UseRenderAppearanceForShading = False
        material.Color = colour
        material.SurfaceForegroundPatternId = solid.Id
        material.SurfaceForegroundPatternColor = colour
        material.CutForegroundPatternId = solid.Id
        material.CutForegroundPatternColor = colour
        created.append(name)
    sub.Commit()
except:
    if sub.HasStarted() and not sub.HasEnded():
        sub.RollBack()
    raise
finally:
    TransactionManager.Instance.TransactionTaskDone()
    sub.Dispose()
OUT = {'created': created, 'kept': kept}
`;
  }
  function sketchup(colours,seed) {
    const rows=colours.map((c,i)=>`  [${JSON.stringify(materialName(c,i))}, ${channels(c).join(', ')}],`).join('\n');
    return `# S-LAB RGB palette - load once in desktop SketchUp's Ruby Console.
# Creates In Model materials; existing materials of the same names are kept.
# No faces are assigned. Undo reverses this import in one step.
# Seed ${seed}
palette = [
${rows}
]
model = Sketchup.active_model
model.start_operation('Import S-LAB palette', true)
begin
  palette.each do |name, r, g, b|
    next if model.materials[name]
    material = model.materials.add(name)
    material.color = Sketchup::Color.new(r, g, b)
  end
  model.commit_operation
rescue StandardError
  model.abort_operation
  raise
end
UI.messagebox('S-LAB palette ready in Materials > In Model.')
`;
  }
  return {ase,aco,revit,sketchup};
})();
