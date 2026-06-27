/**
 * 国际化文案字典。
 *
 * 所有面向用户的字符串集中在此管理，组件通过 useLocaleStore 的 t(key) 读取。
 * 字典按功能模块分组以便维护，key 使用点分命名空间。
 *
 * 缺失策略：t(key) 在当前语言未命中时回退到 zh，zh 也未命中则返回 key 本身。
 */

export type Locale = 'zh' | 'en';

export const DEFAULT_LOCALE: Locale = 'zh';
export const LOCALE_STORAGE_KEY = 'dr-locale';

type Dict = Record<string, string>;

export const translations: Record<Locale, Dict> = {
  zh: {
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
  },

  en: {
    // === TopNav ===
    'nav.title': 'Wheel of Fate',
    'nav.history': 'History',
    'nav.mute': 'Mute',
    'nav.unmute': 'Unmute',
    'nav.settings': 'Settings',
    'nav.language': 'Switch language',

    // === LanguageSwitcher ===
    'lang.switch': 'Switch language',
    'lang.zh': '中',
    'lang.en': 'EN',

    // === EditorialHeader ===
    'header.eyebrow': "TODAY'S CHOICE",
    'header.title': 'What do you want to eat today?',
    'header.subtitle': 'Enter your options and let the wheel decide.',

    // === WheelPage ===
    'wheel.emptyHint': 'Add at least 2 options for the wheel to appear',
    'wheel.canvasEmptyHint': 'Add options to start',
    'wheel.canvasSingleHint': 'At least 2 options required',

    // === Ornament ===
    'ornament.hint': 'Hold to charge · Release to spin · Enter to trigger',

    // === OptionsInput ===
    'options.input.placeholder': 'Enter an option, press Enter to add…',
    'options.input.placeholderMaxed': 'Reached the limit of 50',
    'options.input.needTwo': 'At least 2 options required',
    'options.input.count': '{count} options total',
    'options.input.add': 'Add option',
    'options.input.maxed': 'Reached the limit of 50',

    // === OptionsList ===
    'options.list.empty': 'No options yet — add some above',
    'options.list.savePreset': 'Save as preset',
    'options.list.clearAll': 'Clear all',
    'options.list.confirmClear': 'Confirm clear?',
    'options.list.cleared': 'Cleared all options',

    // === OptionItem ===
    'option.drag': 'Drag to reorder',
    'option.save': 'Save',
    'option.delete': 'Delete option',

    // === SpinButton ===
    'spin.label': 'Spin the Wheel of Fate',
    'spin.charging': 'Charging',
    'spin.spinning': 'Spinning…',
    'spin.ariaLabel': 'Spin the Wheel of Fate',

    // === SavePresetDialog ===
    'preset.title': 'Save as preset',
    'preset.desc': 'Name this set of options for quick reuse.',
    'preset.placeholder': 'e.g. Lunch picks',
    'preset.cancel': 'Cancel',
    'preset.save': 'Save',
    'preset.savedToast': 'Saved as preset',
    'preset.saveFailToast': 'Save failed, please try again',

    // === ResultCard ===
    'result.eyebrow': 'FATE SEALED',
    'result.subtitle': "Tonight's answer is this.",
    'result.spinAgain': 'Spin again',
    'result.save': 'Save',
    'result.saved': 'Saved',
    'result.share': 'Share',
    'result.meta': 'No. {num} · tonight\'s choice',
    'result.savedToast': 'Saved as preset',
    'result.saveFailToast': 'Save failed, please try again',

    // === ResultOverlay ===
    'result.ariaLabel': 'Spin result',

    // === ShareSheet ===
    'share.title': 'Share this decision',
    'share.desc': 'Fate decided for you: {result}',
    'share.descEmpty': 'Spin the wheel first to get a result',
    'share.saveImage': 'Save image',
    'share.copyLink': 'Copy link',
    'share.copied': 'Link copied',
    'share.socialShare': 'Share to social',
    'share.imageFail': 'Image generation failed, please retry.',
    'share.linkFail': 'Link generation failed, please retry.',
    'share.linkTooLong': 'Too many options — link too long. Please reduce options before sharing.',
    'share.socialFail': 'Sharing incomplete, please retry.',
    'share.linkPreview': '/share?d=…',
    'share.close': 'Close',

    // === HistoryDrawer ===
    'history.eyebrow': 'CHRONICLE',
    'history.title': 'Your choices',
    'history.tabHistory': 'History',
    'history.tabPresets': 'Presets',
    'history.ariaLabel': 'History and presets',
    'history.close': 'Close',

    // === HistoryList ===
    'history.loading': 'Loading…',
    'history.empty': 'No decisions yet',
    'history.emptyHint': 'Spins are saved automatically',
    'history.count': '{count} records',
    'history.clear': 'Clear',
    'history.clearTitle': 'Clear history?',
    'history.clearDesc': 'This cannot be undone. All decision records will be permanently deleted.',

    // === HistoryItem ===
    'history.deleteAria': 'Delete record',
    'history.deleteTitle': 'Delete record',
    'history.deleteDesc': 'Are you sure you want to delete this decision record?',
    'history.confirmDelete': 'Delete',
    'history.cancel': 'Cancel',
    'history.deleted': 'Deleted',
    'history.optionCount': '{count} options',
    'history.expand': 'Show options',
    'history.collapse': 'Hide options',
    'history.winner': 'Hit',

    // === PresetList ===
    'preset.loading': 'Loading…',
    'preset.empty': 'No saved presets yet',
    'preset.emptyHint': 'Save common combinations from the option editor',
    'preset.count': '{count} presets',
    'preset.optionCount': '{count} options',
    'preset.deleteAria': 'Delete preset',
    'preset.load': 'Load into wheel',

    // === SettingsPanel ===
    'settings.title': 'Settings',
    'settings.close': 'Close',
    'settings.themeTitle': 'Theme',
    'settings.themeDesc': 'Switch the overall color scheme, affects all UI elements',
    'settings.textSizeTitle': 'Text size',
    'settings.textSizeDesc': 'Adjust text size across the whole page',
    'settings.pointerTitle': 'Pointer style',
    'settings.pointerDesc': 'Choose the shape of the top pointer',

    // === ThemePicker ===
    'theme.editorial': 'Editorial Paper',
    'theme.neonNight': 'Neon Night',
    'theme.morandi': 'Morandi',
    'theme.ariaLabel': 'Theme: {name}',

    // === TextSizeSlider ===
    'textSize.small': 'S',
    'textSize.medium': 'M',
    'textSize.large': 'L',

    // === PointerStylePicker ===
    'pointer.triangle': 'Triangle',
    'pointer.circle': 'Circle',
    'pointer.arrow': 'Arrow',
    'pointer.ariaLabel': 'Pointer style: {name}',

    // === ConfirmDialog ===
    'confirm.defaultConfirm': 'Confirm',
    'confirm.defaultCancel': 'Cancel',

    // === Toast ===
    'toast.ariaLabel': 'Notification',

    // === ErrorBoundary ===
    'error.title': 'Something went wrong',
    'error.desc': 'The page ran into an issue. Please refresh and retry.',
    'error.reload': 'Reload page',

    // === NotFoundPage ===
    'notFound.title': 'This path of fate leads nowhere',
    'notFound.desc': 'You wandered onto an unrendered page — the wheel has not reached here yet.',
    'notFound.cta': 'Back to Wheel of Fate',

    // === PrivacyPage ===
    'privacy.eyebrow': 'LEGAL',
    'privacy.title': 'Privacy Policy',
    'privacy.section1Title': 'Data Storage',
    'privacy.section1Body': 'All data (options, history, presets) is stored locally in your browser (IndexedDB and LocalStorage) and never uploaded to any server. Uninstalling the browser or clearing site data is equivalent to deleting all local records.',
    'privacy.section2Title': 'No Tracking',
    'privacy.section2Body': 'This app does not use cookies for tracking, does not collect your personally identifiable information, and does not perform cross-site behavioral profiling.',
    'privacy.section3Title': 'Third-party Services',
    'privacy.section3Body': 'If analytics is enabled, only anonymous aggregate data (page views, device type, referrer) is collected, with no personally identifiable information and no raw records shared with any third party. You can block the script in your browser to fully disable analytics.',
    'privacy.section4Title': 'Data Deletion',
    'privacy.section4Body': 'You can clear history within the app at any time, or use your browser\'s "Clear site data" to delete all local data (options, history, presets, theme preferences).',
    'privacy.section5Title': 'Contact',
    'privacy.section5Body': 'If you have questions, reach us via',
    'privacy.section5Link': 'GitHub Issues',
    'privacy.section5Tail': '.',
    'privacy.cta': 'Back to Wheel of Fate',

    // === TermsPage ===
    'terms.eyebrow': 'LEGAL',
    'terms.title': 'Terms of Service',
    'terms.section1Title': 'Nature of Service',
    'terms.section1Body': 'Wheel of Fate is an entertainment utility that helps users make random choices among options. It does not provide any commercial, medical, legal, financial, or professional advice.',
    'terms.section2Title': 'Disclaimer',
    'terms.section2Body': 'Wheel results are generated by a random algorithm and are for entertainment reference only. They do not constitute any professional advice, decision guidance, or prediction. We make no guarantee about the "fairness", "luckiness", or any derived interpretation of results.',
    'terms.section3Title': 'Usage Risk',
    'terms.section3Body': 'Users are responsible for any decisions made based on wheel results. Do not use this app as the sole decision basis in important scenarios involving health, safety, finance, or the rights of others.',
    'terms.section4Title': 'Intellectual Property',
    'terms.section4Body': 'The visual design, code, and brand name of this app are copyrighted. Without written permission, you may not copy, redistribute, or commercially use the design and code of this app.',
    'terms.section5Title': 'Changes to Terms',
    'terms.section5Body': 'We reserve the right to modify these terms at any time. Modified terms take effect upon publication on this page, and continued use constitutes acceptance of the updated terms.',
    'terms.cta': 'Back to Wheel of Fate',

    // === ShareResultPage ===
    'shareResult.eyebrow': '— Decision Roulette —',
    'shareResult.canvasAria': 'Wheel of Fate result',
    'shareResult.eyebrowLabel': 'Fate decided for you',
    'shareResult.subtitle': 'Enter options · Spin the wheel · Embrace the guidance',
    'shareResult.saveImage': 'Save result image',
    'shareResult.copyLink': 'Copy link',
    'shareResult.copied': 'Copied',
    'shareResult.share': 'Share',
    'shareResult.invalidTitle': 'Link expired',
    'shareResult.invalidDesc': 'This share link cannot be decoded — it may be corrupted or truncated.',
    'shareResult.cta': 'Back to Wheel of Fate',
    'shareResult.imageFail': 'Image generation failed, please retry.',
    'shareResult.copyFail': 'Copy failed — please copy the address bar link manually.',
    'shareResult.socialFail': 'Sharing incomplete, please retry.',
    'shareResult.shareTitle': 'Wheel of Fate — Decision Roulette',
    'shareResult.shareText': 'Fate decided for me: {result}',
    'shareResult.installTitle': 'Add to Home Screen',
    'shareResult.installed': 'Installed — launch offline from your Home Screen.',
    'shareResult.installNow': 'Install now',
    'shareResult.iosGuide': 'Tap the Share button, then "Add to Home Screen".',
    'shareResult.androidGuide': 'Open the menu, then "Add to Home Screen".',
    'shareResult.iosLabel': 'iOS Safari: ',
    'shareResult.androidLabel': 'Android Chrome: ',
    'shareResult.installHint': 'Works offline after install — launch like a native app.',
    'shareResult.spinYourself': 'Spin my own',

    // === ReloadPrompt ===
    'pwa.needRefresh': 'New version available',
    'pwa.offlineReady': 'App ready for offline use',
    'pwa.refresh': 'Refresh',

    // === useSpinEngine ===
    'spin.historySaveFail': 'Result saved to this session, but failed to write to history.',
  },
};

/**
 * 插值：将 {key} 占位符替换为 params 中的值。
 * 例如 t('history.optionCount', { count: 5 }) -> "5 个选项" / "5 options"
 */
export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`,
  );
}
