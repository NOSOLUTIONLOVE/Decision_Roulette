/** English dictionary — all user-facing English strings.
 *  Key names mirror the zh dictionary 1:1; TS enforces sync via TranslationKey. */
export const en = {
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
  'settings.consentTitle': 'Data collection',
  'settings.consentDesc': 'Allow anonymous analytics and error reporting (Plausible / Sentry). Off by default; must be enabled manually.',
  'settings.consentOn': 'On',
  'settings.consentOff': 'Off',

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

  // === PrivacyPage §6 (error monitoring disclosure) ===
  'privacy.section6Title': 'Error Monitoring (optional)',
  'privacy.section6Body': 'If you enable "Data collection" in Settings, the app uses Sentry to collect runtime crash reports: error type, stack trace, user action trail (breadcrumbs), browser/OS version, app version, and the IP address at the time of the incident (for deduplication and rate limiting). We do not collect your option content, history, presets, or any text you enter. Crash data is retained for 90 days and then auto-deleted; transmission uses TLS encryption. You can disable this toggle in Settings at any time to stop reporting; data already sent before disabling will auto-expire per the retention window above.',

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

  // === Storage quota / degradation ===
  'storage.quotaExceeded': 'Local storage is full; some history records could not be saved. Please clear browser data and retry.',
  'storage.degraded': 'Local database unavailable; switched to lightweight storage (max 50 records).',
};
