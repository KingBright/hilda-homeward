/** Dependency-free build: readable modules in, offline HTML out. */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
const root=resolve(import.meta.dirname,'..');
async function files(dir, extension) {
  const result=[];
  for(const entry of await readdir(dir,{withFileTypes:true})) {
    const path=resolve(dir,entry.name);
    if(entry.isDirectory()) result.push(...await files(path,extension));
    else if(path.endsWith(extension)) result.push(path);
  }
  return result.sort();
}
const all=await files(resolve(root,'src'),'.js');
const loader=resolve(root,'src/engine/modules.js'), bootstrap=resolve(root,'src/bootstrap.js');
const paths=[loader,...all.filter(p=>p!==loader&&p!==bootstrap),bootstrap];
const styles=await files(resolve(root,'src/ui'),'.css');
const css=(await Promise.all(styles.map(p=>readFile(p,'utf8')))).join('\n');
const scripts=(await Promise.all(paths.map(async p=>'/* '+relative(root,p)+' */\n'+await readFile(p,'utf8')))).join('\n');
const template=await readFile(resolve(root,'src/template.html'),'utf8');
if(!template.includes('<!-- STYLES -->')||!template.includes('<!-- SCRIPTS -->')) throw Error('Missing build slots');
const html=template.replace('<!-- STYLES -->',`<style>\n${css}\n</style>`).replace('<!-- SCRIPTS -->',`<script>\n${scripts.replaceAll('</script','<\\/script')}\n</script>`);
for(const name of ['index.html','hilda-homeward-v2.html']) await writeFile(resolve(root,name),html);
const dev=template.replace('<!-- STYLES -->',styles.map(p=>`<link rel="stylesheet" href="./${relative(root,p)}">`).join('\n')).replace('<!-- SCRIPTS -->',paths.map(p=>`<script defer src="./${relative(root,p)}"></script>`).join('\n'));
await writeFile(resolve(root,'dev.html'),dev);
const manifest={version:JSON.parse(await readFile(resolve(root,'package.json'),'utf8')).version,modules:paths.map(p=>relative(root,p)),bytes:Buffer.byteLength(html),sha256:createHash('sha256').update(html).digest('hex')};
await writeFile(resolve(root,'build-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Built ${paths.length} source modules, ${(manifest.bytes/1024).toFixed(1)} KiB, sha256 ${manifest.sha256}`);
