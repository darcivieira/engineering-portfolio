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
function makeTag(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
async function renderActivity(){
  let data;
  try {const r=await fetch('/data/github-activity.json',{cache:'no-cache'});if(!r.ok)throw new Error('snapshot unavailable');data=await r.json();} catch {return;}
  if(!data.updatedAt)return;
  const update=safeDate(data.updatedAt);if(!update)return;
  document.getElementById('activity-updated').textContent=new Intl.DateTimeFormat(locale,{day:'2-digit',month:'short',year:'numeric'}).format(update);
  const summary=data.contributions;
  const chart=document.getElementById('activity-chart');
  if(summary && Array.isArray(summary.days) && summary.days.length===30 && Number.isInteger(summary.total)){
    document.getElementById('metric-commits').textContent=String(summary.total);
    document.getElementById('metric-events').textContent=String(summary.restricted);
    document.getElementById('metric-repos').textContent=String(summary.activeDays);
    const dateFormat=new Intl.DateTimeFormat(locale,{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'});
    document.getElementById('activity-period').textContent=`${labels.period}: ${dateFormat.format(new Date(summary.from))} — ${dateFormat.format(new Date(summary.to))}.`;
    chart.replaceChildren();
    const top=Math.max(1,...summary.days.map(day=>day.count));
    for(const [index,item] of summary.days.entries()){
      const day=new Date(`${item.date}T00:00:00Z`);
      const description=`${dateFormat.format(day)}: ${item.count} ${labels.count}`;
      const col=makeTag('div','chart-column');col.dataset.date=item.date;col.dataset.count=String(item.count);
      col.setAttribute('role','img');col.setAttribute('aria-label',description);
      const value=makeTag('span','chart-value',item.count ? String(item.count) : '');value.setAttribute('aria-hidden','true');
      const bar=makeTag('div','chart-bar');bar.style.height=`${Math.max(4,(item.count/top)*100)}%`;bar.setAttribute('title',description);
      const tick=index===0 || index===29 || index%7===0;
      const label=makeTag('span','chart-day',tick ? new Intl.DateTimeFormat(locale,{day:'2-digit',timeZone:'UTC'}).format(day) : '');label.setAttribute('aria-hidden','true');
      col.append(value,bar,label);chart.append(col);
    }
  }
  const events=Array.isArray(data.events)?data.events:[];
  const feed=document.getElementById('activity-events');feed.replaceChildren();
  const items=[...events].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8);
  if(!items.length){feed.append(makeTag('p','activity-empty',labels.empty));return;}
  for(const item of items){
    const row=makeTag('div','feed-row');const marker=makeTag('span','feed-marker');marker.textContent='◇';
    const mid=makeTag('div','feed-mid');
    const eventLabel=[item.type,labels.actions?.[item.action]||item.action].filter(Boolean).join(' · ');
    const title=makeTag('span','feed-title',item.title && item.title!==item.type ? `${eventLabel}: ${item.title}` : eventLabel);
    const info=makeTag('span','feed-info',item.repo||'GitHub'); mid.append(title,info);
    const date=safeDate(item.date);const dateLabel=makeTag('time','feed-date',date?new Intl.DateTimeFormat(locale,{day:'2-digit',month:'short'}).format(date):'');
    row.append(marker,mid,dateLabel);feed.append(row);
    if(item.url?.startsWith('https://github.com/')) {const link=makeTag('a','feed-overlay');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label', `${title.textContent} - ${item.repo}`);row.append(link);}
  }
}
renderActivity();
