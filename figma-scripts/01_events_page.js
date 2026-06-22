// ============================================================
// 巨亨ONLINE — Figma 頁面腳本
// 01_events_page.js  →  活動頁 (events.vue)
// 目標頁面：📱 頁面參考
// 產出 Frame：
//   [A] 活動頁 — 進行中 📱      (x=0)
//   [B] 活動頁 — 即將開始 📱    (x=430)
//   [C] 活動頁 — 詳情 Modal 📱  (x=860)
// ============================================================

(async () => {

// ── FONTS ──────────────────────────────────────────────────
await Promise.all([
  figma.loadFontAsync({ family: 'Inter', style: 'Regular' }),
  figma.loadFontAsync({ family: 'Inter', style: 'Medium' }),
  figma.loadFontAsync({ family: 'Inter', style: 'Bold' }),
  figma.loadFontAsync({ family: 'Inter', style: 'Black' }),
]);

// ── PAGE ───────────────────────────────────────────────────
let pg = figma.root.children.find(p => p.name && p.name.includes('頁面參考'));
if (!pg) { pg = figma.createPage(); pg.name = '📱 頁面參考'; }
await figma.setCurrentPageAsync(pg);
pg.children.filter(n => n.name && n.name.includes('活動頁')).forEach(n => n.remove());

// ── COLOR HELPERS ──────────────────────────────────────────
const rgb = h => { const x = h.replace('#',''); return { r: parseInt(x.slice(0,2),16)/255, g: parseInt(x.slice(2,4),16)/255, b: parseInt(x.slice(4,6),16)/255 }; };
const C = {
  bg:          rgb('#0F0020'), bgDeep:     rgb('#080014'),
  card:        rgb('#160A2A'), gold:        rgb('#F5C842'),
  white:       rgb('#FFFFFF'), text:        rgb('#EDE0F9'),
  muted:       rgb('#C4B5D5'), purple:      rgb('#7C3AED'),
  purpleLight: rgb('#AB80F7'), purpleDark:  rgb('#6B21A8'),
  green:       rgb('#4ADE80'), red:         rgb('#DC2626'),
  amber:       rgb('#FBBF24'), gray:        rgb('#9CA3AF'),
  dark:        rgb('#120820'),
};
const solid  = (c, op=1) => [{ type:'SOLID', color:c, opacity:op }];
const linGrd = (c1, c2)  => [{ type:'GRADIENT_LINEAR', gradientTransform:[[1,0,0],[0,1,0]], gradientStops:[{ position:0, color:{...rgb(c1),a:1} },{ position:1, color:{...rgb(c2),a:1} }] }];

// ── BASE HELPERS ───────────────────────────────────────────
function mkTxt(str, sz, style, clr, op=1) {
  const n = figma.createText();
  n.fontName = { family:'Inter', style };
  n.fontSize = sz;
  n.characters = String(str);
  n.fills = [{ type:'SOLID', color:clr, opacity:op }];
  n.textAutoResize = 'WIDTH_AND_HEIGHT';
  return n;
}
function mkFrame(w, h, bg=null, radius=0, clip=false) {
  const f = figma.createFrame();
  f.resize(w, h);
  f.fills = bg ? (Array.isArray(bg) ? bg : solid(bg)) : [];
  f.cornerRadius = radius;
  f.clipsContent = clip;
  return f;
}

const W  = 390;
const CW = 358; // W - 32 (16px side padding)
const GAP = 40; // gap between frames

// ── SHARED COMPONENTS ──────────────────────────────────────
function buildMarquee(parent, y) {
  const mq = mkFrame(W, 36, C.bgDeep); mq.x = 0; mq.y = y; mq.clipsContent = true;
  const t = mkTxt('🔴 玩家***豪 在老虎機贏得 NT$38,500！  •  系統公告：服務正常  •  🔴 玩家***星 在百家樂贏得 NT$12,800！', 11, 'Regular', C.muted, 0.8);
  t.x = 12; t.y = 10; mq.appendChild(t); parent.appendChild(mq); return y + 36;
}

function buildHeader(parent, y, title) {
  const h = mkFrame(W, 52, C.bg); h.x = 0; h.y = y;
  const t = mkTxt(title, 20, 'Black', C.gold); t.x = 16; t.y = 14; h.appendChild(t);
  parent.appendChild(h); return y + 52;
}

function buildTabBar(parent, y, tabs) {
  // tabs: [{ label, count, active, badgeColor }]
  const sec = mkFrame(W, 60, C.bg); sec.x = 0; sec.y = y;
  const bar = mkFrame(CW, 48, null, 12); bar.x = 16; bar.y = 6;
  bar.layoutMode = 'HORIZONTAL'; bar.primaryAxisSizingMode = 'FIXED'; bar.counterAxisSizingMode = 'FIXED';
  bar.primaryAxisAlignItems = 'SPACE_BETWEEN'; bar.counterAxisAlignItems = 'CENTER';
  bar.paddingLeft = 6; bar.paddingRight = 6;
  bar.fills = [{ type:'SOLID', color:rgb('#000000'), opacity:0.3 }];
  bar.strokeWeight = 1; bar.strokes = solid(C.purple, 0.3);
  for (const tab of tabs) {
    const tb = mkFrame(4, 36, tab.active ? linGrd('#7C3AED','#6B21A8') : null, 8);
    tb.layoutMode = 'HORIZONTAL'; tb.primaryAxisSizingMode = 'AUTO'; tb.counterAxisSizingMode = 'AUTO';
    tb.counterAxisAlignItems = 'CENTER'; tb.itemSpacing = 5;
    tb.paddingLeft = 12; tb.paddingRight = 12; tb.paddingTop = 0; tb.paddingBottom = 0;
    tb.appendChild(mkTxt(tab.label, 12, tab.active ? 'Bold' : 'Regular', tab.active ? C.white : C.muted, tab.active ? 1 : 0.7));
    if (tab.count !== null) {
      const bdg = mkFrame(16, 16, C.red, 8);
      bdg.layoutMode = 'HORIZONTAL'; bdg.primaryAxisAlignItems = 'CENTER'; bdg.counterAxisAlignItems = 'CENTER';
      bdg.primaryAxisSizingMode = 'FIXED'; bdg.counterAxisSizingMode = 'FIXED';
      bdg.appendChild(mkTxt(String(tab.count), 9, 'Bold', C.white));
      tb.appendChild(bdg);
    }
    bar.appendChild(tb);
  }
  sec.appendChild(bar); parent.appendChild(sec); return y + 60;
}

function buildEventCard(parent, x, y, ev, statusLabel, statusColor) {
  const card = mkFrame(CW, 120, C.card, 16, true);
  card.name = `Card: ${ev.title}`; card.x = x; card.y = y;
  card.strokeWeight = 1; card.strokes = solid(C.purple, 0.2);

  // Gradient cover
  const cover = mkFrame(CW, 80, linGrd(ev.g1, ev.g2));
  cover.x = 0; cover.y = 0;
  const ctitle = mkTxt(ev.title, 16, 'Black', C.white); ctitle.x = 16; ctitle.y = 16; cover.appendChild(ctitle);
  const csub = mkTxt(ev.sub, 11, 'Regular', C.white, 0.65); csub.x = 16; csub.y = 42; cover.appendChild(csub);
  const cprize = mkTxt(ev.prize, 13, 'Bold', C.gold); cprize.y = 13; cprize.x = CW - 16 - cprize.width; cover.appendChild(cprize);

  // Status badge
  const sbf = mkFrame(70, 22, null, 999);
  sbf.layoutMode = 'HORIZONTAL'; sbf.primaryAxisSizingMode = 'AUTO'; sbf.counterAxisSizingMode = 'AUTO';
  sbf.primaryAxisAlignItems = 'CENTER'; sbf.counterAxisAlignItems = 'CENTER';
  sbf.paddingLeft = 8; sbf.paddingRight = 8; sbf.paddingTop = 4; sbf.paddingBottom = 4;
  sbf.fills = [{ type:'SOLID', color:statusColor, opacity:0.2 }];
  sbf.strokeWeight = 1; sbf.strokes = [{ type:'SOLID', color:statusColor, opacity:0.4 }];
  sbf.appendChild(mkTxt(statusLabel, 10, 'Bold', statusColor));
  cover.appendChild(sbf); sbf.x = CW - 12 - sbf.width; sbf.y = 42;
  card.appendChild(cover);

  // Footer
  const footer = mkFrame(CW, 40); footer.x = 0; footer.y = 80;
  const et = mkTxt(`截止：${ev.end}`, 11, 'Regular', C.muted, 0.7); et.x = 16; et.y = 12; footer.appendChild(et);
  const lt = mkTxt('查看詳情 →', 11, 'Regular', C.purpleLight); lt.x = CW - 16 - lt.width; lt.y = 12; footer.appendChild(lt);
  card.appendChild(footer);
  parent.appendChild(card);
  return y + 120;
}

function buildBottomNav(parent, y, activeKey) {
  const items = [['首頁','home'],['活動','events'],['排行榜','leaderboard'],['客服','support'],['會員','member']];
  const nav = mkFrame(W, 60); nav.x = 0; nav.y = y;
  nav.fills = solid(C.bg); nav.strokeWeight = 1; nav.strokes = solid(C.purple, 0.15);
  nav.layoutMode = 'HORIZONTAL'; nav.primaryAxisSizingMode = 'FIXED'; nav.counterAxisSizingMode = 'FIXED';
  nav.primaryAxisAlignItems = 'SPACE_AROUND'; nav.counterAxisAlignItems = 'CENTER';
  for (const [lbl, key] of items) {
    const act = key === activeKey;
    const ni = mkFrame(48, 44); ni.layoutMode = 'VERTICAL'; ni.primaryAxisSizingMode = 'FIXED';
    ni.counterAxisSizingMode = 'FIXED'; ni.counterAxisAlignItems = 'CENTER'; ni.primaryAxisAlignItems = 'CENTER'; ni.itemSpacing = 3;
    const dot = figma.createEllipse(); dot.resize(18, 18); dot.fills = solid(act ? C.gold : C.muted, act ? 1 : 0.3); ni.appendChild(dot);
    ni.appendChild(mkTxt(lbl, 10, act ? 'Bold' : 'Regular', act ? C.gold : C.muted, act ? 1 : 0.5));
    nav.appendChild(ni);
  }
  parent.appendChild(nav); return y + 60;
}

function addAnnotationLabel(text, x, y) {
  const lf = figma.createFrame(); lf.x = x; lf.y = y - 40;
  lf.fills = [{ type:'SOLID', color:C.purple, opacity:0.15 }]; lf.cornerRadius = 6;
  lf.layoutMode = 'HORIZONTAL'; lf.primaryAxisSizingMode = 'AUTO'; lf.counterAxisSizingMode = 'FIXED';
  lf.resize(10, 28); lf.paddingLeft = 10; lf.paddingRight = 10; lf.counterAxisAlignItems = 'CENTER';
  lf.appendChild(mkTxt(text, 12, 'Bold', C.purpleLight));
  pg.appendChild(lf);
}

// ── DATA ───────────────────────────────────────────────────
const activeEvs = [
  { title:'百萬大獎賽', sub:'累積積分衝頂，贏取百萬獎金',   end:'2026/12/31', prize:'NT$1,280,000', g1:'#1a003a', g2:'#7C3AED' },
  { title:'新手首儲禮', sub:'首次儲值享最高 100% 加碼',     end:'長期',       prize:'+100%',        g1:'#1a0a00', g2:'#D97706' },
  { title:'每日簽到獎', sub:'連續簽到 7 天，累積豐厚獎勵', end:'長期',       prize:'每日點數',    g1:'#0a1a00', g2:'#166534' },
];
const upcomingEvs = [
  { title:'春節限定活動', sub:'農曆新年特別回饋，限時限量', end:'2026/02/10', prize:'NT$500,000',  g1:'#2d0a0a', g2:'#991b1b' },
  { title:'情人節特別賽', sub:'雙人對戰，贏取情侶大禮包', end:'2026/02/14',  prize:'神秘禮物',   g1:'#1a003a', g2:'#be185d' },
];

// ── FRAME A — 進行中 ────────────────────────────────────────
{
  const PAGE = mkFrame(W, 100, C.bg); PAGE.name = '活動頁 — 進行中 📱'; PAGE.x = 0; PAGE.y = 50;
  let Y = 0;
  Y = buildMarquee(PAGE, Y);
  Y = buildHeader(PAGE, Y, '熱門活動');
  Y = buildTabBar(PAGE, Y, [
    { label:'進行中',   count:3, active:true,  badgeColor:C.green },
    { label:'即將開始', count:2, active:false, badgeColor:C.amber },
    { label:'已結束',   count:1, active:false, badgeColor:C.gray  },
  ]);
  Y += 8;
  for (let i = 0; i < activeEvs.length; i++) {
    Y = buildEventCard(PAGE, 16, Y, activeEvs[i], '進行中', C.green) + (i < activeEvs.length - 1 ? 16 : 24);
  }
  Y = buildBottomNav(PAGE, Y, 'events');
  PAGE.resize(W, Y);
  pg.appendChild(PAGE);
  addAnnotationLabel('活動頁 — 進行中 tab', 0, 50);
}

// ── FRAME B — 即將開始 ──────────────────────────────────────
{
  const OX = W + GAP;
  const PAGE = mkFrame(W, 100, C.bg); PAGE.name = '活動頁 — 即將開始 📱'; PAGE.x = OX; PAGE.y = 50;
  let Y = 0;
  Y = buildMarquee(PAGE, Y);
  Y = buildHeader(PAGE, Y, '熱門活動');
  Y = buildTabBar(PAGE, Y, [
    { label:'進行中',   count:3, active:false, badgeColor:C.green },
    { label:'即將開始', count:2, active:true,  badgeColor:C.amber },
    { label:'已結束',   count:1, active:false, badgeColor:C.gray  },
  ]);
  Y += 8;
  for (let i = 0; i < upcomingEvs.length; i++) {
    Y = buildEventCard(PAGE, 16, Y, upcomingEvs[i], '即將開始', C.amber) + (i < upcomingEvs.length - 1 ? 16 : 24);
  }
  Y = buildBottomNav(PAGE, Y, 'events');
  PAGE.resize(W, Y);
  pg.appendChild(PAGE);
  addAnnotationLabel('活動頁 — 即將開始 tab', OX, 50);
}

// ── FRAME C — 詳情 Modal ────────────────────────────────────
{
  const OX = (W + GAP) * 2;
  const MODAL_H = 720;
  const PAGE = mkFrame(W, MODAL_H, C.bg); PAGE.name = '活動頁 — 詳情 Modal 📱'; PAGE.x = OX; PAGE.y = 50;

  // Background page (blurred - simulated with low opacity overlay)
  const overlay = mkFrame(W, MODAL_H, rgb('#000000')); overlay.x = 0; overlay.y = 0; overlay.opacity = 0.75;
  PAGE.appendChild(overlay);

  // Modal box (auto-layout vertical)
  const mBox = mkFrame(CW, 10, C.dark, 20, false);
  mBox.x = 16; mBox.y = 140;
  mBox.layoutMode = 'VERTICAL'; mBox.primaryAxisSizingMode = 'AUTO'; mBox.counterAxisSizingMode = 'FIXED';
  mBox.paddingLeft = 16; mBox.paddingRight = 16; mBox.paddingTop = 20; mBox.paddingBottom = 24; mBox.itemSpacing = 14;
  mBox.strokeWeight = 1; mBox.strokes = solid(C.purple, 0.3);

  // ① Handle bar
  const handleWrap = mkFrame(10, 14); handleWrap.layoutMode = 'HORIZONTAL'; handleWrap.primaryAxisSizingMode = 'AUTO';
  handleWrap.counterAxisSizingMode = 'FIXED'; handleWrap.primaryAxisAlignItems = 'CENTER'; handleWrap.counterAxisAlignItems = 'CENTER';
  const handleBar = mkFrame(36, 4, rgb('#FFFFFF'), 2); handleBar.opacity = 0.2; handleWrap.appendChild(handleBar);
  mBox.appendChild(handleWrap);

  // ② Gradient cover
  const mCover = mkFrame(10, 10, linGrd('#1a003a','#7C3AED'), 12);
  mCover.layoutMode = 'VERTICAL'; mCover.primaryAxisSizingMode = 'AUTO'; mCover.counterAxisSizingMode = 'AUTO';
  mCover.paddingLeft = 16; mCover.paddingRight = 16; mCover.paddingTop = 16; mCover.paddingBottom = 16; mCover.itemSpacing = 6;
  mCover.appendChild(mkTxt('百萬大獎賽', 18, 'Black', C.white));
  mCover.appendChild(mkTxt('累積積分衝頂，贏取百萬獎金', 12, 'Regular', C.white, 0.7));
  mBox.appendChild(mCover);

  // ③ Info rows
  for (const [lbl, val, clr] of [['活動獎金','NT$1,280,000',C.gold],['截止日期','2026/12/31',C.text]]) {
    const row = mkFrame(10, 32); row.layoutMode = 'HORIZONTAL'; row.primaryAxisSizingMode = 'AUTO';
    row.counterAxisSizingMode = 'FIXED'; row.primaryAxisAlignItems = 'SPACE_BETWEEN'; row.counterAxisAlignItems = 'CENTER';
    row.appendChild(mkTxt(lbl, 13, 'Regular', C.muted, 0.7)); row.appendChild(mkTxt(val, 13, 'Bold', clr));
    mBox.appendChild(row);
  }

  // ④ Divider
  const div = mkFrame(10, 1, C.purple); div.opacity = 0.2; mBox.appendChild(div);

  // ⑤ Description
  const desc = mkTxt('活動詳細規則說明由後台系統填入。參與方式、計分標準、獎金發放時程等資訊將在活動正式開始後公告。', 12, 'Regular', C.muted, 0.75);
  desc.textAutoResize = 'HEIGHT'; desc.resize(CW - 32, desc.height);
  desc.lineHeight = { value:180, unit:'PERCENT' }; mBox.appendChild(desc);

  // ⑥ CTA Button
  const cta = mkFrame(10, 48, linGrd('#F5C842','#E09520'), 12);
  cta.layoutMode = 'HORIZONTAL'; cta.primaryAxisSizingMode = 'AUTO'; cta.counterAxisSizingMode = 'FIXED';
  cta.primaryAxisAlignItems = 'CENTER'; cta.counterAxisAlignItems = 'CENTER';
  cta.effects = [{ type:'DROP_SHADOW', color:{r:0.961,g:0.784,b:0.255,a:0.35}, offset:{x:0,y:4}, radius:14, spread:0, visible:true, blendMode:'NORMAL' }];
  cta.appendChild(mkTxt('立即參與', 15, 'Bold', rgb('#1a0a00'))); mBox.appendChild(cta);

  PAGE.appendChild(mBox);
  pg.appendChild(PAGE);
  addAnnotationLabel('活動頁 — 詳情 Modal', OX, 50);
}

figma.viewport.scrollAndZoomIntoView(pg.children);
return '✅ 活動頁完成！Frame A(進行中) + B(即將開始) + C(詳情Modal) 已建立於 📱 頁面參考';

})();
