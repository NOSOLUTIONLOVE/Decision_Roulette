/** 中文字典 — 所有面向用户的中文文案集中在此。
 *  键名使用点分命名空间（如 'nav.title'），与组件注释中的 === 区块标题对应。 */
export const zh = {
  // === TopNav ===
  'nav.title': '命运之轮',
  'nav.history': '历史记录',
  'nav.mute': '静音',
  'nav.unmute': '取消静音',
  'nav.settings': '设置',
  'nav.language': '语言切换',

  // === LanguageSwitcher ===
  'lang.switch': '切换语言',
  'lang.zh': '中',
  'lang.en': 'EN',

  // === EditorialHeader ===
  'header.eyebrow': '今日抉择',
  'header.title': '你今天想吃什么？',
  'header.subtitle': '输入你的选项，让轮盘替你决定。',

  // === WheelPage ===
  'wheel.emptyHint': '至少添加 2 个选项，轮盘才会出现',
  'wheel.canvasEmptyHint': '添加选项开始',
  'wheel.canvasSingleHint': '至少需要 2 个选项',

  // === Ornament ===
  'ornament.hint': '长按蓄力 · 松手启动 · 回车触发',

  // === OptionsInput ===
  'options.input.placeholder': '输入选项，回车添加…',
  'options.input.placeholderMaxed': '已达上限 50 个',
  'options.input.needTwo': '至少需要 2 个选项',
  'options.input.count': '共 {count} 个选项',
  'options.input.add': '添加选项',
  'options.input.maxed': '已达上限 50 个',

  // === OptionsList ===
  'options.list.empty': '还没有选项，在上方添加吧',
  'options.list.savePreset': '保存为预设',
  'options.list.clearAll': '清空全部',
  'options.list.confirmClear': '确认清空？',
  'options.list.cleared': '已清空所有选项',

  // === OptionItem ===
  'option.drag': '拖拽排序',
  'option.save': '保存',
  'option.delete': '删除选项',

  // === SpinButton ===
  'spin.label': '转动命运之轮',
  'spin.charging': '蓄力中',
  'spin.spinning': '转动中…',
  'spin.ariaLabel': '转动命运之轮',

  // === SavePresetDialog ===
  'preset.title': '保存为预设',
  'preset.desc': '为这组选项命名，方便下次使用。',
  'preset.placeholder': '例如：午餐选择',
  'preset.cancel': '取消',
  'preset.save': '保存',
  'preset.savedToast': '已保存为预设',
  'preset.saveFailToast': '保存失败，请重试',

  // === ResultCard ===
  'result.eyebrow': '命运已定',
  'result.subtitle': '今晚的答案，是它。',
  'result.spinAgain': '再转一次',
  'result.save': '保存',
  'result.saved': '已存',
  'result.share': '分享',
  'result.meta': '第 {num} 号 · 今夜之选',
  'result.savedToast': '已保存为预设',
  'result.saveFailToast': '保存失败，请重试',

  // === ResultOverlay ===
  'result.ariaLabel': '转动结果',

  // === ShareSheet ===
  'share.title': '分享这次决定',
  'share.desc': '命运替你决定：{result}',
  'share.descEmpty': '请先转动轮盘获得结果',
  'share.saveImage': '保存图片',
  'share.copyLink': '复制链接',
  'share.copied': '链接已复制',
  'share.socialShare': '分享到社交',
  'share.imageFail': '图片生成失败，请重试。',
  'share.linkFail': '链接生成失败，请重试。',
  'share.linkTooLong': '选项过多，链接超长，请减少选项后再分享。',
  'share.socialFail': '分享未完成，请重试。',
  'share.linkPreview': '/share?d=…',
  'share.close': '关闭',

  // === HistoryDrawer ===
  'history.eyebrow': 'CHRONICLE',
  'history.title': '你的选择',
  'history.tabHistory': '历史',
  'history.tabPresets': '预设',
  'history.ariaLabel': '历史与预设',
  'history.close': '关闭',

  // === HistoryList ===
  'history.loading': '加载中…',
  'history.empty': '还没有决定记录',
  'history.emptyHint': '转动转盘后会自动保存',
  'history.count': '共 {count} 条',
  'history.clear': '清空',
  'history.clearTitle': '清空历史记录？',
  'history.clearDesc': '此操作不可撤销，所有决定记录将被永久删除。',

  // === HistoryItem ===
  'history.deleteAria': '删除记录',
  'history.deleteTitle': '删除记录',
  'history.deleteDesc': '确定要删除这条决定记录吗？',
  'history.confirmDelete': '删除',
  'history.cancel': '取消',
  'history.deleted': '已删除',
  'history.optionCount': '{count} 个选项',
  'history.expand': '展开选项',
  'history.collapse': '收起选项',
  'history.winner': '命中',

  // === PresetList ===
  'preset.loading': '加载中…',
  'preset.empty': '还没有保存预设',
  'preset.emptyHint': '在选项编辑中保存常用组合',
  'preset.count': '共 {count} 个预设',
  'preset.optionCount': '{count} 个选项',
  'preset.deleteAria': '删除预设',
  'preset.load': '载入转盘',

  // === SettingsPanel ===
  'settings.title': '设置',
  'settings.close': '关闭',
  'settings.themeTitle': '主题',
  'settings.themeDesc': '切换整体配色方案，影响所有界面元素',
  'settings.textSizeTitle': '字号',
  'settings.textSizeDesc': '调节整个网页的文字大小',
  'settings.pointerTitle': '指针样式',
  'settings.pointerDesc': '选择轮盘顶部指针的形状',
  'settings.consentTitle': '数据收集',
  'settings.consentDesc': '允许匿名访问分析与错误报告（Plausible / Sentry）。默认关闭，需手动开启。',
  'settings.consentOn': '已开启',
  'settings.consentOff': '已关闭',

  // === ThemePicker ===
  'theme.editorial': '暖纸编辑',
  'theme.neonNight': '霓虹夜',
  'theme.morandi': '莫兰迪',
  'theme.ariaLabel': '主题：{name}',

  // === TextSizeSlider ===
  'textSize.small': '小',
  'textSize.medium': '中',
  'textSize.large': '大',

  // === PointerStylePicker ===
  'pointer.triangle': '三角',
  'pointer.circle': '圆形',
  'pointer.arrow': '箭头',
  'pointer.ariaLabel': '指针样式：{name}',

  // === ConfirmDialog ===
  'confirm.defaultConfirm': '确认',
  'confirm.defaultCancel': '取消',

  // === Toast ===
  'toast.ariaLabel': '通知',

  // === ErrorBoundary ===
  'error.title': '出错了',
  'error.desc': '页面出现问题，请刷新重试',
  'error.reload': '刷新页面',

  // === NotFoundPage ===
  'notFound.title': '这条命运之路走不通',
  'notFound.desc': '你走入了一片未被绘制的纸面，转盘尚未抵达此处。',
  'notFound.cta': '回到命运之轮',

  // === PrivacyPage ===
  'privacy.eyebrow': 'LEGAL',
  'privacy.title': '隐私政策',
  'privacy.section1Title': '数据存储说明',
  'privacy.section1Body': '所有数据（选项、历史记录、预设）均存储在您设备的浏览器本地（IndexedDB 与 LocalStorage），不上传至任何服务器。卸载浏览器或清除站点数据即等同于删除全部本地记录。',
  'privacy.section2Title': '不追踪',
  'privacy.section2Body': '本应用不使用 Cookie 进行追踪，不采集您的个人身份信息，也不进行跨站行为画像。',
  'privacy.section3Title': '第三方服务',
  'privacy.section3Body': '若启用访问分析，仅收集匿名聚合数据（页面访问量、设备类型、来源），不含可识别个人信息，也不与任何第三方共享原始记录。您可通过浏览器拦截该脚本以完全关闭分析。',
  'privacy.section4Title': '数据删除',
  'privacy.section4Body': '您可随时在应用内清除历史记录，或通过浏览器「清除站点数据」来删除所有本地数据（选项、历史、预设、主题偏好）。',
  'privacy.section5Title': '联系方式',
  'privacy.section5Body': '如有疑问可通过',
  'privacy.section5Link': 'GitHub Issues',
  'privacy.section5Tail': '联系我们。',
  'privacy.cta': '返回命运之轮',

  // === PrivacyPage §6（错误监控披露）===
  'privacy.section6Title': '错误监控（可选）',
  'privacy.section6Body': '若您在「设置」中开启「数据收集」，应用将使用 Sentry 收集运行时崩溃报告，内容包括：错误类型、调用栈、用户操作路径（breadcrumbs）、浏览器/操作系统版本、应用版本、以及事发时的 IP 地址（用于去重与频次限制）。我们不收集您的选项内容、历史记录、预设或任何输入文本。崩溃数据保留 90 天后自动删除，传输采用 TLS 加密。您可随时在设置中关闭此开关以完全停止上报，关闭前的已上报数据按上述期限自动过期。',

  // === TermsPage ===
  'terms.eyebrow': 'LEGAL',
  'terms.title': '服务条款',
  'terms.section1Title': '服务性质',
  'terms.section1Body': '命运之轮是一个娱乐性质的工具应用，帮助用户在选项间做出随机选择。它不提供任何商业、医疗、法律、金融或专业咨询。',
  'terms.section2Title': '免责声明',
  'terms.section2Body': '轮盘结果由随机算法生成，仅供娱乐参考，不构成任何专业建议、决策建议或预测。我们不对结果的「公正性」「幸运度」或任何衍生解释作出保证。',
  'terms.section3Title': '使用风险',
  'terms.section3Body': '用户对基于轮盘结果做出的任何决定自行承担责任。请勿在涉及健康、安全、财务或他人权益的重要场景中将本应用作为唯一决策依据。',
  'terms.section4Title': '知识产权',
  'terms.section4Body': '应用的视觉设计、代码与品牌名称受版权保护。未经书面许可，不得复制、再分发或以商业方式使用本应用的设计与代码。',
  'terms.section5Title': '条款变更',
  'terms.section5Body': '我们保留随时修改本条款的权利。修改后的条款自发布于本页面起生效，继续使用即视为接受更新后的条款。',
  'terms.cta': '返回命运之轮',

  // === ShareResultPage ===
  'shareResult.eyebrow': '— Decision Roulette —',
  'shareResult.canvasAria': '命运之轮结果',
  'shareResult.eyebrowLabel': '命运替你决定了',
  'shareResult.subtitle': '输入选项 · 转动转盘 · 接受指引',
  'shareResult.saveImage': '保存结果图',
  'shareResult.copyLink': '复制链接',
  'shareResult.copied': '已复制',
  'shareResult.share': '分享',
  'shareResult.invalidTitle': '链接已失效',
  'shareResult.invalidDesc': '这个分享链接无法被解读，或许它已损坏或被截断。',
  'shareResult.cta': '回到命运之轮',
  'shareResult.imageFail': '图片生成失败，请重试。',
  'shareResult.copyFail': '复制失败，请手动复制地址栏链接。',
  'shareResult.socialFail': '分享未完成，请重试。',
  'shareResult.shareTitle': '命运之轮 — Decision Roulette',
  'shareResult.shareText': '命运替我决定了：{result}',
  'shareResult.installTitle': '添加到主屏幕',
  'shareResult.installed': '已安装，可从主屏幕离线启动。',
  'shareResult.installNow': '立即安装',
  'shareResult.iosGuide': '点击底部分享按钮，选择「添加到主屏幕」。',
  'shareResult.androidGuide': '打开菜单，选择「添加到主屏幕」。',
  'shareResult.iosLabel': 'iOS Safari：',
  'shareResult.androidLabel': 'Android Chrome：',
  'shareResult.installHint': '安装后可离线使用，像原生应用一样启动。',
  'shareResult.spinYourself': '我自己转一个',

  // === ReloadPrompt ===
  'pwa.needRefresh': '新版本可用',
  'pwa.offlineReady': '应用已可离线使用',
  'pwa.refresh': '刷新',

  // === useSpinEngine ===
  'spin.historySaveFail': '结果已保存到当前会话，但未能写入历史记录',

  // === 存储配额 / 降级 ===
  'storage.quotaExceeded': '本地存储已满，部分历史记录未能保存。请清理浏览器数据后重试。',
  'storage.degraded': '本地数据库不可用，已切换至轻量存储（最多保留 50 条记录）。',
};
