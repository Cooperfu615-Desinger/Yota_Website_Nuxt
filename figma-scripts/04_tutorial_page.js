// ============================================================
// 巨亨ONLINE — Figma 頁面腳本
// 04_tutorial_page.js  →  新手教學頁 (tutorial.vue)
// 目標頁面：📱 頁面參考
// 產出 Frame：
//   [A] 新手教學 — 遊戲介紹 📱   (x=0)
//   [B] 新手教學 — APP特色 📱     (x=430)
//   [C] 新手教學 — 安裝教學 📱   (x=860)
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
pg.children.filter(n => n.name && n.name.includes('新手教學')).forEach(n => n.remove());

// ── HELPERS ────────────────────────────────────────────────
const rgb    = h => { const x=h.replace('#',''); return { r:parseInt(x.slice(0,2),16)/255, g:parseInt(x.slice(2,4),16)/255, b:parseInt(x.slice(4,6),16)/255 }; };
const solid  = (c,op=1) => [{ type:'SOLID',color:c,opacity:op }];
const linGrd = (c1,c2)  => [{ type:'GRADIENT_LINEAR', gradientTransform:[[1,0,0],[0,1,0]], gradientStops:[{position:0,color:{...rgb(c1),a:1}},{position:1,color:{...rgb(c2),a:1}}] }];

const C = {
  bg:rgb('#0F0020'), bgDeep:rgb('#080014'), card:rgb('#160A2A'), cardLight:rgb('#1E0E38'),
  gold:rgb('#F5C842'), white:rgb('#FFFFFF'), text:rgb('#EDE0F9'),
  muted:rgb('#C4B5D5'), purple:rgb('#7C3AED'), purpleLight:rgb('#AB80F7'),
  green:rgb('#4ADE80'), red:rgb('#F87171'), blue:rgb('#60A5FA'),
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

// ── SHARED ─────────────────────────────────────────────────
function buildMarquee(p, y) {
  const mq=mkFrame(W,36,C.bgDeep); mq.x=0; mq.y=y; mq.clipsContent=true;
  const t=mkTxt('🔴 玩家***豪 贏得 38,500 金幣！  •  系統公告：服務正常  •  🔴 玩家***星 贏得 12,800 金幣！',11,'Regular',C.muted,0.8);
  t.x=12; t.y=10; mq.appendChild(t); p.appendChild(mq); return y+36;
}

function buildHeader(p, y) {
  const h=mkFrame(W,52,C.bg); h.x=0; h.y=y;
  const t=mkTxt('新手教學',20,'Black',C.gold); t.x=16; t.y=14; h.appendChild(t);
  p.appendChild(h); return y+52;
}

function buildTabBar(p, y, activeKey) {
  const tabs=[{key:'games',label:'遊戲介紹'},{key:'features',label:'APP 特色'},{key:'install',label:'安裝教學'}];
  const sec=mkFrame(W,56,C.bg); sec.x=0; sec.y=y;
  const bar=mkFrame(CW,44,null,12); bar.x=16; bar.y=6;
  bar.layoutMode='HORIZONTAL'; bar.primaryAxisSizingMode='FIXED'; bar.counterAxisSizingMode='FIXED';
  bar.primaryAxisAlignItems='SPACE_BETWEEN'; bar.counterAxisAlignItems='CENTER';
  bar.paddingLeft=4; bar.paddingRight=4;
  bar.fills=[{type:'SOLID',color:rgb('#000000'),opacity:0.3}];
  bar.strokeWeight=1; bar.strokes=solid(C.purple,0.3);
  for (const tab of tabs) {
    const act=tab.key===activeKey;
    const tb=mkFrame(4,36,act?linGrd('#7C3AED','#6B21A8'):null,8);
    tb.layoutMode='HORIZONTAL'; tb.primaryAxisSizingMode='AUTO'; tb.counterAxisSizingMode='AUTO';
    tb.counterAxisAlignItems='CENTER'; tb.paddingLeft=12; tb.paddingRight=12; tb.paddingTop=0; tb.paddingBottom=0;
    tb.appendChild(mkTxt(tab.label,12,act?'Bold':'Regular',act?C.white:C.muted,act?1:0.7));
    bar.appendChild(tb);
  }
  sec.appendChild(bar); p.appendChild(sec); return y+56;
}

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

function addAnnotationLabel(text, x, y) {
  const lf=figma.createFrame(); lf.x=x; lf.y=y-40;
  lf.fills=[{type:'SOLID',color:C.purple,opacity:0.15}]; lf.cornerRadius=6;
  lf.layoutMode='HORIZONTAL'; lf.primaryAxisSizingMode='AUTO'; lf.counterAxisSizingMode='FIXED';
  lf.resize(10,28); lf.paddingLeft=10; lf.paddingRight=10; lf.counterAxisAlignItems='CENTER';
  lf.appendChild(mkTxt(text,12,'Bold',C.purpleLight)); pg.appendChild(lf);
}

// ── DATA ───────────────────────────────────────────────────
const games = [
  { name:'水果老虎機',    desc:'經典水果符號，多線賠率', badge:'熱門',  rtp:'96.5%', grd:['#1a0a00','#D97706'] },
  { name:'招財貓百家樂',  desc:'亞洲最受歡迎桌遊',       badge:'新上線',rtp:'98.9%', grd:['#001a3a','#1E40AF'] },
  { name:'海洋捕魚機',    desc:'射擊系遊戲，越大越賺',   badge:null,    rtp:'95.8%', grd:['#001a10','#065F46'] },
  { name:'麻將胡了',      desc:'麻將主題老虎機',          badge:null,    rtp:'96.2%', grd:['#1a0010','#9D174D'] },
  { name:'神龍傳奇',      desc:'亞洲神話主題大獎機',      badge:'熱門',  rtp:'95.5%', grd:['#10001a','#5B21B6'] },
  { name:'魚蝦蟹',        desc:'傳統骰子遊戲，簡單好玩', badge:null,    rtp:'97.1%', grd:['#1a1000','#92400E'] },
];

const features = [
  { icon:'🎰', title:'保留座功能',   desc:'暫時離開不怕位置被搶，系統自動保留您的遊戲席位長達 10 分鐘。' },
  { icon:'💬', title:'即時聊天室',   desc:'與其他玩家即時互動，分享喜悅、交流技巧，讓遊戲更有趣。' },
  { icon:'🏆', title:'即時排行榜',   desc:'即時更新的排行榜讓您掌握競爭狀況，激勵您挑戰頂端。' },
  { icon:'🔔', title:'推播通知',     desc:'重要活動、中獎通知不錯過，第一時間掌握最新資訊。' },
  { icon:'🔒', title:'SSL 安全加密', desc:'所有交易採用銀行級 256-bit SSL 加密，保障您的資金安全。' },
];

const iosSteps = [
  '點選頁面上方「iOS 下載」按鈕',
  '出現「是否要下載設定描述檔？」，點選「允許」',
  '前往 手機設定 → 一般 → VPN 與裝置管理',
  '點選企業應用程式 → 點選「信任」',
  '返回桌面，找到已安裝的 APP 圖示，即可開啟',
];

const androidSteps = [
  '點選頁面下方「Android 下載」按鈕',
  '如出現「此類型檔案可能會損害裝置」，點選「仍要下載」',
  '完成下載後，點選 APK 檔案進行安裝（如要求允許未知來源，請在設定中開啟）',
];

// ── FRAME A — 遊戲介紹 ─────────────────────────────────────
{
  const PAGE=mkFrame(W,100,C.bg); PAGE.name='新手教學 — 遊戲介紹 📱'; PAGE.x=0; PAGE.y=50;
  let Y=0;
  Y = buildMarquee(PAGE, Y);
  Y = buildHeader(PAGE, Y);
  Y = buildTabBar(PAGE, Y, 'games');
  Y += 12;

  // 2-column game grid
  const CARD_W = Math.floor((CW - 12) / 2);
  const CARD_H = 164;

  for (let i=0; i<games.length; i++) {
    const g=games[i];
    const col=i%2; const row=Math.floor(i/2);
    const cx = 16 + col*(CARD_W+12);
    const cy = Y + row*(CARD_H+12);

    const card=mkFrame(CARD_W, CARD_H, C.card, 12, true);
    card.name=`GameCard: ${g.name}`; card.x=cx; card.y=cy;
    card.strokeWeight=1; card.strokes=solid(C.purple,0.2);

    // Cover (aspect-video ≈ 16:9)
    const coverH=Math.round(CARD_W * 9/16);
    const cover=mkFrame(CARD_W, coverH, linGrd(g.grd[0],g.grd[1]));
    cover.x=0; cover.y=0; cover.clipsContent=true;

    // Game emoji placeholder
    const emo=mkTxt('🎮',28,'Regular',C.white);
    emo.x=Math.round(CARD_W/2-emo.width/2); emo.y=Math.round(coverH/2-emo.height/2);
    cover.appendChild(emo);

    // Badge
    if (g.badge) {
      const bdg=mkFrame(4,20,g.badge==='熱門'?C.gold:C.red,6);
      bdg.layoutMode='HORIZONTAL'; bdg.primaryAxisSizingMode='AUTO'; bdg.counterAxisSizingMode='AUTO';
      bdg.primaryAxisAlignItems='CENTER'; bdg.counterAxisAlignItems='CENTER';
      bdg.paddingLeft=7; bdg.paddingRight=7; bdg.paddingTop=3; bdg.paddingBottom=3;
      bdg.appendChild(mkTxt(g.badge,9,'Bold',g.badge==='熱門'?rgb('#1a0a00'):C.white));
      bdg.x=6; bdg.y=6; cover.appendChild(bdg);
    }

    // Annotation for art team
    const ann=mkTxt('← 遊戲圖片',8,'Regular',C.purpleLight,0.7);
    ann.x=CARD_W-ann.width-4; ann.y=4; cover.appendChild(ann);

    card.appendChild(cover);

    // Card body
    const body=mkFrame(CARD_W,CARD_H-coverH);
    body.x=0; body.y=coverH;
    body.layoutMode='VERTICAL'; body.primaryAxisSizingMode='AUTO'; body.counterAxisSizingMode='FIXED';
    body.paddingLeft=10; body.paddingRight=10; body.paddingTop=8; body.paddingBottom=8; body.itemSpacing=3;

    body.appendChild(mkTxt(g.name, 12, 'Bold', C.text));
    body.appendChild(mkTxt(g.desc, 10, 'Regular', C.muted, 0.7));

    // RTP + Try btn row
    const bottomRow=mkFrame(1,28); bottomRow.layoutMode='HORIZONTAL';
    bottomRow.primaryAxisSizingMode='AUTO'; bottomRow.counterAxisSizingMode='AUTO';
    bottomRow.primaryAxisAlignItems='SPACE_BETWEEN'; bottomRow.counterAxisAlignItems='CENTER';
    bottomRow.itemSpacing=0;
    bottomRow.appendChild(mkTxt(`RTP ${g.rtp}`,10,'Regular',C.purpleLight));
    const tryBtn=mkFrame(4,24,C.gold,999); tryBtn.layoutMode='HORIZONTAL';
    tryBtn.primaryAxisSizingMode='AUTO'; tryBtn.counterAxisSizingMode='AUTO';
    tryBtn.primaryAxisAlignItems='CENTER'; tryBtn.counterAxisAlignItems='CENTER';
    tryBtn.paddingLeft=10; tryBtn.paddingRight=10; tryBtn.paddingTop=0; tryBtn.paddingBottom=0;
    tryBtn.appendChild(mkTxt('試玩',10,'Bold',rgb('#1a0a00'))); bottomRow.appendChild(tryBtn);
    body.appendChild(bottomRow);
    card.appendChild(body);
    PAGE.appendChild(card);
  }

  const rowCount = Math.ceil(games.length/2);
  Y += rowCount * (CARD_H + 12) - 12 + 24;
  Y = buildBottomNav(PAGE, Y);
  PAGE.resize(W, Y);
  pg.appendChild(PAGE);
  addAnnotationLabel('新手教學 — 遊戲介紹 tab', 0, 50);
}

// ── FRAME B — APP 特色 ──────────────────────────────────────
{
  const OX=W+GAP;
  const PAGE=mkFrame(W,100,C.bg); PAGE.name='新手教學 — APP特色 📱'; PAGE.x=OX; PAGE.y=50;
  let Y=0;
  Y = buildMarquee(PAGE, Y);
  Y = buildHeader(PAGE, Y);
  Y = buildTabBar(PAGE, Y, 'features');
  Y += 12;

  for (const f of features) {
    const card=mkFrame(CW,1,C.card,12); card.x=16; card.y=Y;
    card.layoutMode='HORIZONTAL'; card.primaryAxisSizingMode='AUTO'; card.counterAxisSizingMode='FIXED';
    card.paddingLeft=14; card.paddingRight=14; card.paddingTop=14; card.paddingBottom=14; card.itemSpacing=14;
    card.strokeWeight=1; card.strokes=solid(C.purple,0.2);

    // Icon box
    const iconBox=mkFrame(44,44,rgb('#2A1A4A'),12);
    iconBox.layoutMode='HORIZONTAL'; iconBox.primaryAxisSizingMode='FIXED'; iconBox.counterAxisSizingMode='FIXED';
    iconBox.primaryAxisAlignItems='CENTER'; iconBox.counterAxisAlignItems='CENTER';
    iconBox.appendChild(mkTxt(f.icon,20,'Regular',C.white));
    card.appendChild(iconBox);

    // Text column
    const col=mkFrame(1,1); col.layoutMode='VERTICAL'; col.primaryAxisSizingMode='AUTO'; col.counterAxisSizingMode='AUTO';
    col.counterAxisAlignItems='MIN'; col.primaryAxisAlignItems='MIN'; col.itemSpacing=5;
    col.appendChild(mkTxt(f.title,13,'Bold',C.text));
    const descT=mkTxt(f.desc,11,'Regular',C.muted,0.75); descT.textAutoResize='HEIGHT'; descT.resize(CW-44-14-14-14,descT.height);
    descT.lineHeight={value:160,unit:'PERCENT'}; col.appendChild(descT);
    card.appendChild(col);

    PAGE.appendChild(card);
    Y += card.height + 12;
  }

  Y += 12;
  Y = buildBottomNav(PAGE, Y);
  PAGE.resize(W, Y);
  pg.appendChild(PAGE);
  addAnnotationLabel('新手教學 — APP特色 tab', OX, 50);
}

// ── FRAME C — 安裝教學 ──────────────────────────────────────
{
  const OX=(W+GAP)*2;
  const PAGE=mkFrame(W,100,C.bg); PAGE.name='新手教學 — 安裝教學 📱'; PAGE.x=OX; PAGE.y=50;
  let Y=0;
  Y = buildMarquee(PAGE, Y);
  Y = buildHeader(PAGE, Y);
  Y = buildTabBar(PAGE, Y, 'install');
  Y += 16;

  function buildInstallSection(steps, title, btnLabel, btnColor, iconColor) {
    // Section title row
    const titleRow=mkFrame(W,32,C.bg); titleRow.x=0; titleRow.y=Y;
    const dot=figma.createEllipse(); dot.resize(8,8); dot.x=16; dot.y=12; dot.fills=solid(rgb(iconColor));
    titleRow.appendChild(dot);
    const titleT=mkTxt(title,14,'Bold',C.text); titleT.x=30; titleT.y=8; titleRow.appendChild(titleT);
    PAGE.appendChild(titleRow);
    let ly=Y+32;

    // Steps card
    const card=mkFrame(CW,1,C.card,12); card.x=16; card.y=ly;
    card.layoutMode='VERTICAL'; card.primaryAxisSizingMode='AUTO'; card.counterAxisSizingMode='FIXED';
    card.paddingLeft=14; card.paddingRight=14; card.paddingTop=12; card.paddingBottom=12; card.itemSpacing=0;
    card.strokeWeight=1; card.strokes=solid(C.purple,0.2);

    for (let i=0;i<steps.length;i++) {
      const row=mkFrame(CW-28,1); row.layoutMode='HORIZONTAL';
      row.primaryAxisSizingMode='AUTO'; row.counterAxisSizingMode='AUTO';
      row.counterAxisAlignItems='MIN'; row.itemSpacing=10;
      if (i>0) { row.paddingTop=12; }

      // Step number circle
      const numBg=mkFrame(24,24,rgb(iconColor),12);
      numBg.layoutMode='HORIZONTAL'; numBg.primaryAxisSizingMode='FIXED'; numBg.counterAxisSizingMode='FIXED';
      numBg.primaryAxisAlignItems='CENTER'; numBg.counterAxisAlignItems='CENTER';
      numBg.appendChild(mkTxt(String(i+1),11,'Bold',rgb('#0F0020'))); row.appendChild(numBg);

      const stepT=mkTxt(steps[i],12,'Regular',C.muted,0.8); stepT.textAutoResize='HEIGHT'; stepT.resize(CW-28-24-10,stepT.height);
      stepT.lineHeight={value:160,unit:'PERCENT'}; row.appendChild(stepT);
      card.appendChild(row);
    }
    PAGE.appendChild(card);
    ly += card.height + 12;

    // Download button
    const btn=mkFrame(CW,48,linGrd(btnColor,shiftColor(btnColor,-20)),12); btn.x=16; btn.y=ly;
    btn.layoutMode='HORIZONTAL'; btn.primaryAxisSizingMode='FIXED'; btn.counterAxisSizingMode='FIXED';
    btn.primaryAxisAlignItems='CENTER'; btn.counterAxisAlignItems='CENTER'; btn.itemSpacing=8;
    btn.effects=[{type:'DROP_SHADOW',color:{...rgb(btnColor),a:0.3},offset:{x:0,y:4},radius:12,spread:0,visible:true,blendMode:'NORMAL'}];
    btn.appendChild(mkTxt(btnLabel,14,'Bold',rgb('#0F0020')));
    PAGE.appendChild(btn);
    ly += 48 + 24;
    return ly;
  }

  // Helper: darken hex color by amount
  function shiftColor(hex, amt) {
    const h=hex.replace('#','');
    const r=Math.max(0,Math.min(255,parseInt(h.slice(0,2),16)+amt));
    const g=Math.max(0,Math.min(255,parseInt(h.slice(2,4),16)+amt));
    const b=Math.max(0,Math.min(255,parseInt(h.slice(4,6),16)+amt));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  // Note: buildInstallSection uses Y from outer scope, must update Y
  // iOS section
  {
    const titleRow=mkFrame(W,32,C.bg); titleRow.x=0; titleRow.y=Y;
    const dot=figma.createEllipse(); dot.resize(8,8); dot.x=16; dot.y=12; dot.fills=solid(rgb('#A0A0A0'));
    titleRow.appendChild(dot);
    const titleT=mkTxt('iOS 安裝步驟',14,'Bold',C.text); titleT.x=30; titleT.y=8; titleRow.appendChild(titleT);
    PAGE.appendChild(titleRow); Y+=32;

    const card=mkFrame(CW,1,C.card,12); card.x=16; card.y=Y;
    card.layoutMode='VERTICAL'; card.primaryAxisSizingMode='AUTO'; card.counterAxisSizingMode='FIXED';
    card.paddingLeft=14; card.paddingRight=14; card.paddingTop=12; card.paddingBottom=12; card.itemSpacing=0;
    card.strokeWeight=1; card.strokes=solid(C.purple,0.2);
    for (let i=0;i<iosSteps.length;i++) {
      const row=mkFrame(CW-28,1); row.layoutMode='HORIZONTAL'; row.primaryAxisSizingMode='AUTO'; row.counterAxisSizingMode='AUTO';
      row.counterAxisAlignItems='MIN'; row.itemSpacing=10; if (i>0) row.paddingTop=12;
      const nb=mkFrame(24,24,rgb('#C0C0C0'),12); nb.layoutMode='HORIZONTAL'; nb.primaryAxisSizingMode='FIXED'; nb.counterAxisSizingMode='FIXED';
      nb.primaryAxisAlignItems='CENTER'; nb.counterAxisAlignItems='CENTER'; nb.appendChild(mkTxt(String(i+1),11,'Bold',rgb('#0F0020'))); row.appendChild(nb);
      const st=mkTxt(iosSteps[i],12,'Regular',C.muted,0.8); st.textAutoResize='HEIGHT'; st.resize(CW-28-24-10,st.height);
      st.lineHeight={value:160,unit:'PERCENT'}; row.appendChild(st); card.appendChild(row);
    }
    PAGE.appendChild(card); Y+=card.height+12;

    // Screenshot placeholders row
    const snapRow=mkFrame(W,100); snapRow.x=0; snapRow.y=Y; snapRow.clipsContent=true;
    snapRow.layoutMode='HORIZONTAL'; snapRow.primaryAxisSizingMode='FIXED'; snapRow.counterAxisSizingMode='FIXED';
    snapRow.paddingLeft=16; snapRow.itemSpacing=8;
    for (let i=0;i<4;i++) {
      const ph=mkFrame(80,100,rgb('#160A2A'),10);
      ph.strokeWeight=1; ph.strokes=solid(C.purple,0.25);
      ph.layoutMode='VERTICAL'; ph.primaryAxisSizingMode='FIXED'; ph.counterAxisSizingMode='FIXED';
      ph.primaryAxisAlignItems='CENTER'; ph.counterAxisAlignItems='CENTER';
      ph.appendChild(mkTxt(`截圖 ${i+1}`,9,'Regular',C.muted,0.5)); snapRow.appendChild(ph);
    }
    PAGE.appendChild(snapRow); Y+=100+12;

    const iBtn=mkFrame(CW,48,linGrd('#A0A0A0','#606060'),12); iBtn.x=16; iBtn.y=Y;
    iBtn.layoutMode='HORIZONTAL'; iBtn.primaryAxisSizingMode='FIXED'; iBtn.counterAxisSizingMode='FIXED';
    iBtn.primaryAxisAlignItems='CENTER'; iBtn.counterAxisAlignItems='CENTER'; iBtn.itemSpacing=8;
    iBtn.appendChild(mkTxt('iOS 下載',14,'Bold',C.white)); PAGE.appendChild(iBtn); Y+=48+24;
  }

  // Divider
  const divLine=mkFrame(CW,1,C.purple); divLine.x=16; divLine.y=Y; divLine.opacity=0.2; PAGE.appendChild(divLine); Y+=24;

  // Android section
  {
    const titleRow=mkFrame(W,32,C.bg); titleRow.x=0; titleRow.y=Y;
    const dot=figma.createEllipse(); dot.resize(8,8); dot.x=16; dot.y=12; dot.fills=solid(rgb('#3DDC84'));
    titleRow.appendChild(dot);
    const titleT=mkTxt('Android 安裝步驟',14,'Bold',C.text); titleT.x=30; titleT.y=8; titleRow.appendChild(titleT);
    PAGE.appendChild(titleRow); Y+=32;

    const card=mkFrame(CW,1,C.card,12); card.x=16; card.y=Y;
    card.layoutMode='VERTICAL'; card.primaryAxisSizingMode='AUTO'; card.counterAxisSizingMode='FIXED';
    card.paddingLeft=14; card.paddingRight=14; card.paddingTop=12; card.paddingBottom=12; card.itemSpacing=0;
    card.strokeWeight=1; card.strokes=solid(C.purple,0.2);
    for (let i=0;i<androidSteps.length;i++) {
      const row=mkFrame(CW-28,1); row.layoutMode='HORIZONTAL'; row.primaryAxisSizingMode='AUTO'; row.counterAxisSizingMode='AUTO';
      row.counterAxisAlignItems='MIN'; row.itemSpacing=10; if (i>0) row.paddingTop=12;
      const nb=mkFrame(24,24,rgb('#3DDC84'),12); nb.layoutMode='HORIZONTAL'; nb.primaryAxisSizingMode='FIXED'; nb.counterAxisSizingMode='FIXED';
      nb.primaryAxisAlignItems='CENTER'; nb.counterAxisAlignItems='CENTER'; nb.appendChild(mkTxt(String(i+1),11,'Bold',rgb('#0F0020'))); row.appendChild(nb);
      const st=mkTxt(androidSteps[i],12,'Regular',C.muted,0.8); st.textAutoResize='HEIGHT'; st.resize(CW-28-24-10,st.height);
      st.lineHeight={value:160,unit:'PERCENT'}; row.appendChild(st); card.appendChild(row);
    }
    PAGE.appendChild(card); Y+=card.height+12;

    const aBtn=mkFrame(CW,48,linGrd('#3DDC84','#1A8A42'),12); aBtn.x=16; aBtn.y=Y;
    aBtn.layoutMode='HORIZONTAL'; aBtn.primaryAxisSizingMode='FIXED'; aBtn.counterAxisSizingMode='FIXED';
    aBtn.primaryAxisAlignItems='CENTER'; aBtn.counterAxisAlignItems='CENTER'; aBtn.itemSpacing=8;
    aBtn.appendChild(mkTxt('Android 下載',14,'Bold',rgb('#0F0020'))); PAGE.appendChild(aBtn); Y+=48+24;
  }

  Y = buildBottomNav(PAGE, Y);
  PAGE.resize(W, Y);
  pg.appendChild(PAGE);
  addAnnotationLabel('新手教學 — 安裝教學 tab', OX, 50);
}

figma.viewport.scrollAndZoomIntoView(pg.children);
return '✅ 新手教學頁完成！Frame A(遊戲介紹) + B(APP特色) + C(安裝教學) 已建立於 📱 頁面參考';

})();
