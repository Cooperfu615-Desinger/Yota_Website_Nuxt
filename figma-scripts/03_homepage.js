// ============================================================
// 巨亨ONLINE — Figma 頁面腳本
// 03_homepage.js  →  首頁 (index.vue)
// 目標頁面：📱 頁面參考
// 產出 Frame：
//   [A] 首頁 — 手機版 📱  (390px wide)
// ============================================================

(async () => {

await Promise.all([
  figma.loadFontAsync({ family:'Inter', style:'Regular' }),
  figma.loadFontAsync({ family:'Inter', style:'Medium' }),
  figma.loadFontAsync({ family:'Inter', style:'Bold' }),
  figma.loadFontAsync({ family:'Inter', style:'Black' }),
]);

let pg = figma.root.children.find(p => p.name && p.name.includes('頁面參考'));
if (!pg) { pg = figma.createPage(); pg.name = '📱 頁面參考'; }
await figma.setCurrentPageAsync(pg);
pg.children.filter(n => n.name && n.name.includes('首頁')).forEach(n => n.remove());

// ── HELPERS ────────────────────────────────────────────────
const rgb    = h => { const x=h.replace('#',''); return { r:parseInt(x.slice(0,2),16)/255, g:parseInt(x.slice(2,4),16)/255, b:parseInt(x.slice(4,6),16)/255 }; };
const solid  = (c,op=1) => [{ type:'SOLID',color:c,opacity:op }];
const linGrd = (c1,c2)  => [{ type:'GRADIENT_LINEAR', gradientTransform:[[1,0,0],[0,1,0]], gradientStops:[{position:0,color:{...rgb(c1),a:1}},{position:1,color:{...rgb(c2),a:1}}] }];

const C = {
  bg:rgb('#0F0020'), bgDeep:rgb('#080014'), card:rgb('#160A2A'),
  gold:rgb('#F5C842'), white:rgb('#FFFFFF'), text:rgb('#EDE0F9'),
  muted:rgb('#C4B5D5'), purple:rgb('#7C3AED'), purpleLight:rgb('#AB80F7'),
  green:rgb('#4ADE80'), red:rgb('#F87171'), dark:rgb('#120820'),
};

function mkTxt(str, sz, style, clr, op=1) {
  const n=figma.createText(); n.fontName={family:'Inter',style}; n.fontSize=sz;
  n.characters=String(str); n.fills=[{type:'SOLID',color:clr,opacity:op}]; n.textAutoResize='WIDTH_AND_HEIGHT'; return n;
}
function mkFrame(w, h, bg=null, radius=0, clip=false) {
  const f=figma.createFrame(); f.resize(w,h);
  f.fills=bg?(Array.isArray(bg)?bg:solid(bg)):[];
  f.cornerRadius=radius; f.clipsContent=clip; return f;
}

const W=390, CW=358;

// ── SECTION BUILDERS ───────────────────────────────────────

// 1. 跑馬燈
function buildMarquee(p, y) {
  const mq=mkFrame(W,36,C.bgDeep); mq.x=0; mq.y=y; mq.clipsContent=true;
  const t=mkTxt('🔴 玩家***豪 在老虎機贏得 NT$38,500！  •  系統公告：服務正常  •  🔴 玩家***星 在百家樂贏得 NT$12,800！',11,'Regular',C.muted,0.8);
  t.x=12; t.y=10; mq.appendChild(t); p.appendChild(mq); return y+36;
}

// 2. Banner 輪播（以漸層色塊代替圖片，標注「美術出圖替換」）
function buildBanner(p, y) {
  const H = Math.round(W * 7/16); // 16:7 aspect ratio = 170px
  const banner=mkFrame(W,H,linGrd('#1a003a','#7C3AED')); banner.x=0; banner.y=y; banner.clipsContent=true;
  banner.name='Banner Slider（美術出圖）';

  // Slide content placeholder
  const inner=mkFrame(W-40,H-20,null); inner.x=20; inner.y=10;
  inner.layoutMode='VERTICAL'; inner.primaryAxisSizingMode='AUTO'; inner.counterAxisSizingMode='AUTO';
  inner.primaryAxisAlignItems='CENTER'; inner.counterAxisAlignItems='MIN'; inner.itemSpacing=6;
  inner.appendChild(mkTxt('🎰 百萬大獎賽',28,'Black',C.gold));
  inner.appendChild(mkTxt('獎金池 NT$1,280,000',13,'Regular',C.white,0.8));
  const ctaBtn=mkFrame(140,40,linGrd('#F5C842','#E09520'),10);
  ctaBtn.layoutMode='HORIZONTAL'; ctaBtn.primaryAxisSizingMode='AUTO'; ctaBtn.counterAxisSizingMode='AUTO';
  ctaBtn.primaryAxisAlignItems='CENTER'; ctaBtn.counterAxisAlignItems='CENTER';
  ctaBtn.paddingLeft=20; ctaBtn.paddingRight=20; ctaBtn.paddingTop=0; ctaBtn.paddingBottom=0;
  ctaBtn.appendChild(mkTxt('▶  立即進入',14,'Bold',rgb('#1a0a00')));
  inner.appendChild(ctaBtn); banner.appendChild(inner);

  // Arrow buttons (left / right)
  const arrowStyle = { fills:[{type:'SOLID',color:rgb('#000000'),opacity:0.4}], strokeWeight:1, strokes:solid(C.white,0.2) };
  const arrL=mkFrame(32,32,null,16); arrL.x=8; arrL.y=Math.round((H-32)/2);
  Object.assign(arrL, arrowStyle); arrL.fills=arrowStyle.fills; arrL.strokeWeight=arrowStyle.strokeWeight; arrL.strokes=arrowStyle.strokes;
  arrL.layoutMode='HORIZONTAL'; arrL.primaryAxisSizingMode='FIXED'; arrL.counterAxisSizingMode='FIXED';
  arrL.primaryAxisAlignItems='CENTER'; arrL.counterAxisAlignItems='CENTER';
  arrL.appendChild(mkTxt('‹',16,'Bold',C.white)); banner.appendChild(arrL);

  const arrR=mkFrame(32,32,null,16); arrR.x=W-40; arrR.y=Math.round((H-32)/2);
  arrR.fills=arrowStyle.fills; arrR.strokeWeight=arrowStyle.strokeWeight; arrR.strokes=arrowStyle.strokes;
  arrR.layoutMode='HORIZONTAL'; arrR.primaryAxisSizingMode='FIXED'; arrR.counterAxisSizingMode='FIXED';
  arrR.primaryAxisAlignItems='CENTER'; arrR.counterAxisAlignItems='CENTER';
  arrR.appendChild(mkTxt('›',16,'Bold',C.white)); banner.appendChild(arrR);

  // Dots indicator
  const dotsY=H-16;
  const dotColors=[C.gold,C.muted,C.muted,C.muted];
  for (let i=0;i<4;i++) {
    const dot=figma.createEllipse();
    const dotW=i===0?16:6; dot.resize(dotW,6);
    dot.x=Math.round(W/2 - 20 + i*12); dot.y=dotsY;
    dot.fills=solid(dotColors[i],i===0?1:0.4);
    banner.appendChild(dot);
  }

  // Annotation
  const ann=mkTxt('← 美術出圖替換此區塊',10,'Regular',C.purpleLight,0.8);
  ann.x=W-ann.width-12; ann.y=4; banner.appendChild(ann);

  p.appendChild(banner); return y+H;
}

// 3. 立即進入按鈕 + 快速入口
function buildQuickActions(p, y) {
  const sec=mkFrame(W,148,C.card); sec.x=0; sec.y=y;
  sec.strokeWeight=1; sec.strokes=solid(C.purple,0.12);

  // Big CTA
  const cta=mkFrame(CW,48,linGrd('#F5C842','#E09520'),14); cta.x=16; cta.y=12;
  cta.layoutMode='HORIZONTAL'; cta.primaryAxisSizingMode='FIXED'; cta.counterAxisSizingMode='FIXED';
  cta.primaryAxisAlignItems='CENTER'; cta.counterAxisAlignItems='CENTER'; cta.itemSpacing=8;
  cta.effects=[{type:'DROP_SHADOW',color:{r:0.961,g:0.784,b:0.255,a:0.3},offset:{x:0,y:4},radius:14,spread:0,visible:true,blendMode:'NORMAL'}];
  cta.appendChild(mkTxt('▶',15,'Bold',rgb('#1a0a00')));
  cta.appendChild(mkTxt('立即進入遊戲大廳',16,'Bold',rgb('#1a0a00')));
  sec.appendChild(cta);

  // Quick links row (4 cols)
  const links=[
    { label:'儲值',  color:'#F5C842', bgOp:0.1 },
    { label:'活動',  color:'#F87171', bgOp:0.1 },
    { label:'排行榜',color:'#4ade80', bgOp:0.1 },
    { label:'教學',  color:'#AB80F7', bgOp:0.1 },
  ];
  const linkW=Math.floor((CW-12)/4);
  for (let i=0;i<4;i++) {
    const lk=mkFrame(linkW,68,null,12); lk.x=16+i*(linkW+4); lk.y=72;
    lk.fills=[{type:'SOLID',color:C.purple,opacity:0.1}]; lk.strokeWeight=1; lk.strokes=solid(C.purple,0.25);
    lk.layoutMode='VERTICAL'; lk.primaryAxisSizingMode='FIXED'; lk.counterAxisSizingMode='FIXED';
    lk.primaryAxisAlignItems='CENTER'; lk.counterAxisAlignItems='CENTER'; lk.itemSpacing=6;
    const icon=figma.createEllipse(); icon.resize(24,24); icon.fills=solid(rgb(links[i].color));
    lk.appendChild(icon);
    lk.appendChild(mkTxt(links[i].label,11,'Regular',rgb(links[i].color)));
    sec.appendChild(lk);
  }
  p.appendChild(sec); return y+148;
}

// 4. 排行榜快報
function buildLeaderboardSection(p, y) {
  // Header
  const hdr=mkFrame(W,36,C.bg); hdr.x=0; hdr.y=y;
  const title=mkTxt('排行榜快報',14,'Bold',C.text); title.x=16; title.y=10; hdr.appendChild(title);
  const upd=mkTxt('● 剛剛更新',10,'Regular',C.muted,0.7); upd.x=W-16-upd.width; upd.y=12; hdr.appendChild(upd);
  p.appendChild(hdr); y+=36;

  // Tab bar (compact)
  const tabSec=mkFrame(W,44,C.bg); tabSec.x=0; tabSec.y=y;
  const tbar=mkFrame(CW,36,null,10); tbar.x=16; tbar.y=4;
  tbar.fills=[{type:'SOLID',color:rgb('#000000'),opacity:0.25}]; tbar.strokeWeight=1; tbar.strokes=solid(C.purple,0.25);
  tbar.layoutMode='HORIZONTAL'; tbar.primaryAxisSizingMode='FIXED'; tbar.counterAxisSizingMode='FIXED';
  tbar.primaryAxisAlignItems='SPACE_BETWEEN'; tbar.counterAxisAlignItems='CENTER';
  tbar.paddingLeft=4; tbar.paddingRight=4;
  for (const [lbl,act] of [['總贏分',true],['倍率榜',false],['活動榜',false]]) {
    const tb=mkFrame(4,28,act?linGrd('#7C3AED','#6B21A8'):null,8);
    tb.layoutMode='HORIZONTAL'; tb.primaryAxisSizingMode='AUTO'; tb.counterAxisSizingMode='AUTO';
    tb.counterAxisAlignItems='CENTER'; tb.paddingLeft=12; tb.paddingRight=12;
    tb.appendChild(mkTxt(lbl,11,act?'Bold':'Regular',act?C.white:C.muted,act?1:0.6));
    tbar.appendChild(tb);
  }
  tabSec.appendChild(tbar); p.appendChild(tabSec); y+=44;

  // Rank items (5 items)
  const items=[
    { rank:1, name:'玩家***旺', amount:'NT$2,580,000', game:'老虎機', amtColor:'#F5C842' },
    { rank:2, name:'玩家***福', amount:'NT$1,820,000', game:'百家樂', amtColor:'#C0C0C0' },
    { rank:3, name:'玩家***星', amount:'NT$960,000',   game:'老虎機', amtColor:'#CD7F32' },
    { rank:4, name:'玩家***財', amount:'NT$800,000',   game:'老虎機', amtColor:'#AB80F7' },
    { rank:5, name:'玩家***福', amount:'NT$720,000',   game:'百家樂', amtColor:'#AB80F7' },
  ];
  const card=mkFrame(CW,1,C.card,12); card.x=16; card.y=y;
  card.layoutMode='VERTICAL'; card.primaryAxisSizingMode='AUTO'; card.counterAxisSizingMode='FIXED';
  card.paddingLeft=12; card.paddingRight=12; card.paddingTop=8; card.paddingBottom=8; card.itemSpacing=0;
  card.strokeWeight=1; card.strokes=solid(C.purple,0.2);

  const rankColors=['#F5C842','#C0C0C0','#CD7F32'];
  for (let i=0;i<items.length;i++) {
    const it=items[i];
    const row=mkFrame(CW-24,48); row.layoutMode='HORIZONTAL';
    row.primaryAxisSizingMode='FIXED'; row.counterAxisSizingMode='FIXED';
    row.counterAxisAlignItems='CENTER'; row.itemSpacing=10;
    if (i>0) { row.strokeWeight=1; row.strokes=solid(C.purple,0.08); }

    // Rank badge
    const rankBg=mkFrame(24,24,rgb(i<3?rankColors[i]:'#2A1A4A'),12);
    if (i>=3) { rankBg.fills=[{type:'SOLID',color:rgb('#2A1A4A'),opacity:1}]; }
    rankBg.layoutMode='HORIZONTAL'; rankBg.primaryAxisSizingMode='FIXED'; rankBg.counterAxisSizingMode='FIXED';
    rankBg.primaryAxisAlignItems='CENTER'; rankBg.counterAxisAlignItems='CENTER';
    rankBg.appendChild(mkTxt(String(it.rank),10,'Bold',i<3?rgb('#1a0a00'):C.muted)); row.appendChild(rankBg);

    const info=mkFrame(1,36); info.layoutMode='VERTICAL'; info.primaryAxisSizingMode='AUTO'; info.counterAxisSizingMode='AUTO';
    info.counterAxisAlignItems='MIN'; info.primaryAxisAlignItems='CENTER'; info.itemSpacing=2;
    info.appendChild(mkTxt(it.name,12,'Bold',C.text));
    info.appendChild(mkTxt(it.game+' · 剛剛',10,'Regular',C.muted,0.6));
    row.appendChild(info);

    row.appendChild(mkTxt(it.amount,12,'Bold',rgb(it.amtColor)));
    card.appendChild(row);
  }
  p.appendChild(card); y+=card.height;

  // View all link
  const viewAll=mkTxt('查看完整排行榜 →',11,'Regular',C.purpleLight);
  viewAll.x=Math.round(W/2-viewAll.width/2); viewAll.y=y+10;
  p.appendChild(viewAll); y+=36;

  return y;
}

// 5. 最新消息
function buildNewsSection(p, y) {
  const hdr=mkFrame(W,36,C.bg); hdr.x=0; hdr.y=y;
  const title=mkTxt('最新消息',14,'Bold',C.text); title.x=16; title.y=10; hdr.appendChild(title);
  p.appendChild(hdr); y+=36;

  const news=[
    { type:'activity', label:'活動', title:'百萬排行榜決賽倒數中！最後衝刺機會不容錯過', time:'1小時前', labelColor:'#F5C842', labelBg:'rgba(245,200,66,0.15)' },
    { type:'system',   label:'公告', title:'系統維護公告：2024/01/15 凌晨 05:00–05:30',  time:'3小時前', labelColor:'#60A5FA', labelBg:'rgba(96,165,250,0.15)' },
    { type:'activity', label:'活動', title:'新手首儲禮包升級！最高獲得 5,000 點額外贈點',  time:'昨天',    labelColor:'#F5C842', labelBg:'rgba(245,200,66,0.15)' },
  ];

  const card=mkFrame(CW,1,C.card,12); card.x=16; card.y=y;
  card.layoutMode='VERTICAL'; card.primaryAxisSizingMode='AUTO'; card.counterAxisSizingMode='FIXED';
  card.paddingLeft=0; card.paddingRight=0; card.paddingTop=0; card.paddingBottom=0; card.itemSpacing=0;
  card.strokeWeight=1; card.strokes=solid(C.purple,0.2);

  for (let i=0;i<news.length;i++) {
    const nw=news[i];
    const row=mkFrame(CW,68); row.layoutMode='HORIZONTAL';
    row.primaryAxisSizingMode='FIXED'; row.counterAxisSizingMode='FIXED';
    row.counterAxisAlignItems='CENTER'; row.itemSpacing=10;
    row.paddingLeft=14; row.paddingRight=14; row.paddingTop=0; row.paddingBottom=0;
    if (i>0) { row.strokeWeight=1; row.strokes=solid(C.purple,0.1); }

    // Badge
    const badge=mkFrame(36,22,null,6);
    badge.fills=[{type:'SOLID',color:rgb(nw.labelColor.replace(/[^#a-fA-F0-9]/g,'')||'F5C842'),opacity:0.15}];
    badge.layoutMode='HORIZONTAL'; badge.primaryAxisSizingMode='AUTO'; badge.counterAxisSizingMode='AUTO';
    badge.primaryAxisAlignItems='CENTER'; badge.counterAxisAlignItems='CENTER';
    badge.paddingLeft=7; badge.paddingRight=7; badge.paddingTop=4; badge.paddingBottom=4;
    badge.appendChild(mkTxt(nw.label,10,'Bold',rgb(nw.labelColor.startsWith('#')?nw.labelColor:'F5C842')));
    row.appendChild(badge);

    const infoCol=mkFrame(1,50); infoCol.layoutMode='VERTICAL'; infoCol.primaryAxisSizingMode='AUTO'; infoCol.counterAxisSizingMode='AUTO';
    infoCol.counterAxisAlignItems='MIN'; infoCol.primaryAxisAlignItems='CENTER'; infoCol.itemSpacing=4;

    const titleT=mkTxt(nw.title,12,'Regular',C.text); titleT.textAutoResize='HEIGHT'; titleT.resize(CW-80,titleT.height);
    infoCol.appendChild(titleT);
    infoCol.appendChild(mkTxt(nw.time,10,'Regular',C.muted,0.4));
    row.appendChild(infoCol);
    card.appendChild(row);
  }
  p.appendChild(card); y+=card.height+24;
  return y;
}

// 6. Bottom Nav
function buildBottomNav(p, y) {
  const items=[['首頁','home'],['活動','events'],['排行榜','leaderboard'],['客服','support'],['會員','member']];
  const nav=mkFrame(W,60); nav.x=0; nav.y=y;
  nav.fills=solid(C.bg); nav.strokeWeight=1; nav.strokes=solid(C.purple,0.15);
  nav.layoutMode='HORIZONTAL'; nav.primaryAxisSizingMode='FIXED'; nav.counterAxisSizingMode='FIXED';
  nav.primaryAxisAlignItems='SPACE_BETWEEN'; nav.counterAxisAlignItems='CENTER'; nav.paddingLeft=8; nav.paddingRight=8;
  for (const [lbl,key] of items) {
    const act=key==='home';
    const ni=mkFrame(48,44); ni.layoutMode='VERTICAL'; ni.primaryAxisSizingMode='FIXED';
    ni.counterAxisSizingMode='FIXED'; ni.counterAxisAlignItems='CENTER'; ni.primaryAxisAlignItems='CENTER'; ni.itemSpacing=3;
    const dot=figma.createEllipse(); dot.resize(18,18); dot.fills=solid(act?C.gold:C.muted,act?1:0.3); ni.appendChild(dot);
    ni.appendChild(mkTxt(lbl,10,act?'Bold':'Regular',act?C.gold:C.muted,act?1:0.5));
    nav.appendChild(ni);
  }
  p.appendChild(nav); return y+60;
}

// ── BUILD FRAME ────────────────────────────────────────────
const PAGE=mkFrame(W,100,C.bg); PAGE.name='首頁 — 手機版 📱'; PAGE.x=0; PAGE.y=50;
let Y=0;
Y = buildMarquee(PAGE, Y);
Y = buildBanner(PAGE, Y);
Y = buildQuickActions(PAGE, Y);
Y += 8;
Y = buildLeaderboardSection(PAGE, Y);
Y = buildNewsSection(PAGE, Y);
Y = buildBottomNav(PAGE, Y);
PAGE.resize(W, Y);
pg.appendChild(PAGE);

// Annotation
const lf=figma.createFrame(); lf.x=0; lf.y=10;
lf.fills=[{type:'SOLID',color:C.purple,opacity:0.15}]; lf.cornerRadius=6;
lf.layoutMode='HORIZONTAL'; lf.primaryAxisSizingMode='AUTO'; lf.counterAxisSizingMode='FIXED';
lf.resize(10,28); lf.paddingLeft=10; lf.paddingRight=10; lf.counterAxisAlignItems='CENTER';
lf.appendChild(mkTxt('首頁 — 手機版',12,'Bold',C.purpleLight)); pg.appendChild(lf);

figma.viewport.scrollAndZoomIntoView([PAGE]);
return `✅ 首頁完成！手機版 Frame 已建立於 📱 頁面參考 (高度 ${Y}px)`;

})();
