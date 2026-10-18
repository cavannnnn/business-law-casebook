const DOCUMENTS = [
  {id:'syllabus',short:'Syllabus',title:'课程大纲 Syllabus',subtitle:'课程目标、日程与考核',pages:6,offset:0},
  {id:'week01',short:'Week 01',title:'第一单元 · 法律与道德',subtitle:'Northwind · 判断的起点',pages:15,offset:6},
  {id:'week02',short:'Week 02',title:'第二单元 · 公司实体与设立',subtitle:'Ember · 谁签约、谁负责',pages:19,offset:21},
  {id:'week03',short:'Week 03',title:'第三单元 · 监管与产品责任',subtitle:'Rello · 四封信与一场事故',pages:35,offset:40},
  {id:'week04',short:'Week 04',title:'第四单元 · 知识产权基础',subtitle:'Brivane · 权利、所有人和边界',pages:35,offset:75}
];
const cache = new Map();
let currentDoc = DOCUMENTS[0], currentPage = 1, requestNumber = 0;
const $ = id => document.getElementById(id);
function paragraphText(element, value){ element.textContent = value || '本页以左侧原图为准。'; }
function make(tag, className, text){ const node=document.createElement(tag); if(className) node.className=className; if(text!==undefined) node.textContent=text; return node; }
function validPage(doc, page){ return Math.min(doc.pages,Math.max(1,Number(page)||1)); }
function pickInitial(){
  const query=new URLSearchParams(location.search);
  const saved=JSON.parse(localStorage.getItem('business-law-reader-position')||'null');
  const doc=DOCUMENTS.find(d=>d.id===query.get('doc')) || DOCUMENTS.find(d=>d.id===saved?.doc) || DOCUMENTS[0];
  return {doc,page:validPage(doc,query.get('page')||saved?.page||1)};
}
function renderDocs(){
  const host=$('docList'); host.replaceChildren();
  DOCUMENTS.forEach((doc,index)=>{
    const button=make('button','doc-button'+(doc===currentDoc?' active':'')); button.type='button';
    const badge=make('span','doc-index',String(index).padStart(2,'0'));
    const words=make('span','doc-text'); words.append(make('strong','',doc.short),make('small','',doc.subtitle));
    button.append(badge,words,make('span','doc-count',`${doc.pages} P`));
    button.setAttribute('aria-current',doc===currentDoc?'page':'false');
    button.addEventListener('click',()=>show(doc,1)); host.append(button);
  });
  requestAnimationFrame(()=>{
    const active=host.querySelector('.active');
    if(active) host.scrollLeft=active.offsetLeft-host.offsetLeft-12;
  });
}
function renderPageGrid(){
  const host=$('pageGrid'); host.replaceChildren(); $('pageCount').textContent=`${currentDoc.pages} 页`;
  for(let page=1;page<=currentDoc.pages;page++){
    const button=make('button',page===currentPage?'active':'',String(page).padStart(2,'0'));
    button.type='button'; button.title=`${currentDoc.title}，第 ${page} 页`;
    button.setAttribute('aria-label',button.title);
    if(page===currentPage) button.setAttribute('aria-current','page');
    button.addEventListener('click',()=>show(currentDoc,page)); host.append(button);
  }
  requestAnimationFrame(()=>{
    const active=host.querySelector('button.active');
    if(active) host.scrollLeft=active.offsetLeft-host.offsetLeft-12;
  });
}
async function load(doc){
  if(!cache.has(doc.id)) cache.set(doc.id,fetch(`data/${doc.id}.json`).then(response=>{if(!response.ok)throw new Error(`无法读取 ${doc.id}`);return response.json()}));
  return cache.get(doc.id);
}
function renderTerms(page){
  const host=$('termList'); host.replaceChildren();
  const terms=page.terms||[]; $('termSection').hidden=!terms.length;
  terms.forEach(term=>{
    const card=make('div','term-card'); const strong=make('strong','',term.en); const zh=make('span','',term.zh); const explanation=make('p','',term.explanation);
    card.append(strong,zh,explanation);host.append(card);
  });
}
async function show(doc,page,scroll=true){
  currentDoc=doc;currentPage=validPage(doc,page);const myRequest=++requestNumber;
  renderDocs();renderPageGrid();
  $('sectionEyebrow').textContent=`${doc.short.toUpperCase()} · ORIGINAL DOCUMENT`;
  $('pageTitle').textContent=`${doc.title} · 第 ${currentPage} 页`;
  $('pageSummary').textContent=doc.subtitle;
  $('globalProgress').textContent=`第 ${doc.offset+currentPage} / 110 页`;
  $('documentProgress').textContent=`本文件 ${currentPage} / ${doc.pages}`;
  $('progressFill').style.width=`${(doc.offset+currentPage)/110*100}%`;
  $('downloadPdf').href=`original/${doc.id}/source.pdf`;
  $('navCenter').textContent=`${doc.short} · ${currentPage} / ${doc.pages}`;
  $('prevPage').disabled=doc===DOCUMENTS[0]&&currentPage===1;
  $('nextPage').disabled=doc===DOCUMENTS.at(-1)&&currentPage===doc.pages;
  const newUrl=new URL(location.href);newUrl.searchParams.set('doc',doc.id);newUrl.searchParams.set('page',currentPage);history.replaceState(null,'',newUrl);
  localStorage.setItem('business-law-reader-position',JSON.stringify({doc:doc.id,page:currentPage}));
  $('chineseText').textContent='正在打开本页译读…';$('englishText').textContent='';$('professorNote').textContent='';$('termSection').hidden=true;
  try{
    const data=await load(doc); if(myRequest!==requestNumber)return;
    const item=data.pages[currentPage-1];if(!item)throw new Error('这一页的资料未找到');
    $('pageImage').src=item.image;$('pageImage').alt=`${doc.title}，原始 PDF 第 ${currentPage} 页`;
    $('lightboxImage').src=item.image;
    paragraphText($('englishText'),item.english);
    paragraphText($('chineseText'),item.chinese);
    paragraphText($('professorNote'),item.note);
    renderTerms(item);
    if(scroll) $('study').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }catch(error){
    if(myRequest===requestNumber) $('chineseText').textContent=`本页载入失败：${error.message}。请刷新网页重试。`;
  }
}
function step(direction){
  let index=DOCUMENTS.indexOf(currentDoc),page=currentPage+direction;
  if(page<1){if(index===0)return;index--;page=DOCUMENTS[index].pages}
  if(page>DOCUMENTS[index].pages){if(index===DOCUMENTS.length-1)return;index++;page=1}
  show(DOCUMENTS[index],page);
}
$('prevPage').addEventListener('click',()=>step(-1));$('nextPage').addEventListener('click',()=>step(1));
$('imageButton').addEventListener('click',()=>{$('lightbox').hidden=false;document.body.classList.add('modal-open');$('closeLightbox').focus()});
function closeLightbox(){$('lightbox').hidden=true;document.body.classList.remove('modal-open');$('imageButton').focus()}
$('closeLightbox').addEventListener('click',closeLightbox);
$('lightbox').addEventListener('click',event=>{if(event.target===$('lightbox'))closeLightbox()});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!$('lightbox').hidden){closeLightbox();return}
  if(!$('lightbox').hidden||['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
  if(event.key==='ArrowLeft')step(-1);
  if(event.key==='ArrowRight')step(1);
});
window.addEventListener('popstate',()=>{const q=new URLSearchParams(location.search);const doc=DOCUMENTS.find(d=>d.id===q.get('doc'))||DOCUMENTS[0];show(doc,q.get('page'),false)});
const initial=pickInitial();show(initial.doc,initial.page,false);
