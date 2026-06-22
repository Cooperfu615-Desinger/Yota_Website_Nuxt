// ============================================================
// 巨亨ONLINE — Figma 頁面腳本
// 02_leaderboard_page.js  →  排行榜頁 (leaderboard.vue)
// 目標頁面：📱 頁面參考
// 產出 Frame：
//   [A] 排行榜 — 總贏分 📱    (x=0)
//   [B] 排行榜 — 倍率榜 📱    (x=430)
//   [C] 排行榜 — 活動榜 📱    (x=860)
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
pg.children.filter(n => n.name && n.name.includes('排行榜')).forEach(n => n.remove());

// ── HELPERS ────────────────────────────────────────────────
const rgb  = h => { const x=h.replace('#',''); return { r:parseInt(x.slice(0,2),16)/255, g:parseInt(x.slice(2,4),16)/255, b:parseInt(x.slice(4,6),16)/255 }; };
const solid  = (c,op=1) => [{ type:'SOLID', color:c, opacity:op }];
const linGrd = (c1,c2)  => [{ type:'GRADIENT_LINEAR', gradientTransform:[[1,0,0],[0,1,0]], gradientStops:[{ position:0,color:{...rgb(c1),a:1}},{ position:1,color:{...rgb(c2),a:1}}] }];

const C = {
  bg:rgb('#0F0020'), bgDeep:rgb('#080014'), card:rgb('#160A2A'),
  gold:rgb('#F5C842'), goldDark:rgb('#B8860B'), white:rgb('#FFFFFF'),
  text:rgb('#EDE0F9'), muted:rgb('#C4B5D5'), purple:rgb('#7C3AED'),
  purpleLight:rgb('#AB80F7'), silver:rgb('#C0C0C0'), bronze:rgb('#CD7F32'),
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

const W=390, CW=358, GAP=40;

// ── SHARED BUILDERS ────────────────────────────────────────
function buildMarquee(p, y) {
  const mq=mkFrame(W,36,C.bgDeep); mq.x=0; mq.y=y; mq.clipsContent=true;
  const t=mkTxt('🔴 玩家***旺 在老虎機贏得 NT$38,500！  •  系統公告：服務正常  •  🔴 玩家***龍 在水果老虎機贏得 ×2,560倍！',11,'Regular',C.muted,0.8);
  t.x=12; t.y=10; mq.appendChild(t); p.appendChild(mq); return y+36;
}

function buildHeader(p, y) {
  const h=mkFrame(W,64,C.bg); h.x=0; h.y=y;
  const t=mkTxt('排行榜',20,'Black',C.gold); t.x=16; t.y=12; h.appendChild(t);
  const sub=mkTxt('● 剛剛更新',11,'Regular',C.muted,0.7); sub.x=16; sub.y=40; h.appendChild(sub);
  p.appendChild(h); return y+64;
}

function buildTabBar(p, y, activeKey) {
  const tabs=[{key:'win',label:'總贏分'},{key:'multi',label:'倍率榜'},{key:'event',label:'活動榜'}];
  const sec=mkFrame(W,56,C.bg); sec.x=0; sec.y=y;
  const bar=mkFrame(CW,44,null,12); bar.x=16; bar.y=6;
  bar.layoutMode='HORIZONTAL'; bar.primaryAxisSizingMode='FIXED'; bar.counterAxisSizingMode='FIXED';
  bar.primaryAxisAlignItems='SPACE_BETWEEN'; bar.counterAxisAlignItems='CENTER';
  bar.paddingLeft=6; bar.paddingRight=6;
  bar.fills=[{type:'SOLID',color:rgb('#000000'),opacity:0.3}];
  bar.strokeWeight=1; bar.strokes=solid(C.purple,0.3);
  for (const tab of tabs) {
    const act=tab.key===activeKey;
    const tb=mkFrame(4,34,act?linGrd('#7C3AED','#6B21A8'):null,8);
    tb.layoutMode='HORIZONTAL'; tb.primaryAxisSizingMode='AUTO'; tb.counterAxisSizingMode='AUTO';
    tb.counterAxisAlignItems='CENTER'; tb.paddingLeft=16; tb.paddingRight=16; tb.paddingTop=0; tb.paddingBottom=0;
    tb.appendChild(mkTxt(tab.label,12,act?'Bold':'Regular',act?C.white:C.muted,act?1:0.7));
    bar.appendChild(tb);
  }
  sec.appendChild(bar); p.appendChild(sec); return y+56;
}

// Podium for Top 3
function buildPodium(p, y, top3) {
  const SECTION_H = 260;
  const sec=mkFrame(W,SECTION_H,C.bg); sec.x=0; sec.y=y;

  // Heights: 2nd=80px, 1st=110px, 3rd=60px
  const podiumData = [
    { rank:2, barH:80,  barGrd:['#808080','#C0C0C0'], circleD:56, borderC:'#C0C0C0', data:top3[1] },
    { rank:1, barH:110, barGrd:['#B8860B','#F5C842'], circleD:64, borderC:'#F5C842', data:top3[0] },
    { rank:3, barH:60,  barGrd:['#8B4513','#CD7F32'], circleD:56, borderC:'#CD7F32', data:top3[2] },
  ];

  const BOTTOM_Y = SECTION_H - 10;
  const slotW = W / 3;

  for (let i=0; i<3; i++) {
    const d=podiumData[i];
    const cx = slotW * i + slotW/2;

    // Crown for 1st
    if (d.rank===1) {
      const crown=mkTxt('👑',18,'Regular',C.gold);
      crown.x=Math.round(cx - crown.width/2); crown.y=BOTTOM_Y - d.barH - d.circleD - 30;
      sec.appendChild(crown);
    }

    // Avatar circle
    const avatarBg=mkFrame(d.circleD,d.circleD,linGrd('#A855F7','#6B21A8'),d.circleD/2);
    avatarBg.strokeWeight=2; avatarBg.strokes=solid(rgb(d.borderC));
    avatarBg.x=Math.round(cx - d.circleD/2);
    avatarBg.y=BOTTOM_Y - d.barH - d.circleD - (d.rank===1?4:0);
    if (d.rank===1) { avatarBg.effects=[{type:'DROP_SHADOW',color:{r:0.961,g:0.784,b:0.255,a:0.5},offset:{x:0,y:0},radius:16,spread:0,visible:true,blendMode:'NORMAL'}]; }
    const emoT=mkTxt('👤',d.rank===1?22:18,'Regular',C.white);
    emoT.x=Math.round(d.circleD/2 - emoT.width/2); emoT.y=Math.round(d.circleD/2 - emoT.height/2);
    avatarBg.appendChild(emoT); sec.appendChild(avatarBg);

    // Name
    const nameT=mkTxt(d.data.name,10,d.rank===1?'Bold':'Regular',d.rank===1?C.gold:C.muted,d.rank===1?1:0.8);
    nameT.x=Math.round(cx - nameT.width/2); nameT.y=avatarBg.y + d.circleD + 3;
    sec.appendChild(nameT);

    // Bar
    const bar=mkFrame(slotW-16, d.barH, linGrd(d.barGrd[0],d.barGrd[1]));
    bar.topLeftRadius=8; bar.topRightRadius=8;
    bar.x=Math.round(cx - (slotW-16)/2);
    bar.y=BOTTOM_Y - d.barH;
    const rankT=mkTxt(String(d.rank), d.rank===1?20:16, 'Black', d.rank===1?rgb('#1a0a00'):C.white);
    rankT.x=Math.round((slotW-16)/2 - rankT.width/2); rankT.y=d.barH-26;
    bar.appendChild(rankT); sec.appendChild(bar);
  }

  p.appendChild(sec);

  // Score cards row
  const scoreRow=mkFrame(CW,72,null); scoreRow.x=16; scoreRow.y=y+SECTION_H;
  scoreRow.layoutMode='HORIZONTAL'; scoreRow.primaryAxisSizingMode='FIXED'; scoreRow.counterAxisSizingMode='FIXED';
  scoreRow.primaryAxisAlignItems='SPACE_BETWEEN'; scoreRow.counterAxisAlignItems='CENTER'; scoreRow.itemSpacing=8;

  // Reorder to rank 1,2,3 for score cards
  const ordered=[top3[0],top3[1],top3[2]];
  const scoreColors=[C.gold,C.silver,C.bronze];
  for (let i=0; i<3; i++) {
    const sc=mkFrame(1,64,C.card,10); sc.layoutMode='VERTICAL';
    sc.primaryAxisSizingMode='AUTO'; sc.counterAxisSizingMode='AUTO';
    sc.paddingLeft=8; sc.paddingRight=8; sc.paddingTop=8; sc.paddingBottom=8; sc.itemSpacing=3;
    sc.strokeWeight=1; sc.strokes=solid(C.purple,0.2);
    const amtT=mkTxt(ordered[i].amount,11,'Bold',scoreColors[i]||C.gold);
    sc.appendChild(amtT);
    sc.appendChild(mkTxt(ordered[i].game,10,'Regular',C.muted,0.7));
    scoreRow.appendChild(sc);
  }
  p.appendChild(scoreRow);

  return y + SECTION_H + 80;
}

function buildRankList(p, y, items) {
  const card=mkFrame(CW,1,C.card,12); card.x=16; card.y=y;
  card.layoutMode='VERTICAL'; card.primaryAxisSizingMode='AUTO'; card.counterAxisSizingMode='FIXED';
  card.paddingLeft=12; card.paddingRight=12; card.paddingTop=8; card.paddingBottom=8; card.itemSpacing=0;
  card.strokeWeight=1; card.strokes=solid(C.purple,0.2);

  for (let i=0; i<items.length; i++) {
    const item=items[i];
    const row=mkFrame(CW-24,48); row.layoutMode='HORIZONTAL';
    row.primaryAxisSizingMode='FIXED'; row.counterAxisSizingMode='FIXED';
    row.counterAxisAlignItems='CENTER'; row.itemSpacing=10;

    if (i>0) { row.strokeWeight=1; row.strokes=solid(C.purple,0.08); row.paddingTop=1; }

    // Rank badge
    const badgeBg=mkFrame(28,28,rgb('#2A1A4A'),14); badgeBg.layoutMode='HORIZONTAL';
    badgeBg.primaryAxisSizingMode='FIXED'; badgeBg.counterAxisSizingMode='FIXED';
    badgeBg.primaryAxisAlignItems='CENTER'; badgeBg.counterAxisAlignItems='CENTER';
    badgeBg.appendChild(mkTxt(String(item.rank),11,'Bold',C.muted));
    row.appendChild(badgeBg);

    // Avatar
    const av=mkFrame(28,28,rgb('#2A1A4A'),14); av.layoutMode='HORIZONTAL';
    av.primaryAxisSizingMode='FIXED'; av.counterAxisSizingMode='FIXED';
    av.primaryAxisAlignItems='CENTER'; av.counterAxisAlignItems='CENTER';
    av.appendChild(mkTxt('👤',13,'Regular',C.white)); row.appendChild(av);

    // Name + game
    const info=mkFrame(1,40); info.layoutMode='VERTICAL';
    info.primaryAxisSizingMode='AUTO'; info.counterAxisSizingMode='AUTO';
    info.counterAxisAlignItems='MIN'; info.primaryAxisAlignItems='CENTER'; info.itemSpacing=2;
    info.appendChild(mkTxt(item.name,13,'Bold',C.text));
    info.appendChild(mkTxt(item.game,11,'Regular',C.muted,0.7));
    row.appendChild(info);

    // Amount
    const amt=mkTxt(item.amount,13,'Bold',C.purpleLight);
    row.appendChild(amt);

    card.appendChild(row);
  }

  p.appendChild(card);
  return y + card.height + 24;
}

function buildBottomNav(p, y, activeKey) {
  const items=[['首頁','home'],['活動','events'],['排行榜','leaderboard'],['客服','support'],['會員','member']];
  const nav=mkFrame(W,60); nav.x=0; nav.y=y;
  nav.fills=solid(C.bg); nav.strokeWeight=1; nav.strokes=solid(C.purple,0.15);
  nav.layoutMode='HORIZONTAL'; nav.primaryAxisSizingMode='FIXED'; nav.counterAxisSizingMode='FIXED';
  nav.primaryAxisAlignItems='SPACE_BETWEEN'; nav.counterAxisAlignItems='CENTER'; nav.paddingLeft=8; nav.paddingRight=8;
  for (const [lbl,key] of items) {
    const act=key===activeKey;
    const ni=mkFrame(48,44); ni.layoutMode='VERTICAL'; ni.primaryAxisSizingMode='FIXED';
    ni.counterAxisSizingMode='FIXED'; ni.counterAxisAlignItems='CENTER'; ni.primaryAxisAlignItems='CENTER'; ni.itemSpacing=3;
    const dot=figma.createEllipse(); dot.resize(18,18); dot.fills=solid(act?C.gold:C.muted,act?1:0.3); ni.appendChild(dot);
    ni.appendChild(mkTxt(lbl,10,act?'Bold':'Regular',act?C.gold:C.muted,act?1:0.5));
    nav.appendChild(ni);
  }
  p.appendChild(nav); return y+60;
}

function addAnnotationLabel(text, x, y) {
  const lf=figma.createFrame(); lf.x=x; lf.y=y-40;
  lf.fills=[{type:'SOLID',color:C.purple,opacity:0.15}]; lf.cornerRadius=6;
  lf.layoutMode='HORIZONTAL'; lf.primaryAxisSizingMode='AUTO'; lf.counterAxisSizingMode='FIXED';
  lf.resize(10,28); lf.paddingLeft=10; lf.paddingRight=10; lf.counterAxisAlignItems='CENTER';
  lf.appendChild(mkTxt(text,12,'Bold',C.purpleLight)); pg.appendChild(lf);
}

// ── DATA ───────────────────────────────────────────────────
const data = {
  win: {
    top3: [
      { rank:1, name:'玩家***旺', amount:'NT$2,580,000', game:'老虎機', color:'gold' },
      { rank:2, name:'玩家***福', amount:'NT$1,820,000', game:'百家樂', color:'silver' },
      { rank:3, name:'玩家***星', amount:'NT$960,000',   game:'老虎機', color:'bronze' },
    ],
    rest: [
      { rank:4,  name:'玩家***財', amount:'NT$800,000', game:'老虎機' },
      { rank:5,  name:'玩家***福', amount:'NT$720,000', game:'百家樂' },
      { rank:6,  name:'玩家***祿', amount:'NT$640,000', game:'捕魚' },
      { rank:7,  name:'玩家***壽', amount:'NT$560,000', game:'老虎機' },
      { rank:8,  name:'玩家***喜', amount:'NT$480,000', game:'百家樂' },
      { rank:9,  name:'玩家***吉', amount:'NT$400,000', game:'老虎機' },
      { rank:10, name:'玩家***順', amount:'NT$320,000', game:'捕魚' },
    ],
  },
  multi: {
    top3: [
      { rank:1, name:'玩家***龍', amount:'×2,560 倍', game:'水果老虎機', color:'gold' },
      { rank:2, name:'玩家***鳳', amount:'×1,888 倍', game:'老虎機',     color:'silver' },
      { rank:3, name:'玩家***虎', amount:'×1,280 倍', game:'捕魚機',     color:'bronze' },
    ],
    rest: [
      { rank:4,  name:'玩家***風', amount:'×1,100 倍', game:'老虎機' },
      { rank:5,  name:'玩家***雲', amount:'×1,000 倍', game:'捕魚機' },
      { rank:6,  name:'玩家***雷', amount:'×900 倍',   game:'老虎機' },
      { rank:7,  name:'玩家***電', amount:'×800 倍',   game:'百家樂' },
      { rank:8,  name:'玩家***水', amount:'×700 倍',   game:'老虎機' },
      { rank:9,  name:'玩家***火', amount:'×600 倍',   game:'捕魚' },
      { rank:10, name:'玩家***土', amount:'×500 倍',   game:'老虎機' },
    ],
  },
  event: {
    top3: [
      { rank:1, name:'玩家***王', amount:'6,280 分', game:'百萬大獎賽', color:'gold' },
      { rank:2, name:'玩家***侯', amount:'5,990 分', game:'百萬大獎賽', color:'silver' },
      { rank:3, name:'玩家***將', amount:'5,560 分', game:'百萬大獎賽', color:'bronze' },
    ],
    rest: [
      { rank:4,  name:'玩家***相', amount:'5,200 分', game:'百萬大獎賽' },
      { rank:5,  name:'玩家***士', amount:'4,900 分', game:'百萬大獎賽' },
      { rank:6,  name:'玩家***兵', amount:'4,600 分', game:'百萬大獎賽' },
      { rank:7,  name:'玩家***車', amount:'4,300 分', game:'百萬大獎賽' },
      { rank:8,  name:'玩家***馬', amount:'4,000 分', game:'百萬大獎賽' },
      { rank:9,  name:'玩家***砲', amount:'3,700 分', game:'百萬大獎賽' },
      { rank:10, name:'玩家***卒', amount:'3,400 分', game:'百萬大獎賽' },
    ],
  },
};

// ── BUILD 3 FRAMES ─────────────────────────────────────────
const tabDefs = [
  { key:'win',   label:'排行榜 — 總贏分 📱',  activeTab:'win' },
  { key:'multi', label:'排行榜 — 倍率榜 📱',  activeTab:'multi' },
  { key:'event', label:'排行榜 — 活動榜 📱',  activeTab:'event' },
];

for (let fi=0; fi<3; fi++) {
  const { key, label, activeTab } = tabDefs[fi];
  const OX = fi * (W + GAP);
  const PAGE=mkFrame(W,100,C.bg); PAGE.name=label; PAGE.x=OX; PAGE.y=50;
  let Y=0;
  Y = buildMarquee(PAGE, Y);
  Y = buildHeader(PAGE, Y);
  Y = buildTabBar(PAGE, Y, activeTab);
  Y = buildPodium(PAGE, Y, data[key].top3);
  Y = buildRankList(PAGE, Y, data[key].rest);
  Y = buildBottomNav(PAGE, Y, 'leaderboard');
  PAGE.resize(W, Y);
  pg.appendChild(PAGE);
  addAnnotationLabel(label.replace(' 📱',''), OX, 50);
}

figma.viewport.scrollAndZoomIntoView(pg.children);
return '✅ 排行榜頁完成！Frame A(總贏分) + B(倍率榜) + C(活動榜) 已建立於 📱 頁面參考';

})();
