const LMS = {
  org: 'Sanifect ICM Pty Ltd',
  sponsor: 'MicroSafe Care Australia Pty Ltd',
  passMark: 80,
  validityMonths: 12,
  method: [
    { n: '01', title: 'The subject', body: 'Sit with this client, this site, this risk. Name the people, surfaces, and pressures before you name a product.' },
    { n: '02', title: 'The pathway', body: 'Who does what, how often, with which method. Write it so a new operator can follow it.' },
    { n: '03', title: 'The training', body: 'Train the people who will run that pathway. Competency is recorded.' },
    { n: '04', title: 'The proof', body: 'A measurable outcome for health: documented cycles, competency records, ATP or NATA when required. Shine and scent are not the score.' }
  ]
};
function esc(s){return String(s||'').replace(/[&<>"]/g,c=>({ '&':'&','<':'<','>':'>','"':'"' }[c]));}
function bar(a){
  return '<header class="topbar"><a class="brand" href="#/"><img src="assets/logo.svg" alt="Sanifect" /><span class="word"><strong>Sanifect SME Academy</strong><span>Pathway · training · proof</span></span></a><nav class="nav"><a class="'+(a==='home'?'active':'')+'" href="#/">Academy</a><a class="'+(a==='method'?'active':'')+'" href="#/method">Method</a><a class="'+(a==='evidence'?'active':'')+'" href="#/evidence">Evidence</a></nav><div class="who">Public desk</div></header>';
}
function foot(){
  return '<footer class="site-footer wrap"><p><strong>Sanifect ICM</strong> works each client\'s specific challenge \u2014 a pathway, training, and a measurable health outcome. We endorse <strong>Nanocyn Advanced</strong> when that pathway needs a listed hospital-grade hard-surface disinfectant, sanitiser and cleaner, <strong>AUST L 520725</strong>. It is not TGA approved.</p><p>ARTG sponsor: '+esc(LMS.sponsor)+'. '+esc(LMS.org)+' is the Australian distributor and ICM partner. Argus owns Sanifect public copy.</p></footer>';
}
function landing(){
  const m = LMS.method.map(x=>'<article><div class="n">'+x.n+'</div><h3>'+x.title+'</h3><p>'+x.body+'</p></article>').join('');
  return bar('home')+'<main class="wrap wrap-wide"><section class="hero"><div><div class="kicker" style="color:var(--gold)">Sanifect ICM \u00b7 SME Academy</div><h1>Each challenge. A pathway. Training. Proof.</h1><p>Sanifect is infection control management. We sit with the client\'s specific subject, establish a pathway and the training to run it, and work toward a measurable health outcome. We endorse Nanocyn Advanced when that pathway needs a listed hospital-grade tool.</p></div><div class="stats"><div class="stat"><b>4</b><span>Method steps</span></div><div class="stat"><b>3</b><span>Stages: operator, specialist, SME</span></div><div class="stat"><b>14</b><span>Assessed units</span></div><div class="stat"><b>80%</b><span>Pass mark</span></div></div></section><h2>How Sanifect works</h2><p class="lede">Not a bottle with a logo. A programme for this site, these people, this risk.</p><div class="method">'+m+'</div><div class="legal-strip"><p><strong>When the tool is Nanocyn Advanced.</strong> AUST L 520725 \u00b7 Listed hospital-grade hard-surface disinfectant, sanitiser and cleaner. Never TGA approved.</p></div></main>'+foot();
}
function method(){
  const m = LMS.method.map(x=>'<article><div class="n">'+x.n+'</div><h3>'+x.title+'</h3><p>'+x.body+'</p></article>').join('');
  return bar('method')+'<main class="wrap"><div class="kicker">Sanifect ICM</div><h1>We endorse a product. We run a programme.</h1><p class="lede">Nanocyn Advanced is the listed hospital-grade tool we endorse when the pathway needs it.</p><div class="method">'+m+'</div></main>'+foot();
}
function evidence(){
  return bar('evidence')+'<main class="wrap"><div class="kicker">Public desk</div><h1>The envelope, not the library.</h1><div class="evidence-grid"><article class="fact"><span class="tag icm">Sanifect ICM</span><h3>The service is the pathway</h3><p>Sanifect looks at each subject with the client, guides a pathway and training, and works toward a measurable health outcome. Nanocyn Advanced is the listed product we endorse when the pathway needs it \u2014 not the whole company.</p></article><article class="fact"><span class="tag listed">Listed</span><h3>Flagship SKU</h3><p>Nanocyn Advanced is a listed hospital-grade hard-surface disinfectant, sanitiser and cleaner. AUST L 520725. Never TGA approved.</p></article><article class="fact"><span class="tag not">Not on 520725</span><h3>Do not say</h3><p>MRSA, influenza, Candida albicans, any log figure, any 99.x% kill, or the general word sporicidal.</p></article></div></main>'+foot();
}
function render(){
  const h = (location.hash||'#/').replace(/^#/, '') || '/';
  const p = h.split('/').filter(Boolean)[0];
  let html = landing();
  if (p==='method') html = method();
  if (p==='evidence') html = evidence();
  document.getElementById('app').innerHTML = html;
}
window.addEventListener('hashchange', render);
render();
