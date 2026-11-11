import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { join } from 'node:path';
const root = process.cwd();
const [site, projects, experience] = await Promise.all([
  readFile(join(root, 'content/site.json'), 'utf8').then(JSON.parse),
  readFile(join(root, 'content/projects.json'), 'utf8').then(JSON.parse),
  readFile(join(root, 'content/experience.json'), 'utf8').then(JSON.parse),
]);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg = (path, cls='') => `<svg class="icon ${cls}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
const icons = {
  arrow:svg('<path d="M5 12h14m-6-6 6 6-6 6"/>'),
  diagonal:svg('<path d="M7 17 17 7M8 7h9v9"/>'),
  linkedin:svg('<rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 10v7M7 7v.01M11 17v-7h3v1a3 3 0 0 1 4 3v3M11 13a3 3 0 0 1 3-3"/>'),
  github:svg('<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.9a3.3 3.3 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.8A5.2 5.2 0 0 0 19 5a4.8 4.8 0 0 0-.1-3.8s-1.1-.4-3.9 1.5a13.7 13.7 0 0 0-7 0C5.2.8 4.1 1.2 4.1 1.2A4.8 4.8 0 0 0 4 5a5.2 5.2 0 0 0-1.3 3.7c0 5.3 3.2 6.5 6.2 6.8a3.3 3.3 0 0 0-.9 2.6V22"/>'),
  layers:svg('<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>'),
  code:svg('<path d="m8 9-3 3 3 3m8-6 3 3-3 3m-5-9-2 12"/>'),
  shield:svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>'),
  database:svg('<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>'),
  terminal:svg('<rect x="2" y="3" width="20" height="18" rx="2"/><path d="m6 9 3 3-3 3m6 0h5"/>'),
  cloud:svg('<path d="M20 16.6a4.5 4.5 0 0 0-2.9-8.2A6 6 0 0 0 5.5 10 4 4 0 0 0 6 18h13"/>'),
  branch:svg('<circle cx="6" cy="3" r="2"/><circle cx="6" cy="21" r="2"/><circle cx="18" cy="6" r="2"/><path d="M6 5v14M18 8a6 6 0 0 1-6 6H6"/>'),
  globe:svg('<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/>'),
  sparkle:svg('<path d="m12 3 1.5 6.5L20 11l-6.5 1.5L12 19l-1.5-6.5L4 11l6.5-1.5L12 3Zm7 13 .5 2.5L22 19l-2.5.5L19 22l-.5-2.5L16 19l2.5-.5L19 16Z"/>'),
  menu:svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  close:svg('<path d="M5 5 19 19M19 5 5 19"/>'),
  check:svg('<path d="m5 12 4 4L19 6"/>'),
};
function sectionHeading(eyebrow,title,lead) {return `<div class="section-head reveal"><p class="eyebrow"><span class="eyebrow-tick"></span>${esc(eyebrow)}</p><h2>${esc(title)}</h2><p class="section-lead">${esc(lead)}</p></div>`;}
function renderProject(project, t, lang) {
  const tags=project.stack.map(x=>`<span class="tag">${esc(x)}</span>`).join('');
  return `<article class="project-card reveal" data-category="${esc(project.category)}">
    <div class="project-top"><span class="project-number">${esc(project.number)} / 04</span><span class="open-label"><span class="mini-dot"></span>${esc(t.projectOpen)}</span></div>
    <div class="project-art project-art--${esc(project.accent)}" aria-hidden="true"><div class="art-orbit art-orbit-a"></div><div class="art-orbit art-orbit-b"></div><div class="art-center">${project.id==='crucible'?icons.sparkle:project.id==='kanbanize'?icons.branch:project.id==='rag'?icons.layers:icons.database}</div><span class="art-line art-line-a"></span><span class="art-line art-line-b"></span><span class="art-coordinate">${esc(project.id.toUpperCase())} // SYSTEM</span></div>
    <div class="project-content"><p class="project-subtitle">${esc(project.subtitle[lang])}</p><h3>${esc(project.title[lang])}</h3><p class="project-summary">${esc(project.summary[lang])}</p><div class="project-tags">${tags}</div><div class="project-bottom"><span class="project-detail">${esc(project.detail[lang])}</span><a target="_blank" rel="noopener noreferrer" href="${esc(project.repo)}" class="project-link" aria-label="${esc(t.projectCode)}: ${esc(project.title[lang])}">${icons.diagonal}<span>${esc(t.projectCode)}</span></a></div></div>
  </article>`;
}
function render(lang) {
  const t=site[lang], other=lang==='pt'?'en':'pt';
  const path=lang==='pt'?'/':'/en/';
  const switchPath=lang==='pt'?'/en/':'/';
  const canonical='https://example.pages.dev'+path;
  const caseCards=[1,2,3].map(n=>`<article class="case-card reveal case-${n}"><div class="case-card-top"><span class="case-index">0${n}</span><span class="case-glyph">${n===1?icons.shield:n===2?icons.branch:icons.cloud}</span></div><p class="case-kicker">${esc(t[`case${n}Tag`])}</p><h3>${esc(t[`case${n}Title`])}</h3><p>${esc(t[`case${n}Body`])}</p><span class="case-foot">${esc(t[`case${n}Foot`])}</span></article>`).join('');
  const principles=[['layers',1],['code',2],['database',3],['shield',4]].map(([ic,n])=>`<article class="principle reveal"><span class="principle-icon">${icons[ic]}</span><div><h3>${esc(t[`principle${n}Title`])}</h3><p>${esc(t[`principle${n}Text`])}</p></div><span class="principle-index">0${n}</span></article>`).join('');
  const careers=experience.map((entry,i)=>`<article class="career-item reveal" data-experience="${esc(entry.id)}"><div class="career-rail"><span class="career-marker"></span>${i<experience.length-1?'<span class="career-line"></span>':''}</div><div class="career-info"><div class="career-topline"><h3>${esc(entry.company)}</h3><span class="career-time">${esc(entry.period[lang])}</span></div><p class="career-role">${esc(entry.role[lang])}</p><p class="career-desc">${esc(entry.summary[lang])}</p><details class="career-deliveries"${i===0?' open':''}><summary>${esc(t.careerDeliveries)}<span aria-hidden="true">+</span></summary><ul>${entry.deliveries.map(delivery=>`<li><h4>${esc(delivery.title[lang])}</h4><p>${esc(delivery.text[lang])}</p></li>`).join('')}</ul></details><div class="career-stack">${entry.stack.map(technology=>`<span class="tag">${esc(technology)}</span>`).join('')}</div></div></article>`).join('');
  const contactEmail=site.identity.email?`<a class="contact-link" href="mailto:${esc(site.identity.email)}">${icons.arrow}${esc(t.contactEmail)}</a>`:'';
  const contactLinkedin=site.identity.linkedinUrl?`<a class="btn btn-secondary" target="_blank" rel="noopener noreferrer" href="${esc(site.identity.linkedinUrl)}">${icons.linkedin}${esc(t.contactLinkedin)}${icons.diagonal}</a>`:'';
  return `<!doctype html>
<html lang="${lang==='pt'?'pt-BR':'en'}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(t.metaTitle)}</title><meta name="description" content="${esc(t.metaDescription)}"/><meta name="theme-color" content="#080f18"/>
<meta property="og:type" content="website"/><meta property="og:title" content="${esc(t.metaTitle)}"/><meta property="og:description" content="${esc(t.metaDescription)}"/>
<link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
<link rel="alternate" hreflang="pt-BR" href="/"/><link rel="alternate" hreflang="en" href="/en/"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600;650;700;750;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/assets/main.css"/><script defer src="/assets/main.js"></script>
</head>
<body data-lang="${lang}">
<a class="skip-link" href="#main">${esc(t.skip)}</a>
<div class="site-noise" aria-hidden="true"></div><div class="ambient ambient-left" aria-hidden="true"></div><div class="ambient ambient-right" aria-hidden="true"></div>
<header class="site-header" id="top"><div class="header-inner wrap">
  <a href="${path}" class="brand" aria-label="D.V. Engineering Home"><span class="brand-icon"><span class="brand-chevron">&gt;_</span></span><span class="brand-name">D.V<span class="brand-muted"> / ENGINEERING</span></span></a>
  <nav class="desktop-nav" aria-label="Primary navigation"><a href="#about">${esc(t.navAbout)}</a><a href="#projects">${esc(t.navWork)}</a><a href="#engineering">${esc(t.navPhilosophy)}</a><a href="#experience">${esc(t.navExperience)}</a><a href="#github">${esc(t.navActivity)}</a></nav>
  <div class="nav-actions"><a class="language-pill" href="${switchPath}" aria-label="${esc(t.toggle)}">${icons.globe}<span>${lang==='pt'?'EN':'PT'}</span></a><a class="header-cta" href="#contact">${esc(t.navContact)} ${icons.diagonal}</a><button class="mobile-menu-btn" aria-label="${esc(t.navMenu)}" aria-expanded="false" aria-controls="mobile-nav">${icons.menu}</button></div>
</div><nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden><a href="#about">${esc(t.navAbout)}</a><a href="#projects">${esc(t.navWork)}</a><a href="#engineering">${esc(t.navPhilosophy)}</a><a href="#experience">${esc(t.navExperience)}</a><a href="#github">${esc(t.navActivity)}</a><a href="#contact">${esc(t.navContact)}</a><a href="${switchPath}">PT / EN</a></nav></header>
<main id="main">
<section class="hero section" id="home"><div class="wrap hero-layout">
  <div class="hero-copy"><div class="available reveal"><span class="status-dot"></span>${esc(t.navAvailability)} <span class="availability-sep">/</span> ${esc(t.heroLocation)}</div>
    <p class="hero-eyebrow reveal">${esc(t.heroEyebrow)}</p>
    <h1 class="reveal">${esc(t.heroTitleA)}<br><em>${esc(t.heroTitleB)}</em></h1>
    <p class="hero-description reveal">${esc(t.heroLead)}</p>
    <div class="hero-actions reveal"><a href="#projects" class="btn btn-primary">${esc(t.heroPrimary)}${icons.arrow}</a><a href="#contact" class="btn btn-secondary">${esc(t.heroSecondary)}${icons.diagonal}</a></div>
    <div class="hero-stacks reveal"><span>${esc(t.heroTagA)}</span><i></i><span>${esc(t.heroTagB)}</span><i></i><span>${esc(t.heroTagC)}</span><i></i><span>${esc(t.heroTagD)}</span></div>
  </div>
  <div class="hero-visual reveal" aria-label="Architecture conceptual visualization"><div class="orbit-large orbit-one"></div><div class="orbit-large orbit-two"></div><div class="float-label float-label-one">01 / BACKEND</div><div class="float-label float-label-two">02 / CLOUD</div><div class="architecture-panel">
  <div class="panel-head"><span class="panel-dots"><b></b><b></b><b></b></span><span>${esc(t.terminalTitle)}</span><span class="panel-hash">#001</span></div>
  <div class="panel-body"><div class="panel-kicker"><span class="pulse-tiny"></span>${esc(t.terminalPill)}</div><div class="panel-file"><span class="line-number">01</span><span class="line-word">engineering</span> = {</div>
  <div class="panel-file code-indent"><span class="line-number">02</span><span class="code-property">'domain'</span>: <span class="code-string">'first'</span>,</div>
  <div class="panel-file code-indent"><span class="line-number">03</span><span class="code-property">'modules'</span>: <span class="code-string">'cohesive'</span>,</div>
  <div class="panel-file code-indent"><span class="line-number">04</span><span class="code-property">'complexity'</span>: <span class="code-string">'earned'</span>,</div>
  <div class="panel-file code-indent"><span class="line-number">05</span><span class="code-property">'operations'</span>: <span class="code-string">'built-in'</span>,</div>
  <div class="panel-file"><span class="line-number">06</span>}</div>
  <div class="panel-divider"></div><div class="panel-check">${icons.check}<span>${esc(t.terminalLineA)}</span></div><div class="panel-check">${icons.check}<span>${esc(t.terminalLineB)}</span></div><div class="panel-check">${icons.check}<span>${esc(t.terminalLineC)}</span></div></div>
  <div class="panel-foot"><span><i class="green-light"></i> ALL SYSTEMS OPERATIONAL</span><span>DV:DEV</span></div></div>
  <div class="visual-footer">${icons.terminal}<span>${esc(t.terminalFooter)}</span></div>
  </div></div><div class="hero-end wrap"><a href="#about" class="scroll-note"><span class="scroll-line"></span>${esc(t.heroScroll)}</a><span class="hero-index">PORTFOLIO / 2026</span></div></section>
<section class="section about-section" id="about" aria-labelledby="about-title"><div class="wrap about-layout">
  <div class="about-letter reveal"><p class="eyebrow"><span class="eyebrow-tick"></span>${esc(t.aboutEyebrow)}</p><h2 id="about-title">${esc(t.aboutTitle)}</h2>
  <p class="about-intro">${esc(t.aboutIntro)}</p><p>${esc(t.aboutBody)}</p><p>${esc(t.aboutApproach)}</p><p>${esc(t.aboutClosing)}</p>
  <div class="about-signature"><strong>${esc(site.identity.name)}</strong><span>${esc(t.aboutRole)}</span></div>
  <a href="#contact" class="simple-link">${esc(t.aboutCta)}${icons.arrow}</a></div>
  <aside class="about-value reveal" aria-labelledby="about-value-title"><h3 id="about-value-title">${esc(t.aboutValueTitle)}</h3>
  ${[1,2,3].map(n=>`<div class="about-value-item"><h4>${esc(t[`aboutValue${n}Title`])}</h4><p>${esc(t[`aboutValue${n}Text`])}</p></div>`).join('')}
  <p class="about-availability">${esc(t.aboutAvailability)}</p></aside>
</div></section>
<section class="section projects-section" id="projects"><div class="wrap">
  <div class="section-header-split">${sectionHeading(t.sectionWorkEyebrow,t.sectionWorkTitle,t.sectionWorkLead)}<a class="simple-link" href="${esc(site.identity.githubUrl)}?tab=repositories" target="_blank" rel="noopener noreferrer">${esc(t.githubMore)}${icons.diagonal}</a></div>
  <div class="filter-row" role="group" aria-label="Project filters"><button class="filter-btn active" data-filter="all" aria-pressed="true">${esc(t.filterAll)} <span>04</span></button><button class="filter-btn" data-filter="ai" aria-pressed="false">${esc(t.filterAi)}</button><button class="filter-btn" data-filter="integrations" aria-pressed="false">${esc(t.filterIntegrations)}</button><button class="filter-btn" data-filter="backend" aria-pressed="false">${esc(t.filterBackend)}</button></div>
  <div class="project-grid">${projects.map(p=>renderProject(p,t,lang)).join('')}</div>
  <div class="work-footer"><span>${icons.sparkle} ${esc(t.projectCallout)}</span></div>
</div></section>
<section class="section philosophy-section" id="engineering"><div class="wrap">
 ${sectionHeading(t.sectionPrincipleEyebrow,t.sectionPrincipleTitle,t.sectionPrincipleLead)}
 <div class="engineering-grid"><div class="principles">${principles}</div><div class="architecture-example reveal"><div class="arch-header"><span class="arch-label">${icons.layers} REFERENCE MODEL</span><span class="arch-square">[ 01 ]</span></div><h3>${esc(t.archHeading)}</h3><p>${esc(t.archSub)}</p>
 <div class="arch-diagram"><div class="arch-box arch-edge"><span class="arch-label-small">ENTRY</span><strong>${esc(t.archEntry)}</strong></div><span class="arch-connector">↓</span><div class="arch-box arch-capability"><span class="arch-label-small">MODULE</span><strong>${esc(t.archBusiness)}</strong><span class="arch-meta">${esc(t.archDomain)}</span></div><div class="arch-forks"><span></span><span></span></div><div class="arch-bottom"><div class="arch-box arch-adapter">${icons.database}<strong>${esc(t.archStorage)}</strong></div><div class="arch-box arch-adapter">${icons.branch}<strong>${esc(t.archExternal)}</strong></div></div></div>
 <div class="arch-note"><span class="mini-dot"></span>${esc(t.archFoot)}</div></div></div>
</div></section>
<section class="section cases-section" id="cases"><div class="wrap">${sectionHeading(t.sectionCasesEyebrow,t.sectionCasesTitle,t.sectionCasesLead)}<div class="cases-grid">${caseCards}</div></div></section>
<section class="section experience-section" id="experience"><div class="wrap experience-grid"><div class="experience-intro">${sectionHeading(t.sectionCareerEyebrow,t.sectionCareerTitle,t.sectionCareerLead)}<div class="tech-cloud"><span>Python</span><span>Java</span><span>FastAPI</span><span>Spring Boot</span><span>PostgreSQL</span><span>Redis</span><span>RabbitMQ</span><span>Docker</span><span>Kubernetes</span><span>GitOps</span><span>LLM / RAG</span></div></div><div class="career-list">${careers}</div></div></section>
<section class="section activity-section" id="github"><div class="wrap">${sectionHeading(t.sectionActivityEyebrow,t.sectionActivityTitle,t.sectionActivityLead)}
<div class="activity-dashboard reveal" data-github-activity="true"><div class="activity-top"><div class="activity-user"><span class="activity-avatar">${icons.github}</span><div><strong>@${esc(site.identity.github)}</strong><span>github.com/${esc(site.identity.github)}</span></div></div><div class="sync-label"><span class="sync-signal"></span>${esc(t.activitySync)}: <time id="activity-updated">${esc(t.activityStatus)}</time></div></div>
<div class="activity-metrics"><div><span class="metric-value" id="metric-commits">—</span><span class="metric-label">${esc(t.activityCommits)}</span></div><div><span class="metric-value" id="metric-events">—</span><span class="metric-label">${esc(t.activityEvents)}</span></div><div><span class="metric-value" id="metric-repos">—</span><span class="metric-label">${esc(t.activityRepos)}</span></div></div>
<div class="activity-lower"><div class="activity-chart-zone"><h3>${esc(t.activityChart)}</h3><div class="activity-chart" id="activity-chart" aria-label="${esc(t.activityChart)}"><div class="chart-placeholder" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div></div><p class="activity-disclaimer">${esc(t.activityNote)}</p><p class="activity-disclaimer">${esc(t.activityCoverage)}</p><p class="activity-disclaimer" id="activity-period"></p></div><div class="activity-events-zone"><h3>${esc(t.activityRecent)}</h3><div id="activity-events" class="activity-feed"><p class="activity-empty">${esc(t.activityEmpty)}</p></div><p class="activity-disclaimer">${esc(t.activityEventNote)}</p></div></div>
<div class="activity-bottom"><a href="${esc(site.identity.githubUrl)}" target="_blank" rel="noopener noreferrer" class="simple-link">${esc(t.activityAll)}${icons.diagonal}</a><span>GITHUB · CONTRIBUTION CALENDAR</span></div></div></div></section>
<section class="section contact-section" id="contact"><div class="wrap"><div class="contact-card"><div class="contact-glow"></div><div class="contact-body"><p class="eyebrow"><span class="eyebrow-tick"></span>${esc(t.sectionContactEyebrow)}</p><h2>${esc(t.sectionContactTitle)}</h2><p class="contact-lead">${esc(t.sectionContactLead)}</p><div class="contact-types"><span>${icons.check}${esc(t.contactConsult)}</span><span>${icons.check}${esc(t.contactPosition)}</span></div><div class="contact-actions"><a class="btn btn-primary" target="_blank" rel="noopener noreferrer" href="${esc(site.identity.githubUrl)}">${icons.github}${esc(t.contactGitHub)}${icons.diagonal}</a>${contactEmail}${contactLinkedin}</div></div><div class="contact-mark" aria-hidden="true">&gt;_</div></div></div></section>
</main>
<footer class="site-footer"><div class="wrap footer-content"><a href="#top" class="brand footer-brand"><span class="brand-icon"><span class="brand-chevron">&gt;_</span></span><span class="brand-name">D.V<span class="brand-muted"> / ENGINEERING</span></span></a><p>${esc(t.footerText)}</p><a class="back-to-top" href="#top">${esc(t.footerBack)} ↑</a></div><div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} D.V. ENGINEERING</span><span>PT / EN · BUILT TO LAST</span></div></footer>
<script type="application/json" id="page-labels">${JSON.stringify({empty:t.activityEmpty,count:t.activityCount,period:t.activityPeriod,actions:{opened:t.activityActionOpened,closed:t.activityActionClosed,merged:t.activityActionMerged,reopened:t.activityActionReopened,created:t.activityActionCreated},lang,projectCode:t.projectCode}).replace(/</g,'\\u003c')}</script>
</body></html>`;
}
await mkdir(join(root,'dist/assets'),{recursive:true});
await mkdir(join(root,'dist/en'),{recursive:true});
await cp(join(root,'public'),join(root,'dist'),{recursive:true});
await Promise.all([
  writeFile(join(root,'dist/index.html'),render('pt')),
  writeFile(join(root,'dist/en/index.html'),render('en')),
  cp(join(root,'src/main.css'),join(root,'dist/assets/main.css')),
  cp(join(root,'src/main.js'),join(root,'dist/assets/main.js')),
]);
console.log('Built dist/index.html and dist/en/index.html');
