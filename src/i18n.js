

const TRANSLATIONS = {
  en: {
    
    dragTip: "Drag to move · Double-click to center · Right-click to pin",
    resizeTip: "Resize window",
    clearTip: "Clear search",
    indexingTip: "Indexing…",
    settingsTip: "Settings",
    searchPlaceholder: "",
    defaultHint: "Type to search · Tab completes · Right-click for actions · !help for commands",
    noResults: "No results found",

    ctxOpen: "Open",
    ctxAdmin: "Open as admin",
    ctxDirectory: "Open directory",
    ctxCopy: "Copy path",

    groupGeneral: "General & System",
    groupAppearance: "Appearance & Theme",
    groupIndexing: "Indexing & Content",

    lblLanguage: "Language",
    lblHotkey: "Global Hotkey",
    lblAlign: "Window Position",
    lblMonitor: "Display Monitor",
    lblZoom: "Zoom Level",
    lblAutostart: "Run at Windows startup",
    lblPresets: "Theme Presets",
    lblAccent: "Accent Color",
    lblBg: "Background Color",
    lblRadius: "Card Corner Radius",
    lblRowH: "Row Height",
    lblOpacity: "Card Opacity",
    lblGlow: "Glow Effect",
    lblBorder: "Card Border",
    lblBorderW: "Border Width",
    lblBorderPos: "Border Style",
    lblIndex: "Indexed Files",
    lblContent: "Content Categories",
    lblRebuild: "Rebuild Index",

    pressKeys: "Press keys…",
    hotkeyModifierError: "Include a modifier: Ctrl, Alt, Shift or Super",
    autostartOn: "Autostart enabled",
    autostartOff: "Autostart disabled",
    rebuildingNotice: "Rebuilding index… Search remains available.",
    borderInner: "Inner",
    borderOuter: "Outer",
    borderInnerTip: "Stroke inside card edges",
    borderOuterTip: "Stroke outside card edges",
    customAccentTip: "Custom Accent Color",
    customBgTip: "Custom Background Color",
    currentCount: "Current",
    hiddenKinds: "Hidden",
    everythingShown: "Everything is shown",
    itemsCount: "items",
    stillIndexing: "Still indexing…",
    hotkeyApplied: "Hotkey updated",

    groupFolders: "Folders",
    groupPrograms: "Applications",
    groupMedia: "Media Files",
    groupFiles: "Documents & Files",
    groupSystem: "System & Libraries",
    selectAll: "Select All",

    helpTitle: "Available Commands",
    helpZoom: "Change UI zoom level",
    helpYt: "Search YouTube",
    helpG: "Search Google",
    helpGh: "Search GitHub",
    helpWiki: "Search Wikipedia",
    helpD: "Search DuckDuckGo",
    helpNpm: "Search npm packages",
    helpRed: "Search Reddit",
    helpSo: "Search StackOverflow",
    helpTranslate: "Google Translate",
    helpDict: "Dictionary definition",
    helpWeather: "Weather forecast (wttr.in)",
    helpFx: "Currency rate (XE USD -> RUB)",
    helpCalc: "Calculator (e.g. 2+2*3)",
    helpColor: "Color code info & shades",
    helpKill: "Kill running process",
    helpPower: "Shutdown / Restart / Sleep",
    helpCurr: "Live currency converter",
  },
  ru: {
    
    dragTip: "Перетащите · Двойной клик: центр · Правый клик: закрепить",
    resizeTip: "Изменить размер",
    clearTip: "Очистить поиск",
    indexingTip: "Индексация…",
    settingsTip: "Настройки",
    searchPlaceholder: "",
    defaultHint: "Вводите текст · Tab — автодополнение · Правый клик — действия · !help — команды",
    noResults: "Ничего не найдено",

    ctxOpen: "Открыть",
    ctxAdmin: "Запустить от админа",
    ctxDirectory: "Открыть папку",
    ctxCopy: "Скопировать путь",

    groupGeneral: "Основное и Система",
    groupAppearance: "Внешний вид и Тема",
    groupIndexing: "Индексация и Поиск",

    lblLanguage: "Язык интерфейса",
    lblHotkey: "Горячая клавиша",
    lblAlign: "Привязка окна",
    lblMonitor: "Монитор",
    lblZoom: "Масштаб (Zoom)",
    lblAutostart: "Запуск при старте Windows",
    lblPresets: "Пресеты оформления",
    lblAccent: "Цвет акцента",
    lblBg: "Цвет фона",
    lblRadius: "Скругление карточек",
    lblRowH: "Высота строк",
    lblOpacity: "Прозрачность",
    lblGlow: "Эффект свечения",
    lblBorder: "Рамка карточек",
    lblBorderW: "Толщина рамки",
    lblBorderPos: "Стиль рамки",
    lblIndex: "Проиндексировано",
    lblContent: "Категории файлов",
    lblRebuild: "Переиндексировать",

    pressKeys: "Нажмите клавиши…",
    hotkeyModifierError: "Добавьте модификатор: Ctrl, Alt, Shift или Super",
    autostartOn: "Автозапуск включен",
    autostartOff: "Автозапуск выключен",
    rebuildingNotice: "Обновление индекса… Поиск доступен во время работы.",
    borderInner: "Внутрь",
    borderOuter: "Наружу",
    borderInnerTip: "Контур внутри карточки",
    borderOuterTip: "Контур снаружи карточки",
    customAccentTip: "Свой цвет акцента",
    customBgTip: "Свой цвет фона",
    currentCount: "Активно",
    hiddenKinds: "Скрыто",
    everythingShown: "Отображается всё",
    itemsCount: "элементов",
    stillIndexing: "Индексация…",
    hotkeyApplied: "Горячая клавиша обновлена",

    groupFolders: "Папки",
    groupPrograms: "Приложения",
    groupMedia: "Медиафайлы",
    groupFiles: "Документы и файлы",
    groupSystem: "Системные файлы и библиотеки",
    selectAll: "Выбрать всё",

    helpTitle: "Доступные команды",
    helpZoom: "Изменить масштаб UI",
    helpYt: "Поиск в YouTube",
    helpG: "Поиск в Google",
    helpGh: "Поиск в GitHub",
    helpWiki: "Поиск в Википедии",
    helpD: "Поиск в DuckDuckGo",
    helpNpm: "Поиск в npm",
    helpRed: "Поиск на Reddit",
    helpSo: "Поиск на StackOverflow",
    helpTranslate: "Google Переводчик",
    helpDict: "Определение слова",
    helpWeather: "Прогноз погоды (wttr.in)",
    helpFx: "Курс валют XE (USD -> RUB)",
    helpCalc: "Калькулятор (напр. 2+2*3)",
    helpColor: "Информация о цвете и оттенки",
    helpKill: "Завершить процесс",
    helpPower: "Питание (shutdown/restart/sleep)",
    helpCurr: "Конвертер валют",
  },
  ja: {
    
    dragTip: "ドラッグで移動 · ダブルクリックで中央配置 · 右クリックで pinned",
    resizeTip: "サイズ変更",
    clearTip: "クリア",
    indexingTip: "インデックス作成中…",
    settingsTip: "設定",
    searchPlaceholder: "",
    defaultHint: "入力して検索 · Tabで補完 · 右クリックで操作 · !helpでコマンド一覧",
    noResults: "結果が見つかりません",

    ctxOpen: "開く",
    ctxAdmin: "管理者として実行",
    ctxDirectory: "フォルダを開く",
    ctxCopy: "パスをコピー",

    groupGeneral: "一般・システム",
    groupAppearance: "外観・テーマ",
    groupIndexing: "インデックス・検索",

    lblLanguage: "表示言語",
    lblHotkey: "グローバルホットキー",
    lblAlign: "ウィンドウ配置",
    lblMonitor: "ディスプレイ",
    lblZoom: "ズーム",
    lblAutostart: "Windows起動時に実行",
    lblPresets: "テーマプリセット",
    lblAccent: "アクセントカラー",
    lblBg: "背景色",
    lblRadius: "カードの角丸",
    lblRowH: "行の高さ",
    lblOpacity: "不透明度",
    lblGlow: "発光エフェクト",
    lblBorder: "枠線",
    lblBorderW: "枠線の太さ",
    lblBorderPos: "枠線のスタイル",
    lblIndex: "インデックス数",
    lblContent: "検索カテゴリ",
    lblRebuild: "再構築",

    pressKeys: "キーを押してください…",
    hotkeyModifierError: "修飾キー（Ctrl, Alt, Shift, Super）を含めてください",
    autostartOn: "自動起動有効",
    autostartOff: "自動起動無効",
    rebuildingNotice: "インデックスを再構築中… 検索は利用可能です。",
    borderInner: "内側",
    borderOuter: "外側",
    borderInnerTip: "枠線を内側に配置",
    borderOuterTip: "枠線を外側に配置",
    customAccentTip: "カスタムアクセントカラー",
    customBgTip: "カスタム背景色",
    currentCount: "選択中",
    hiddenKinds: "非表示",
    everythingShown: "すべて表示中",
    itemsCount: "件",
    stillIndexing: "インデックス作成中…",
    hotkeyApplied: "ホットキーを更新しました",

    groupFolders: "フォルダ",
    groupPrograms: "アプリケーション",
    groupMedia: "メディアファイル",
    groupFiles: "ドキュメント・ファイル",
    groupSystem: "システムとライブラリ",
    selectAll: "すべて選択",

    helpTitle: "利用可能なコマンド",
    helpZoom: "UIズームの変更",
    helpYt: "YouTube検索",
    helpG: "Google検索",
    helpGh: "GitHub検索",
    helpWiki: "Wikipedia検索",
    helpD: "DuckDuckGo検索",
    helpNpm: "npmパッケージ検索",
    helpRed: "Reddit検索",
    helpSo: "StackOverflow検索",
    helpTranslate: "Google翻訳",
    helpDict: "辞書検索",
    helpWeather: "天気予報 (wttr.in)",
    helpFx: "為替レート (XE USD -> RUB)",
    helpCalc: "電卓 (例: 2+2*3)",
    helpColor: "カラーコード詳細とシェード",
    helpKill: "プロセスの終了",
    helpPower: "電源操作 (シャットダウン/再起動/スリープ)",
    helpCurr: "リアルタイム通貨換算",
  },
};

let currentLang = "en";

function getLang() {
  return currentLang;
}

function setLanguage(lang) {
  if (TRANSLATIONS[lang]) {
    currentLang = lang;
  } else {
    currentLang = "en";
  }
  
  if (document.startViewTransition) {
    document.startViewTransition(() => updateUIStrings());
  } else {
    updateUIStrings();
  }
  
  return currentLang;
}

function t(key, params = {}) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  let str = dict[key] || TRANSLATIONS.en[key] || key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, "g"), v);
  }
  return str;
}

function updateUIStrings() {
  const elems = document.querySelectorAll("[data-i18n]");
  elems.forEach((el) => {
    const key = el.dataset.i18n;
    if (key) {
      el.textContent = t(key);
    }
  });

  const tips = document.querySelectorAll("[data-i18n-tip]");
  tips.forEach((el) => {
    const key = el.dataset.i18nTip;
    if (key) {
      el.dataset.tip = t(key);
    }
  });

  const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
  placeholders.forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (key) {
      el.placeholder = t(key);
    }
  });

  window.dispatchEvent(new CustomEvent("language-changed", { detail: { lang: currentLang } }));
}

window.i18n = {
  getLang,
  setLanguage,
  t,
  updateUIStrings,
};
