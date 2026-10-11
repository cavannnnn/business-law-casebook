const bar=document.querySelector('.progress span');
const links=[...document.querySelectorAll('.side-nav a,.mobile-nav a')];
const sections=[...document.querySelectorAll('section.lesson')];
function updateProgress(){const max=document.documentElement.scrollHeight-innerHeight;bar.style.width=(max>0?Math.min(100,scrollY/max*100):0)+'%'}
addEventListener('scroll',updateProgress,{passive:true});updateProgress();
const navObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){for(const a of links)a.classList.toggle('active',a.hash==='#'+entry.target.id)}}},{rootMargin:'-22% 0px -65% 0px'});sections.forEach(s=>navObserver.observe(s));

// A quick case decision before each long explanation gives the reader a reason to keep reading.
const caseFiles=[
  {icon:'river',label:'Northwind 的河',hook:'有许可证，但河流下游有人承担风险。',terms:[['许可证','permit'],['法律来源','sources of law'],['商业伦理','business ethics']],question:'你在董事会上会先说哪一句？',choices:['当地许可已发，议题结束。','先确认许可范围，再评估社区损害。'],correct:1,why:'许可证回答一部分合法性问题；董事会仍须处理规则适用范围与受影响者的风险。'},
  {icon:'map',label:'两种法律地图',hook:'法国律师翻法典，英国律师找判例。',terms:[['大陆法系','civil law'],['普通法系','common law'],['判决必要理由','ratio decidendi']],question:'跨法系案件先做什么？',choices:['先定位法域，再找该法域的法源。','先套最熟悉的规则。'],correct:0,why:'法律推理的起点取决于法域；两个法系都可能使用立法和判例。'},
  {icon:'signature',label:'Ember 的签名',hook:'Lena 签旧订单时，公司还没注册。',terms:[['独立人格','separate legal personality'],['成立前合同','pre-incorporation contract'],['代表权','authority']],question:'旧订单追债，第一步找谁？',choices:['先查 Lena 签署时的个人责任。','只找后来注册的 Ember。'],correct:0,why:'公司当时尚不存在；后来是否承接旧订单，要另查适用规则和手续。'},
  {icon:'letters',label:'Rello 的五封信',hook:'劳动、竞争、消防、数据与产品事故同时找上门。',terms:[['监管机关','regulator'],['产品责任','product liability'],['严格责任','strict liability']],question:'Rello 的第一张工作表应怎样做？',choices:['把所有来信合并成“法律风险”。','逐封列机关、文书、事实和期限。'],correct:1,why:'每个机关的权力、具体义务与时限不同；受害人的私人请求又是另一条线。'},
  {icon:'contract',label:'合同出生时刻',hook:'双方没签同一张纸，却已发货并付款。',terms:[['要约','offer'],['承诺','acceptance'],['条款纳入','incorporation of terms']],question:'最先要确定的时间点是？',choices:['合同何时成立。','发票何时打印。'],correct:0,why:'合同成立时点决定哪组条款来得及进入交易；履行行为也可能表示承诺。'},
  {icon:'clock',label:'Verity 的迟交',hook:'迟交两天，客户递来 €31,000 收据。',terms:[['违约','breach'],['损害赔偿','damages'],['减损','mitigation']],question:'你会怎样审查索赔？',choices:['有收据就全额赔。','逐项看损失、因果、可预见性和减损。'],correct:1,why:'违约不自动等于客户的全部损失都可赔；解除合同也要单独判断。'},
  {icon:'sensor',label:'Brivane 的传感器',hook:'研发四年、工资也付了，权属文件却有洞。',terms:[['知识产权','intellectual property'],['权属','ownership'],['转让','assignment']],question:'Brivane 现在先查什么？',choices:['逐项查权利成立、初始权利人和转让文件。','已经付工资，就默认一切归公司。'],correct:0,why:'不同权利的成立、归属与地域范围不同，付款本身未必完成转让。'},
  {icon:'ai',label:'Aldgate 的 AI 图案',hook:'机器出了第一稿，人类又改了九天。',terms:[['人类创作','human authorship'],['训练数据','training data'],['商业秘密','trade secret']],question:'写版权转让条款之前，先核实什么？',choices:['人的创作贡献与是否存在可转让的权利。','把“所有输出都归我”写大一点。'],correct:0,why:'转让不能凭空创造权利；证据要能说明人的选择、输入来源和秘密是否保住。'},
  {icon:'globe',label:'Hallowell 的判决',hook:'胜诉判决在英国，债务人财产在别国。',terms:[['管辖','jurisdiction'],['准据法','governing law'],['承认与执行','recognition & enforcement']],question:'起草争议条款时，先看哪里？',choices:['先看资产所在国与执行路线。','先选最熟悉的法院，赢了再说。'],correct:0,why:'判决或裁决需要在有资产的地方得到承认并执行，才可能变成回款。'},
  {icon:'board',label:'最后一场董事会',hook:'合作条款看起来友好，小字却决定以后谁承担风险。',terms:[['意向书','term sheet'],['保证','warranty'],['有约束力','binding']],question:'哪些句子应在签署前讲清楚？',choices:['保密等条款是否立即有约束力。','整份文件写“非约束”，其他让对方猜。'],correct:0,why:'意向书可以混合有约束力和无约束力的条款，必须明确划界。'}
];

const answered=new Map();
const count=document.getElementById('case-count');
const meter=document.getElementById('case-meter');
function updateCaseCount(){const done=answered.size;const right=[...answered.values()].filter(Boolean).length;count.textContent=done?`已判断 ${done} / 10 案 · 首次答对 ${right} 案`:'先读一案，再试着作判决';meter.style.width=(done*10)+'%'}
caseFiles.forEach((file,index)=>{
  const section=sections[index];if(!section)return;
  const lead=section.querySelector('.lead');if(!lead)return;
  const card=document.createElement('div');card.className='case-file';card.style.setProperty('--case-hue',String((index*21)%140+164));
  card.innerHTML=`<div class="case-art" aria-hidden="true"><svg viewBox="0 0 120 120"><use href="./assets/case-icons.svg#${file.icon}"></use></svg><span>CASE ${String(index+1).padStart(2,'0')}</span></div><div class="case-body"><div class="case-eyebrow">30 秒案情速览 · QUICK CASE</div><h3>${file.label}</h3><p class="case-hook">${file.hook}</p><div class="term-row" aria-label="本章中英关键词">${file.terms.map(([zh,en])=>`<span class="term-pill"><b>${zh}</b><small>${en}</small></span>`).join('')}</div><div class="decision"><b>⚖️ 教授先问：${file.question}</b><div class="decision-choices">${file.choices.map((choice,j)=>`<button type="button" data-choice="${j}" aria-label="选择 ${j?'B':'A'}：${choice}"><span>${j?'B':'A'}</span>${choice}</button>`).join('')}</div><div class="decision-result" aria-live="polite" hidden></div></div></div>`;
  lead.after(card);
  const result=card.querySelector('.decision-result');
  card.querySelectorAll('[data-choice]').forEach(button=>button.addEventListener('click',()=>{
    const chosen=Number(button.dataset.choice);const right=chosen===file.correct;
    if(!answered.has(index))answered.set(index,right);
    card.querySelectorAll('[data-choice]').forEach(b=>{b.classList.toggle('selected',b===button);b.classList.toggle('correct',Number(b.dataset.choice)===file.correct);b.setAttribute('aria-pressed',String(b===button))});
    result.hidden=false;result.innerHTML=`<strong>${right?'判得漂亮！':'再想一步：正确方向是 '+(file.correct?'B':'A')+'。'}</strong> ${file.why}`;
    updateCaseCount();
  }));
});
updateCaseCount();

if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.documentElement.classList.add('motion-ready');
  const revealObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}}},{threshold:.09});
  document.querySelectorAll('.case-file,.logic,.comparison,.matrix,.endcap').forEach(el=>revealObserver.observe(el));
}
