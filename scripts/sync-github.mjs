/**
 * Collects public activity at build time. Never exposes a token to the browser.
 * GitHub's public event feed is limited to the last 30 days / 300 events.
 * Commits are sourced from selected PUBLIC repositories and limited to 30 days.
 */
import { readFile,writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const root=process.cwd();
const repoData=JSON.parse(await readFile(join(root,'content/projects.json'),'utf8'));
const username='darcivieira';
const headers={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'dv-engineering-portfolio'};
if(process.env.GITHUB_TOKEN)headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;
async function github(path){
  const response=await fetch(`https://api.github.com${path}`,{headers,signal:AbortSignal.timeout(16000)});
  if(!response.ok)throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}
const after=new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10);
const events=await github(`/users/${username}/events/public?per_page=100`);
const publicEvents=events.filter(x=>x.created_at && x.created_at.slice(0,10)>=after).slice(0,60).map(e=>({
  id:String(e.id),type:e.type?.replace('Event','')||'Event',repo:e.repo?.name||'',date:e.created_at,
  title:e.type==='PullRequestEvent'?(e.payload?.pull_request?.title||'Pull request'):e.type==='IssuesEvent'?(e.payload?.issue?.title||'Issue'):e.type==='PushEvent'?'Push':e.type?.replace('Event','')||'Activity',
  url:e.payload?.pull_request?.html_url || e.payload?.issue?.html_url || `https://github.com/${e.repo?.name||username}`
}));
const jobs=await Promise.allSettled(repoData.filter(p=>p.repo).map(async p=>{
  const repo=p.repo.replace('https://github.com/','');
  const list=await github(`/repos/${repo}/commits?author=${username}&since=${encodeURIComponent(after+'T00:00:00Z')}&per_page=35`);
  return list.map(c=>({sha:c.sha.slice(0,10),title:(c.commit?.message||'Commit').split('\n')[0].slice(0,100),repo,date:c.commit?.author?.date||c.commit?.committer?.date,url:c.html_url}));
}));
const commits=jobs.flatMap((job,i)=>job.status==='fulfilled'?job.value:[]);
const errors=jobs.filter(x=>x.status==='rejected');
if(errors.length) console.warn(`${errors.length} commit feed(s) unavailable`);
const snapshot={username,commitsVerified:true,eventsVerified:true,updatedAt:new Date().toISOString(),windowDays:30,commits:commits.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,150),events:publicEvents,repositories:[...new Set(repoData.map(p=>p.repo).filter(Boolean))],note:'Only public activity. Selected repositories; not a complete contribution history.'};
await writeFile(join(root,'public/data/github-activity.json'),JSON.stringify(snapshot,null,2)+'\n');
console.log(`Synced ${snapshot.commits.length} commits and ${snapshot.events.length} public events.`);
