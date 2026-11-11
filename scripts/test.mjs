import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
for(const path of ['dist/index.html','dist/en/index.html']){
  const html=await readFile(path,'utf8');
  assert.match(html,/<html lang=/);
  assert.match(html,/Crucible/);
  assert.match(html,/Kanbanize SDK/);
  assert.match(html,/first-backend-challange/);
  assert.match(html,/href="#contact"/);
  assert.match(html,/data-github-activity="true"/);
  assert.doesNotMatch(html, /%%[A-Z_]+%%/);
}
const js=await readFile('dist/assets/main.js','utf8');
assert.match(js,/renderActivity/);
const data=JSON.parse(await readFile('dist/data/github-activity.json','utf8'));
assert.equal(data.username,'darcivieira');
console.log('PASS: bilingual pages, project content, controls and data contract');
