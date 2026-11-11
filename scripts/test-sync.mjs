import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const directory=await mkdtemp(join(tmpdir(),'portfolio-contributions-'));
try {
  await mkdir(join(directory,'content'));await mkdir(join(directory,'public/data'),{recursive:true});
  await writeFile(join(directory,'content/site.json'),JSON.stringify({identity:{github:'test'}}));
  const mock=`globalThis.fetch=async (value,options)=>{
    const now=new Date();now.setUTCHours(0,0,0,0);
    if(value.endsWith('/graphql')){
      const query=JSON.parse(options.body).query;
      if(query.includes('repository{')||query.includes('title'))throw Error('Private detail requested');
      const contributionDays=Array.from({length:30},(_,index)=>{const date=new Date(now);date.setUTCDate(date.getUTCDate()-29+index);return {date:date.toISOString().slice(0,10),contributionCount:index+1};});
      return new Response(JSON.stringify({data:{user:{contributionsCollection:{restrictedContributionsCount:400,contributionCalendar:{totalContributions:465,weeks:[{contributionDays}]},privateRepository:'DO-NOT-PUBLISH'}}}}));
    }
    if(options.headers.Authorization)throw Error('Public events received credentials');
    const page=new URL(value).searchParams.get('page');
    const item={id:page,public:true,type:'PullRequestEvent',created_at:new Date().toISOString(),repo:{name:'test/public'},payload:{action:'closed',pull_request:{title:'Public PR',merged:true,html_url:'https://github.com/test/public/pull/1'}}};
    const events=[item,{...item,id:'private',public:false,repo:{name:'DO-NOT-PUBLISH'}}];
    return new Response(JSON.stringify(events),{headers:page==='1'?{link:'<https://api.github.com/next>; rel="next"'}:{}});
  };`;
  const script=new URL('./sync-github.mjs',import.meta.url).href;
  const run=source=>spawnSync(process.execPath,['--input-type=module','--eval',source+`await import(${JSON.stringify(script)});`],{cwd:directory,env:{...process.env,CONTRIBUTIONS_TOKEN:'fixture-only'},encoding:'utf8'});
  const result=run(mock);assert.equal(result.status,0,result.stderr);
  const path=join(directory,'public/data/github-activity.json');const raw=await readFile(path,'utf8');const data=JSON.parse(raw);
  assert.equal(data.contributions.total,465);assert.equal(data.contributions.restricted,400);assert.equal(data.contributions.activeDays,30);assert.equal(data.contributions.days.length,30);
  assert.equal(data.events.length,2);assert.equal(data.events[0].action,'merged');assert.doesNotMatch(raw,/DO-NOT-PUBLISH/);
  const failed=run("globalThis.fetch=async()=>new Response('{}',{status:503});");
  assert.notEqual(failed.status,0);assert.equal(await readFile(path,'utf8'),raw);
  console.log('PASS: profile totals, private-data exclusion, public event pagination and snapshot preservation');
} finally {await rm(directory,{recursive:true,force:true});}
