# 附錄 A：錯誤訊息與客服處理對照表

- 章節狀態：草稿，待產品與後端確認
- 版本：0.1
- 建立日期：2026-08-03
- 來源：message.txt（RespMeg），本次來源筆數：254 筆
- 適用對象：產品營運人員、客服人員
- 相關章節：第一章、第二章、第六章、第七章、第十章、第十二章、第十三章、第十四章、第十五章、第十六章

> 注意：本附錄是內部整理草稿。來源檔中的文字是後端回傳訊息，不代表都適合直接對玩家顯示或照字面回覆。正式話術、錯誤歸類、處理時限與補償規則，仍須由產品、後端、營運與客服共同確認。

## A.1 使用方式

當玩家或代理商回報錯誤時，客服依下列順序處理：

1. 記錄畫面顯示文字、錯誤代碼（若有）、發生時間、功能入口、裝置與瀏覽器。
2. 在本附錄搜尋錯誤代碼；若畫面沒有代碼，搜尋回傳文字或依功能篩選。
3. 先看「適用範圍」與「狀態」，確認這是玩家可見候選、客服待分類，或後台／技術訊息。
4. 若已完成客服對照，依「玩家回覆建議」「客服處理」與「升級對象」執行。
5. 若仍未確認，使用保守說法，保留原始資料並標記待確認；不得自行創造等待時間、補償金額或恢復條件。

客服不得要求玩家提供密碼、驗證碼、token、完整支付卡號或其他不必要的敏感資訊。

## A.2 分類原則

| 分類 | 使用原則 |
|---|---|
| 玩家／客服候選 | 名稱或功能看似與玩家註冊、登入、錢包、儲值、遊戲、客服流程相關；仍須由產品與後端確認是否可對外使用。 |
| 客服／技術待分類 | 可能需要客服查詢，但目前不足以判斷玩家話術、處理權限或責任歸屬。 |
| 後台／技術候選 | 多半與代理、管理員、營運後台、資料處理或系統基礎設施相關；不得直接當作玩家前台規則。 |
| 待人工分級 | 僅存在來源索引，尚未建立正式客服話術與處理流程。 |

本次分類是依錯誤代碼名稱與產品手冊用途做的初步分組，不是後端權威定義。

## A.3 主章節引用規則

- 主章節描述正式產品規則；本附錄只負責錯誤代碼、客服查詢與處理對照。
- 只要後端可提供錯誤代碼，文件與工單應優先記錄代碼，代碼是跨前端、客服與後端溝通的主要索引。
- 前端或客服頁面沒有顯示代碼時，先記錄原始訊息，再以本附錄全文搜尋；不要只依相似中文自行判定。
- 來源訊息與正式產品規則衝突時，先標記「規則待確認」，並回報產品 PM／後端；不能把來源文字直接覆蓋已確認規則。
- 未確認的等待時間、重試次數、解鎖條件、補償方式與金額，不得寫成固定承諾。

## A.4 常見錯誤與客服處理對照

下表先整理目前最可能被玩家或代理商回報的錯誤。所有欄位仍須經產品與後端確認；未列入本表的代碼，請使用 A.5 完整索引並建立待確認紀錄。

| 錯誤代碼 | 來源訊息 | 玩家回覆建議 | 客服處理 | 升級對象／備註 |
|---|---|---|---|---|
| [`MsgAccountAlreadyExists`](#error-msgaccountalreadyexists) | 會員已存在 | 確認玩家輸入的帳號是否正確；若確定是新帳號，請請玩家更換帳號。 | 不要向玩家透露其他帳號持有人資訊；若玩家主張帳號屬於自己，依帳號驗證流程轉交。 | 客服主管／會員資料相關後端 |
| [`MsgAccountHasBeenUsed`](#error-msgaccounthasbeenused) | 帳號已被使用 | 此帳號目前無法再次使用，請改用其他帳號。 | 確認是否為註冊、綁定或邀請流程中的重複資料。 | 客服主管／會員資料相關後端 |
| [`MsgAccountInvalidCredentials`](#error-msgaccountinvalidcredentials) | 帳號或密碼錯誤 | 請確認帳號與密碼是否輸入正確；仍無法登入時，可依忘記密碼流程申請重設。 | 先確認大小寫、前後空格與輸入法；不得要求玩家提供密碼。 | 登入問題持續或疑似遭盜用時升級處理 |
| [`MsgAccountDisabled`](#error-msgaccountdisabled) | 帳號已停用 | 此帳號目前無法登入，請由客服協助確認帳號狀態。 | 記錄帳號、發生時間與錯誤代碼；不要自行承諾恢復時間。 | 會員狀態管理／客服主管 |
| [`MsgAccountFrozen`](#error-msgaccountfrozen) | 帳戶已凍結，僅可瀏覽 | 帳戶目前處於限制狀態，部分操作暫時無法使用。 | 確認玩家要執行的功能與帳號狀態，依解凍或申訴流程處理。 | 會員狀態管理／風控 |
| [`MsgAccountEmailAlreadyExists`](#error-msgaccountemailalreadyexists) | 電子郵件已存在 | 此電子郵件已綁定其他會員資料，請確認是否輸入正確。 | 不得提供已綁定帳號的個人資訊；若需變更，依身分驗證流程處理。 | 會員資料相關後端 |
| [`MsgAccountPhoneHasBeenUsed`](#error-msgaccountphonehasbeenused) | 電話號碼已存在 | 此電話號碼已綁定其他會員資料，請確認是否輸入正確。 | 不得提供已綁定帳號的個人資訊；若需變更，依身分驗證流程處理。 | 會員資料相關後端 |
| [`MsgRegisterDisabled`](#error-msgregisterdisabled) | 註冊功能暫時無法使用 | 目前暫時無法註冊，請稍後再試。 | 確認是否為全站性狀況；記錄發生時間、裝置與錯誤代碼。 | 值班營運／後端 |
| [`MsgLoginDisabled`](#error-msglogindisabled) | 登入功能暫時無法使用 | 目前暫時無法登入，請稍後再試。 | 先確認是否為全站性異常，再依公告或事件處理流程回覆。 | 值班營運／後端 |
| [`MsgLoginLimited`](#error-msgloginlimited) | 登入次數過多 | 登入嘗試次數過多，請稍後再試；若忘記密碼，請改走忘記密碼流程。 | 不要反覆嘗試或要求玩家提供密碼；記錄帳號與錯誤代碼。 | 持續無法登入或疑似攻擊時升級風控／後端 |
| [`MsgLoginLimitedIP`](#error-msgloginlimitedip) | IP 登入次數過多 | 目前登入嘗試受到暫時限制，請稍後再試。 | 確認是否多人共用網路、VPN 或異常流量；不要直接承諾解除時間。 | 風控／後端 |
| [`MsgLoginLimitedUsername`](#error-msgloginlimitedusername) | 帳號登入次數過多 | 此帳號目前受到暫時登入限制，請稍後再試。 | 確認帳號、錯誤代碼與最後一次成功登入資訊。 | 風控／後端 |
| [`MsgInvalidPassword`](#error-msginvalidpassword) | 密碼錯誤 | 請確認密碼是否輸入正確；若忘記密碼，請依忘記密碼流程申請重設。 | 客服不得查看、索取或代填玩家密碼。 | 登入問題持續時升級會員／後端 |
| [`MsgSamePassword`](#error-msgsamepassword) | 密碼不可與舊密碼相同 | 新密碼不能與目前密碼相同，請重新設定一組不同的密碼。 | 確認符合密碼 6–100 字元規則；不要記錄新密碼。 | 若持續失敗，提供錯誤代碼給後端 |
| [`MsgAccountOldPasswordMismatch`](#error-msgaccountoldpasswordmismatch) | 舊密碼不正確 | 請確認目前密碼是否輸入正確；若忘記，請改走忘記密碼流程。 | 客服不得索取密碼；先確認玩家是否誤用新密碼或複製到空格。 | 登入問題持續時升級會員／後端 |
| [`MsgAccountInviteCodeNotFound`](#error-msgaccountinvitecodenotfound) | 無效的邀請碼 | 請確認推薦碼是否完整、大小寫正確，且未混入前後空格。 | 確認代碼類型：代理商推廣碼為 6 碼，玩家代理推薦碼為 8 碼；不要將兩者混用。 | 代理關係或推薦碼資料異常時升級後端 |
| [`MsgInviteCodeInvalidLength`](#error-msginvitecodeinvalidlength) | 邀請碼長度需為 6 或 8 | 系統回傳的長度規則需要進一步確認，請先不要直接向玩家承諾單一格式。 | 依使用情境確認是代理商推廣碼 6 碼或玩家代理推薦碼 8 碼，並保留錯誤代碼。 | 產品 PM／後端：確認 API 與前端文案是否一致 |
| [`MsgOAuthExchangeFailed`](#error-msgoauthexchangefailed) | OAuth 換 token 或驗證失敗 | 三方登入驗證失敗，請重新操作；仍無法使用時提供錯誤代碼。 | 記錄登入方式、時間、裝置與瀏覽器；不要要求玩家提供 token。 | 後端／第三方登入整合負責人 |
| [`MsgTurnstileVerificationFailed`](#error-msgturnstileverificationfailed) | 驗證錯誤 | 頁面驗證未完成，請重新整理後再操作。 | 確認瀏覽器、網路、外掛與是否重複送出；不要要求玩家提供驗證內容。 | 持續發生或多人同時發生時升級後端 |
| [`MsgInsufficientBalance`](#error-msginsufficientbalance) | 餘額不足 | 目前錢包餘額不足，請先確認錢包與幣別，再進行儲值或轉入。 | 確認使用中的錢包、幣別、可用餘額與操作類型；不要只看總資產判定可用餘額。 | 金流／錢包後端 |
| [`MsgWalletNotFound`](#error-msgwalletnotfound) | 找不到錢包 | 目前找不到對應的錢包資料，請重新整理後再試。 | 記錄會員、幣別、操作時間與錯誤代碼；不要自行建立或更換錢包。 | 金流／錢包後端 |
| [`MsgExchangeAmountNotDivisible`](#error-msgexchangeamountnotdivisible) | 兌換金額不可整除 | 兌換金額不符合目前的換算單位，請調整金額後再試。 | 確認幣別、換算比例、最小單位與前端顯示規則。 | 金流／產品後端 |
| [`MsgInvalidP2pAmounts`](#error-msginvalidp2pamounts) | 無效的 P2P 金額 | 轉帳金額格式或範圍不符合規則，請確認輸入金額後再試。 | 確認金額、幣別、可用餘額與是否重複送出。 | 金流／錢包後端 |
| [`MsgInvalidP2pWallet`](#error-msginvalidp2pwallet) | 無效的 P2P 錢包 | 目前選取的轉帳錢包無法使用，請重新確認錢包與幣別。 | 保留來源錢包、目標錢包、幣別與錯誤代碼，不要自行改動帳務資料。 | 金流／錢包後端 |
| [`MsgTransferTargetInvalid`](#error-msgtransfertargetinvalid) | 轉接對象無效（空字串或同 operator） | 轉入或轉出對象無效，請確認對象資料後再試。 | 確認是否留白、是否選到自己或不適用的對象；不要猜測交易是否成功。 | 代理／金流後端 |
| [`MsgDepositOrderNotFound`](#error-msgdepositordernotfound) | 找不到原始儲值訂單 | 系統目前找不到這筆儲值訂單，請提供訂單資訊讓客服協助查詢。 | 收集訂單編號、帳號、金額、幣別、時間與付款方式；不要要求完整卡號或密碼。 | 金流／後端 |
| [`MsgDepositAlreadyReversed`](#error-msgdepositalreadyreversed) | 原始儲值訂單已沖正 | 這筆儲值訂單已被沖正，客服需要進一步確認帳務狀態。 | 先查核訂單與錢包流水，不要重複承諾補款或再次操作。 | 金流／財務／後端 |
| [`MsgRewardCardExpired`](#error-msgrewardcardexpired) | 優惠卡已過期 | 此優惠卡已超過使用期限，無法再使用。 | 確認優惠卡編號、有效期限與活動規則；不要承諾展延。 | 營運活動負責人 |
| [`MsgRewardCardNotFound`](#error-msgrewardcardnotfound) | 找不到優惠卡 | 系統找不到這張優惠卡，請確認卡號或入口是否正確。 | 記錄卡號、會員、操作時間與活動名稱；不要要求玩家提供密碼。 | 營運活動／後端 |
| [`MsgRewardCardTurnoverNotMet`](#error-msgrewardcardturnovernotmet) | 優惠卡未達流水要求 | 目前尚未達到優惠卡的流水要求，因此暫時無法使用或提領。 | 查核該優惠卡的流水規則、目前進度與適用幣別，依正式活動規則說明。 | 營運活動／金流 |
| [`MsgKeywordBlocked`](#error-msgkeywordblocked) | 關鍵字攔截 | 訊息包含目前無法使用的內容，請調整文字後再送出。 | 不要向玩家揭露完整攔截詞庫；確認是否為誤判並記錄原始情境。 | 客服主管／風控 |
| [`MsgFrequencyError`](#error-msgfrequencyerror) | 超出次數限制請等待一下 | 操作次數過多，請稍後再試。 | 確認功能、時間、帳號與 IP；不要自行承諾固定等待秒數。 | 風控／後端 |
| [`MsgConversationClosed`](#error-msgconversationclosed) | 對話已關閉（允許另起） | 這個對話已結束，請重新建立新的客服對話。 | 確認是否應沿用原工單或另建對話，避免重複建立大量案件。 | 客服主管（若無法另起時再升級） |
| [`MsgConversationStopped`](#error-msgconversationstopped) | 對話已停用（對方聊天被管理員停用，不可另起） | 目前無法在此對話中繼續傳送訊息，請由客服確認後續處理方式。 | 確認停用原因與處置權限，不要引導玩家反覆建立對話規避限制。 | 客服主管／風控 |
| [`MsgPlayerHasActiveOrder`](#error-msgplayerhasactiveorder) | 玩家有未結案工單 | 目前已有處理中的案件，請先沿用原案件，避免重複送出。 | 查詢既有工單編號與狀態，將新資訊補充到原案件。 | 客服主管（工單狀態異常時升級後端） |
| [`MsgOrderAlreadyResolved`](#error-msgorderalreadyresolved) | 工單已結案 | 此案件已結案；若有新問題，請重新建立案件或依客服流程處理。 | 確認結案時間、結案原因與是否需要重新開案，不要直接修改歷史紀錄。 | 客服主管 |
| [`MsgOrderNotFound`](#error-msgordernotfound) | 工單不存在 | 目前找不到這筆工單，請確認工單編號或登入帳號是否正確。 | 確認工單編號、會員與時間；不要以不存在直接判定玩家未提交。 | 客服系統／後端 |
| [`MsgOrderNotOwnedByPlayer`](#error-msgordernotownedbyplayer) | 工單不屬於此玩家 | 目前登入的會員無法查看這筆工單，請確認登入帳號。 | 不得提供其他玩家工單內容；疑似帳號問題依身分驗證流程處理。 | 客服主管／會員資料相關後端 |
| [`MsgOrderNotInProgress`](#error-msgordernotinprogress) | 工單非處理中（不可發訊或轉接） | 此案件目前不是處理中的狀態，暫時無法進行這項操作。 | 查核工單狀態與操作時點，避免重複轉接或發訊。 | 客服系統／後端 |
| [`MsgServiceUnavailable`](#error-msgserviceunavailable) | 服務暫時無法使用 | 服務暫時無法使用，請稍後再試。 | 確認是否為單一功能或全站異常，記錄時間、功能、裝置與錯誤代碼。 | 值班營運／後端 |
| [`MsgSystemMaintenance`](#error-msgsystemmaintenance) | 系統維護中 | 系統目前維護中，請依公告時間稍後再試。 | 確認維護公告與影響範圍；若無公告，通知值班營運。 | 值班營運／後端 |
| [`MsgInternalServerError`](#error-msginternalservererror) | 伺服器內部異常 | 系統發生暫時性異常，請稍後再試；若仍無法使用，請提供錯誤代碼。 | 記錄完整錯誤代碼、時間、功能與操作步驟，不要向玩家轉述技術堆疊。 | 後端／值班營運 |
| [`MsgSessionNotFound`](#error-msgsessionnotfound) | 找不到 Session | 登入狀態已失效，請重新登入後再操作。 | 確認是否為閒置逾時、跨分頁或瀏覽器快取問題；不得要求玩家提供 token。 | 持續發生時升級後端 |
| [`MsgInvalidToken`](#error-msginvalidtoken) | token 失效 | 登入驗證已失效，請重新登入後再操作。 | 不要要求玩家提供 token；記錄發生功能與時間。 | 持續發生或大量發生時升級後端 |
| [`MsgRequestValidateFail`](#error-msgrequestvalidatefail) | 請求資料異常(驗證器不通過) | 送出的資料格式不符合規則，請重新確認欄位後再試。 | 記錄功能、欄位、錯誤代碼與輸入情境；不要猜測尚未確認的限制。 | 產品 PM／後端 |

## A.5 完整來源索引

以下索引由 `message.txt` 自動產生，共 254 筆。除 A.4 外，其餘項目尚未建立正式客服話術；「適用範圍」是初步分類，請在規格確認後補上狀態與處理流程。

| 錯誤代碼 | 來源訊息 | 初步適用範圍 | 對外狀態 |
|---|---|---|---|
| [`MsgAccountAgentAssignmentMismatch`](#error-msgaccountagentassignmentmismatch) | 代理設定與推薦人代理不一致 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountAgentAssignmentNotAllowed`](#error-msgaccountagentassignmentnotallowed) | 該會員不可帶代理設定 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountAgentIdsRequired`](#error-msgaccountagentidsrequired) | 代理 ID 清單為必填 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountAgentPromoCodeRequired`](#error-msgaccountagentpromocoderequired) | 代理推廣碼為必填 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountAlreadyExists`](#error-msgaccountalreadyexists) | 會員已存在 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgAccountDatabaseError`](#error-msgaccountdatabaseerror) | 資料庫操作錯誤 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountDisabled`](#error-msgaccountdisabled) | 帳號已停用 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgAccountEmailAlreadyExists`](#error-msgaccountemailalreadyexists) | 電子郵件已存在 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgAccountFrozen`](#error-msgaccountfrozen) | 帳戶已凍結，僅可瀏覽 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgAccountHasBeenUsed`](#error-msgaccounthasbeenused) | 帳號已被使用 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgAccountHasUplineAgent`](#error-msgaccounthasuplineagent) | 該會員有上線代理 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountIdentityType`](#error-msgaccountidentitytype) | 帳戶身分錯誤 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountInvalidCredentials`](#error-msgaccountinvalidcredentials) | 帳號或密碼錯誤 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgAccountInvalidEndTime`](#error-msgaccountinvalidendtime) | 無效的結束時間 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountInvalidId`](#error-msgaccountinvalidid) | 無效的會員 ID | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountInvalidPhone`](#error-msgaccountinvalidphone) | 無效的電話號碼格式 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountInvalidStartTime`](#error-msgaccountinvalidstarttime) | 無效的開始時間 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountInvalidTimeRange`](#error-msgaccountinvalidtimerange) | 無效的時間範圍 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountInvalidUuid`](#error-msgaccountinvaliduuid) | 無效的 UUID | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountInviteCodeNotFound`](#error-msgaccountinvitecodenotfound) | 無效的邀請碼 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgAccountInviterRequired`](#error-msgaccountinviterrequired) | 帶有邀請碼時推薦人為必填 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountNotFound`](#error-msgaccountnotfound) | 會員不存在 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountOauthAccountNotRegistered`](#error-msgaccountoauthaccountnotregistered) | 三方登入身分尚未註冊會員（前端可引導使用者註冊流程） | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountOauthIdentityAlreadyBound`](#error-msgaccountoauthidentityalreadybound) | 三方登入身分已綁定其他會員 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountOauthIdentityNotFound`](#error-msgaccountoauthidentitynotfound) | 三方登入身分未綁定會員 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountOauthLastCredential`](#error-msgaccountoauthlastcredential) | 無密碼且為最後一個三方登入身分，不可解綁 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountOauthProviderAlreadyBound`](#error-msgaccountoauthprovideralreadybound) | 該會員已綁定相同三方提供商 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountOldPasswordMismatch`](#error-msgaccountoldpasswordmismatch) | 舊密碼不正確 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgAccountOldPasswordNotAllowed`](#error-msgaccountoldpasswordnotallowed) | 當前帳號尚未設定密碼，不可帶舊密碼 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountOldPasswordRequired`](#error-msgaccountoldpasswordrequired) | 變更密碼時舊密碼為必填 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountPermissionDepositConflict`](#error-msgaccountpermissiondepositconflict) | 禁止儲值更新參數衝突 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountPermissionGiftConflict`](#error-msgaccountpermissiongiftconflict) | 禁止贈禮更新參數衝突 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountPermissionMuteConflict`](#error-msgaccountpermissionmuteconflict) | 禁言更新參數衝突 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountPermissionPlayConflict`](#error-msgaccountpermissionplayconflict) | 禁止遊玩更新參數衝突 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountPhoneHasBeenUsed`](#error-msgaccountphonehasbeenused) | 電話號碼已存在 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgAccountRollbackExpired`](#error-msgaccountrollbackexpired) | 會員建立回滾期限已過 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountTagAlreadyExists`](#error-msgaccounttagalreadyexists) | 標籤名稱已存在 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountTagHasPlayers`](#error-msgaccounttaghasplayers) | 標籤仍有玩家關聯，無法停用 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountTagNotDeletable`](#error-msgaccounttagnotdeletable) | 僅可刪除停用狀態的自定義標籤 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountTagNotFound`](#error-msgaccounttagnotfound) | 標籤不存在 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountTagSystemProtected`](#error-msgaccounttagsystemprotected) | 系統預設標籤不可修改或刪除 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountTagUpdateConflict`](#error-msgaccounttagupdateconflict) | 玩家標籤更新參數衝突 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountUnsupportedOperatorType`](#error-msgaccountunsupportedoperatortype) | 不支援的操作人員類型 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccountUserUpdateFieldNotAllowed`](#error-msgaccountuserupdatefieldnotallowed) | 使用者不可更新該欄位 | 玩家／客服候選 | 待人工分級 |
| [`MsgAccumulationInconsistent`](#error-msgaccumulationinconsistent) | 累積值無法扣除 | 客服／技術待分類 | 待人工分級 |
| [`MsgAdjustAmountMustBePositive`](#error-msgadjustamountmustbepositive) | 調整金額必須為正數 | 後台／技術候選 | 待人工分級 |
| [`MsgAdjustmentAlreadyExecuted`](#error-msgadjustmentalreadyexecuted) | 調整已執行 | 後台／技術候選 | 待人工分級 |
| [`MsgAdjustmentNotFound`](#error-msgadjustmentnotfound) | 找不到調整紀錄 | 後台／技術候選 | 待人工分級 |
| [`MsgAdjustWalletTargetRequired`](#error-msgadjustwallettargetrequired) | 調整錢包目標為必填 | 後台／技術候選 | 待人工分級 |
| [`MsgAdministratorGroupNotFound`](#error-msgadministratorgroupnotfound) | 管理員群組不存在 | 後台／技術候選 | 待人工分級 |
| [`MsgAdministratorNotFound`](#error-msgadministratornotfound) | 管理員不存在 | 後台／技術候選 | 待人工分級 |
| [`MsgAgent2faAlreadyBound`](#error-msgagent2faalreadybound) | 代理雙重驗證已綁定 | 後台／技術候選 | 待人工分級 |
| [`MsgAgent2faBindingExpired`](#error-msgagent2fabindingexpired) | 代理雙重驗證綁定已過期 | 後台／技術候選 | 待人工分級 |
| [`MsgAgent2faBindingInitFailed`](#error-msgagent2fabindinginitfailed) | 代理雙重驗證綁定初始化失敗 | 後台／技術候選 | 待人工分級 |
| [`MsgAgent2faBindingNotInitialized`](#error-msgagent2fabindingnotinitialized) | 代理雙重驗證綁定尚未初始化 | 後台／技術候選 | 待人工分級 |
| [`MsgAgent2faCodeInvalid`](#error-msgagent2facodeinvalid) | 代理雙重驗證碼無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgent2faNotBound`](#error-msgagent2fanotbound) | 代理尚未綁定雙重驗證 | 後台／技術候選 | 待人工分級 |
| [`MsgAgent2faNotEnabled`](#error-msgagent2fanotenabled) | 代理雙重驗證未啟用 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentAccountExists`](#error-msgagentaccountexists) | 代理帳號已存在 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentAccountOrPasswordInvalid`](#error-msgagentaccountorpasswordinvalid) | 代理帳號或密碼錯誤 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentAlreadyActive`](#error-msgagentalreadyactive) | 代理已為啟用狀態 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentAlreadyFrozen`](#error-msgagentalreadyfrozen) | 代理已為凍結狀態 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentAlreadyLocked`](#error-msgagentalreadylocked) | 代理已為鎖定狀態 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentAssistantCpaConfigNotAllowed`](#error-msgagentassistantcpaconfignotallowed) | 助理代理不允許 CPA 設定 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentChangePasswordCurrentPasswordInvalid`](#error-msgagentchangepasswordcurrentpasswordinvalid) | 代理目前密碼不正確 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentChangePasswordLocked`](#error-msgagentchangepasswordlocked) | 代理變更密碼已鎖定 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentChangePasswordNewPasswordInvalid`](#error-msgagentchangepasswordnewpasswordinvalid) | 代理新密碼格式無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentChangePasswordSameAsCurrent`](#error-msgagentchangepasswordsameascurrent) | 代理新密碼不可與目前密碼相同 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentChangeReasonRequired`](#error-msgagentchangereasonrequired) | 代理變更原因為必填 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentCpaConfigPermissionDenied`](#error-msgagentcpaconfigpermissiondenied) | 代理 CPA 設定權限不足 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentCpaOverflowWarning`](#error-msgagentcpaoverflowwarning) | 代理 CPA 溢出警告 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentCpaRewardAmountExceedsUpline`](#error-msgagentcparewardamountexceedsupline) | 代理 CPA 獎金金額超過上線 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentDatabaseError`](#error-msgagentdatabaseerror) | 代理資料庫操作錯誤 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentDirectUplinePermissionDenied`](#error-msgagentdirectuplinepermissiondenied) | 代理直屬上線權限不足 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentDisabled`](#error-msgagentdisabled) | 代理已停用 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentDisableInheritAgentNotActive`](#error-msgagentdisableinheritagentnotactive) | 代理停用繼承的代理非啟用狀態 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentDisableInheritancePermissionDenied`](#error-msgagentdisableinheritancepermissiondenied) | 代理停用繼承權限不足 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentDisableInheritanceTargetNotEligible`](#error-msgagentdisableinheritancetargetnoteligible) | 代理停用繼承目標不符合資格 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentDisableInheritanceTargetRequired`](#error-msgagentdisableinheritancetargetrequired) | 代理停用繼承目標為必填 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentDisableInheritToSelf`](#error-msgagentdisableinherittoself) | 代理不可繼承給自己 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentFrozen`](#error-msgagentfrozen) | 代理已凍結 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentGeneratePromoteCodeFailed`](#error-msgagentgeneratepromotecodefailed) | 代理推廣碼產生失敗 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentGenerateUidFailed`](#error-msgagentgenerateuidfailed) | 代理 UID 產生失敗 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentIdentityNotApplicableForCpaConfig`](#error-msgagentidentitynotapplicableforcpaconfig) | 此代理身份不適用 CPA 設定 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentIdentityNotApplicableForDisableInheritance`](#error-msgagentidentitynotapplicablefordisableinheritance) | 此代理身份不適用停用繼承 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentIdentityNotApplicableForDownlineCreate`](#error-msgagentidentitynotapplicablefordownlinecreate) | 此代理身份不適用建立下線 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentIdentityNotApplicableForWalletInheritance`](#error-msgagentidentitynotapplicableforwalletinheritance) | 此代理身份不適用錢包繼承 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentInheritAgentNotAllowedForStatus`](#error-msgagentinheritagentnotallowedforstatus) | 代理繼承因狀態限制不允許 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentInvalidAbnormalFlag`](#error-msgagentinvalidabnormalflag) | 代理異常旗標無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentInvalidActiveStatus`](#error-msgagentinvalidactivestatus) | 代理啟用狀態無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentInvalidContactFormat`](#error-msgagentinvalidcontactformat) | 代理聯絡方式格式無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentInvalidCpaAllocationRate`](#error-msgagentinvalidcpaallocationrate) | 代理 CPA 分配比例無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentInvalidCpaRewardAmount`](#error-msgagentinvalidcparewardamount) | 代理 CPA 獎金金額無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentInvalidCpaTierCount`](#error-msgagentinvalidcpatiercount) | 代理 CPA 階層數量無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentInvalidDisableStatus`](#error-msgagentinvaliddisablestatus) | 代理停用狀態無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentInvalidDownlineIdentity`](#error-msgagentinvaliddownlineidentity) | 代理下線身份無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentInvalidFrozenStatus`](#error-msgagentinvalidfrozenstatus) | 代理凍結狀態無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentInvalidId`](#error-msgagentinvalidid) | 代理 ID 無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentInvalidLockedStatus`](#error-msgagentinvalidlockedstatus) | 代理鎖定狀態無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentInvalidPromoteCodeFormat`](#error-msgagentinvalidpromotecodeformat) | 代理推廣碼格式無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentInvalidTimeRange`](#error-msgagentinvalidtimerange) | 代理時間範圍無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentInvalidUuid`](#error-msgagentinvaliduuid) | 代理 UUID 無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentInvalidWithdrawalInfo`](#error-msgagentinvalidwithdrawalinfo) | 代理提款資訊無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentLocked`](#error-msgagentlocked) | 代理已鎖定 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentMissingAgentConfig`](#error-msgagentmissingagentconfig) | 代理缺少代理設定 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentNotFound`](#error-msgagentnotfound) | 代理不存在 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentOperatorNotFound`](#error-msgagentoperatornotfound) | 代理操作員不存在 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentPromoteCodeExists`](#error-msgagentpromotecodeexists) | 代理推廣碼已存在 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentPromoteCodeNotAllowed`](#error-msgagentpromotecodenotallowed) | 不允許使用代理推廣碼 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentPromoteCodeRequired`](#error-msgagentpromotecoderequired) | 代理推廣碼為必填 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentTopAgentStatusUpdateNotAllowed`](#error-msgagenttopagentstatusupdatenotallowed) | 不允許更新頂級代理狀態 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentUnspecified`](#error-msgagentunspecified) | 代理未指定錯誤 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentUplineNotFound`](#error-msgagentuplinenotfound) | 代理上線不存在 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentUplineOrRootPermissionDenied`](#error-msgagentuplineorrootpermissiondenied) | 代理上線或根權限不足 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentWalletCpaRewardAlreadyGranted`](#error-msgagentwalletcparewardalreadygranted) | 代理 CPA 獎金已發放 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentWalletInsufficientBalance`](#error-msgagentwalletinsufficientbalance) | 代理錢包餘額不足 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentWalletInvalidAmount`](#error-msgagentwalletinvalidamount) | 代理錢包金額無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentWalletInvalidChangeType`](#error-msgagentwalletinvalidchangetype) | 代理錢包變更類型無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentWalletInvalidModifierType`](#error-msgagentwalletinvalidmodifiertype) | 代理錢包修改者類型無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentWalletInvalidSourceType`](#error-msgagentwalletinvalidsourcetype) | 代理錢包來源類型無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentWalletNotFound`](#error-msgagentwalletnotfound) | 代理錢包不存在 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentWalletRevenueShareAlreadyGranted`](#error-msgagentwalletrevenuesharealreadygranted) | 代理分潤已發放 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentWithdrawalApplicationBelowThreshold`](#error-msgagentwithdrawalapplicationbelowthreshold) | 代理提款申請低於門檻 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentWithdrawalApplicationInvalidStatus`](#error-msgagentwithdrawalapplicationinvalidstatus) | 代理提款申請狀態無效 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentWithdrawalApplicationLimitExceeded`](#error-msgagentwithdrawalapplicationlimitexceeded) | 代理提款申請已超過限制 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentWithdrawalApplicationNotFound`](#error-msgagentwithdrawalapplicationnotfound) | 代理提款申請不存在 | 後台／技術候選 | 待人工分級 |
| [`MsgAgentWithdrawalApplicationReviewPermissionDenied`](#error-msgagentwithdrawalapplicationreviewpermissiondenied) | 代理提款申請審核權限不足 | 後台／技術候選 | 待人工分級 |
| [`MsgAnnouncementNotFound`](#error-msgannouncementnotfound) | 公告不存在 | 後台／技術候選 | 待人工分級 |
| [`MsgArticleCoverConflict`](#error-msgarticlecoverconflict) | cover_file 與 cover_delete 同時設定,語意衝突 | 後台／技術候選 | 待人工分級 |
| [`MsgArticleNotFound`](#error-msgarticlenotfound) | 文章不存在 | 後台／技術候選 | 待人工分級 |
| [`MsgArticleTemplateNotFound`](#error-msgarticletemplatenotfound) | 文章模板不存在 | 後台／技術候選 | 待人工分級 |
| [`MsgAssetInvalidContentType`](#error-msgassetinvalidcontenttype) | 無效的資源內容類型 | 後台／技術候選 | 待人工分級 |
| [`MsgAssetSizeExceeded`](#error-msgassetsizeexceeded) | 資源大小超出限制 | 後台／技術候選 | 待人工分級 |
| [`MsgAuthMissingIdentity`](#error-msgauthmissingidentity) | 驗證缺失身份 | 客服／技術待分類 | 待人工分級 |
| [`MsgAvatarAssetNotFound`](#error-msgavatarassetnotfound) | 指定的頭像素材不存在 | 後台／技術候選 | 待人工分級 |
| [`MsgAvatarInputRequired`](#error-msgavatarinputrequired) | 頭像需擇一提供(檔案/素材ID) | 後台／技術候選 | 待人工分級 |
| [`MsgContentRequired`](#error-msgcontentrequired) | 內容必填 | 客服／技術待分類 | 待人工分級 |
| [`MsgContentTooLong`](#error-msgcontenttoolong) | 內容過長 | 客服／技術待分類 | 待人工分級 |
| [`MsgConversationClosed`](#error-msgconversationclosed) | 對話已關閉（允許另起） | 玩家／客服候選 | 已納入常見對照 |
| [`MsgConversationStopped`](#error-msgconversationstopped) | 對話已停用（對方聊天被管理員停用，不可另起） | 玩家／客服候選 | 已納入常見對照 |
| [`MsgCoverRequired`](#error-msgcoverrequired) | 封面必填 | 後台／技術候選 | 待人工分級 |
| [`MsgDataNotFound`](#error-msgdatanotfound) | 找不到資料 | 客服／技術待分類 | 待人工分級 |
| [`MsgDepositAlreadyReversed`](#error-msgdepositalreadyreversed) | 原始儲值訂單已沖正 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgDepositMissingRelatedId`](#error-msgdepositmissingrelatedid) | 儲值缺少關聯 ID | 玩家／客服候選 | 待人工分級 |
| [`MsgDepositOrderNotFound`](#error-msgdepositordernotfound) | 找不到原始儲值訂單 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgDialCodeNotSupported`](#error-msgdialcodenotsupported) | 電話區碼不支援 | 玩家／客服候選 | 待人工分級 |
| [`MsgEmailAlreadySet`](#error-msgemailalreadyset) | 信箱已設定,不可再修改 | 玩家／客服候選 | 待人工分級 |
| [`MsgExchangeAmountNotDivisible`](#error-msgexchangeamountnotdivisible) | 兌換金額不可整除 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgFileIsNil`](#error-msgfileisnil) | 尚未選擇檔案 | 客服／技術待分類 | 待人工分級 |
| [`MsgFileTooLarge`](#error-msgfiletoolarge) | 上傳的檔案太大 | 客服／技術待分類 | 待人工分級 |
| [`MsgFrequencyError`](#error-msgfrequencyerror) | 超出次數限制請等待一下 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgGameIdDuplicated`](#error-msggameidduplicated) | 遊戲 ID 重複 | 玩家／客服候選 | 待人工分級 |
| [`MsgGameIdNotAllowed`](#error-msggameidnotallowed) | 不允許的遊戲 ID | 玩家／客服候選 | 待人工分級 |
| [`MsgImageNotFound`](#error-msgimagenotfound) | 圖片不存在 | 後台／技術候選 | 待人工分級 |
| [`MsgImagePixelTooLarge`](#error-msgimagepixeltoolarge) | 圖片像素過大 | 後台／技術候選 | 待人工分級 |
| [`MsgImageSlotFull`](#error-msgimageslotfull) | 平台類型區塊已達上限 | 後台／技術候選 | 待人工分級 |
| [`MsgImageTypeNotAllowedOnPlatform`](#error-msgimagetypenotallowedonplatform) | 該平台不支援此圖片類型 | 後台／技術候選 | 待人工分級 |
| [`MsgInsufficientBalance`](#error-msginsufficientbalance) | 餘額不足 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgInternalServerError`](#error-msginternalservererror) | 伺服器內部異常 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgInvalidArticleCategory`](#error-msginvalidarticlecategory) | 文章類別不合法 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidChangeType`](#error-msginvalidchangetype) | 無效的變更類型 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidCursor`](#error-msginvalidcursor) | 無效的游標 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidIDFormat`](#error-msginvalididformat) | 無效的 id格式 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidImagePlatform`](#error-msginvalidimageplatform) | 圖片平台不合法 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidImageType`](#error-msginvalidimagetype) | 圖片類型無效 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidManualAdjustCurrency`](#error-msginvalidmanualadjustcurrency) | 無效的手動調整幣別 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidManualReasonTypeOfflineDepositParam`](#error-msginvalidmanualreasontypeofflinedepositparam) | 無效的手動原因類型線下儲值參數 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidP2pAmounts`](#error-msginvalidp2pamounts) | 無效的 P2P 金額 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgInvalidP2pWallet`](#error-msginvalidp2pwallet) | 無效的 P2P 錢包 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgInvalidPassword`](#error-msginvalidpassword) | 密碼錯誤 | 客服／技術待分類 | 已納入常見對照 |
| [`MsgInvalidPerPage`](#error-msginvalidperpage) | 無效的每頁數量 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidPopupFrequency`](#error-msginvalidpopupfrequency) | 彈窗頻率不合法 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidReasonType`](#error-msginvalidreasontype) | 無效的原因類型 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidRemarkLength`](#error-msginvalidremarklength) | 備註長度無效 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidStatusTransition`](#error-msginvalidstatustransition) | 無效狀態流轉 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidTimeRange`](#error-msginvalidtimerange) | 時間範圍不合法 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidToken`](#error-msginvalidtoken) | token 失效 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgInvalidTurnoverParams`](#error-msginvalidturnoverparams) | 無效的流水參數 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidWalletCombination`](#error-msginvalidwalletcombination) | 無效的錢包組合 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidWeight`](#error-msginvalidweight) | 權重範圍不合法 | 客服／技術待分類 | 待人工分級 |
| [`MsgInvalidYearMonth`](#error-msginvalidyearmonth) | 無效的年月 | 客服／技術待分類 | 待人工分級 |
| [`MsgInviteCodeInvalidLength`](#error-msginvitecodeinvalidlength) | 邀請碼長度需為 6 或 8 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgIPNotAllow`](#error-msgipnotallow) | ip 不可訪問 | 客服／技術待分類 | 待人工分級 |
| [`MsgKeywordBlocked`](#error-msgkeywordblocked) | 關鍵字攔截 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgLevelNotFound`](#error-msglevelnotfound) | 找不到等級 | 後台／技術候選 | 待人工分級 |
| [`MsgLevelVersionConflict`](#error-msglevelversionconflict) | 等級版本衝突 | 後台／技術候選 | 待人工分級 |
| [`MsgLoginDisabled`](#error-msglogindisabled) | 登入功能暫時無法使用 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgLoginLimited`](#error-msgloginlimited) | 登入次數過多 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgLoginLimitedIP`](#error-msgloginlimitedip) | IP 登入次數過多 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgLoginLimitedUsername`](#error-msgloginlimitedusername) | 帳號登入次數過多 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgMailboxScheduleTimeInvalid`](#error-msgmailboxscheduletimeinvalid) | 信箱排程時間無效 | 後台／技術候選 | 待人工分級 |
| [`MsgMailboxTargetEmpty`](#error-msgmailboxtargetempty) | 信箱收件對象為空 | 後台／技術候選 | 待人工分級 |
| [`MsgMailboxTargetIDsNotFound`](#error-msgmailboxtargetidsnotfound) | 信箱收件對象 ID 不存在 | 後台／技術候選 | 待人工分級 |
| [`MsgNegativeBalanceOnDeposit`](#error-msgnegativebalanceondeposit) | 儲值時餘額為負數 | 客服／技術待分類 | 待人工分級 |
| [`MsgNegativeBalanceOnRollback`](#error-msgnegativebalanceonrollback) | 回滾時餘額為負數 | 客服／技術待分類 | 待人工分級 |
| [`MsgNoPendingOrder`](#error-msgnopendingorder) | 派發池為空 | 客服／技術待分類 | 待人工分級 |
| [`MsgOAuthExchangeFailed`](#error-msgoauthexchangefailed) | OAuth 換 token 或驗證失敗 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgOAuthPollInvalid`](#error-msgoauthpollinvalid) | OAuth 輪詢 ID 無效或已使用 | 玩家／客服候選 | 待人工分級 |
| [`MsgOAuthProviderInvalid`](#error-msgoauthproviderinvalid) | OAuth provider 無效或未啟用 | 玩家／客服候選 | 待人工分級 |
| [`MsgOAuthRegisterTicketInvalid`](#error-msgoauthregisterticketinvalid) | OAuth 註冊 ticket 無效或已使用 | 玩家／客服候選 | 待人工分級 |
| [`MsgOAuthStateInvalid`](#error-msgoauthstateinvalid) | OAuth state 無效或已使用 | 玩家／客服候選 | 待人工分級 |
| [`MsgOperatorMismatch`](#error-msgoperatormismatch) | 操作者不符 | 後台／技術候選 | 待人工分級 |
| [`MsgOperatorPermissionDenied`](#error-msgoperatorpermissiondenied) | 操作者權限不足 | 後台／技術候選 | 待人工分級 |
| [`MsgOrderAlreadyClaimed`](#error-msgorderalreadyclaimed) | 工單已被認領 | 玩家／客服候選 | 待人工分級 |
| [`MsgOrderAlreadyResolved`](#error-msgorderalreadyresolved) | 工單已結案 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgOrderNotFound`](#error-msgordernotfound) | 工單不存在 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgOrderNotInProgress`](#error-msgordernotinprogress) | 工單非處理中（不可發訊或轉接） | 玩家／客服候選 | 已納入常見對照 |
| [`MsgOrderNotOwnedByPlayer`](#error-msgordernotownedbyplayer) | 工單不屬於此玩家 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgPermissionDenied`](#error-msgpermissiondenied) | 權限不足 | 客服／技術待分類 | 待人工分級 |
| [`MsgPhoneAlreadySet`](#error-msgphonealreadyset) | 手機已設定,不可再修改 | 玩家／客服候選 | 待人工分級 |
| [`MsgPhoneIncomplete`](#error-msgphoneincomplete) | 電話號碼不完整 | 玩家／客服候選 | 待人工分級 |
| [`MsgPhoneInvalid`](#error-msgphoneinvalid) | 電話號碼無效 | 玩家／客服候選 | 待人工分級 |
| [`MsgPlayerHasActiveOrder`](#error-msgplayerhasactiveorder) | 玩家有未結案工單 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgPopupFreqOnlyForPopup`](#error-msgpopupfreqonlyforpopup) | 彈窗頻率僅適用於彈窗公告圖 | 後台／技術候選 | 待人工分級 |
| [`MsgRebateDispatchedReversalForbidden`](#error-msgrebatedispatchedreversalforbidden) | 不允許沖正已發放返水的儲值 | 玩家／客服候選 | 待人工分級 |
| [`MsgRebateInProgress`](#error-msgrebateinprogress) | 返水進行中 | 玩家／客服候選 | 待人工分級 |
| [`MsgRedisError`](#error-msgrediserror) | Redis 操作錯誤 | 後台／技術候選 | 待人工分級 |
| [`MsgRegisterDisabled`](#error-msgregisterdisabled) | 註冊功能暫時無法使用 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgRegistrationSourceReserved`](#error-msgregistrationsourcereserved) | 註冊來源為系統保留值 | 客服／技術待分類 | 待人工分級 |
| [`MsgRequestError`](#error-msgrequesterror) | 請求資料異常(資料類型異常) | 客服／技術待分類 | 待人工分級 |
| [`MsgRequestParam`](#error-msgrequestparam) | 請求參數異常 | 客服／技術待分類 | 待人工分級 |
| [`MsgRequestValidateFail`](#error-msgrequestvalidatefail) | 請求資料異常(驗證器不通過) | 玩家／客服候選 | 已納入常見對照 |
| [`MsgRewardCardExpired`](#error-msgrewardcardexpired) | 優惠卡已過期 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgRewardCardInvalidBalance`](#error-msgrewardcardinvalidbalance) | 優惠卡餘額無效 | 玩家／客服候選 | 待人工分級 |
| [`MsgRewardCardInvalidMaxBalance`](#error-msgrewardcardinvalidmaxbalance) | 優惠卡最大餘額無效 | 玩家／客服候選 | 待人工分級 |
| [`MsgRewardCardInvalidMultiplier`](#error-msgrewardcardinvalidmultiplier) | 優惠卡倍數無效 | 玩家／客服候選 | 待人工分級 |
| [`MsgRewardCardInvalidStatus`](#error-msgrewardcardinvalidstatus) | 優惠卡狀態無效 | 玩家／客服候選 | 待人工分級 |
| [`MsgRewardCardNotFound`](#error-msgrewardcardnotfound) | 找不到優惠卡 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgRewardCardTurnoverNotMet`](#error-msgrewardcardturnovernotmet) | 優惠卡未達流水要求 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgSagaAlreadyProcessed`](#error-msgsagaalreadyprocessed) | 分散式事務已處理 | 後台／技術候選 | 待人工分級 |
| [`MsgSamePassword`](#error-msgsamepassword) | 密碼不可與舊密碼相同 | 客服／技術待分類 | 已納入常見對照 |
| [`MsgServiceUnavailable`](#error-msgserviceunavailable) | 服務暫時無法使用 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgSessionNotFound`](#error-msgsessionnotfound) | 找不到 Session | 玩家／客服候選 | 已納入常見對照 |
| [`MsgSettledMonthReversalForbidden`](#error-msgsettledmonthreversalforbidden) | 不允許沖正已結算月份的儲值 | 客服／技術待分類 | 待人工分級 |
| [`MsgSettlementInProgress`](#error-msgsettlementinprogress) | 結算進行中 | 玩家／客服候選 | 待人工分級 |
| [`MsgSqlError`](#error-msgsqlerror) | SQL 操作錯誤 | 後台／技術候選 | 待人工分級 |
| [`MsgStartTimeRequired`](#error-msgstarttimerequired) | 發佈日期必填 | 客服／技術待分類 | 待人工分級 |
| [`MsgStateFrozen`](#error-msgstatefrozen) | 狀態已凍結 | 客服／技術待分類 | 待人工分級 |
| [`MsgStateNotFound`](#error-msgstatenotfound) | 找不到狀態 | 客服／技術待分類 | 待人工分級 |
| [`MsgStateVersionConflict`](#error-msgstateversionconflict) | 狀態版本衝突 | 客服／技術待分類 | 待人工分級 |
| [`MsgStatsNotFound`](#error-msgstatsnotfound) | 找不到統計資料 | 後台／技術候選 | 待人工分級 |
| [`MsgSuccess`](#error-msgsuccess) | 成功 | 客服／技術待分類 | 待人工分級 |
| [`MsgSystemMaintenance`](#error-msgsystemmaintenance) | 系統維護中 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgTemplateInUseConflict`](#error-msgtemplateinuseconflict) | 同類型已有啟用模板 | 後台／技術候選 | 待人工分級 |
| [`MsgTitleRequired`](#error-msgtitlerequired) | 標題必填 | 客服／技術待分類 | 待人工分級 |
| [`MsgTotpInvalid`](#error-msgtotpinvalid) | TOTP 驗證錯誤 | 客服／技術待分類 | 待人工分級 |
| [`MsgTotpNotActive`](#error-msgtotpnotactive) | TOTP 未啟用 | 客服／技術待分類 | 待人工分級 |
| [`MsgTransferTargetInvalid`](#error-msgtransfertargetinvalid) | 轉接對象無效（空字串或同 operator） | 玩家／客服候選 | 已納入常見對照 |
| [`MsgTurnstileSecretKey`](#error-msgturnstilesecretkey) | 網站異常 | 玩家／客服候選 | 待人工分級 |
| [`MsgTurnstileVerificationFailed`](#error-msgturnstileverificationfailed) | 驗證錯誤 | 玩家／客服候選 | 已納入常見對照 |
| [`MsgUnexpectedErrorOnRollback`](#error-msgunexpectederroronrollback) | 回滾時發生非預期錯誤 | 客服／技術待分類 | 待人工分級 |
| [`MsgUpgradeLevelMismatch`](#error-msgupgradelevelmismatch) | 升級等級不符 | 玩家／客服候選 | 待人工分級 |
| [`MsgUpgradeNotEligible`](#error-msgupgradenoteligible) | 不符合升級資格 | 玩家／客服候選 | 待人工分級 |
| [`MsgWalletNotFound`](#error-msgwalletnotfound) | 找不到錢包 | 玩家／客服候選 | 已納入常見對照 |

## A.6 新增錯誤訊息維護流程

未來 `message.txt` 增加錯誤時，建議依下列流程更新：

1. 保留原始來源檔與取得日期，不直接改寫後端原文。
2. 執行本附錄產生器，更新 A.5 完整來源索引。
3. 由產品與後端確認錯誤的觸發條件、HTTP／API 情境、是否玩家可見，以及是否需要前端轉換文案。
4. 由客服與營運補上玩家回覆、查詢步驟、可處理權限、升級對象與是否有時限。
5. 將高頻或高風險錯誤加入 A.4；低頻或技術錯誤保留在 A.5，避免主流程過度膨脹。
6. 重新產生本機 HTML，使用搜尋、錯誤代碼錨點與注記功能進行確認。
7. 未經檢視前，不要將含有後台／技術訊息的完整索引推送到公開 repository。

建議後續為每筆錯誤補上「確認日期」「確認人」「正式狀態」「前端是否顯示原文」「關聯 API／頁面」等欄位，以便版本交接。

## A.7 截圖與規格注記預留

目前附錄先以文案與索引為主，尚未加入畫面截圖。正式規則確認後，可在 A.4 的高頻錯誤項目補上：

- 觸發畫面與操作步驟截圖；
- 玩家實際看到的前端文案；
- 客服可見的錯誤代碼與查詢位置；
- 已確認／待確認的規格注記。

本機 HTML 的注記會儲存在瀏覽器 localStorage；如需跨電腦或交接，請使用匯出 JSON 功能保存注記。

---

來源快照：message.txt
