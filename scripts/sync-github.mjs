/** Aggregate profile contributions; publish detailed events from public endpoints only. */
import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
const root=process.cwd();
const { identity }=JSON.parse(await readFile(join(root,'content/site.json'),'utf8'));
const username=identity.github;
const today=new Date();today.setUTCHours(0,0,0,0);
const since=new Date(today);since.setUTCDate(since.getUTCDate()-29);
const until=new Date(today);until.setUTCDate(until.getUTCDate()+1);
const endInclusive=new Date(until.getTime()-1);
const inWindow=date=>{const timestamp=new Date(date);return timestamp>=since && timestamp<until;};
const headers={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'dv-engineering-portfolio'};
// Query only numbers and dates: private repository names, URLs and titles are never requested.
const query=`query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){contributionsCollection(from:$from,to:$to){restrictedContributionsCount contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
const input={query,variables:{login:username,from:since.toISOString(),to:endInclusive.toISOString()}};
async function collectContributions(){
  const token=process.env.CONTRIBUTIONS_TOKEN || process.env.GITHUB_TOKEN;
  let result;
  if(token){
    const response=await fetch('https://api.github.com/graphql',{method:'POST',headers:{...headers,Authorization:`Bearer ${token}`},body:JSON.stringify(input),signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error(`Contribution summary: HTTP ${response.status}`);
    result=await response.json();
  } else {
    // Reuse the owner's local GitHub sign-in without extracting or saving its credential.
    result=await new Promise((resolve,reject)=>{
      const child=spawn('gh',['api','graphql','--input','-'],{stdio:['pipe','pipe','pipe'],timeout:25000});
      let output='';child.stdout.on('data',chunk=>output+=chunk);
      child.stderr.resume();child.on('error',reject);
      child.on('close',code=>{if(code!==0)return reject(new Error('GitHub contribution summary unavailable; sign in with gh or configure a token.'));try{resolve(JSON.parse(output));}catch(error){reject(error);}});
      child.stdin.on('error',()=>{});child.stdin.end(JSON.stringify(input));
    });
  }
  if(result.errors?.length)throw new Error('GitHub rejected the contribution summary query.');
  const collection=result.data?.user?.contributionsCollection;
  if(!collection)throw new Error('GitHub returned no contribution summary.');
  const days=collection.contributionCalendar.weeks.flatMap(week=>week.contributionDays).filter(day=>inWindow(day.date)).map(day=>({date:day.date,count:day.contributionCount}));
  if(days.length!==30 || days.some(day=>!Number.isInteger(day.count)||day.count<0))throw new Error('Invalid contribution calendar.');
  const total=days.reduce((sum,day)=>sum+day.count,0);
  if(total!==collection.contributionCalendar.totalContributions)throw new Error('Contribution total does not match daily counts.');
  return {from:since.toISOString(),to:endInclusive.toISOString(),updatedAt:new Date().toISOString(),total,restricted:collection.restrictedContributionsCount,activeDays:days.filter(day=>day.count>0).length,days};
}
async function collectPublicEvents(){
  const items=[];
  for(let page=1;page<=3;page++){
    // No authorization header: this feed can never contain private repository details.
    const response=await fetch(`https://api.github.com/users/${username}/events/public?per_page=100&page=${page}`,{headers,signal:AbortSignal.timeout(16000)});
    if(!response.ok)throw new Error(`Public events: HTTP ${response.status}`);
    const batch=await response.json();if(!Array.isArray(batch))throw new Error('Invalid public event feed.');
    items.push(...batch);
    if(!/rel="next"/.test(response.headers.get('link')||''))break;
  }
  return items.filter(event=>event.public===true && event.created_at && inWindow(event.created_at)).map(event=>({
    id:String(event.id),type:event.type?.replace('Event','')||'Activity',repo:event.repo?.name||'',date:event.created_at,
    action:event.type==='PullRequestEvent' && event.payload?.pull_request?.merged?'merged':event.payload?.action||'',
    title:event.payload?.pull_request?.title || event.payload?.issue?.title || event.type?.replace('Event','') || 'Activity',
    url:event.payload?.pull_request?.html_url || event.payload?.issue?.html_url || `https://github.com/${event.repo?.name||username}`
  }));
}
// Keep the previous snapshot intact if either source fails.
const [contributions,events]=await Promise.all([collectContributions(),collectPublicEvents()]);
const snapshot={username,updatedAt:new Date().toISOString(),windowDays:30,contributions,events,eventsVerified:true,note:'Profile contribution counts, including anonymous restricted contributions when shared by the user. Detailed activity is public-only and limited by GitHub public events availability.'};
await writeFile(join(root,'public/data/github-activity.json'),JSON.stringify(snapshot,null,2)+'\n');
console.log(`Synced ${contributions.total} contributions (${contributions.restricted} restricted), ${contributions.activeDays} active days and ${events.length} public events.`);
