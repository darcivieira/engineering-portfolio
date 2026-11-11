document.documentElement.classList.add('js-enhanced');
// Progressive enhancement only. Core portfolio content is static and indexable.
const menuButton = document.querySelector('.mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');
if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    mobileNav.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  });
  mobileNav.addEventListener('click', event => {
    if (event.target.closest('a')) {
      mobileNav.hidden = true;
      menuButton.setAttribute('aria-expanded','false');
      document.body.classList.remove('menu-open');
    }
  });
}
const filterButtons = document.querySelectorAll('[data-filter]');
filterButtons.forEach(button => button.addEventListener('click', () => {
  const value = button.dataset.filter;
  filterButtons.forEach(b => {
    const active = b === button;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('.project-card').forEach(card => {
    card.hidden = value !== 'all' && card.dataset.category !== value;
  });
}));
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});
  }, {threshold:.08,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
} else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'));
const labels = JSON.parse(document.getElementById('page-labels')?.textContent || '{}');
const locale = labels.lang === 'en' ? 'en-US' : 'pt-BR';
function safeDate(dateString){const d=new Date(dateString);return Number.isNaN(d.getTime())?null:d;}
function daysBack(date,n){const d=new Date(date); d.setUTCDate(d.getUTCDate()-n);return d;}
function makeTag(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
async function renderActivity(){
  let data;
  try {const r=await fetch('/data/github-activity.json',{cache:'no-cache'});if(!r.ok)throw new Error('snapshot unavailable');data=await r.json();} catch {return;}
  if(!data.updatedAt)return;
  const update=safeDate(data.updatedAt);if(!update)return;
  document.getElementById('activity-updated').textContent=new Intl.DateTimeFormat(locale,{day:'2-digit',month:'short',year:'numeric'}).format(update);
  const commits=Array.isArray(data.commits)?data.commits:[];
  const events=Array.isArray(data.events)?data.events:[];
  const repos=Array.isArray(data.repositories)?data.repositories:[];
  document.getElementById('metric-commits').textContent=String(commits.length);
  document.getElementById('metric-events').textContent=data.eventsVerified === false ? '—' : String(events.length);
  document.getElementById('metric-repos').textContent=String(new Set([...commits,...events].map(x=>x.repo).filter(Boolean)).size);
  const chart=document.getElementById('activity-chart'); chart.replaceChildren();
  const start=new Date();start.setHours(0,0,0,0);
  const weekly=Array.from({length:7},(_,i)=>{const day=daysBack(start,6-i), key=day.toISOString().slice(0,10);return {day,key,amount:commits.filter(c=>c.date?.slice(0,10)===key).length};});
  const top=Math.max(1,...weekly.map(x=>x.amount));
  for(const item of weekly){
    const col=makeTag('div','chart-column');
    const value=makeTag('span','chart-value',String(item.amount));
    const bar=makeTag('div','chart-bar');bar.style.height=`${Math.max(6,(item.amount/top)*100)}%`;bar.setAttribute('title',`${item.key}: ${item.amount}`);
    const label=makeTag('span','chart-day',new Intl.DateTimeFormat(locale,{weekday:'short',timeZone:'UTC'}).format(item.day).replace('.',''));
    col.append(value,bar,label);chart.append(col);
  }
  const feed=document.getElementById('activity-events');feed.replaceChildren();
  const items=[...commits.map(x=>({...x,kind:'commit'})), ...events.map(x=>({...x,kind:'event'}))].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6);
  if(!items.length){feed.append(makeTag('p','activity-empty',labels.empty));return;}
  for(const item of items){
    const row=makeTag('div','feed-row');const marker=makeTag('span','feed-marker');marker.textContent=item.kind==='commit'?'↳':'◇';
    const mid=makeTag('div','feed-mid');
    const title=makeTag('span','feed-title',item.title || item.type || (item.kind==='commit'?'Commit':'Event'));
    const info=makeTag('span','feed-info',item.repo||'GitHub'); mid.append(title,info);
    const date=safeDate(item.date);const dateLabel=makeTag('time','feed-date',date?new Intl.DateTimeFormat(locale,{day:'2-digit',month:'short'}).format(date):'');
    row.append(marker,mid,dateLabel);feed.append(row);
    if(item.url?.startsWith('https://github.com/')) {const link=makeTag('a','feed-overlay');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label', `${title.textContent} - ${item.repo}`);row.append(link);}
  }
}
renderActivity();
