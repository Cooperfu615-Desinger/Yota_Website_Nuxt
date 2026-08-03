import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = process.argv[2]
const outputPath = resolve(projectRoot, 'handbook/appendix-a-error-message-reference.md')

if (!sourcePath) {
  console.error('用法：node handbook/build-error-appendix.mjs /path/to/message.txt')
  process.exit(1)
}

const sourceLabel = sourcePath.split(/[\\/]/).pop()
const source = await readFile(resolve(sourcePath), 'utf8')
const entryPattern = /^\s*(Msg[A-Za-z0-9_]+):\s*'([^']*)',?/gm
const entries = [...source.matchAll(entryPattern)].map((match) => ({
  code: match[1],
  message: match[2],
}))

if (entries.length === 0) {
  console.error(`找不到 RespMeg 錯誤訊息：${sourcePath}`)
  process.exit(1)
}

const escapeTableCell = (value) => String(value)
  .replaceAll('\\', '\\\\')
  .replaceAll('|', '\\|')
  .replaceAll('\n', ' ')

const codeLink = (code) => `[\`${code}\`](#error-${code.toLowerCase()})`

const backendPrefixes = [
  'MsgAgent',
  'MsgAdministrator',
  'MsgArticle',
  'MsgAnnouncement',
  'MsgAsset',
  'MsgAvatar',
  'MsgCover',
  'MsgImage',
  'MsgLevel',
  'MsgMailbox',
  'MsgManual',
  'MsgOperator',
  'MsgPopup',
  'MsgSaga',
  'MsgStats',
  'MsgTemplate',
  'MsgAdjustment',
  'MsgAdjust',
  'MsgRedis',
  'MsgSql',
]

const playerPrefixes = [
  'MsgAccount',
  'MsgConversation',
  'MsgDeposit',
  'MsgDialCode',
  'MsgEmail',
  'MsgExchange',
  'MsgFrequency',
  'MsgGame',
  'MsgInviteCode',
  'MsgInsufficientBalance',
  'MsgInvalidP2p',
  'MsgKeyword',
  'MsgLogin',
  'MsgOAuth',
  'MsgOrder',
  'MsgPhone',
  'MsgPlayer',
  'MsgRebate',
  'MsgRegister',
  'MsgRewardCard',
  'MsgSettlement',
  'MsgTransferTarget',
  'MsgUpgrade',
  'MsgWallet',
]

const includesPrefix = (code, prefixes) => prefixes.some((prefix) => code.startsWith(prefix))

function scopeFor(code) {
  if (includesPrefix(code, backendPrefixes)) return '後台／技術候選'
  if (includesPrefix(code, playerPrefixes)) return '玩家／客服候選'
  if ([
    'MsgInternalServerError',
    'MsgInvalidToken',
    'MsgRequestValidateFail',
    'MsgServiceUnavailable',
    'MsgSessionNotFound',
    'MsgSystemMaintenance',
    'MsgTurnstile',
  ].some((prefix) => code.startsWith(prefix))) return '玩家／客服候選'
  return '客服／技術待分類'
}

const commonRows = [
  ['MsgAccountAlreadyExists', '註冊帳號已存在。', '確認玩家輸入的帳號是否正確；若確定是新帳號，請請玩家更換帳號。', '不要向玩家透露其他帳號持有人資訊；若玩家主張帳號屬於自己，依帳號驗證流程轉交。', '客服主管／會員資料相關後端'],
  ['MsgAccountHasBeenUsed', '帳號已被使用。', '此帳號目前無法再次使用，請改用其他帳號。', '確認是否為註冊、綁定或邀請流程中的重複資料。', '客服主管／會員資料相關後端'],
  ['MsgAccountInvalidCredentials', '帳號或密碼錯誤。', '請確認帳號與密碼是否輸入正確；仍無法登入時，可依忘記密碼流程申請重設。', '先確認大小寫、前後空格與輸入法；不得要求玩家提供密碼。', '登入問題持續或疑似遭盜用時升級處理'],
  ['MsgAccountDisabled', '帳號已停用。', '此帳號目前無法登入，請由客服協助確認帳號狀態。', '記錄帳號、發生時間與錯誤代碼；不要自行承諾恢復時間。', '會員狀態管理／客服主管'],
  ['MsgAccountFrozen', '帳戶已凍結，僅可瀏覽。', '帳戶目前處於限制狀態，部分操作暫時無法使用。', '確認玩家要執行的功能與帳號狀態，依解凍或申訴流程處理。', '會員狀態管理／風控'],
  ['MsgAccountEmailAlreadyExists', '電子郵件已存在。', '此電子郵件已綁定其他會員資料，請確認是否輸入正確。', '不得提供已綁定帳號的個人資訊；若需變更，依身分驗證流程處理。', '會員資料相關後端'],
  ['MsgAccountPhoneHasBeenUsed', '電話號碼已存在。', '此電話號碼已綁定其他會員資料，請確認是否輸入正確。', '不得提供已綁定帳號的個人資訊；若需變更，依身分驗證流程處理。', '會員資料相關後端'],
  ['MsgRegisterDisabled', '註冊功能暫時無法使用。', '目前暫時無法註冊，請稍後再試。', '確認是否為全站性狀況；記錄發生時間、裝置與錯誤代碼。', '值班營運／後端'],
  ['MsgLoginDisabled', '登入功能暫時無法使用。', '目前暫時無法登入，請稍後再試。', '先確認是否為全站性異常，再依公告或事件處理流程回覆。', '值班營運／後端'],
  ['MsgLoginLimited', '登入次數過多。', '登入嘗試次數過多，請稍後再試；若忘記密碼，請改走忘記密碼流程。', '不要反覆嘗試或要求玩家提供密碼；記錄帳號與錯誤代碼。', '持續無法登入或疑似攻擊時升級風控／後端'],
  ['MsgLoginLimitedIP', 'IP 登入次數過多。', '目前登入嘗試受到暫時限制，請稍後再試。', '確認是否多人共用網路、VPN 或異常流量；不要直接承諾解除時間。', '風控／後端'],
  ['MsgLoginLimitedUsername', '帳號登入次數過多。', '此帳號目前受到暫時登入限制，請稍後再試。', '確認帳號、錯誤代碼與最後一次成功登入資訊。', '風控／後端'],
  ['MsgInvalidPassword', '密碼錯誤。', '請確認密碼是否輸入正確；若忘記密碼，請依忘記密碼流程申請重設。', '客服不得查看、索取或代填玩家密碼。', '登入問題持續時升級會員／後端'],
  ['MsgSamePassword', '密碼不可與舊密碼相同。', '新密碼不能與目前密碼相同，請重新設定一組不同的密碼。', '確認符合密碼 6–100 字元規則；不要記錄新密碼。', '若持續失敗，提供錯誤代碼給後端'],
  ['MsgAccountOldPasswordMismatch', '舊密碼不正確。', '請確認目前密碼是否輸入正確；若忘記，請改走忘記密碼流程。', '客服不得索取密碼；先確認玩家是否誤用新密碼或複製到空格。', '登入問題持續時升級會員／後端'],
  ['MsgAccountInviteCodeNotFound', '無效的邀請碼。', '請確認推薦碼是否完整、大小寫正確，且未混入前後空格。', '確認代碼類型：代理商推廣碼為 6 碼，玩家代理推薦碼為 8 碼；不要將兩者混用。', '代理關係或推薦碼資料異常時升級後端'],
  ['MsgInviteCodeInvalidLength', '邀請碼長度需為 6 或 8。', '系統回傳的長度規則需要進一步確認，請先不要直接向玩家承諾單一格式。', '依使用情境確認是代理商推廣碼 6 碼或玩家代理推薦碼 8 碼，並保留錯誤代碼。', '產品 PM／後端：確認 API 與前端文案是否一致'],
  ['MsgOAuthExchangeFailed', 'OAuth 換 token 或驗證失敗。', '三方登入驗證失敗，請重新操作；仍無法使用時提供錯誤代碼。', '記錄登入方式、時間、裝置與瀏覽器；不要要求玩家提供 token。', '後端／第三方登入整合負責人'],
  ['MsgTurnstileVerificationFailed', '驗證錯誤。', '頁面驗證未完成，請重新整理後再操作。', '確認瀏覽器、網路、外掛與是否重複送出；不要要求玩家提供驗證內容。', '持續發生或多人同時發生時升級後端'],
  ['MsgInsufficientBalance', '餘額不足。', '目前錢包餘額不足，請先確認錢包與幣別，再進行儲值或轉入。', '確認使用中的錢包、幣別、可用餘額與操作類型；不要只看總資產判定可用餘額。', '金流／錢包後端'],
  ['MsgWalletNotFound', '找不到錢包。', '目前找不到對應的錢包資料，請重新整理後再試。', '記錄會員、幣別、操作時間與錯誤代碼；不要自行建立或更換錢包。', '金流／錢包後端'],
  ['MsgExchangeAmountNotDivisible', '兌換金額不可整除。', '兌換金額不符合目前的換算單位，請調整金額後再試。', '確認幣別、換算比例、最小單位與前端顯示規則。', '金流／產品後端'],
  ['MsgInvalidP2pAmounts', '無效的 P2P 金額。', '轉帳金額格式或範圍不符合規則，請確認輸入金額後再試。', '確認金額、幣別、可用餘額與是否重複送出。', '金流／錢包後端'],
  ['MsgInvalidP2pWallet', '無效的 P2P 錢包。', '目前選取的轉帳錢包無法使用，請重新確認錢包與幣別。', '保留來源錢包、目標錢包、幣別與錯誤代碼，不要自行改動帳務資料。', '金流／錢包後端'],
  ['MsgTransferTargetInvalid', '轉接對象無效（空字串或同 operator）。', '轉入或轉出對象無效，請確認對象資料後再試。', '確認是否留白、是否選到自己或不適用的對象；不要猜測交易是否成功。', '代理／金流後端'],
  ['MsgDepositOrderNotFound', '找不到原始儲值訂單。', '系統目前找不到這筆儲值訂單，請提供訂單資訊讓客服協助查詢。', '收集訂單編號、帳號、金額、幣別、時間與付款方式；不要要求完整卡號或密碼。', '金流／後端'],
  ['MsgDepositAlreadyReversed', '原始儲值訂單已沖正。', '這筆儲值訂單已被沖正，客服需要進一步確認帳務狀態。', '先查核訂單與錢包流水，不要重複承諾補款或再次操作。', '金流／財務／後端'],
  ['MsgRewardCardExpired', '優惠卡已過期。', '此優惠卡已超過使用期限，無法再使用。', '確認優惠卡編號、有效期限與活動規則；不要承諾展延。', '營運活動負責人'],
  ['MsgRewardCardNotFound', '找不到優惠卡。', '系統找不到這張優惠卡，請確認卡號或入口是否正確。', '記錄卡號、會員、操作時間與活動名稱；不要要求玩家提供密碼。', '營運活動／後端'],
  ['MsgRewardCardTurnoverNotMet', '優惠卡未達流水要求。', '目前尚未達到優惠卡的流水要求，因此暫時無法使用或提領。', '查核該優惠卡的流水規則、目前進度與適用幣別，依正式活動規則說明。', '營運活動／金流'],
  ['MsgKeywordBlocked', '關鍵字攔截。', '訊息包含目前無法使用的內容，請調整文字後再送出。', '不要向玩家揭露完整攔截詞庫；確認是否為誤判並記錄原始情境。', '客服主管／風控'],
  ['MsgFrequencyError', '超出次數限制請等待一下。', '操作次數過多，請稍後再試。', '確認功能、時間、帳號與 IP；不要自行承諾固定等待秒數。', '風控／後端'],
  ['MsgConversationClosed', '對話已關閉（允許另起）。', '這個對話已結束，請重新建立新的客服對話。', '確認是否應沿用原工單或另建對話，避免重複建立大量案件。', '客服主管（若無法另起時再升級）'],
  ['MsgConversationStopped', '對話已停用（對方聊天被管理員停用，不可另起）。', '目前無法在此對話中繼續傳送訊息，請由客服確認後續處理方式。', '確認停用原因與處置權限，不要引導玩家反覆建立對話規避限制。', '客服主管／風控'],
  ['MsgPlayerHasActiveOrder', '玩家有未結案工單。', '目前已有處理中的案件，請先沿用原案件，避免重複送出。', '查詢既有工單編號與狀態，將新資訊補充到原案件。', '客服主管（工單狀態異常時升級後端）'],
  ['MsgOrderAlreadyResolved', '工單已結案。', '此案件已結案；若有新問題，請重新建立案件或依客服流程處理。', '確認結案時間、結案原因與是否需要重新開案，不要直接修改歷史紀錄。', '客服主管'],
  ['MsgOrderNotFound', '工單不存在。', '目前找不到這筆工單，請確認工單編號或登入帳號是否正確。', '確認工單編號、會員與時間；不要以不存在直接判定玩家未提交。', '客服系統／後端'],
  ['MsgOrderNotOwnedByPlayer', '工單不屬於此玩家。', '目前登入的會員無法查看這筆工單，請確認登入帳號。', '不得提供其他玩家工單內容；疑似帳號問題依身分驗證流程處理。', '客服主管／會員資料相關後端'],
  ['MsgOrderNotInProgress', '工單非處理中（不可發訊或轉接）。', '此案件目前不是處理中的狀態，暫時無法進行這項操作。', '查核工單狀態與操作時點，避免重複轉接或發訊。', '客服系統／後端'],
  ['MsgServiceUnavailable', '服務暫時無法使用。', '服務暫時無法使用，請稍後再試。', '確認是否為單一功能或全站異常，記錄時間、功能、裝置與錯誤代碼。', '值班營運／後端'],
  ['MsgSystemMaintenance', '系統維護中。', '系統目前維護中，請依公告時間稍後再試。', '確認維護公告與影響範圍；若無公告，通知值班營運。', '值班營運／後端'],
  ['MsgInternalServerError', '伺服器內部異常。', '系統發生暫時性異常，請稍後再試；若仍無法使用，請提供錯誤代碼。', '記錄完整錯誤代碼、時間、功能與操作步驟，不要向玩家轉述技術堆疊。', '後端／值班營運'],
  ['MsgSessionNotFound', '找不到 Session。', '登入狀態已失效，請重新登入後再操作。', '確認是否為閒置逾時、跨分頁或瀏覽器快取問題；不得要求玩家提供 token。', '持續發生時升級後端'],
  ['MsgInvalidToken', 'token 失效。', '登入驗證已失效，請重新登入後再操作。', '不要要求玩家提供 token；記錄發生功能與時間。', '持續發生或大量發生時升級後端'],
  ['MsgRequestValidateFail', '請求資料異常（驗證器不通過）。', '送出的資料格式不符合規則，請重新確認欄位後再試。', '記錄功能、欄位、錯誤代碼與輸入情境；不要猜測尚未確認的限制。', '產品 PM／後端'],
]

const commonByCode = new Map(commonRows.map((row) => [row[0], row]))
const entryByCode = new Map(entries.map((entry) => [entry.code, entry]))
const missingCommon = commonRows.filter(([code]) => !entryByCode.has(code)).map(([code]) => code)

if (missingCommon.length > 0) {
  console.warn(`常見錯誤對照表中的代碼不在來源檔：${missingCommon.join(', ')}`)
}

const lines = [
  '# 附錄 A：錯誤訊息與客服處理對照表',
  '',
  '- 章節狀態：草稿，待產品與後端確認',
  '- 版本：0.1',
  '- 建立日期：2026-08-03',
  `- 來源：message.txt（RespMeg），本次來源筆數：${entries.length} 筆`,
  '- 適用對象：產品營運人員、客服人員',
  '- 相關章節：第一章、第二章、第六章、第七章、第十章、第十二章、第十三章、第十四章、第十五章、第十六章',
  '',
  '> 注意：本附錄是內部整理草稿。來源檔中的文字是後端回傳訊息，不代表都適合直接對玩家顯示或照字面回覆。正式話術、錯誤歸類、處理時限與補償規則，仍須由產品、後端、營運與客服共同確認。',
  '',
  '## A.1 使用方式',
  '',
  '當玩家或代理商回報錯誤時，客服依下列順序處理：',
  '',
  '1. 記錄畫面顯示文字、錯誤代碼（若有）、發生時間、功能入口、裝置與瀏覽器。',
  '2. 在本附錄搜尋錯誤代碼；若畫面沒有代碼，搜尋回傳文字或依功能篩選。',
  '3. 先看「適用範圍」與「狀態」，確認這是玩家可見候選、客服待分類，或後台／技術訊息。',
  '4. 若已完成客服對照，依「玩家回覆建議」「客服處理」與「升級對象」執行。',
  '5. 若仍未確認，使用保守說法，保留原始資料並標記待確認；不得自行創造等待時間、補償金額或恢復條件。',
  '',
  '客服不得要求玩家提供密碼、驗證碼、token、完整支付卡號或其他不必要的敏感資訊。',
  '',
  '## A.2 分類原則',
  '',
  '| 分類 | 使用原則 |',
  '|---|---|',
  '| 玩家／客服候選 | 名稱或功能看似與玩家註冊、登入、錢包、儲值、遊戲、客服流程相關；仍須由產品與後端確認是否可對外使用。 |',
  '| 客服／技術待分類 | 可能需要客服查詢，但目前不足以判斷玩家話術、處理權限或責任歸屬。 |',
  '| 後台／技術候選 | 多半與代理、管理員、營運後台、資料處理或系統基礎設施相關；不得直接當作玩家前台規則。 |',
  '| 待人工分級 | 僅存在來源索引，尚未建立正式客服話術與處理流程。 |',
  '',
  '本次分類是依錯誤代碼名稱與產品手冊用途做的初步分組，不是後端權威定義。',
  '',
  '## A.3 主章節引用規則',
  '',
  '- 主章節描述正式產品規則；本附錄只負責錯誤代碼、客服查詢與處理對照。',
  '- 只要後端可提供錯誤代碼，文件與工單應優先記錄代碼，代碼是跨前端、客服與後端溝通的主要索引。',
  '- 前端或客服頁面沒有顯示代碼時，先記錄原始訊息，再以本附錄全文搜尋；不要只依相似中文自行判定。',
  '- 來源訊息與正式產品規則衝突時，先標記「規則待確認」，並回報產品 PM／後端；不能把來源文字直接覆蓋已確認規則。',
  '- 未確認的等待時間、重試次數、解鎖條件、補償方式與金額，不得寫成固定承諾。',
  '',
  '## A.4 常見錯誤與客服處理對照',
  '',
  '下表先整理目前最可能被玩家或代理商回報的錯誤。所有欄位仍須經產品與後端確認；未列入本表的代碼，請使用 A.5 完整索引並建立待確認紀錄。',
  '',
  '| 錯誤代碼 | 來源訊息 | 玩家回覆建議 | 客服處理 | 升級對象／備註 |',
  '|---|---|---|---|---|',
]

for (const [code, fallbackMessage, playerReply, action, escalation] of commonRows) {
  const sourceMessage = entryByCode.get(code)?.message ?? fallbackMessage
  lines.push(`| ${codeLink(code)} | ${escapeTableCell(sourceMessage)} | ${escapeTableCell(playerReply)} | ${escapeTableCell(action)} | ${escapeTableCell(escalation)} |`)
}

lines.push(
  '',
  '## A.5 完整來源索引',
  '',
  `以下索引由 \`message.txt\` 自動產生，共 ${entries.length} 筆。除 A.4 外，其餘項目尚未建立正式客服話術；「適用範圍」是初步分類，請在規格確認後補上狀態與處理流程。`,
  '',
  '| 錯誤代碼 | 來源訊息 | 初步適用範圍 | 對外狀態 |',
  '|---|---|---|---|',
)

for (const entry of entries) {
  const status = commonByCode.has(entry.code) ? '已納入常見對照' : '待人工分級'
  lines.push(`| [\`${entry.code}\`](#error-${entry.code.toLowerCase()}) | ${escapeTableCell(entry.message)} | ${scopeFor(entry.code)} | ${status} |`)
}

lines.push(
  '',
  '## A.6 新增錯誤訊息維護流程',
  '',
  '未來 `message.txt` 增加錯誤時，建議依下列流程更新：',
  '',
  '1. 保留原始來源檔與取得日期，不直接改寫後端原文。',
  '2. 執行本附錄產生器，更新 A.5 完整來源索引。',
  '3. 由產品與後端確認錯誤的觸發條件、HTTP／API 情境、是否玩家可見，以及是否需要前端轉換文案。',
  '4. 由客服與營運補上玩家回覆、查詢步驟、可處理權限、升級對象與是否有時限。',
  '5. 將高頻或高風險錯誤加入 A.4；低頻或技術錯誤保留在 A.5，避免主流程過度膨脹。',
  '6. 重新產生本機 HTML，使用搜尋、錯誤代碼錨點與注記功能進行確認。',
  '7. 未經檢視前，不要將含有後台／技術訊息的完整索引推送到公開 repository。',
  '',
  '建議後續為每筆錯誤補上「確認日期」「確認人」「正式狀態」「前端是否顯示原文」「關聯 API／頁面」等欄位，以便版本交接。',
  '',
  '## A.7 截圖與規格注記預留',
  '',
  '目前附錄先以文案與索引為主，尚未加入畫面截圖。正式規則確認後，可在 A.4 的高頻錯誤項目補上：',
  '',
  '- 觸發畫面與操作步驟截圖；',
  '- 玩家實際看到的前端文案；',
  '- 客服可見的錯誤代碼與查詢位置；',
  '- 已確認／待確認的規格注記。',
  '',
  '本機 HTML 的注記會儲存在瀏覽器 localStorage；如需跨電腦或交接，請使用匯出 JSON 功能保存注記。',
  '',
  '---',
  '',
  `來源快照：${sourceLabel}`,
)

await writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8')
console.log(`已產生 ${outputPath}（${entries.length} 筆來源錯誤訊息）`)
