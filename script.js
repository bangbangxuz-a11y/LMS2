        (function() {
            'use strict';

            // ============================================================
            //  MONACO ENVIRONMENT
            // ============================================================
            window.MonacoEnvironment = {
                getWorkerUrl: function() {
                    if (window.__codeplaygroundWorkerUrl) return window.__codeplaygroundWorkerUrl;
                    const script =
                        `
                        self.MonacoEnvironment = { baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/' };
                        importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs/base/worker/workerMain.js');
                    `;
                    window.__codeplaygroundWorkerUrl = URL.createObjectURL(new Blob([script], { type: 'application/javascript' }));
                    return window.__codeplaygroundWorkerUrl;
                }
            };

            // ============================================================
            //  DOM REFS
            // ============================================================
            const $ = id => document.getElementById(id);
            const qsa = (s, ctx) => (ctx || document).querySelectorAll(s);

            const previewIframe = $('previewIframe');
            const previewStatus = $('previewStatus');
            const errorOverlay = $('errorOverlay');
            const errorOverlayTitle = $('errorOverlayTitle');
            const errorOverlayMessage = $('errorOverlayMessage');
            const dismissErrorBtn = $('dismissErrorBtn');
            const openErrorFileBtn = $('openErrorFileBtn');
            const runBtn = $('runBtn');
            const saveBtn = $('saveBtn');
            const downloadBtn = $('downloadBtn');
            const uploadBtn = $('uploadBtn');
            const templatesBtn = $('templatesBtn');
            const formatBtn = $('formatBtn');
            const cdnBtn = $('cdnBtn');
            const cmdBtn = $('cmdBtn');
            const settingsBtn = $('settingsBtn');
            const layoutBtn = $('layoutBtn');
            const themeBtn = $('themeBtn');
            const fileInput = $('fileInput');
            const toast = $('toast');
            const mainPanel = $('mainPanel');
            const appLoading = $('appLoading');
            const sidebar = $('sidebar');
            const fileList = $('fileList');
            const newFileBtn = $('newFileBtn');
            const newFolderBtn = $('newFolderBtn');
            const renameFileBtn = $('renameFileBtn');
            const deleteItemBtn = $('deleteItemBtn');
            const toggleSidebarBtn = $('toggleSidebarBtn');
            const openWorkspaceBtn = $('openWorkspaceBtn');
            const editorTabsBar = $('editorTabsBar');
            const consolePanel = $('consolePanel');
            const consoleBody = $('consoleBody');
            const consoleFilter = $('consoleFilter');
            const copyConsoleBtn = $('copyConsoleBtn');
            const downloadConsoleBtn = $('downloadConsoleBtn');
            const clearConsoleBtn = $('clearConsoleBtn');
            const toggleConsoleBtn = $('toggleConsoleBtn');
            const cdnModal = $('cdnModal');
            const cdnInput = $('cdnInput');
            const addCdnBtn = $('addCdnBtn');
            const cdnList = $('cdnList');
            const closeCdnModal = $('closeCdnModal');
            const settingsModal = $('settingsModal');
            const closeSettingsModal = $('closeSettingsModal');
            const templatesModal = $('templatesModal');
            const templateGrid = $('templateGrid');
            const closeTemplatesModal = $('closeTemplatesModal');
            const cmdPalette = $('cmdPalette');
            const cmdInput = $('cmdInput');
            const cmdList = $('cmdList');
            const fontSizeInput = $('fontSize');
            const tabSizeInput = $('tabSize');
            const wordWrapSelect = $('wordWrap');
            const lineNumbersSelect = $('lineNumbers');
            const minimapSelect = $('minimap');
            const autoSaveCheck = $('autoSave') || $('autoRun');
            const refreshDelayRange = $('refreshDelay');
            const refreshDelayValue = $('refreshDelayValue');
            const mobileSidebarBtn = $('mobileSidebarBtn');
            const runPythonBtn = $('runPythonBtn');

            // ============================================================
            //  STATE
            // ============================================================
            const STORAGE_KEY = 'codeplayground_pro_data';
            const IDB_NAME = 'codeplayground_pro_storage';
            const IDB_STORE = 'projects';
            const IDB_PROJECT_KEY = 'current-project';
            const STORAGE_VERSION = 4;
            const MAX_FILE_COUNT = 100;
            const MAX_FILE_SIZE = 2 * 1024 * 1024;
            const MAX_STORAGE_PAYLOAD_SIZE = 4 * 1024 * 1024;
            const MAX_NATIVE_MODULE_URLS = 200;
            const MAX_MODULE_BUNDLE_SIZE = 1024 * 1024;
            const SETTINGS_KEY = 'codeplayground_pro_settings';
            const CDN_KEY = 'codeplayground_pro_cdn';
            const THEME_KEY = 'codeplayground_pro_theme';
            const LAYOUT_KEY = 'codeplayground_pro_layout';
            const PYODIDE_VERSION = '0.26.2';
            const PYODIDE_SCRIPT_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`;
            const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
            const PYTHON_BACKEND_ORIGIN = window.CODEPLAYGROUND_BACKEND_URL ||
                (window.location.port === '8000' ? window.location.origin : 'http://127.0.0.1:8000');
            const EXTERNAL_ASSETS = {
                iconStyle: {
                    href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
                    integrity: 'sha384-/o6I2CkkWC//PSjvWC/eYN7l3xM3tJm8ZzVkCOfp//W05QcE3mlGskpoHB6XqI+B'
                },
                monacoLoader: {
                    src: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs/loader.min.js',
                    integrity: 'sha384-IXKqkSd8dPlMLRSjIIxdLeshFYpxdYlkI32bLhsV+yZDD8awNbI2+kmFgULpHUBe'
                },
                monacoStyle: {
                    href: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs/editor/editor.main.min.css',
                    integrity: 'sha384-QOL+KMGDSHiTGpw4XDfyq5kJL37YaD/smO5a7/aNyBGQaFMNnrbYfDj+HzhC3daQ'
                },
                split: {
                    src: 'https://cdnjs.cloudflare.com/ajax/libs/split.js/1.6.5/split.min.js',
                    integrity: 'sha384-q2ksSc8z6Q4ZUnxlfZj9AXZLpSdWmD3q/YrId1twTeNHh56fNh98YbJSpppzGUvL'
                },
                jszip: {
                    src: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
                    integrity: 'sha384-+mbV2IY1Zk/X1p/nWllGySJSUN8uMs+gUAN10Or95UBH0fpj6GfKgPmgC5EXieXG'
                }
            };
            const externalAssetPromises = new Map();

            let settings = {
                fontSize: 14,
                tabSize: 2,
                wordWrap: 'on',
                lineNumbers: 'on',
                minimap: true,
                autoSave: true,
                refreshDelay: 350
            };
            let theme = 'light';
            let cdnUrls = [];
            let consoleEntries = [];
            let consoleFilterValue = '';
            let expandedFolders = new Set();
            let folderTreeInitialized = false;
            let lastPreviewError = null;
            let consoleOpen = false;
            let splitInstance = null;
            let splitLoadPromise = null;
            let layoutMode = 'horizontal';
            let toastTimer = null;
            let updateTimer = null;
            let persistenceInterval = null;
            let indexedDbPromise = null;
            let persistenceBackend = 'localStorage';
            let previewStatusTimer = null;
            let consoleScrollFrame = 0;
            let previewSessionToken = '';
            let previewGeneration = 0;
            let previewPageId = 'index.html';
            let previewBaseHref = './';
            let nativeModuleUrls = [];
            let uiRenderFrame = 0;
            let modalTrigger = null;
            let lastPersistedPayload = '';
            let persistenceDirty = true;
            let persistenceFlushed = false;
            let moduleBundleLimitNotified = false;
            let previewContents = null;
            let pyodideRuntime = null;
            let pyodideLoadPromise = null;
            let pythonRunInProgress = false;
            let appInitStarted = false;
            const PYTHON_PROJECT_DIR = '/codeplayground';
            let pythonFsPaths = new Set();
            let pythonFsDirectories = new Set();
            let pythonModuleRoots = new Set();
            let pythonFilesystemFingerprint = '';
            let pythonRequirementsFingerprint = '';

            // --- VFS ---
            let files = {};
            let folders = new Set();
            let selectedFolderPath = '';
            let workspaceDirectoryHandle = null;
            let activeFileId = 'index.html';
            let selectedFileId = 'index.html';
            let openFileIds = [];
            let dependencyIssues = [];
            const fileOrder = ['index.html', 'style.css', 'script.js', 'main.py'];

            // --- Editor instances ---
            let editors = {};
            let editorOptions = null;

            // --- Defaults ---
            const DEFAULT_HTML = `<h1>Hello, World! 👋</h1>\n<p>Edit kode di sebelah kiri untuk melihat perubahan secara langsung.</p>\n<link rel="stylesheet" href="style.css" />\n<script src="script.js"><\/script>`;
            const DEFAULT_CSS = `body {\n  font-family: 'Segoe UI', sans-serif;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n  margin: 0;\n  background: #f8fafc;\n  color: #1e293b;\n}\n\nh1 {\n  color: #4f46e5;\n  font-size: 2.8rem;\n  margin-bottom: 0.4rem;\n}\n\np {\n  font-size: 1.2rem;\n  color: #475569;\n}`;
            const DEFAULT_JS =
                `// Selamat datang di CodePlayground!\nconsole.log("Hello from JavaScript!");\n\ndocument.querySelector('h1')?.addEventListener('click', () => {\n  alert('🎉 H1 diklik!');\n});`;

            // ============================================================
            //  PERSISTENCE (dengan error handling & validasi)
            // ============================================================
            function loadData() {
                try {
                    const raw = localStorage.getItem(STORAGE_KEY);
                    if (!raw) return null;
                    if (raw.length > MAX_STORAGE_PAYLOAD_SIZE) {
                        console.warn('Stored data exceeds the maximum payload size, using defaults');
                        return null;
                    }
                    const data = JSON.parse(raw);
                    if (!data || typeof data !== 'object' || !data.files || typeof data.files !== 'object') {
                        console.warn('Invalid data structure, using defaults');
                        return null;
                    }
                    data.folders = Array.isArray(data.folders) ? data.folders.filter(folder => validateFolderName(folder)) : [];
                    if (Object.keys(data.files).length > MAX_FILE_COUNT) {
                        console.warn('Stored file count exceeds the maximum, using defaults');
                        return null;
                    }
                    for (const id of Object.keys(data.files)) {
                        const f = data.files[id];
                        if (!validateFileName(id) || !f || typeof f !== 'object' || typeof f.content !== 'string' ||
                            f.content.length > MAX_FILE_SIZE ||
                            (f.type === 'asset' ? typeof f.mime !== 'string' : !['html', 'css', 'javascript', 'python'].includes(f.language))) {
                            console.warn('Invalid file entry, removing:', id);
                            delete data.files[id];
                        }
                    }
                    if (Object.keys(data.files).length === 0) return null;
                    const storedVersion = Number(data.version) || 1;
                    if (storedVersion < STORAGE_VERSION) {
                        Object.values(data.files).forEach(file => {
                            if (typeof file.committedContent !== 'string') {
                                file.committedContent = file.dirty === true ? '' : file.content;
                            } else if (file.legacyDirty === true && file.committedContent === file.content) {
                                file.committedContent = '';
                            }
                            file.type = file.type === 'asset' ? 'asset' : 'code';
                            delete file.legacyDirty;
                            delete file.dirty;
                        });
                    }
                    data.version = STORAGE_VERSION;
                    return data;
                } catch (err) {
                    console.warn('Load data error:', err);
                    return null;
                }
            }

            function saveData(sourceFiles = files, sourceActiveFileId = activeFileId, commit = false, sourceOpenFileIds = openFileIds, notify = true) {
                try {
                    if (Object.keys(sourceFiles).length > MAX_FILE_COUNT) {
                        if (notify) showToast('⚠️ Jumlah file maksimum adalah ' + MAX_FILE_COUNT);
                        return false;
                    }
                    const payload = {
                        files: {},
                        folders: [...folders],
                        activeFileId: sourceActiveFileId,
                        openFileIds: sourceOpenFileIds.filter(id => sourceFiles[id] && isCodeFile(sourceFiles[id])),
                        version: STORAGE_VERSION
                    };
                    Object.keys(sourceFiles).forEach(id => {
                        const f = sourceFiles[id];
                        const currentContent = getCurrentContent(f);
                        if (currentContent.length > MAX_FILE_SIZE) {
                            throw new Error('File terlalu besar: ' + id);
                        }
                        payload.files[id] = {
                            content: currentContent,
                            committedContent: commit ? currentContent : (typeof f.committedContent === 'string' ? f.committedContent : currentContent),
                            language: f.language,
                            type: f.type || (f.language === 'asset' ? 'asset' : 'code'),
                            mime: f.mime || '',
                            dirty: commit ? false : currentContent !== f.committedContent
                        };
                    });
                    const serialized = JSON.stringify(payload);
                    if (serialized.length > MAX_STORAGE_PAYLOAD_SIZE) {
                        if (notify) showToast('⚠️ Project terlalu besar untuk disimpan');
                        return false;
                    }
                    if (serialized === lastPersistedPayload) {
                        persistenceDirty = false;
                        return true;
                    }
                    localStorage.setItem(STORAGE_KEY, serialized);
                    persistToIndexedDB(payload).catch(() => {});
                    lastPersistedPayload = serialized;
                    persistenceDirty = false;
                    return true;
                } catch (err) {
                    console.error('Save data error:', err);
                    if (notify) showToast(err.message.startsWith('File terlalu besar') ?
                        '⚠️ Ukuran file melebihi batas 2 MB' : '⚠️ Gagal menyimpan data');
                    return false;
                }
            }

            function openProjectDatabase() {
                if (indexedDbPromise) return indexedDbPromise;
                if (!('indexedDB' in window)) return Promise.reject(new Error('IndexedDB tidak tersedia'));
                indexedDbPromise = new Promise((resolve, reject) => {
                    const request = indexedDB.open(IDB_NAME, 1);
                    request.onupgradeneeded = () => request.result.createObjectStore(IDB_STORE);
                    request.onsuccess = () => { persistenceBackend = 'IndexedDB'; resolve(request.result); };
                    request.onerror = () => reject(request.error || new Error('IndexedDB gagal dibuka'));
                });
                return indexedDbPromise;
            }

            function persistToIndexedDB(payload) {
                return openProjectDatabase().then(db => new Promise((resolve, reject) => {
                    const transaction = db.transaction(IDB_STORE, 'readwrite');
                    transaction.objectStore(IDB_STORE).put(payload, IDB_PROJECT_KEY);
                    transaction.oncomplete = resolve;
                    transaction.onerror = () => reject(transaction.error);
                }));
            }

            function loadFromIndexedDB() {
                return openProjectDatabase().then(db => new Promise((resolve, reject) => {
                    const request = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(IDB_PROJECT_KEY);
                    request.onsuccess = () => resolve(request.result || null);
                    request.onerror = () => reject(request.error);
                })).catch(() => null);
            }

            function getCurrentContent(file) {
                if (previewContents && file && previewContents.has(file)) return previewContents.get(file);
                return file && file.model ? file.model.getValue() : (file ? file.content : '');
            }

            function getFileType(file) {
                return file && (file.type === 'asset' || file.language === 'asset') ? 'asset' : 'code';
            }

            function isFileDirty(file) {
                return !!file && getCurrentContent(file) !== file.committedContent;
            }

            function syncFileState(file) {
                if (!file) return false;
                const currentContent = getCurrentContent(file);
                const dirty = currentContent !== file.committedContent;
                const changed = file.content !== currentContent || file.dirty !== dirty;
                file.content = currentContent;
                file.dirty = dirty;
                return changed;
            }

            function syncAllFileState() {
                Object.keys(files).forEach(id => syncFileState(files[id]));
            }

            function commitAllFiles() {
                syncAllFileState();
                if (!saveData(files, activeFileId, true)) return false;
                Object.keys(files).forEach(id => {
                    const file = files[id];
                    file.committedContent = file.content;
                    file.dirty = false;
                });
                return true;
            }

            // ============================================================
            //  SETTINGS (dengan validasi)
            // ============================================================
            function loadSettings() {
                try {
                    const raw = localStorage.getItem(SETTINGS_KEY);
                    if (!raw) return;
                    const s = JSON.parse(raw);
                    if (s && typeof s === 'object') {
                        if (typeof s.fontSize === 'number') settings.fontSize = clampNumber(s.fontSize, 10, 28, 14);
                        if (typeof s.tabSize === 'number') settings.tabSize = clampNumber(s.tabSize, 1, 8, 2);
                        if (['off', 'on', 'wordWrapColumn', 'bounded'].includes(s.wordWrap)) settings.wordWrap = s.wordWrap;
                        if (['on', 'off', 'relative', 'interval'].includes(s.lineNumbers)) settings.lineNumbers = s
                        .lineNumbers;
                        if (typeof s.minimap === 'boolean') settings.minimap = s.minimap;
                        if (typeof s.autoSave === 'boolean') settings.autoSave = s.autoSave;
                        else if (typeof s.autoRun === 'boolean') settings.autoSave = s.autoRun;
                        if (typeof s.refreshDelay === 'number') settings.refreshDelay = clampNumber(s.refreshDelay, 100, 800, 350);
                    }
                } catch (err) {
                    console.warn('Load settings error:', err);
                }
                applySettingsUI();
            }

            function saveSettings() {
                try {
                    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
                } catch (err) {
                    console.error('Save settings error:', err);
                }
                applySettingsToEditors();
            }

            function applySettingsUI() {
                settings.fontSize = clampNumber(settings.fontSize, 10, 28, 14);
                settings.tabSize = clampNumber(settings.tabSize, 1, 8, 2);
                settings.refreshDelay = clampNumber(settings.refreshDelay, 100, 800, 350);
                fontSizeInput.value = settings.fontSize;
                tabSizeInput.value = settings.tabSize;
                wordWrapSelect.value = settings.wordWrap;
                lineNumbersSelect.value = settings.lineNumbers;
                minimapSelect.value = settings.minimap ? 'true' : 'false';
                autoSaveCheck.checked = settings.autoSave;
                refreshDelayRange.value = settings.refreshDelay;
                refreshDelayValue.textContent = settings.refreshDelay + 'ms';
            }

            function clampNumber(value, min, max, fallback) {
                const number = Number(value);
                return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
            }

            function applySettingsToEditors() {
                if (!editors.html) return;
                const compactDevice = window.matchMedia?.('(max-width: 820px), (pointer: coarse)').matches === true;
                const opts = {
                    fontSize: settings.fontSize,
                    tabSize: settings.tabSize,
                    wordWrap: settings.wordWrap,
                    lineNumbers: settings.lineNumbers,
                    minimap: { enabled: settings.minimap && !compactDevice }
                };
                Object.values(editors).forEach(ed => ed.updateOptions(opts));
            }

            // ============================================================
            //  CDN (dengan revalidasi)
            // ============================================================
            const ALLOWED_CDN_DOMAINS = [
                'cdnjs.cloudflare.com',
                'unpkg.com',
                'cdn.jsdelivr.net',
                'cdn.tailwindcss.com'
            ];

            function loadCdn() {
                try {
                    const raw = localStorage.getItem(CDN_KEY);
                    if (raw) {
                        cdnUrls = JSON.parse(raw);
                        if (!Array.isArray(cdnUrls)) cdnUrls = [];
                        cdnUrls = [...new Set(cdnUrls
                            .filter(u => typeof u === 'string' && validateCdnUrl(u))
                            .map(u => new URL(u).href))];
                    }
                } catch (err) {
                    console.warn('Load CDN error:', err);
                    cdnUrls = [];
                }
                renderCdnList();
            }

            function validateCdnUrl(url) {
                try {
                    const u = new URL(url);
                    if (u.protocol !== 'https:') return false;
                    const host = u.hostname;
                    for (const d of ALLOWED_CDN_DOMAINS) {
                        if (host === d) return true;
                    }
                    return false;
                } catch (_) { return false; }
            }

            function saveCdn() {
                try {
                    localStorage.setItem(CDN_KEY, JSON.stringify(cdnUrls));
                } catch (err) {
                    console.error('Save CDN error:', err);
                }
            }

            function renderCdnList() {
                cdnList.innerHTML = '';
                if (cdnUrls.length === 0) {
                    const li = document.createElement('li');
                    li.textContent = 'Belum ada CDN.';
                    li.style.color = 'var(--text-secondary)';
                    li.style.fontStyle = 'italic';
                    cdnList.appendChild(li);
                    return;
                }
                cdnUrls.forEach((url, i) => {
                    const li = document.createElement('li');
                    const span = document.createElement('span');
                    span.className = 'url';
                    span.textContent = url;
                    const btn = document.createElement('button');
                    btn.className = 'remove-btn';
                    btn.innerHTML = '<i class="fas fa-times"></i>';
                    btn.onclick = () => { cdnUrls.splice(i, 1);
                        saveCdn();
                        renderCdnList();
                        buildPreview();
                        showToast('🗑️ CDN dihapus'); };
                    li.appendChild(span);
                    li.appendChild(btn);
                    cdnList.appendChild(li);
                });
            }

            function addCdnUrl(url) {
                url = url.trim();
                if (!url) return false;
                if (!validateCdnUrl(url)) {
                    showToast('⚠️ Domain tidak diizinkan atau URL tidak valid');
                    return false;
                }
                const normalizedUrl = new URL(url).href;
                if (cdnUrls.includes(normalizedUrl)) {
                    showToast('⚠️ Sudah ada');
                    return false;
                }
                cdnUrls.push(normalizedUrl);
                saveCdn();
                renderCdnList();
                buildPreview();
                showToast('✅ CDN ditambahkan');
                return true;
            }

            function getExtFromUrl(url) {
                try {
                    const u = new URL(url);
                    const p = u.pathname.split('.');
                    if (p.length > 1) return p.pop().toLowerCase();
                } catch (_) { /* ignore */ }
                return null;
            }

            function normalizeFileName(name) {
                return name.trim().replace(/\\/g, '/').replace(/^\.\//, '');
            }

            function normalizeVfsPath(pathname) {
                return normalizeFileName(pathname).replace(/^\/+/, '');
            }

            function getFileDirectory(fileId) {
                const slash = normalizeVfsPath(fileId).lastIndexOf('/');
                return slash === -1 ? '' : normalizeVfsPath(fileId).slice(0, slash + 1);
            }

            function getSourceBaseHref(fileId, baseHref) {
                const origin = 'https://codeplayground.local/';
                const sourceDirectory = getFileDirectory(fileId);
                return new URL(baseHref || './', origin + sourceDirectory);
            }

            function isLocalVfsReference(reference, allowBare = false) {
                const value = (reference || '').trim();
                return allowBare || value.startsWith('./') || value.startsWith('../') || value.startsWith('/');
            }

            function getReferenceBaseHref(sourceFileId, baseHref) {
                return sourceFileId ? getSourceBaseHref(sourceFileId, baseHref) :
                    new URL(baseHref || './', 'https://codeplayground.local/');
            }

            function validateFileName(name) {
                const normalized = normalizeFileName(name);
                if (!normalized || normalized.length > 128 || normalized.startsWith('/') || normalized.endsWith('/')) return false;
                if (normalized.split('/').some(part => !part || part === '.' || part === '..')) return false;
                return /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(normalized) && /\.[A-Za-z0-9]{1,12}$/i.test(normalized);
            }

            function validateFolderName(name) {
                const normalized = normalizeVfsPath(name);
                return !!normalized && normalized.length <= 128 && !normalized.endsWith('/') &&
                    normalized.split('/').every(part => /^[A-Za-z0-9._-]+$/.test(part) && part !== '.' && part !== '..');
            }

            async function connectLocalWorkspace() {
                if (typeof window.showDirectoryPicker !== 'function') {
                    showToast('⚠️ Browser ini tidak mendukung akses folder lokal');
                    return;
                }
                try {
                    workspaceDirectoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
                    openWorkspaceBtn.setAttribute('aria-label', `Folder terhubung: ${workspaceDirectoryHandle.name}`);
                    openWorkspaceBtn.title = `Folder terhubung: ${workspaceDirectoryHandle.name}`;
                    showToast(`✅ Folder terhubung: ${workspaceDirectoryHandle.name}`);
                } catch (error) {
                    if (error?.name !== 'AbortError') {
                        console.error('Local folder access failed:', error);
                        showToast('⚠️ Folder lokal tidak dapat dihubungkan');
                    }
                }
            }

            async function createLocalFolder(folderPath) {
                if (!workspaceDirectoryHandle) return;
                let current = workspaceDirectoryHandle;
                for (const part of folderPath.split('/')) {
                    current = await current.getDirectoryHandle(part, { create: true });
                }
            }

            function getLanguageFromFileName(name) {
                const extension = name.split('.').pop().toLowerCase();
                return extension === 'html' ? 'html' : extension === 'css' ? 'css' : extension === 'js' ? 'javascript' : extension === 'py' ? 'python' : 'asset';
            }

            function isCodeFile(file) {
                return getFileType(file) === 'code';
            }

            function getAssetDataUrl(file) {
                const content = getCurrentContent(file);
                return file && getFileType(file) === 'asset' && typeof content === 'string' ? content : '';
            }

            function splitSrcsetCandidates(value, includeDescriptors = false) {
                const candidates = [];
                let start = 0;
                let dataUrlEnd = -1;
                for (let index = 0; index <= value.length; index += 1) {
                    const character = value[index];
                    if (index === start) {
                        const candidateStart = value.slice(start).search(/\S/);
                        dataUrlEnd = candidateStart >= 0 && value.slice(start + candidateStart).startsWith('data:') ?
                            start + candidateStart : -1;
                    }
                    if (dataUrlEnd >= 0 && index > dataUrlEnd && /\s/.test(character)) dataUrlEnd = -1;
                    if ((character === ',' && dataUrlEnd < 0) || index === value.length) {
                        const candidate = value.slice(start, index).trim();
                            if (candidate) candidates.push(includeDescriptors ? candidate : candidate.split(/\s+/, 1)[0]);
                        start = index + 1;
                        dataUrlEnd = -1;
                    }
                }
                return candidates;
            }

            function inlineLocalAssets(doc, baseHref, sourceFileId) {
                doc.querySelectorAll('img[src], source[src], video[poster], object[data], iframe[src], audio[src], track[src], embed[src], input[src], link[rel~="icon"]').forEach(node => {
                    const attributeName = node.hasAttribute('poster') ? 'poster' : node.hasAttribute('data') ? 'data' : 'href' in node && node.tagName.toLowerCase() === 'link' ? 'href' : 'src';
                    const fileId = getAssetFileId(node.getAttribute(attributeName), 'resource', baseHref, sourceFileId, true);
                    const dataUrl = getAssetDataUrl(files[fileId]);
                    if (dataUrl) node.setAttribute(attributeName, dataUrl);
                });
                doc.querySelectorAll('img[srcset], source[srcset]').forEach(node => {
                    const rewritten = splitSrcsetCandidates(node.getAttribute('srcset'), true).map(candidate => {
                        const parts = candidate.trim().split(/\s+/);
                        const fileId = getAssetFileId(parts[0], 'resource', baseHref, sourceFileId, true);
                        const dataUrl = getAssetDataUrl(files[fileId]);
                        if (dataUrl) parts[0] = dataUrl;
                        return parts.join(' ');
                    });
                    node.setAttribute('srcset', rewritten.join(', '));
                });
            }

            // ============================================================
            //  ESCAPE & SAFE STRINGIFY
            // ============================================================
            function escapeForHtml(str) {
                return str
                    .replace(/<\/script\b/gi, '<\\/script')
                    .replace(/<\/style\b/gi, '<\\/style');
            }

            function escapeForAttribute(str) {
                return str
                    .replace(/&/g, '&amp;')
                    .replace(/"/g, '&quot;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
            }

            function safeStringify(obj) {
                try {
                    return JSON.stringify(obj);
                } catch (_) {
                    return '[Circular]';
                }
            }

            // ============================================================
            //  BUILD PREVIEW — dengan full-document detection yang lebih baik
            // ============================================================
            function isFullDocument(html) {
                const withoutLeadingComments = html.replace(/^\uFEFF/, '').replace(/^(?:\s*\x3C!--[\s\S]*?-->\s*)*/, '');
                return /^(?:<!doctype\s+html\b|<html\b|<head\b|<body\b)/i.test(withoutLeadingComments.trimStart());
            }

            function getBestFile(language, preferredName) {
                const candidates = Object.keys(files).filter(id => files[id].language === language);
                if (candidates.length === 0) return null;
                const preferred = candidates.find(id => id === preferredName);
                if (preferred) return preferred;
                const rootIndex = candidates.find(id => id.toLowerCase() === 'index.' + (language === 'html' ? 'html' : language === 'css' ? 'css' : language === 'python' ? 'py' : 'js'));
                return rootIndex || (candidates.length === 1 ? candidates[0] : null);
            }

            function getAssetFileId(url, language, baseHref, sourceFileId, allowBare = false) {
                try {
                    if (!isLocalVfsReference(url, allowBare)) return null;
                    const virtualOrigin = 'https://codeplayground.local/';
                    const parsed = new URL(url, getReferenceBaseHref(sourceFileId, baseHref));
                    if (parsed.origin !== virtualOrigin) return null;
                    const pathname = normalizeVfsPath(decodeURIComponent(parsed.pathname));
                    const exact = Object.keys(files).find(id => ((language === 'resource' && getFileType(files[id]) === 'asset') || files[id].language === language) &&
                        normalizeVfsPath(id) === pathname);
                    if (exact) return exact;
                    if ((language === 'javascript' || language === 'html') && !/\.[a-z0-9]+$/i.test(pathname)) {
                        const extension = language === 'javascript' ? '.js' : '.html';
                        return Object.keys(files).find(id => files[id].language === language &&
                            normalizeVfsPath(id) === pathname + extension) || null;
                    }
                    return null;
                } catch (_) {
                    return null;
                }
            }

            function getModuleSpecifiers(content) {
                const mask = createJavaScriptCodeMask(content);
                const matches = [
                    ...content.matchAll(/\bimport\s+(?:(?:(?:[A-Za-z_$][\w$]*|\*|\{|\}|,|\s|["'][^"']+["'])+?)\s*from\s*)?["']([^"']+)["']/g),
                    ...content.matchAll(/\bexport\s+(?:\*\s+as\s+[A-Za-z_$][\w$]*|\*|\{[\s\S]*?\})\s*from\s*["']([^"']+)["']/g),
                    ...content.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g),
                    ...content.matchAll(/\bimport\s*\(\s*`([^`$]*)`\s*\)/g)
                ];
                return matches.filter(match => isJavaScriptCodePosition(content, match.index, mask)).map(match => match[1]);
            }

            function resolveDependency(reference, language, baseHref, sourceFileId, allowBare = false) {
                try {
                    const dependency = getAssetFileId(reference, language, baseHref, sourceFileId, allowBare);
                    if (!dependency && !isExternalReference(reference) && isLocalVfsReference(reference, allowBare)) {
                        dependencyIssues.push(`${sourceFileId}: ${reference}`);
                    }
                    return dependency;
                } catch (error) {
                    dependencyIssues.push(`${sourceFileId}: ${reference}`);
                    console.warn('Dependency resolution failed:', error);
                    return null;
                }
            }

            function getLocalModuleSpecifiers(content, fileId, baseHref = './') {
                return getModuleSpecifiers(content).filter(specifier =>
                    !!getAssetFileId(specifier, 'javascript', baseHref, fileId));
            }

            function revokeNativeModuleUrls() {
                nativeModuleUrls.forEach(url => URL.revokeObjectURL(url));
                nativeModuleUrls = [];
            }

            function createNativeModuleUrl(source, fileId, baseHref = './', cache = new Map(), stack = new Set()) {
                if (cache.has(fileId)) return cache.get(fileId);
                if (nativeModuleUrls.length >= MAX_NATIVE_MODULE_URLS) {
                    addConsoleEntry('error', 'Batas jumlah native module URL tercapai');
                    return null;
                }
                if (stack.has(fileId)) {
                    addConsoleEntry('error', 'Circular dependency tidak dapat dimuat sebagai native ESM: ' + fileId);
                    return null;
                }
                const nextStack = new Set(stack);
                nextStack.add(fileId);
                let failed = false;
                const rewriteSpecifier = specifier => {
                    const dependency = getAssetFileId(specifier, 'javascript', baseHref, fileId);
                    if (!dependency) return null;
                    const dependencyUrl = createNativeModuleUrl(getCurrentContent(files[dependency]), dependency, './', cache, nextStack);
                    if (!dependencyUrl) failed = true;
                    if (!dependencyUrl) return null;
                    const resolvedSpecifier = new URL(specifier.value, getReferenceBaseHref(fileId, baseHref));
                    const resolvedDependency = new URL(dependencyUrl);
                    resolvedDependency.search = resolvedSpecifier.search;
                    resolvedDependency.hash = resolvedSpecifier.hash;
                    return resolvedDependency.href;
                };
                const replacements = [];
                findNativeModuleSpecifiers(source).forEach(specifier => {
                    const dependencyUrl = rewriteSpecifier(specifier.value);
                    if (dependencyUrl) replacements.push({
                        start: specifier.start,
                        end: specifier.end,
                        value: dependencyUrl
                    });
                });
                if (failed) return null;
                const moduleSource = replacements.reverse().reduce((result, replacement) =>
                    result.slice(0, replacement.start) + replacement.value + result.slice(replacement.end), source);
                const blobUrl = URL.createObjectURL(new Blob([moduleSource], { type: 'text/javascript' }));
                nativeModuleUrls.push(blobUrl);
                cache.set(fileId, blobUrl);
                return blobUrl;
            }

            function isJavaScriptIdentifierChar(value) {
                return !!value && /[A-Za-z0-9_$]/.test(value);
            }

            function skipJavaScriptTrivia(source, index) {
                while (index < source.length) {
                    if (/\s/.test(source[index])) {
                        index += 1;
                    } else if (source[index] === '/' && source[index + 1] === '/') {
                        index = source.indexOf('\n', index + 2);
                        if (index === -1) return source.length;
                    } else if (source[index] === '/' && source[index + 1] === '*') {
                        const end = source.indexOf('*/', index + 2);
                        index = end === -1 ? source.length : end + 2;
                    } else {
                        break;
                    }
                }
                return index;
            }

            function readJavaScriptString(source, index) {
                const quote = source[index];
                if (quote !== '"' && quote !== "'") return null;
                const start = index + 1;
                index += 1;
                while (index < source.length) {
                    if (source[index] === '\\') {
                        index += 2;
                    } else if (source[index] === quote) {
                        return { start, end: index, value: source.slice(start, index), next: index + 1 };
                    } else {
                        index += 1;
                    }
                }
                return null;
            }

            function readJavaScriptStaticTemplate(source, index) {
                if (source[index] !== '`') return null;
                for (let cursor = index + 1; cursor < source.length; cursor += 1) {
                    if (source[cursor] === '\\') {
                        cursor += 1;
                    } else if (source[cursor] === '$' && source[cursor + 1] === '{') {
                        return null;
                    } else if (source[cursor] === '`') {
                        return { start: index + 1, end: cursor, value: source.slice(index + 1, cursor), next: cursor + 1 };
                    }
                }
                return null;
            }

            function skipJavaScriptTemplate(source, index) {
                const mask = createJavaScriptCodeMask(source);
                for (let cursor = index + 1; cursor < source.length; cursor += 1) {
                    if (source[cursor] === '`' && !mask[cursor]) return cursor + 1;
                }
                return source.length;
            }

            function findJavaScriptTemplateExpressions(source, index) {
                const mask = createJavaScriptCodeMask(source);
                const expressions = [];
                for (let cursor = index + 1; cursor < source.length; cursor += 1) {
                    if (source[cursor] !== '$' || source[cursor + 1] !== '{') continue;
                    const start = cursor + 2;
                    let depth = 1;
                    for (let expressionCursor = start; expressionCursor < source.length; expressionCursor += 1) {
                        if (!mask[expressionCursor]) continue;
                        if (source[expressionCursor] === '{') depth += 1;
                        else if (source[expressionCursor] === '}' && --depth === 0) {
                            expressions.push({ start, end: expressionCursor });
                            cursor = expressionCursor;
                            break;
                        }
                    }
                }
                return expressions;
            }

            function findNativeModuleSpecifiers(source) {
                const result = [];
                for (let index = 0; index < source.length;) {
                    index = skipJavaScriptTrivia(source, index);
                    if (index >= source.length) break;
                    if (source[index] === '`') {
                        findJavaScriptTemplateExpressions(source, index).forEach(expression => {
                            findNativeModuleSpecifiers(source.slice(expression.start, expression.end)).forEach(specifier => {
                                result.push({ ...specifier, start: specifier.start + expression.start, end: specifier.end + expression.start });
                            });
                        });
                        index = skipJavaScriptTemplate(source, index);
                        continue;
                    }
                    if (source[index] === '"' || source[index] === "'") {
                        const string = readJavaScriptString(source, index);
                        index = string ? string.next : index + 1;
                        continue;
                    }
                    if (!/[A-Za-z_$]/.test(source[index])) {
                        index += 1;
                        continue;
                    }
                    const wordStart = index;
                    while (isJavaScriptIdentifierChar(source[index])) index += 1;
                    const word = source.slice(wordStart, index);
                    if (word !== 'import' && word !== 'export') continue;
                    if (word === 'import') {
                        const cursor = skipJavaScriptTrivia(source, index);
                        if (source[cursor] === '.') continue;
                        if (source[cursor] === '(') {
                            const argument = skipJavaScriptTrivia(source, cursor + 1);
                            const string = readJavaScriptString(source, argument) || readJavaScriptStaticTemplate(source, argument);
                            if (string) result.push(string);
                            continue;
                        }
                        const direct = readJavaScriptString(source, cursor);
                        if (direct) {
                            result.push(direct);
                            continue;
                        }
                    }
                    let cursor = index;
                    let nesting = 0;
                    while (cursor < source.length) {
                        cursor = skipJavaScriptTrivia(source, cursor);
                        if (source[cursor] === ';') break;
                        if ('([{'.includes(source[cursor])) nesting += 1;
                        else if (')]}'.includes(source[cursor])) nesting = Math.max(0, nesting - 1);
                        if (/[A-Za-z_$]/.test(source[cursor])) {
                            const fromStart = cursor;
                            while (isJavaScriptIdentifierChar(source[cursor])) cursor += 1;
                            if (source.slice(fromStart, cursor) === 'from') {
                                const string = readJavaScriptString(source, skipJavaScriptTrivia(source, cursor));
                                if (string) result.push(string);
                                break;
                            }
                        } else {
                            cursor += 1;
                        }
                    }
                }
                return result;
            }

            function createNativeModuleScript(node, source, fileId, baseHref) {
                const moduleUrl = createNativeModuleUrl(source, fileId, baseHref);
                if (!moduleUrl) return false;
                node.textContent = '';
                node.setAttribute('type', 'module');
                node.setAttribute('src', moduleUrl);
                return true;
            }

            function getExportedDeclarationNames(content) {
                const names = [];
                const splitBindingParts = pattern => {
                    const parts = [];
                    let start = 0;
                    let depth = 0;
                    for (let index = 0; index < pattern.length; index += 1) {
                        if ('{['.includes(pattern[index])) depth += 1;
                        else if ('}]'.includes(pattern[index])) depth -= 1;
                        else if (pattern[index] === ',' && depth === 0) {
                            parts.push(pattern.slice(start, index));
                            start = index + 1;
                        }
                    }
                    parts.push(pattern.slice(start));
                    return parts.map(part => part.trim()).filter(Boolean);
                };
                const addBindingNames = pattern => {
                    pattern = pattern.trim().replace(/^\.\.\./, '').split('=', 1)[0].trim();
                    if (/^\{/.test(pattern) && /\}$/.test(pattern)) {
                        splitBindingParts(pattern.slice(1, -1)).forEach(part => {
                            const colon = part.indexOf(':');
                            addBindingNames(colon === -1 ? part : part.slice(colon + 1));
                        });
                    } else if (/^\[/.test(pattern) && /\]$/.test(pattern)) {
                        splitBindingParts(pattern.slice(1, -1)).forEach(addBindingNames);
                    } else if (/^[A-Za-z_$][\w$]*$/.test(pattern)) {
                        names.push(pattern);
                    }
                };
                const declarationPattern = /\bexport\s+(?:const|let|var)\s+([^;]+)/g;
                const mask = createJavaScriptCodeMask(content);
                let match;
                while ((match = declarationPattern.exec(content))) {
                    if (!isJavaScriptCodePosition(content, match.index, mask)) continue;
                    const declaration = match[1].split(/;|\n(?=\s*(?:const|let|var)\b)/, 1)[0];
                    const bindingPattern = declaration.replace(/\s*=\s*[\s\S]*$/, '').trim();
                    if (/^[{[]/.test(bindingPattern)) {
                        addBindingNames(bindingPattern);
                    } else {
                        splitBindingParts(declaration).forEach(part => addBindingNames(part));
                    }
                }
                for (const declaration of content.matchAll(/\bexport\s+(?:(?:async)\s+)?(?:function|class)\s+([A-Za-z_$][\w$]*)/g)) {
                    if (isJavaScriptCodePosition(content, declaration.index, mask)) names.push(declaration[1]);
                }
                return [...new Set(names)];
            }

            function getPreviewProject() {
                const entrypoint = getBestFile('html', previewPageId) || getBestFile('html', 'index.html');
                const html = entrypoint ? getCurrentContent(files[entrypoint]) : '';
                return {
                    entrypoint,
                    html,
                    css: Object.keys(files).filter(id => files[id].language === 'css').sort(),
                    javascript: Object.keys(files).filter(id => files[id].language === 'javascript').sort()
                };
            }

            function isExternalReference(url) {
                return !url || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url.trim());
            }

            function isCheckableCodeReference(reference, language, allowBare = false) {
                const path = reference.split(/[?#]/, 1)[0];
                if (!isLocalVfsReference(path, allowBare)) return false;
                return language === 'css' ? /\.css$/i.test(path) : language === 'javascript' &&
                    (/\.js$/i.test(path) || !path.includes('.'));
            }

            function getHtmlResourceReferences(doc) {
                const references = [];
                const add = (selector, attribute, language, splitSrcset = false) => {
                    doc.querySelectorAll(selector).forEach(node => {
                        const value = node.getAttribute(attribute);
                        if (!value) return;
                        const values = splitSrcset ? splitSrcsetCandidates(value) : [value];
                        values.forEach(reference => references.push({ reference, language }));
                    });
                };
                add('link[rel~="stylesheet"][href]', 'href', 'css');
                add('link:not([rel~="stylesheet"])[href]', 'href', 'resource');
                add('a[href]', 'href', 'html');
                add('script[src]', 'src', 'javascript');
                add('img[src], source[src], video[poster], object[data], iframe[src], audio[src], track[src], embed[src], input[src]',
                    'src', 'resource');
                add('video[poster]', 'poster', 'resource');
                add('object[data]', 'data', 'resource');
                add('img[srcset], source[srcset]', 'srcset', 'resource', true);
                return references;
            }

            function getDependencyGraph() {
                dependencyIssues = [];
                const graph = new Map();
                const visit = (fileId) => {
                    if (!fileId || graph.has(fileId)) return;
                    const file = files[fileId];
                    if (!file) return;
                    const dependencies = new Set();
                    graph.set(fileId, dependencies);
                    const content = getCurrentContent(file);
                    if (file.language === 'html') {
                        const doc = new DOMParser().parseFromString(content, 'text/html');
                        const baseHref = doc.querySelector('base[href]')?.getAttribute('href') || './';
                        doc.querySelectorAll('link[rel~="stylesheet"][href], script[src]').forEach(node => {
                            const reference = node.getAttribute(node.hasAttribute('href') ? 'href' : 'src');
                            const language = node.tagName.toLowerCase() === 'link' ? 'css' : 'javascript';
                            const dependency = resolveDependency(reference, language, baseHref, fileId, true);
                            if (dependency) dependencies.add(dependency);
                        });
                        doc.querySelectorAll('script[type="module"]:not([src])').forEach(node => {
                            findNativeModuleSpecifiers(node.textContent).forEach(specifier => {
                                const dependency = resolveDependency(specifier.value, 'javascript', baseHref, fileId);
                                if (dependency) dependencies.add(dependency);
                            });
                        });
                    } else if (file.language === 'css') {
                        replaceCssMatches(content, /@import\s+(?:["']([^"']+)["']|url\(["']?([^"')]+)["']?\))/gi,
                            (match, quotedPath, urlPath) => {
                            const dependency = resolveDependency(quotedPath || urlPath, 'css', './', fileId, true);
                            if (dependency) dependencies.add(dependency);
                            return match;
                        });
                    } else if (file.language === 'javascript') {
                        findNativeModuleSpecifiers(content).forEach(specifier => {
                            const dependency = resolveDependency(specifier.value, 'javascript', './', fileId);
                            if (dependency) dependencies.add(dependency);
                        });
                    }
                    dependencies.forEach(visit);
                };
                const entrypoint = getBestFile('html', previewPageId) || getBestFile('html', 'index.html');
                visit(entrypoint);
                return graph;
            }

            function addBrokenCodeReferences(broken, content, fileId, language, baseHref = './') {
                const references = [];
                if (language === 'javascript') {
                    findNativeModuleSpecifiers(content).forEach(specifier => references.push(specifier.value));
                } else {
                    replaceCssMatches(content, /@import\s+(?:["']([^"']+)["']|url\(\s*["']?([^"')]+)["']?\s*\))/gi,
                        (match, quotedPath, urlPath) => {
                            references.push(quotedPath || urlPath);
                            return match;
                        });
                }
                references.forEach(reference => {
                    if (!isExternalReference(reference) && isCheckableCodeReference(reference, language, language === 'css') &&
                        !getAssetFileId(reference, language, baseHref, fileId, language === 'css')) {
                        broken.push(`${fileId}: ${reference}`);
                    }
                });
            }

            function addBrokenCssAssetReferences(broken, content, fileId, baseHref = './') {
                replaceCssMatches(content, /url\(\s*["']?([^"')]+)["']?\s*\)/gi, (match, rawReference, matchIndex) => {
                    const reference = rawReference.trim();
                    const beforeMatch = content.slice(0, matchIndex);
                    if (/@import\s+[^;]*$/i.test(beforeMatch)) return match;
                    if (isExternalReference(reference)) return match;
                    if (!isExternalReference(reference) && !getAssetFileId(reference, 'resource', baseHref, fileId, true)) {
                        broken.push(`${fileId}: ${reference}`);
                    }
                    return match;
                });
            }

            function findBrokenLocalReferences() {
                const broken = [];
                Object.keys(files).filter(id => files[id].language === 'html').forEach(id => {
                    const doc = new DOMParser().parseFromString(getCurrentContent(files[id]), 'text/html');
                    const baseHref = doc.querySelector('base[href]')?.getAttribute('href') || './';
                    getHtmlResourceReferences(doc).forEach(({ reference, language }) => {
                        if (!isExternalReference(reference) && !getAssetFileId(reference, language, baseHref, id, true)) {
                            broken.push(`${id}: ${reference}`);
                        }
                    });
                    doc.querySelectorAll('style').forEach(node => {
                        addBrokenCodeReferences(broken, node.textContent, id, 'css', baseHref);
                        addBrokenCssAssetReferences(broken, node.textContent, id, baseHref);
                    });
                    doc.querySelectorAll('script:not([src])').forEach(node => {
                        if ((node.getAttribute('type') || '').toLowerCase() === 'module') {
                            addBrokenCodeReferences(broken, node.textContent, id, 'javascript', baseHref);
                        }
                    });
                });
                Object.keys(files).forEach(id => {
                    const file = files[id];
                    const content = getCurrentContent(file);
                    if (file.language === 'javascript') addBrokenCodeReferences(broken, content, id, 'javascript');
                    if (file.language === 'css') addBrokenCodeReferences(broken, content, id, 'css');
                    if (file.language === 'css') {
                        addBrokenCssAssetReferences(broken, content, id);
                    }
                });
                return broken;
            }

            function findReferencesToFile(fileId) {
                return Object.keys(files).filter(id => id !== fileId && hasSemanticReference(id, fileId));
            }

            function forEachReference(fileId, callback) {
                const file = files[fileId];
                if (!file) return;
                const content = getCurrentContent(file);
                if (file.language === 'html') {
                    const doc = new DOMParser().parseFromString(content, 'text/html');
                    const baseHref = doc.querySelector('base[href]')?.getAttribute('href') || './';
                    const pattern = /<([a-z][\w:-]*)\b[^>]*?\b(href|src)=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi;
                    let match;
                    while ((match = pattern.exec(content))) callback(match[3] || match[4] || match[5], baseHref, match.index, match[0], match[2], match[1]);
                } else if (file.language === 'css') {
                    const pattern = /url\(\s*(["']?)([^"')]+)\1\s*\)|@import\s+(?:(["'])([^"']+)\3|url\((["']?)([^"')]+)\5\))/gi;
                    let match;
                    while ((match = pattern.exec(content))) callback(match[2] || match[4] || match[6], './', match.index, match[0]);
                } else if (file.language === 'javascript') {
                    const pattern = /\b(?:import\s+(?:(?:[A-Za-z_$][\w$]*|\*|\{|\}|,|\s)+?\s*from\s*)?|export\s+(?:[A-Za-z_$][\w$]*|\*|\{|\}|,|\s)+?\s*from\s*)["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/g;
                    let match;
                    while ((match = pattern.exec(content))) callback(match[1] || match[2], './', match.index, match[0]);
                }
            }

            function hasSemanticReference(sourceFileId, targetFileId) {
                let found = false;
                forEachReference(sourceFileId, (reference, baseHref, index, match, attributeName, tagName) => {
                    const language = getReferenceLanguage(sourceFileId, reference, attributeName, tagName);
                    const allowBare = files[sourceFileId].language !== 'javascript';
                    if (getAssetFileId(reference, language, baseHref, sourceFileId, allowBare) === targetFileId) found = true;
                });
                return found;
            }

            function getReferenceLanguage(sourceFileId, reference, attributeName, tagName) {
                if (files[sourceFileId].language !== 'html') return files[sourceFileId].language;
                if (attributeName === 'src' && tagName === 'script') return 'javascript';
                if (attributeName === 'href' && (tagName === 'a' || /\.html([?#]|$)/i.test(reference))) return 'html';
                if (attributeName === 'href' && (tagName === 'link' || /\.css([?#]|$)/i.test(reference))) return 'css';
                return 'resource';
            }

            function getRelativeVfsPath(sourceFileId, targetFileId, baseHref = './') {
                const sourceDirectory = getReferenceBaseHref(sourceFileId, baseHref).pathname;
                const sourceParts = sourceDirectory.split('/').filter(Boolean);
                const targetParts = normalizeVfsPath(targetFileId).split('/').filter(Boolean);
                let commonLength = 0;
                while (commonLength < sourceParts.length && commonLength < targetParts.length &&
                    sourceParts[commonLength] === targetParts[commonLength]) {
                    commonLength += 1;
                }
                const relativeParts = [
                    ...sourceParts.slice(commonLength).map(() => '..'),
                    ...targetParts.slice(commonLength)
                ];
                return relativeParts.join('/') || './';
            }

            function rewriteReferences(oldName, newName) {
                Object.keys(files).forEach(id => {
                    const file = files[id];
                    let content = getCurrentContent(file);
                    if (file.language === 'html') {
                        const doc = new DOMParser().parseFromString(content, 'text/html');
                        const baseHref = doc.querySelector('base[href]')?.getAttribute('href') || './';
                        let changed = false;
                        const rewriteValue = (value, language, allowBare = true) => {
                            const pathOnly = value.split(/[?#]/, 1)[0];
                            if (getAssetFileId(pathOnly, language, baseHref, id, allowBare) !== oldName) return value;
                            return value.replace(pathOnly, getRelativeVfsPath(id, newName, baseHref));
                        };
                        doc.querySelectorAll('[href], [src], [poster], [data]').forEach(node => {
                            ['href', 'src', 'poster', 'data'].forEach(attributeName => {
                                if (!node.hasAttribute(attributeName)) return;
                                const reference = node.getAttribute(attributeName);
                                const tagName = node.tagName.toLowerCase();
                                const language = attributeName === 'src' && tagName === 'script' ? 'javascript' :
                                    attributeName === 'href' && tagName === 'link' && /stylesheet/i.test(node.getAttribute('rel') || '') ? 'css' :
                                    attributeName === 'href' && tagName === 'a' ? 'html' :
                                    /\.html([?#]|$)/i.test(reference) ? 'html' : 'resource';
                                const rewritten = rewriteValue(reference, language);
                                if (rewritten !== reference) {
                                    node.setAttribute(attributeName, rewritten);
                                    changed = true;
                                }
                            });
                        });
                        doc.querySelectorAll('[srcset]').forEach(node => {
                            const reference = node.getAttribute('srcset');
                            const rewritten = splitSrcsetCandidates(reference, true).map(candidate => {
                                const parts = candidate.trim().split(/\s+/);
                                if (parts[0]) parts[0] = rewriteValue(parts[0], 'resource');
                                return parts.join(' ');
                            }).join(', ');
                            if (rewritten !== reference) {
                                node.setAttribute('srcset', rewritten);
                                changed = true;
                            }
                        });
                        if (changed) {
                            const doctype = doc.doctype ? '<!DOCTYPE ' + doc.doctype.name + '>' : '';
                            file.model.setValue(doctype + doc.documentElement.outerHTML);
                        }
                        return;
                    }
                    const replacements = [];
                    forEachReference(id, (reference, baseHref, index, match, attributeName) => {
                        const language = getReferenceLanguage(id, reference, attributeName);
                        const pathOnly = reference.split(/[?#]/, 1)[0];
                        if (getAssetFileId(pathOnly, language, baseHref, id) === oldName) {
                            const newRef = reference.replace(pathOnly, getRelativeVfsPath(id, newName, baseHref));
                            replacements.push({ index, length: match.length, value: match.replace(reference, newRef) });
                        }
                    });
                    replacements.reverse().forEach(replacement => {
                        content = content.slice(0, replacement.index) + replacement.value +
                            content.slice(replacement.index + replacement.length);
                    });
                    if (content !== getCurrentContent(file)) file.model.setValue(content);
                });
            }

            function inlineCssImports(content, fileId, stack = new Set()) {
                if (stack.has(fileId)) return '';
                const nextStack = new Set(stack);
                nextStack.add(fileId);
                return replaceCssMatches(content, /@import\s+(?:["']([^"']+)["']|url\((["']?)([^"')]+)\2\))\s*([^;]*);?/gi, (match, quotedPath, _, urlPath, modifiers) => {
                    const path = quotedPath || urlPath;
                    const dependency = getAssetFileId(path, 'css', './', fileId, true);
                    if (!dependency) return match;
                    let imported = inlineCssAssets(inlineCssImports(getCurrentContent(files[dependency]), dependency, nextStack), dependency);
                    const qualifier = (modifiers || '').trim();
                    const layerMatch = qualifier.match(/\blayer(?:\(([^)]*)\))?/i);
                    const supportsMatch = qualifier.match(/\bsupports\(([^)]*)\)/i);
                    const media = qualifier
                        .replace(layerMatch?.[0] || '', '')
                        .replace(supportsMatch?.[0] || '', '')
                        .trim();
                    if (media) imported = `@media ${media} {${imported}}`;
                    if (supportsMatch) imported = `@supports ${supportsMatch[1]} {${imported}}`;
                    if (layerMatch) imported = `@layer${layerMatch[1] ? ' ' + layerMatch[1].trim() : ''} {${imported}}`;
                    return imported;
                });
            }

            function inlineCssAssets(content, fileId) {
                return replaceCssMatches(content, /url\(\s*(["']?)([^"')]+)\1\s*\)/gi, (match, quote, reference) => {
                    const dataUrl = getAssetDataUrl(files[getAssetFileId(reference, 'resource', './', fileId, true)]);
                    return dataUrl ? `url(${quote}${dataUrl}${quote})` : match;
                });
            }

            function inlineReferencedAssets(doc, language, tagName, attributeName, baseHref, sourceFileId) {
                const referenced = new Set();
                doc.querySelectorAll(`${tagName}[${attributeName}]`).forEach(node => {
                    const reference = node.getAttribute(attributeName);
                    const fileId = getAssetFileId(reference, language, baseHref, sourceFileId, true);
                    if (!fileId) return;
                    if (referenced.has(fileId)) {
                        node.remove();
                        return;
                    }
                    referenced.add(fileId);
                    if (language === 'javascript' && node.getAttribute('type') === 'module') {
                        if (!createNativeModuleScript(node, getCurrentContent(files[fileId]), fileId, baseHref)) {
                            const bundle = createModuleBundle(fileId, baseHref);
                            if (bundle) {
                                node.removeAttribute('src');
                                node.removeAttribute('type');
                                node.textContent = bundle;
                            } else {
                                node.remove();
                            }
                        }
                        return;
                    }
                    const replacement = document.createElement(language === 'css' ? 'style' : 'script');
                    let content = getCurrentContent(files[fileId]);
                    if (language === 'css') {
                        content = inlineCssAssets(inlineCssImports(content, fileId), fileId);
                    }
                    replacement.textContent = content;
                    Array.from(node.attributes).forEach(attribute => {
                        if (attribute.name !== attributeName) replacement.setAttribute(attribute.name, attribute.value);
                    });
                    node.replaceWith(replacement);
                });
                return referenced;
            }

            function createModuleBundle(entryFileId, entryBaseHref = './') {
                if (!files[entryFileId]) return '';
                const modules = new Map();
                const visit = (fileId, moduleBaseHref = './') => {
                    if (modules.has(fileId) || !files[fileId]) return;
                    const content = getCurrentContent(files[fileId]);
                    modules.set(fileId, content);
                    getLocalModuleSpecifiers(content, fileId, moduleBaseHref).forEach(specifier => {
                        const dependency = getAssetFileId(specifier, 'javascript', moduleBaseHref, fileId);
                        if (dependency) visit(dependency);
                    });
                };
                visit(entryFileId, entryBaseHref);
                const unsupported = [...modules.entries()].flatMap(([fileId, content]) =>
                    getModuleSpecifiers(content).filter(specifier => !getAssetFileId(specifier, 'javascript', fileId === entryFileId ? entryBaseHref : './', fileId))
                        .map(specifier => `${fileId}: ${specifier}`));
                if (unsupported.length) {
                    addConsoleEntry('error', 'Module tidak dapat dibundle. Pastikan semua import tersedia di project: ' + unsupported.join(', '));
                    return '';
                }
                const bundle = createBundleSource(modules, entryFileId, entryBaseHref);
                if (bundle.length > MAX_MODULE_BUNDLE_SIZE) {
                    addConsoleEntry('error', 'Ukuran module bundle melebihi batas 1 MB');
                    if (!moduleBundleLimitNotified) {
                        moduleBundleLimitNotified = true;
                        showToast('⚠️ Modul tidak dimuat: bundle melebihi 1 MB');
                    }
                    return '';
                }
                return bundle;
            }

            function isJavaScriptCodePosition(source, targetIndex, mask = createJavaScriptCodeMask(source)) {
                return !!mask[targetIndex];
            }

            function createJavaScriptCodeMask(source) {
                const mask = new Array(source.length).fill(false);
                const skipRegex = index => {
                    let inClass = false;
                    for (let cursor = index + 1; cursor < source.length; cursor += 1) {
                        if (source[cursor] === '\\') {
                            cursor += 1;
                        } else if (source[cursor] === '[') {
                            inClass = true;
                        } else if (source[cursor] === ']') {
                            inClass = false;
                        } else if (source[cursor] === '/' && !inClass) {
                            cursor += 1;
                            while (/[A-Za-z]/.test(source[cursor])) cursor += 1;
                            return cursor;
                        } else if (source[cursor] === '\n') {
                            return cursor;
                        }
                    }
                    return source.length;
                };
                const isRegexStart = index => {
                    let cursor = index - 1;
                    while (cursor >= 0 && /\s/.test(source[cursor])) cursor -= 1;
                    if (cursor < 0 || /[({[,:;=!&|?+\-*%^~<>]/.test(source[cursor])) return true;
                    let wordStart = cursor;
                    while (wordStart >= 0 && /[A-Za-z_$]/.test(source[wordStart])) wordStart -= 1;
                    return ['return', 'throw', 'case', 'delete', 'void', 'typeof', 'instanceof', 'in', 'of', 'else', 'do']
                        .includes(source.slice(wordStart + 1, cursor + 1));
                };
                const skipQuoted = (index, quote) => {
                    for (let cursor = index; cursor < source.length; cursor += 1) {
                        if (source[cursor] === '\\') cursor += 1;
                        else if (source[cursor] === quote) return cursor + 1;
                    }
                    return source.length;
                };
                const scanCode = (index, stopAtBrace = false) => {
                    while (index < source.length) {
                        const character = source[index];
                        const next = source[index + 1];
                        if (stopAtBrace && character === '}') return index + 1;
                        if (character === '/' && next === '/') {
                            index = source.indexOf('\n', index + 2);
                            if (index === -1) return source.length;
                            continue;
                        }
                        if (character === '/' && next === '*') {
                            const end = source.indexOf('*/', index + 2);
                            index = end === -1 ? source.length : end + 2;
                            continue;
                        }
                        if (character === '/' && isRegexStart(index)) {
                            index = skipRegex(index);
                            continue;
                        }
                        if (character === '"' || character === "'") {
                            index = skipQuoted(index + 1, character);
                            continue;
                        }
                        if (character === '`') {
                            index = scanTemplate(index);
                            continue;
                        }
                        mask[index] = true;
                        index += 1;
                    }
                    return index;
                };
                const scanTemplate = index => {
                    index += 1;
                    while (index < source.length) {
                        if (source[index] === '\\') {
                            index += 2;
                        } else if (source[index] === '`') {
                            return index + 1;
                        } else if (source[index] === '$' && source[index + 1] === '{') {
                            index = scanCode(index + 2, true);
                        } else {
                            index += 1;
                        }
                    }
                    return source.length;
                };
                scanCode(0);
                return mask;
            }

            function replaceJavaScriptMatches(source, pattern, replacer, mask = createJavaScriptCodeMask(source)) {
                const replacements = [];
                for (const match of source.matchAll(pattern)) {
                    if (!isJavaScriptCodePosition(source, match.index, mask)) continue;
                    replacements.push({
                        start: match.index,
                        end: match.index + match[0].length,
                        value: replacer(...match, match.index)
                    });
                }
                return replacements.reverse().reduce((result, replacement) =>
                    result.slice(0, replacement.start) + replacement.value + result.slice(replacement.end), source);
            }

            function replaceCssMatches(source, pattern, replacer) {
                const replacements = [];
                let state = 'code';
                let quote = '';
                let cursor = 0;
                for (const match of source.matchAll(pattern)) {
                    while (cursor < match.index) {
                        const character = source[cursor];
                        const next = source[cursor + 1];
                        if (state === 'comment') {
                            if (character === '*' && next === '/') {
                                state = 'code';
                                cursor += 2;
                                continue;
                            }
                        } else if (state === 'string') {
                            if (character === '\\') cursor += 2;
                            else if (character === quote) {
                                state = 'code';
                                cursor += 1;
                                continue;
                            }
                        } else if (character === '/' && next === '*') {
                            state = 'comment';
                            cursor += 2;
                            continue;
                        } else if (character === '"' || character === "'") {
                            state = 'string';
                            quote = character;
                        }
                        cursor += 1;
                    }
                    if (state !== 'code') continue;
                    replacements.push({
                        start: match.index,
                        end: match.index + match[0].length,
                        value: replacer(...match, match.index)
                    });
                }
                return replacements.reverse().reduce((result, replacement) =>
                    result.slice(0, replacement.start) + replacement.value + result.slice(replacement.end), source);
            }

            function transformModuleSource(content, fileId, baseHref = './') {
                const imports = [];
                const exportedDeclarations = [];
                const reexports = [];
                content = replaceJavaScriptMatches(content, /\bimport\s*["']([^"']+)["']\s*;?/g, (match, specifier) => {
                    const dependency = getAssetFileId(specifier, 'javascript', baseHref, fileId);
                    return dependency ? `__require(${JSON.stringify(dependency)});` : match;
                });
                content = replaceJavaScriptMatches(content, /\bimport\s+([\s\S]*?)\s*from\s*["']([^"']+)["']\s*;?/g, (match, clause, specifier) => {
                    const dependency = getAssetFileId(specifier, 'javascript', baseHref, fileId);
                    if (!dependency) return match;
                    imports.push({ clause: clause.trim(), dependency });
                    return '';
                });
                content = replaceJavaScriptMatches(content, /\bimport\s+["']([^"']+)["']\s*;?/g, (match, specifier) => {
                    const dependency = getAssetFileId(specifier, 'javascript', baseHref, fileId);
                    return dependency ? `__require(${JSON.stringify(dependency)});` : match;
                });
                content = replaceJavaScriptMatches(content, /export\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']\s*;?/g, (match, names, specifier) => {
                    const dependency = getAssetFileId(specifier, 'javascript', baseHref, fileId);
                    if (!dependency) return match;
                    reexports.push({ names, dependency });
                    return '';
                });
                content = replaceJavaScriptMatches(content, /export\s*\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s*["']([^"']+)["']\s*;?/g, (match, name, specifier) => {
                    const dependency = getAssetFileId(specifier, 'javascript', baseHref, fileId);
                    if (!dependency) return match;
                    reexports.push({ name, dependency });
                    return '';
                });
                content = replaceJavaScriptMatches(content, /export\s*\*\s*from\s*["']([^"']+)["']\s*;?/g, (match, specifier) => {
                    const dependency = getAssetFileId(specifier, 'javascript', baseHref, fileId);
                    if (!dependency) return match;
                    reexports.push({ dependency, all: true });
                    return '';
                });
                const normalizeExportName = name => {
                    const value = name.trim();
                    if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) ||
                        (value.startsWith("'") && value.endsWith("'")))) {
                        return value.slice(1, -1);
                    }
                    return value;
                };
                const prelude = imports.map(({ clause, dependency }) => {
                    const required = `__require(${JSON.stringify(dependency)})`;
                    const lines = [];
                    const namedMatch = clause.match(/\{([\s\S]*)\}/);
                    const namespaceMatch = clause.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/);
                    const defaultMatch = clause.match(/^([A-Za-z_$][\w$]*)\s*(?:,|$)/);
                    if (defaultMatch) lines.push(`const ${defaultMatch[1]} = ${required}.default;`);
                    if (namespaceMatch) lines.push(`const ${namespaceMatch[1]} = ${required};`);
                    if (namedMatch) {
                        namedMatch[1].split(',').map(item => item.trim()).filter(Boolean).forEach(item => {
                            const [remote, local] = item.split(/\s+as\s+/).map(value => value.trim());
                            const remoteName = normalizeExportName(remote);
                            const localName = local || remoteName;
                            if (remoteName && /^[A-Za-z_$][\w$]*$/.test(localName)) {
                                lines.push(`const ${localName} = ${required}[${JSON.stringify(remoteName)}];`);
                            } else {
                                addConsoleEntry('error', `Import tidak didukung di ${fileId}: ${item}`);
                            }
                        });
                    }
                    if (!defaultMatch && !namespaceMatch && !namedMatch) {
                        addConsoleEntry('error', `Import tidak didukung di ${fileId}: ${clause}`);
                    }
                    return lines.join('\n');
                }).join('\n');
                content = replaceJavaScriptMatches(content, /export\s+default\s+/g, () => '__exports.default = ');
                exportedDeclarations.push(...getExportedDeclarationNames(content));
                content = replaceJavaScriptMatches(content, /export\s+(const|let|var)\s+(?=[{[])/g, (match, kind) => `${kind} `);
                content = replaceJavaScriptMatches(content, /export\s+(const|let|var)\s+((?:\{[^}]+\}|\[[^\]]+\]))\s*=/g, (match, kind, pattern) => `${kind} ${pattern} =`);
                content = replaceJavaScriptMatches(content, /export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)/g, (match, kind, name) => `${kind} ${name}`);
                content = replaceJavaScriptMatches(content, /export\s+(async\s+)?function\s+([A-Za-z_$][\w$]*)/g, (match, asyncKeyword, name) => `${asyncKeyword || ''}function ${name}`);
                content = replaceJavaScriptMatches(content, /export\s+class\s+([A-Za-z_$][\w$]*)/g, (match, name) => `class ${name}`);
                const exportedNames = [];
                content = replaceJavaScriptMatches(content, /export\s*\{([^}]+)\}\s*;?/g, (match, names) => {
                    names.split(',').map(item => item.trim()).filter(Boolean).forEach(item => {
                        const [local, exported] = item.split(/\s+as\s+/);
                        const exportName = normalizeExportName(exported || local);
                        const localName = local.trim();
                        if (/^[A-Za-z_$][\w$]*$/.test(localName) && exportName) {
                            exportedNames.push(`__exports[${JSON.stringify(exportName)}] = ${localName};`);
                        }
                    });
                    return '';
                });
                content = replaceJavaScriptMatches(content, /\bimport\(\s*["']([^"']+)["']\s*\)/g, (match, specifier) => {
                    const dependency = getAssetFileId(specifier, 'javascript', baseHref, fileId);
                    return dependency ? `Promise.resolve(__require(${JSON.stringify(dependency)}))` : match;
                });
                content = replaceJavaScriptMatches(content, /\bimport\(\s*`([^`$]*)`\s*\)/g, (match, specifier) => {
                    const dependency = getAssetFileId(specifier, 'javascript', baseHref, fileId);
                    return dependency ? `Promise.resolve(__require(${JSON.stringify(dependency)}))` : match;
                });
                const exportAssignments = [...new Set(exportedDeclarations)].map(name => `__exports.${name} = ${name};`);
                const reexportAssignments = reexports.map(reexport => {
                    const required = `__require(${JSON.stringify(reexport.dependency)})`;
                    if (reexport.name) return `__exports[${JSON.stringify(reexport.name)}] = ${required};`;
                    if (reexport.all) return `Object.keys(${required}).forEach(key => { if (key !== 'default' && key !== '__esModule') __exports[key] = ${required}[key]; });`;
                    return reexport.names.split(',').map(item => {
                        const [remote, local] = item.trim().split(/\s+as\s+/);
                        const remoteName = normalizeExportName(remote);
                        const localName = normalizeExportName(local || remote);
                        return `__exports[${JSON.stringify(localName)}] = ${required}[${JSON.stringify(remoteName)}];`;
                    }).join('\n');
                });
                return `${prelude}\n${content}\n${exportedNames.join('\n')}\n${exportAssignments.join('\n')}\n${reexportAssignments.join('\n')}`;
            }

            function createBundleSource(modules, entryFileId, entryBaseHref = './') {
                const unsupported = [...modules.entries()].flatMap(([fileId, content]) =>
                    getModuleSpecifiers(content).filter(specifier => !getAssetFileId(specifier, 'javascript', fileId === entryFileId ? entryBaseHref : './', fileId))
                        .map(specifier => `${fileId}: ${specifier}`));
                if (unsupported.length) {
                    addConsoleEntry('error', 'Module tidak dapat dibundle. Pastikan semua import tersedia di project: ' + unsupported.join(', '));
                    return '';
                }
                const factories = [...modules.entries()].map(([fileId, content]) =>
                    `${JSON.stringify(fileId)}:(function(__exports,__require){\n${transformModuleSource(content, fileId, fileId === entryFileId ? entryBaseHref : './')}\n})`).join(',\n');
                return `(function(){const __modules={${factories}};const __cache=Object.create(null);const __state=Object.create(null);const __require=id=>{if(__state[id]==='evaluating')return __cache[id];if(__state[id]==='evaluated')return __cache[id];const __factory=__modules[id];if(!__factory)throw new Error('Module not found: '+id);const __exports={};__cache[id]=__exports;__state[id]='evaluating';try{__factory(__exports,__require);__state[id]='evaluated';return __exports;}catch(error){delete __cache[id];delete __state[id];throw error;}};__require(${JSON.stringify(entryFileId)});})();`;
            }

            function rewriteInlineModuleScripts(doc, baseHref, sourceFileId) {
                doc.querySelectorAll('script[type="module"]:not([src])').forEach(node => {
                    const inlineId = `__inline__:${sourceFileId}`;
                    const modules = new Map([[inlineId, node.textContent]]);
                    const visit = (fileId, moduleBaseHref = './') => {
                        if (modules.has(fileId) || !files[fileId]) return;
                        const content = getCurrentContent(files[fileId]);
                        modules.set(fileId, content);
                        getModuleSpecifiers(content).forEach(specifier => {
                            const dependency = getAssetFileId(specifier, 'javascript', moduleBaseHref, fileId);
                            if (dependency) visit(dependency);
                        });
                    };
                    getLocalModuleSpecifiers(node.textContent, sourceFileId, baseHref).forEach(specifier => {
                        const dependency = getAssetFileId(specifier, 'javascript', baseHref, sourceFileId);
                        if (dependency) visit(dependency, './');
                    });
                    if (!createNativeModuleScript(node, node.textContent, inlineId, baseHref)) {
                        const bundle = createBundleSource(modules, inlineId, baseHref);
                        if (bundle) {
                            node.textContent = bundle;
                            node.removeAttribute('type');
                        } else {
                            node.remove();
                        }
                    }
                });
            }

            function buildPreview() {
                syncAllFileState();
                previewContents = new Map(Object.values(files).map(file => [file, file.committedContent]));
                try {
                    buildPreviewFromSavedContent();
                } finally {
                    previewContents = null;
                }
            }

            function buildPreviewFromSavedContent() {
                hidePreviewError();
                revokeNativeModuleUrls();
                moduleBundleLimitNotified = false;
                const project = getPreviewProject();
                const html = project.html;
                const previewDocument = new DOMParser().parseFromString(html, 'text/html');
                previewBaseHref = previewDocument.querySelector('base[href]')?.getAttribute('href') || './';
                previewGeneration += 1;
                const currentPreviewGeneration = previewGeneration;
                previewSessionToken = window.crypto && typeof window.crypto.randomUUID === 'function' ?
                    window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

                const dependencyGraph = getDependencyGraph();
                [...new Set(dependencyIssues)].forEach(issue => addConsoleEntry('warn', 'Dependency lokal tidak ditemukan: ' + issue));
                const reachable = new Set();
                const collectReachable = fileId => {
                    if (!fileId || reachable.has(fileId)) return;
                    reachable.add(fileId);
                    (dependencyGraph.get(fileId) || new Set()).forEach(collectReachable);
                };
                collectReachable(project.entrypoint);
                const reachableCss = project.css.filter(id => reachable.has(id));
                const reachableJs = project.javascript.filter(id => reachable.has(id));

                let cdnLinks = '';
                cdnUrls.forEach(url => {
                    const ext = getExtFromUrl(url);
                    const safeUrl = escapeForAttribute(url);
                    if (ext === 'css') cdnLinks += `<link rel="stylesheet" href="${safeUrl}" />\n`;
                    else cdnLinks += `<script src="${safeUrl}"><\/script>\n`;
                });

                // Interceptor — diletakkan sebelum user JS
                const intercept = `
                (function(){
                    const send=(lvl,args)=>{
                        const msg=args.map(a=>{
                            if(typeof a==='object'){
                                try { return JSON.stringify(a); } catch(_){ return '[Circular]'; }
                            }
                            return String(a);
                        }).join(' ');
                        window.parent.postMessage({type:'console',token:'${previewSessionToken}',generation:${currentPreviewGeneration},level:lvl,message:msg},'*');
                    };
                    ['log','error','warn','info'].forEach(m=>{
                        const orig=console[m];
                        console[m]=function(...args){ orig.apply(console,args); send(m,args); };
                    });
                    window.onerror=function(msg,src,line,col,err){
                        window.parent.postMessage({type:'console',token:'${previewSessionToken}',generation:${currentPreviewGeneration},level:'error',message:'Uncaught: '+msg,file:src,line:line,column:col},'*');
                        return false;
                    };
                    window.addEventListener('unhandledrejection',e=>{
                        window.parent.postMessage({type:'console',token:'${previewSessionToken}',generation:${currentPreviewGeneration},level:'error',message:'Promise rejection: '+e.reason},'*');
                    });
                    document.addEventListener('click',e=>{
                        const anchor=e.target.closest && e.target.closest('a[href]');
                        if(!anchor) return;
                        const href=anchor.getAttribute('href');
                        if(!href || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href.trim())) return;
                        e.preventDefault();
                        window.parent.postMessage({type:'navigate',token:'${previewSessionToken}',generation:${currentPreviewGeneration},href},'*');
                    });
                })();
                `;

                let doc;
                const isFull = isFullDocument(html);

                if (isFull) {
                    const parsedDocument = previewDocument;
                    const baseHref = previewBaseHref;
                    const referencedCss = inlineReferencedAssets(parsedDocument, 'css', 'link[rel~="stylesheet"]', 'href', baseHref, project.entrypoint);
                    const referencedJs = inlineReferencedAssets(parsedDocument, 'javascript', 'script', 'src', baseHref, project.entrypoint);
                    inlineLocalAssets(parsedDocument, baseHref, project.entrypoint);
                    rewriteInlineModuleScripts(parsedDocument, baseHref, project.entrypoint);
                    const extraCss = reachableCss.filter(id => !referencedCss.has(id))
                        .map(id => `<style data-vfs-file="${id}">${escapeForHtml(getCurrentContent(files[id]))}</style>`).join('\n');
                    const extraJs = reachableJs.filter(id => !referencedJs.has(id))
                        .filter(id => !/\b(?:import|export)\b/.test(getCurrentContent(files[id])))
                        .map(id => `<script data-vfs-file="${id}">${escapeForHtml(getCurrentContent(files[id]))}<\/script>`).join('\n');
                    const headAssets = (extraCss ? extraCss + '\n' : '') + cdnLinks;
                    const interceptorScript = `<script>${intercept}<\/script>`;
                    const head = parsedDocument.head || parsedDocument.documentElement.insertBefore(parsedDocument.createElement('head'), parsedDocument.body);
                    head.insertAdjacentHTML('afterbegin', interceptorScript + headAssets);
                    if (extraJs) {
                        const body = parsedDocument.body || parsedDocument.documentElement.appendChild(parsedDocument.createElement('body'));
                        body.insertAdjacentHTML('beforeend', extraJs);
                    }
                    doc = '<!DOCTYPE html>' + parsedDocument.documentElement.outerHTML;
                } else {
                    const parsedDocument = previewDocument;
                    const baseHref = previewBaseHref;
                    const referencedCss = inlineReferencedAssets(parsedDocument, 'css', 'link[rel~="stylesheet"]', 'href', baseHref, project.entrypoint);
                    const referencedJs = inlineReferencedAssets(parsedDocument, 'javascript', 'script', 'src', baseHref, project.entrypoint);
                    inlineLocalAssets(parsedDocument, baseHref, project.entrypoint);
                    rewriteInlineModuleScripts(parsedDocument, baseHref, project.entrypoint);
                    const extraCss = reachableCss.filter(id => !referencedCss.has(id))
                        .map(id => `<style data-vfs-file="${id}">${escapeForHtml(getCurrentContent(files[id]))}</style>`).join('\n');
                    const extraJs = reachableJs.filter(id => !referencedJs.has(id))
                        .filter(id => !/\b(?:import|export)\b/.test(getCurrentContent(files[id])))
                        .map(id => `<script data-vfs-file="${id}">${escapeForHtml(getCurrentContent(files[id]))}<\/script>`).join('\n');
                    doc =
                        `<!DOCTYPE html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /><script>${intercept}<\/script>${cdnLinks}${extraCss}</head><body>${parsedDocument.body.innerHTML}${extraJs}</body></html>`;
                }

                previewIframe.srcdoc = doc;
                setPreviewStatus('live');
            }

            // ============================================================
            //  DOWNLOAD PROJECT (ZIP)
            // ============================================================
            async function downloadProject() {
                if (typeof JSZip === 'undefined') {
                    try {
                        showToast('Memuat fitur download...');
                        await loadExternalAsset(EXTERNAL_ASSETS.jszip);
                    } catch (error) {
                        console.error(error);
                        showToast('⚠️ Library JSZip tidak dimuat');
                        return;
                    }
                }
                syncAllFileState();
                const brokenReferences = findBrokenLocalReferences();
                if (brokenReferences.length > 0) {
                    showToast('⚠️ ZIP dibatalkan: referensi lokal tidak valid');
                    console.warn('Broken local references:', brokenReferences);
                    return;
                }
                const zip = new JSZip();
                let hasHtml = false;
                Object.keys(files).forEach(id => {
                    const f = files[id];
                    const content = f.model ? f.model.getValue() : f.content;
                    if (getFileType(f) === 'asset') {
                        const separator = content.indexOf(',');
                        if (separator >= 0 && content.slice(0, separator).includes(';base64')) {
                            zip.file(id, content.slice(separator + 1), { base64: true });
                        } else {
                            zip.file(id, content || '');
                        }
                    } else {
                        zip.file(id, content);
                    }
                    if (f.language === 'html') hasHtml = true;
                });
                if (!hasHtml) {
                    zip.file('index.html', '<h1>Project</h1>');
                }
                zip.generateAsync({ type: 'blob' }).then(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `codeplayground-project-${Date.now()}.zip`;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                    showToast('📦 Project diunduh sebagai ZIP');
                }).catch(err => {
                    console.error('Zip error:', err);
                    showToast('⚠️ Gagal membuat ZIP');
                });
            }

            // ============================================================
            //  PREVIEW STATUS
            // ============================================================
            function setPreviewStatus(state) {
                if (state === 'running') {
                    previewStatus.textContent = '● running';
                    previewStatus.className = 'preview-status running';
                } else {
                    previewStatus.textContent = '● live';
                    previewStatus.className = 'preview-status';
                }
            }

            function showPreviewError(message, file, line, column) {
                lastPreviewError = { file, line, column };
                errorOverlayTitle.textContent = file ? `Error di ${file}` : 'Preview error';
                errorOverlayMessage.textContent = `${message}${line ? `\n\nBaris ${line}, kolom ${column || 1}` : ''}`;
                errorOverlay.classList.add('open');
                errorOverlay.setAttribute('aria-hidden', 'false');
            }

            function hidePreviewError() {
                errorOverlay.classList.remove('open');
                errorOverlay.setAttribute('aria-hidden', 'true');
            }

            function scheduleUpdate() {
                if (!settings.autoSave) return;
                if (updateTimer) clearTimeout(updateTimer);
                updateTimer = setTimeout(() => { persistDrafts();
                    updateTimer = null; }, settings.refreshDelay);
            }

            // ============================================================
            //  CONSOLE — dengan origin validation yang baik
            // ============================================================
            function addConsoleEntry(level, message, details = {}) {
                consoleEntries.push({ level, message, ...details, timestamp: new Date().toLocaleTimeString() });
                while (consoleEntries.length > 300) {
                    consoleEntries.shift();
                }
                appendConsoleEntry(level, message, details);
                const rows = consoleBody.querySelectorAll('.log-entry');
                if (rows.length > 300) rows[0].remove();
            }

            function appendConsoleEntry(level, message, details = {}) {
                consoleBody.querySelector('.log-empty')?.remove();
                const div = document.createElement('div');
                div.className = 'log-entry';
                const lvl = document.createElement('span');
                lvl.className = 'log-level';
                if (level === 'error') lvl.classList.add('error');
                else if (level === 'warn') lvl.classList.add('warn');
                else if (level === 'info') lvl.classList.add('info');
                lvl.textContent = level.toUpperCase();
                const msg = document.createElement('span');
                msg.className = 'log-message';
                msg.textContent = `${details.file || ''}${details.line ? `:${details.line}:${details.column || 1}` : ''}${details.file ? ' - ' : ''}${message}`;
                div.appendChild(lvl);
                div.appendChild(msg);
                consoleBody.appendChild(div);
                if (!consoleScrollFrame && consoleOpen) {
                    consoleScrollFrame = requestAnimationFrame(() => {
                        consoleScrollFrame = 0;
                        consoleBody.scrollTop = consoleBody.scrollHeight;
                    });
                }
            }

            function renderConsole() {
                consoleBody.innerHTML = '';
                if (consoleEntries.length === 0) {
                    consoleBody.innerHTML = '<div class="log-empty">⟡ Konsol siap</div>';
                    return;
                }
                consoleEntries.filter(e => !consoleFilterValue || `${e.level} ${e.message}`.toLowerCase().includes(consoleFilterValue)).forEach(e => {
                    const div = document.createElement('div');
                    div.className = 'log-entry';
                    const lvl = document.createElement('span');
                    lvl.className = 'log-level';
                    if (e.level === 'error') lvl.classList.add('error');
                    else if (e.level === 'warn') lvl.classList.add('warn');
                    else if (e.level === 'info') lvl.classList.add('info');
                    lvl.textContent = e.level.toUpperCase();
                    const msg = document.createElement('span');
                    msg.className = 'log-message';
                    msg.textContent = `${e.file || ''}${e.line ? `:${e.line}:${e.column || 1}` : ''}${e.file ? ' - ' : ''}${e.message}`;
                    div.appendChild(lvl);
                    div.appendChild(msg);
                    consoleBody.appendChild(div);
                });
                consoleBody.scrollTop = consoleBody.scrollHeight;
            }

            function clearConsole() { consoleEntries = [];
                renderConsole(); }

            function openConsole() {
                consoleOpen = true;
                consolePanel.classList.add('open');
                toggleConsoleBtn.setAttribute('aria-expanded', 'true');
                toggleConsoleBtn.setAttribute('aria-label', 'Tutup konsol');
                toggleConsoleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
            }

            function closeConsole() {
                consoleOpen = false;
                consolePanel.classList.remove('open');
                toggleConsoleBtn.setAttribute('aria-expanded', 'false');
                toggleConsoleBtn.setAttribute('aria-label', 'Buka konsol');
                toggleConsoleBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            }

            function toggleConsole() { consoleOpen ? closeConsole() : openConsole(); }

            function loadPyodideRuntime() {
                if (pyodideRuntime) return Promise.resolve(pyodideRuntime);
                if (pyodideLoadPromise) return pyodideLoadPromise;
                pyodideLoadPromise = new Promise((resolve, reject) => {
                    const finish = () => {
                        if (typeof window.loadPyodide !== 'function') {
                            reject(new Error('Pyodide tidak menyediakan loadPyodide'));
                            return;
                        }
                        window.loadPyodide({ indexURL: PYODIDE_INDEX_URL }).then(runtime => {
                            pyodideRuntime = runtime;
                            resolve(runtime);
                        }).catch(reject);
                    };
                    if (typeof window.loadPyodide === 'function') {
                        finish();
                        return;
                    }
                    const script = document.createElement('script');
                    script.src = PYODIDE_SCRIPT_URL;
                    script.async = true;
                    script.onload = finish;
                    script.onerror = () => reject(new Error('Library Pyodide gagal dimuat'));
                    document.head.appendChild(script);
                }).catch(error => {
                    pyodideLoadPromise = null;
                    throw error;
                });
                return pyodideLoadPromise;
            }

            function getPythonEntryFile() {
                if (files[activeFileId]?.language === 'python') return files[activeFileId];
                const mainFile = Object.values(files).find(file => file.language === 'python' && file === files['main.py']);
                return mainFile || Object.values(files).find(file => file.language === 'python') || null;
            }

            function getPythonFileId(file) {
                return Object.keys(files).find(id => files[id] === file) || '';
            }

            async function preparePythonFilesystem(runtime) {
                const pythonFiles = Object.entries(files).filter(([, file]) => file.language === 'python');
                const filePaths = new Set(pythonFiles.map(([fileId]) => normalizeVfsPath(fileId)));
                const directoryPaths = new Set();
                filePaths.forEach(filePath => {
                    const parts = filePath.split('/');
                    parts.pop();
                    while (parts.length) {
                        directoryPaths.add(parts.join('/'));
                        parts.pop();
                    }
                });
                filePaths.forEach(filePath => {
                    const parts = filePath.split('/');
                    parts.pop();
                    for (let index = 1; index <= parts.length; index += 1) {
                        const ancestor = parts.slice(0, index).join('/');
                        if (filePaths.has(ancestor) || filePaths.has(`${ancestor}.py`)) {
                            throw new Error(`Konflik path Python: ${ancestor} adalah file dan folder`);
                        }
                    }
                });
                const fingerprint = JSON.stringify(pythonFiles
                    .map(([fileId, file]) => [normalizeVfsPath(fileId), getCurrentContent(file)])
                    .sort((left, right) => left[0].localeCompare(right[0])));
                const filesystemChanged = fingerprint !== pythonFilesystemFingerprint;
                const moduleRoots = new Set([...pythonModuleRoots, ...filePaths, ...directoryPaths]
                    .map(filePath => filePath.split('/')[0].replace(/\.py$/i, '')));
                const removeDirectoryContents = path => {
                    let entries = [];
                    try { entries = runtime.FS.readdir(path); } catch (_) { return; }
                    entries.filter(entry => entry !== '.' && entry !== '..').forEach(entry => {
                        const child = `${path}/${entry}`;
                        try {
                            const stat = runtime.FS.stat(child);
                            if (runtime.FS.isDir(stat.mode)) {
                                removeDirectoryContents(child);
                                runtime.FS.rmdir(child);
                            } else {
                                runtime.FS.unlink(child);
                            }
                        } catch (_) {}
                    });
                };
                removeDirectoryContents(PYTHON_PROJECT_DIR);
                runtime.FS.mkdirTree(PYTHON_PROJECT_DIR);
                const currentPaths = new Set();
                directoryPaths.forEach(directoryPath => {
                    runtime.FS.mkdirTree(`${PYTHON_PROJECT_DIR}/${directoryPath}`);
                    currentPaths.add(`${directoryPath}/__init__.py`);
                    if (!filePaths.has(`${directoryPath}/__init__.py`)) {
                        runtime.FS.writeFile(`${PYTHON_PROJECT_DIR}/${directoryPath}/__init__.py`, '');
                    }
                });
                pythonFiles.forEach(([fileId, file]) => {
                    const virtualPath = `${PYTHON_PROJECT_DIR}/${normalizeVfsPath(fileId)}`;
                    const directory = virtualPath.slice(0, virtualPath.lastIndexOf('/'));
                    runtime.FS.mkdirTree(directory);
                    runtime.FS.writeFile(virtualPath, getCurrentContent(file));
                    currentPaths.add(normalizeVfsPath(fileId));
                });
                pythonFsPaths.forEach(filePath => {
                    if (!currentPaths.has(filePath)) {
                        try { runtime.FS.unlink(`${PYTHON_PROJECT_DIR}/${filePath}`); } catch (_) {}
                    }
                });
                pythonFsPaths = currentPaths;
                pythonFsDirectories = directoryPaths;
                pythonModuleRoots = moduleRoots;
                const importDirectories = [...directoryPaths]
                    .sort((left, right) => left.split('/').length - right.split('/').length)
                    .map(directoryPath => `${PYTHON_PROJECT_DIR}/${directoryPath}`);
                await runtime.runPythonAsync(`import sys\nimport_directories = ${JSON.stringify([PYTHON_PROJECT_DIR, ...importDirectories])}\nfor directory in import_directories:\n    while directory in sys.path:\n        sys.path.remove(directory)\nfor directory in reversed(import_directories):\n    sys.path.insert(0, directory)\nlocal_roots = ${JSON.stringify([...moduleRoots])}\nfor module_name in list(sys.modules):\n    if module_name.split('.')[0] in local_roots:\n        del sys.modules[module_name]`);
                return { changed: filesystemChanged, fingerprint };
            }

            function getPythonExternalImportSource(source, localModuleNames) {
                const sourceForDiscovery = source.replace(/\\\r?\n\s*/g, ' ');
                const localFromImportPattern = /^\s*from\s+(\.*(?:[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)?)\s+import\s*(?:\([^)]*\)|[^\n]*)/gm;
                const filteredSource = sourceForDiscovery.replace(localFromImportPattern, (match, moduleName) => {
                    return moduleName.startsWith('.') || localModuleNames.has(moduleName.split('.')[0]) ? '' : match;
                });
                const filteredLines = filteredSource.split('\n').map(line => {
                    const fromMatch = line.match(/^(\s*from\s+)(\.*(?:[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)?)/);
                    if (fromMatch && (fromMatch[2].startsWith('.') || localModuleNames.has(fromMatch[2].split('.')[0]))) return '';
                    const importMatch = line.match(/^(\s*import\s+)(.+)$/);
                    if (!importMatch) return line;
                    const imports = importMatch[2].split(',').filter(item => {
                        const moduleName = item.trim().split(/\s+as\s+/)[0].split('.')[0];
                        return !localModuleNames.has(moduleName);
                    });
                    return imports.length ? importMatch[1] + imports.join(',') : '';
                }).join('\n');
                const codeMask = createPythonCodeMask(filteredSource);
                const dynamicNames = new Set(['importlib.import_module', '__import__']);
                [...filteredSource.matchAll(/\bimport\s+importlib\s+as\s+([A-Za-z_]\w*)/g)].forEach(match => {
                    if (codeMask[match.index]) dynamicNames.add(`${match[1]}.import_module`);
                });
                [...filteredSource.matchAll(/\bfrom\s+importlib\s+import\s+import_module(?:\s+as\s+([A-Za-z_]\w*))?/g)].forEach(match => {
                    if (codeMask[match.index]) dynamicNames.add(match[1] || 'import_module');
                });
                [...filteredSource.matchAll(/\bfrom\s+importlib\s+import\s*\(\s*import_module(?:\s+as\s+([A-Za-z_]\w*))?\s*\)/g)].forEach(match => {
                    if (codeMask[match.index]) dynamicNames.add(match[1] || 'import_module');
                });
                [...filteredSource.matchAll(/\bfrom\s+builtins\s+import\s+__import__(?:\s+as\s+([A-Za-z_]\w*))?/g)].forEach(match => {
                    if (codeMask[match.index]) dynamicNames.add(match[1] || '__import__');
                });
                [...filteredSource.matchAll(/\bfrom\s+builtins\s+import\s*\(\s*__import__(?:\s+as\s+([A-Za-z_]\w*))?\s*\)/g)].forEach(match => {
                    if (codeMask[match.index]) dynamicNames.add(match[1] || '__import__');
                });
                [...filteredSource.matchAll(/\bimport\s+builtins\s+as\s+([A-Za-z_]\w*)/g)].forEach(match => {
                    if (codeMask[match.index]) dynamicNames.add(`${match[1]}.__import__`);
                });
                const escapedNames = [...dynamicNames].map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                const dynamicPattern = new RegExp(`\\b(?:${escapedNames.join('|')})\\s*\\(\\s*["']([A-Za-z_]\\w*(?:\\.[A-Za-z_]\\w*)*)["']`, 'g');
                const dynamicImports = [...filteredSource.matchAll(dynamicPattern)]
                    .filter(match => codeMask[match.index])
                    .map(match => match[1].split('.')[0])
                    .filter(moduleName => !localModuleNames.has(moduleName));
                return `${filteredLines}\n${[...new Set(dynamicImports)].map(moduleName => `import ${moduleName}`).join('\n')}`;
            }

            function createPythonCodeMask(source) {
                const mask = new Array(source.length).fill(false);
                let index = 0;
                while (index < source.length) {
                    if (source[index] === '#') {
                        index = source.indexOf('\n', index + 1);
                        if (index === -1) break;
                        continue;
                    }
                    if (source[index] === '"' || source[index] === "'") {
                        const quote = source[index];
                        const triple = source.slice(index, index + 3) === quote.repeat(3);
                        const closing = triple ? quote.repeat(3) : quote;
                        index += triple ? 3 : 1;
                        while (index < source.length) {
                            if (source[index] === '\\') index += 2;
                            else if (source.slice(index, index + closing.length) === closing) {
                                index += closing.length;
                                break;
                            } else index += 1;
                        }
                        continue;
                    }
                    mask[index] = true;
                    index += 1;
                }
                return mask;
            }

            function getPythonModuleName(fileId) {
                const normalized = normalizeVfsPath(fileId).replace(/\.py$/i, '');
                return normalized.split('/').join('.');
            }

            function getPythonRequirements() {
                const requirementsEntry = Object.entries(files).find(([fileId]) =>
                    normalizeVfsPath(fileId).toLowerCase() === 'requirements.txt');
                if (!requirementsEntry) return [];
                const requirements = getCurrentContent(requirementsEntry[1]).split(/\r?\n/)
                    .map(line => line.replace(/\s+#.*$/, '').trim())
                    .filter(line => line && !line.startsWith('#'));
                if (requirements.length > 100 || requirements.some(requirement => requirement.length > 256)) {
                    throw new Error('requirements.txt terlalu besar atau memiliki terlalu banyak package');
                }
                if (requirements.some(requirement => /^(-r|--requirement|-c|--constraint)\b/i.test(requirement))) {
                    throw new Error('requirements.txt hanya mendukung spesifikasi package, bukan file referensi');
                }
                return [...new Set(requirements)];
            }

            async function installPythonRequirements(runtime) {
                const requirements = getPythonRequirements();
                const fingerprint = JSON.stringify(requirements);
                if (!requirements.length || fingerprint === pythonRequirementsFingerprint) return;
                if (typeof runtime.loadPackage !== 'function') {
                    throw new Error('Runtime Python tidak mendukung instalasi package');
                }
                await runtime.loadPackage('micropip');
                await runtime.runPythonAsync(`import micropip\nawait micropip.install(${JSON.stringify(requirements)})`);
                pythonRequirementsFingerprint = fingerprint;
            }

            async function runPythonOnBackend(file) {
                const pythonFiles = {};
                Object.entries(files).forEach(([fileId, candidate]) => {
                    if (candidate.language === 'python' || normalizeVfsPath(fileId).toLowerCase() === 'requirements.txt') {
                        pythonFiles[fileId] = getCurrentContent(candidate);
                    }
                });
                const entryFile = getPythonFileId(file);
                try {
                    const response = await fetch(`${PYTHON_BACKEND_ORIGIN}/api/python/run`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ entryFile, files: pythonFiles })
                    });
                    const payload = await response.json().catch(() => ({}));
                    if (payload.stdout) addConsoleEntry('info', payload.stdout);
                    if (payload.stderr) addConsoleEntry('error', payload.stderr);
                    if (!response.ok) {
                        addConsoleEntry('error', `Backend Python gagal: ${payload.error || response.statusText}`);
                        showToast('⚠️ Backend Python gagal');
                    } else {
                        addConsoleEntry('info', `Python selesai (exit code ${payload.exitCode ?? 0})`);
                    }
                    return true;
                } catch (error) {
                    if (error?.name !== 'TypeError') {
                        addConsoleEntry('error', `Backend Python gagal: ${error?.message || error}`);
                    }
                    return false;
                }
            }

            async function runPythonCode() {
                if (pythonRunInProgress) return;
                syncAllFileState();
                const file = getPythonEntryFile();
                if (!file) {
                    showToast('⚠️ Belum ada file Python');
                    return;
                }
                pythonRunInProgress = true;
                runPythonBtn.disabled = true;
                const originalLabel = runPythonBtn.querySelector('span')?.textContent || 'Python';
                if (runPythonBtn.querySelector('span')) runPythonBtn.querySelector('span').textContent = 'Loading';
                openConsole();
                clearConsole();
                addConsoleEntry('info', `Python: ${activeFileId === Object.keys(files).find(id => files[id] === file) ? activeFileId : 'main.py'}`);
                let runtime = null;
                try {
                    if (await runPythonOnBackend(file)) return;
                    runtime = await loadPyodideRuntime();
                    const pythonPreparation = await preparePythonFilesystem(runtime);
                    runtime.setStdout({ batched: text => addConsoleEntry('info', text) });
                    runtime.setStderr({ batched: text => addConsoleEntry('error', text) });
                    await installPythonRequirements(runtime);
                    if (pythonPreparation.changed && typeof runtime.loadPackagesFromImports === 'function') {
                        const localModuleNames = new Set(Object.keys(files).filter(id => files[id].language === 'python')
                            .map(id => normalizeVfsPath(id).split('/')[0].replace(/\.py$/i, '')));
                        const packageSources = Object.values(files)
                            .filter(candidate => candidate.language === 'python')
                            .map(candidate => getPythonExternalImportSource(getCurrentContent(candidate), localModuleNames));
                        for (const packageSource of packageSources) {
                            await runtime.loadPackagesFromImports(packageSource);
                        }
                    }
                    pythonFilesystemFingerprint = pythonPreparation.fingerprint;
                    if (runPythonBtn.querySelector('span')) runPythonBtn.querySelector('span').textContent = 'Running';
                    const entryPath = `${PYTHON_PROJECT_DIR}/${normalizeVfsPath(getPythonFileId(file))}`;
                    const entryFileId = getPythonFileId(file);
                    const entryModule = getPythonModuleName(entryFileId);
                    const execution = entryFileId.includes('/') ?
                        `import runpy\nrunpy.run_module(${JSON.stringify(entryModule)}, run_name='__main__')` :
                        `import runpy\nrunpy.run_path(${JSON.stringify(entryPath)}, run_name='__main__')`;
                    const result = await runtime.runPythonAsync(execution);
                    if (result && typeof result.destroy === 'function') result.destroy();
                    addConsoleEntry('info', 'Python selesai');
                } catch (error) {
                    addConsoleEntry('error', `Python gagal: ${error?.message || error}`);
                    showToast('⚠️ Eksekusi Python gagal');
                } finally {
                    try { runtime?.setStdout(); runtime?.setStderr(); } catch (_) {}
                    pythonRunInProgress = false;
                    runPythonBtn.disabled = false;
                    if (runPythonBtn.querySelector('span')) runPythonBtn.querySelector('span').textContent = originalLabel;
                }
            }

            window.addEventListener('message', e => {
                const data = e.data;
                if (e.source !== previewIframe.contentWindow || !data || data.token !== previewSessionToken ||
                    data.generation !== previewGeneration) return;
                if (data.type === 'navigate') {
                    const pageId = getAssetFileId(data.href, 'html', previewBaseHref, previewPageId, true);
                    if (pageId) {
                        previewPageId = pageId;
                        buildPreview();
                    } else {
                        addConsoleEntry('warn', 'Halaman lokal tidak ditemukan: ' + data.href);
                    }
                    return;
                }
                if (data.type !== 'console' || !['log', 'error', 'warn', 'info'].includes(data.level) ||
                    typeof data.message !== 'string') return;
                addConsoleEntry(data.level, data.message, { file: data.file, line: data.line, column: data.column });
                if (data.level === 'error') showPreviewError(data.message, data.file, data.line, data.column);
            });

            // ============================================================
            //  FILES UI
            // ============================================================
            function renderFileList() {
                fileList.innerHTML = '';
                const nodes = {};
                folders.forEach(folderPath => {
                    const parts = normalizeVfsPath(folderPath).split('/');
                    let path = '';
                    parts.forEach(folder => {
                        path = path ? `${path}/${folder}` : folder;
                        nodes[path] ||= { type: 'folder', path, name: folder, parent: path.slice(0, path.lastIndexOf('/')), children: [] };
                    });
                });
                Object.keys(files).forEach(id => {
                    const parts = normalizeVfsPath(id).split('/');
                    let path = '';
                    parts.slice(0, -1).forEach(folder => {
                        path = path ? `${path}/${folder}` : folder;
                        nodes[path] ||= { type: 'folder', path, name: folder, parent: path.slice(0, path.lastIndexOf('/')), children: [] };
                    });
                    nodes[id] = { type: 'file', path: id, name: parts.at(-1), parent: parts.slice(0, -1).join('/') };
                });
                const sortNodes = list => list.sort((a, b) => a.type !== b.type ? (a.type === 'folder' ? -1 : 1) : a.name.localeCompare(b.name));
                Object.values(nodes).forEach(node => {
                    if (node.parent && nodes[node.parent]) nodes[node.parent].children.push(node);
                });
                const roots = sortNodes(Object.values(nodes).filter(node => !node.parent || !nodes[node.parent]));
                if (!folderTreeInitialized) {
                    roots.filter(node => node.type === 'folder').forEach(node => expandedFolders.add(node.path));
                    folderTreeInitialized = true;
                }
                const renderNodes = (items, parent, depth = 0) => items.forEach(node => {
                    if (node.type === 'folder') {
                        const folder = document.createElement('div');
                        folder.className = 'file-item folder-item' + (selectedFolderPath === node.path ? ' active' : '');
                        folder.style.paddingLeft = `${10 + depth * 14}px`;
                        folder.tabIndex = 0;
                        folder.setAttribute('role', 'button');
                        folder.setAttribute('aria-expanded', String(expandedFolders.has(node.path)));
                        folder.innerHTML = `<span class="file-icon"><i class="fas ${expandedFolders.has(node.path) ? 'fa-folder-open' : 'fa-folder'}"></i></span><span class="file-name">${node.name}</span>`;
                        folder.onclick = () => { selectedFolderPath = node.path; selectedFileId = ''; renderFileList(); };
                        folder.ondblclick = () => { expandedFolders.has(node.path) ? expandedFolders.delete(node.path) : expandedFolders.add(node.path); renderFileList(); };
                        folder.onkeydown = event => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                selectedFolderPath = node.path;
                                selectedFileId = '';
                                renderFileList();
                            }
                        };
                        parent.appendChild(folder);
                        if (expandedFolders.has(node.path)) renderNodes(sortNodes(node.children), parent, depth + 1);
                        return;
                    }
                    const id = node.path;
                    const f = files[id];
                    const div = document.createElement('div');
                    div.className = 'file-item' + (id === selectedFileId ? ' active' : '');
                    div.style.paddingLeft = `${10 + depth * 14}px`;
                    div.dataset.fileId = id;
                    div.tabIndex = 0;
                    div.setAttribute('role', 'button');
                    div.setAttribute('aria-label', node.name + (f.dirty ? ', perubahan belum disimpan' : ''));
                    const icon = document.createElement('span');
                    icon.className = 'file-icon';
                    if (getFileType(f) === 'asset') icon.innerHTML = '<i class="fas fa-file-image" style="color:#64748b;"></i>';
                    else if (f.language === 'html') icon.innerHTML = '<i class="fab fa-html5" style="color:#e34f26;"></i>';
                    else if (f.language === 'css') icon.innerHTML = '<i class="fab fa-css3-alt" style="color:#2965f1;"></i>';
                    else if (f.language === 'javascript') icon.innerHTML =
                        '<i class="fab fa-js" style="color:#f7df1e;"></i>';
                    else if (f.language === 'python') icon.innerHTML =
                        '<i class="fab fa-python" style="color:#3776ab;"></i>';
                    else icon.innerHTML = '<i class="fas fa-file"></i>';
                    const name = document.createElement('span');
                    name.className = 'file-name';
                    name.textContent = node.name + (f.dirty ? ' ●' : '');
                    const actions = document.createElement('span');
                    actions.className = 'file-actions';
                    const del = document.createElement('button');
                    del.className = 'delete-btn';
                    del.innerHTML = '<i class="fas fa-times"></i>';
                    del.title = 'Hapus file';
                    del.setAttribute('aria-label', 'Hapus ' + node.name);
                    del.onclick = (e) => { e.stopPropagation();
                        deleteFile(id); };
                    actions.appendChild(del);
                    div.appendChild(icon);
                    div.appendChild(name);
                    div.appendChild(actions);
                    div.onclick = () => {
                        selectedFolderPath = getFileDirectory(id).replace(/\/$/, '');
                        switchFile(id);
                    };
                    div.onkeydown = event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            switchFile(id);
                        }
                    };
                    fileList.appendChild(div);
                });
                renderNodes(roots, fileList);
            }

            function renderTabs() {
                editorTabsBar.innerHTML = '';
                const order = openFileIds.filter(id => files[id] && isCodeFile(files[id]));
                order.sort((a, b) => {
                    const ia = fileOrder.indexOf(a),
                        ib = fileOrder.indexOf(b);
                    if (ia !== -1 && ib !== -1) return ia - ib;
                    if (ia !== -1) return -1;
                    if (ib !== -1) return 1;
                    return a.localeCompare(b);
                });
                order.forEach(id => {
                    const f = files[id];
                    const keyMap = { html: 'html', css: 'css', javascript: 'js', python: 'python' };
                    const editorKey = keyMap[f.language] || 'html';
                    const btn = document.createElement('div');
                    btn.className = 'editor-tab-btn' + (id === activeFileId ? ' active' : '') + (f.dirty ? ' dirty' :
                    '');
                    btn.dataset.file = id;
                    btn.tabIndex = 0;
                    btn.setAttribute('role', 'tab');
                    btn.setAttribute('aria-selected', id === activeFileId ? 'true' : 'false');
                    btn.setAttribute('aria-label', `${id.split('/').pop()}${f.dirty ? ', perubahan belum disimpan' : ''}`);
                    btn.id = `editor-tab-${order.indexOf(id)}`;
                    btn.setAttribute('aria-controls', `${editorKey}EditorSlot`);
                    const label = document.createElement('span');
                    label.textContent = id.split('/').pop();
                    const dot = document.createElement('span');
                    dot.className = 'dirty-dot';
                    const close = document.createElement('button');
                    close.type = 'button';
                    close.className = 'close-tab';
                    close.innerHTML = '&times;';
                    close.setAttribute('aria-label', 'Close ' + id.split('/').pop());
                    close.onclick = (e) => { e.stopPropagation();
                        closeFileTab(id); };
                    btn.appendChild(label);
                    btn.appendChild(dot);
                    btn.appendChild(close);
                    btn.onclick = () => switchFile(id);
                    btn.onkeydown = event => {
                        if (event.target.closest?.('.close-tab')) return;
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            switchFile(id);
                        } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                            event.preventDefault();
                            const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
                            const nextIndex = (order.indexOf(id) + direction + order.length) % order.length;
                            const nextTab = Array.from(editorTabsBar.querySelectorAll('[data-file]'))
                                .find(tab => tab.dataset.file === order[nextIndex]);
                            nextTab?.focus();
                            switchFile(order[nextIndex]);
                        }
                    };
                    editorTabsBar.appendChild(btn);
                });
            }

            function renderFileUI() {
                renderFileList();
                renderTabs();
            }

            function scheduleFileUIRender() {
                if (uiRenderFrame) return;
                uiRenderFrame = requestAnimationFrame(() => {
                    uiRenderFrame = 0;
                    renderFileUI();
                });
            }

            // ============================================================
            //  CORE: SWITCH FILE
            // ============================================================
            function switchFile(id) {
                if (!files[id]) return;
                if (!isCodeFile(files[id])) {
                    selectedFileId = id;
                    renderFileList();
                    showToast('Asset tidak dapat dibuka di editor');
                    return;
                }
                syncAllFileState();
                if (!openFileIds.includes(id)) openFileIds.push(id);
                activeFileId = id;
                selectedFileId = id;
                const f = files[id];
                const lang = f.language;
                const keyMap = { html: 'html', css: 'css', javascript: 'js', python: 'python' };
                const editorKey = keyMap[lang] || 'html';

                const editor = editors[editorKey] || ensureEditor(editorKey);
                if (editor) {
                    editor.setModel(f.model);
                    editor.focus();
                }

                const slotMap = { html: 'htmlEditorSlot', css: 'cssEditorSlot', js: 'jsEditorSlot', python: 'pythonEditorSlot' };
                Object.keys(slotMap).forEach(k => {
                    const slot = document.getElementById(slotMap[k]);
                    slot.classList.toggle('active', k === editorKey);
                    slot.setAttribute('aria-hidden', String(k !== editorKey));
                });

                renderFileUI();
                layoutActiveEditor();
            }

            function closeFileTab(id) {
                const file = files[id];
                if (!file) return;
                const previousContent = file.content;
                const previousDirty = file.dirty;
                syncFileState(file);
                if (isFileDirty(file) && !confirm(`Tutup tab "${id}"? Perubahan belum disimpan akan tetap ada di Explorer.`)) return;
                const index = openFileIds.indexOf(id);
                const nextOpenFileIds = openFileIds.filter(fileId => fileId !== id);
                const nextActiveFileId = activeFileId === id ?
                    (nextOpenFileIds[index] || nextOpenFileIds[index - 1] || nextOpenFileIds[0] ||
                        Object.keys(files).find(fileId => fileId !== id && isCodeFile(files[fileId])) || '') : activeFileId;
                if (!saveData(files, nextActiveFileId, false, nextOpenFileIds)) {
                    file.content = previousContent;
                    file.dirty = previousDirty;
                    return;
                }
                openFileIds = nextOpenFileIds;
                activeFileId = nextActiveFileId;
                if (activeFileId) {
                    switchFile(activeFileId);
                } else {
                    ['html', 'css', 'js', 'python'].forEach(key => editors[key]?.setModel(null));
                    document.querySelectorAll('.editor-slot').forEach(slot => slot.classList.remove('active'));
                    renderFileUI();
                }
            }

            // ============================================================
            //  FILE OPERATIONS
            // ============================================================
            function createNewFile() {
                const requestedName = prompt(
                    'Nama file (contoh: pp.py):',
                    'newfile.py'
                );
                if (!requestedName) return;
                const enteredName = normalizeFileName(requestedName);
                if (enteredName.includes('/')) {
                    showToast('⚠️ Masukkan nama file saja, tanpa folder/');
                    return;
                }
                const name = selectedFolderPath ? `${selectedFolderPath}/${enteredName}` : enteredName;
                if (!validateFileName(name)) { showToast('⚠️ Nama file tidak valid'); return; }
                if (files[name]) { showToast('⚠️ File sudah ada'); return; }
                let lang = 'javascript';
                const ext = name.split('.').pop().toLowerCase();
                if (ext === 'html') lang = 'html';
                else if (ext === 'css') lang = 'css';
                else if (ext === 'js') lang = 'javascript';
                else if (ext === 'py') lang = 'python';
                else { showToast('⚠️ Ekstensi tidak didukung (.html, .css, .js, .py)'); return; }

                const model = monaco.editor.createModel('', lang);
                const newFile = { content: '', committedContent: '', language: lang, dirty: false, model: model };
                const nextFiles = { ...files, [name]: newFile };
                const nextOpenFileIds = [...openFileIds, name];
                if (!saveData(nextFiles, name, false, nextOpenFileIds)) {
                    model.dispose();
                    return;
                }
                files[name] = newFile;
                openFileIds.push(name);
                attachModelListener(model, name);
                activeFileId = name;
                renderFileList();
                renderTabs();
                switchFile(name);
                showToast('✅ File dibuat: ' + name);
            }

            async function createNewFolder() {
                if (!window.prompt) {
                    showToast('⚠️ Browser memblokir dialog nama folder');
                    return;
                }
                const defaultName = selectedFolderPath ? `${selectedFolderPath}/new-folder` : 'new-folder';
                const requestedName = prompt('Nama folder (contoh: components/ui):', defaultName);
                if (!requestedName) return;
                const enteredName = normalizeVfsPath(requestedName);
                const name = selectedFolderPath && !enteredName.includes('/') ? `${selectedFolderPath}/${enteredName}` : enteredName;
                if (!validateFolderName(name)) { showToast('⚠️ Nama folder tidak valid'); return; }
                if (folders.has(name) || Object.keys(files).some(id => id === name || id.startsWith(`${name}/`))) {
                    showToast('⚠️ Folder sudah ada');
                    return;
                }
                const parts = name.split('/');
                if (workspaceDirectoryHandle) {
                    try {
                        await createLocalFolder(name);
                    } catch (error) {
                        console.error('Create local folder failed:', error);
                        showToast('⚠️ Folder fisik tidak dapat dibuat. Periksa izin folder.');
                        return;
                    }
                }
                for (let index = 1; index <= parts.length; index += 1) folders.add(parts.slice(0, index).join('/'));
                expandedFolders.add(name);
                saveData();
                renderFileList();
                showToast(`✅ Folder dibuat: ${name}`);
            }

            const PROJECT_TEMPLATES = [
                { id: 'starter', title: 'HTML Starter', description: 'Halaman HTML sederhana dengan CSS dan JavaScript.', files: {
                    'index.html': '<main class="page"><h1>Project baru</h1><p>Mulai membangun sesuatu yang hebat.</p></main>\n<link rel="stylesheet" href="styles/style.css">\n<script src="scripts/app.js"><\\/script>',
                    'styles/style.css': 'body { font-family: system-ui, sans-serif; margin: 0; padding: 3rem; color: #1e293b; }\n.page { max-width: 42rem; margin: auto; }',
                    'scripts/app.js': 'console.log("Project siap digunakan");'
                }},
                { id: 'landing', title: 'Landing Page', description: 'Struktur landing page responsif dengan section hero dan CTA.', files: {
                    'index.html': '<main><section class="hero"><p class="eyebrow">CodePlayground</p><h1>Build something useful.</h1><p>Landing page responsif yang siap dikembangkan.</p><button id="cta">Mulai</button></section></main>\n<link rel="stylesheet" href="styles/style.css">\n<script src="scripts/app.js"><\\/script>',
                    'styles/style.css': 'body { margin: 0; font-family: system-ui, sans-serif; background: #f8fafc; color: #172033; }\n.hero { min-height: 100vh; display: grid; place-content: center; gap: 1rem; padding: 2rem; }\nbutton { padding: .75rem 1rem; cursor: pointer; }',
                    'scripts/app.js': 'document.querySelector("#cta")?.addEventListener("click", () => alert("Halo!"));'
                }},
                { id: 'python', title: 'Python Starter', description: 'File Python dasar untuk eksperimen Pyodide.', files: {
                    'index.html': '<main><h1>Python Playground</h1><p>Buka main.py lalu jalankan Python.</p></main>',
                    'main.py': 'message = "Python siap digunakan"\nprint(message)'
                }}
            ];

            function renderTemplateGrid() {
                templateGrid.innerHTML = '';
                PROJECT_TEMPLATES.forEach(template => {
                    const card = document.createElement('article');
                    card.className = 'template-card';
                    card.innerHTML = `<h3>${template.title}</h3><p>${template.description}</p>`;
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'btn btn-primary';
                    button.textContent = 'Gunakan template';
                    button.onclick = () => applyTemplate(template);
                    card.appendChild(button);
                    templateGrid.appendChild(card);
                });
            }

            function applyTemplate(template) {
                if (hasDirtyFiles() && !confirm('Perubahan saat ini akan diganti. Lanjutkan?')) return;
                Object.values(files).forEach(file => {
                    file.modelListeners?.dispose();
                    file.model?.dispose();
                });
                files = {};
                folders = new Set();
                selectedFolderPath = '';
                expandedFolders = new Set();
                folderTreeInitialized = false;
                Object.entries(template.files).forEach(([id, content]) => {
                    const language = getLanguageFromFileName(id);
                    const model = monaco.editor.createModel(content, language);
                    files[id] = { content, committedContent: content, language, type: 'code', mime: '', dirty: false, model, modelListeners: null };
                    attachModelListener(model, id);
                });
                openFileIds = Object.keys(files);
                activeFileId = openFileIds[0];
                selectedFileId = activeFileId;
                closeModal(templatesModal);
                switchFile(activeFileId);
                saveData();
                buildPreview();
                showToast(`Template ${template.title} diterapkan`);
            }

            function renameFolder() {
                const oldPath = selectedFolderPath;
                if (!oldPath) return;
                const parent = oldPath.includes('/') ? oldPath.slice(0, oldPath.lastIndexOf('/')) : '';
                const currentName = oldPath.slice(oldPath.lastIndexOf('/') + 1);
                const requestedName = prompt('Nama folder baru:', currentName);
                if (!requestedName) return;
                const enteredName = normalizeVfsPath(requestedName);
                const newPath = enteredName.includes('/') ? enteredName : (parent ? `${parent}/${enteredName}` : enteredName);
                if (!validateFolderName(newPath) || newPath === oldPath || newPath.startsWith(`${oldPath}/`)) return showToast('⚠️ Nama folder tidak valid');
                if (folders.has(newPath) || Object.keys(files).some(id => id === newPath || id.startsWith(`${newPath}/`))) return showToast('⚠️ Nama folder sudah dipakai');
                const renamedFiles = {};
                Object.entries(files).forEach(([id, file]) => {
                    const nextId = id === oldPath ? newPath : id.startsWith(`${oldPath}/`) ? `${newPath}${id.slice(oldPath.length)}` : id;
                    if (file.modelListeners && nextId !== id) file.modelListeners.dispose();
                    renamedFiles[nextId] = file;
                });
                const renamedFolders = new Set([...folders].map(folder => folder === oldPath ? newPath : folder.startsWith(`${oldPath}/`) ? `${newPath}${folder.slice(oldPath.length)}` : folder));
                files = renamedFiles;
                folders = renamedFolders;
                openFileIds = openFileIds.map(id => id.startsWith(`${oldPath}/`) ? `${newPath}${id.slice(oldPath.length)}` : id);
                if (activeFileId.startsWith(`${oldPath}/`)) activeFileId = `${newPath}${activeFileId.slice(oldPath.length)}`;
                if (selectedFileId.startsWith(`${oldPath}/`)) selectedFileId = `${newPath}${selectedFileId.slice(oldPath.length)}`;
                if (previewPageId.startsWith(`${oldPath}/`)) previewPageId = `${newPath}${previewPageId.slice(oldPath.length)}`;
                Object.keys(files).forEach(id => { if (files[id].model && !files[id].modelListeners) attachModelListener(files[id].model, id); });
                selectedFolderPath = newPath;
                expandedFolders.add(newPath);
                saveData();
                renderFileUI();
                showToast(`✅ Folder diubah: ${newPath}`);
            }

            function deleteSelectedFolder() {
                const folderPath = selectedFolderPath;
                if (!folderPath) return;
                const childFiles = Object.keys(files).filter(id => id.startsWith(`${folderPath}/`));
                if (childFiles.length >= Object.keys(files).length) return showToast('⚠️ Project harus memiliki minimal satu file');
                if (!confirm(`Hapus folder "${folderPath}" dan seluruh isinya?`)) return;
                childFiles.forEach(id => {
                    files[id].modelListeners?.dispose();
                    files[id].model?.dispose();
                    delete files[id];
                });
                folders = new Set([...folders].filter(folder => folder !== folderPath && !folder.startsWith(`${folderPath}/`)));
                openFileIds = openFileIds.filter(id => !childFiles.includes(id));
                if (childFiles.includes(activeFileId)) {
                    activeFileId = openFileIds[0] || Object.keys(files).find(id => isCodeFile(files[id])) || '';
                    selectedFileId = activeFileId;
                }
                selectedFolderPath = '';
                expandedFolders.delete(folderPath);
                saveData();
                renderFileUI();
                if (activeFileId) switchFile(activeFileId);
                showToast(`🗑️ Folder dihapus: ${folderPath}`);
            }

            function deleteFile(id) {
                if (Object.keys(files).length <= 1) { showToast('⚠️ Tidak bisa menghapus file terakhir'); return; }
                const file = files[id];
                if (!file) return;
                const previousContent = file.content;
                const previousDirty = file.dirty;
                syncFileState(file);
                const warning = isFileDirty(file) ? ' Perubahan belum disimpan akan hilang.' : '';
                const references = findReferencesToFile(id);
                const referenceWarning = references.length ? ` Direferensikan oleh: ${references.join(', ')}.` : '';
                if (!confirm(`Hapus file "${id}"?${warning}${referenceWarning}`)) return;
                const nextFiles = { ...files };
                delete nextFiles[id];
                const nextOpenFileIds = openFileIds.filter(fileId => fileId !== id);
                const nextActiveFileId = activeFileId === id ?
                    (nextOpenFileIds[0] || Object.keys(nextFiles).find(fileId => isCodeFile(nextFiles[fileId])) || '') : activeFileId;
                if (!saveData(nextFiles, nextActiveFileId, false, nextOpenFileIds)) {
                    file.content = previousContent;
                    file.dirty = previousDirty;
                    return;
                }
                if (file.model) {
                    file.model.dispose();
                }
                if (file.modelListeners) {
                    file.modelListeners.dispose();
                }
                delete files[id];
                const folderPath = getFileDirectory(id).replace(/\/$/, '');
                if (folderPath && !folders.has(folderPath) && !Object.keys(files).some(fileId => getFileDirectory(fileId).startsWith(`${folderPath}/`) || getFileDirectory(fileId).replace(/\/$/, '') === folderPath)) {
                    expandedFolders.delete(folderPath);
                }
                if (previewPageId === id) previewPageId = 'index.html';
                openFileIds = nextOpenFileIds;
                if (activeFileId === id) activeFileId = nextActiveFileId;
                if (selectedFileId === id) selectedFileId = nextActiveFileId;
                renderFileList();
                renderTabs();
                if (activeFileId) {
                    switchFile(activeFileId);
                } else {
                    ['html', 'css', 'js', 'python'].forEach(key => editors[key]?.setModel(null));
                    document.querySelectorAll('.editor-slot').forEach(slot => slot.classList.remove('active'));
                }
                showToast('🗑️ File dihapus: ' + id);
            }

            function renameFile() {
                if (selectedFolderPath) return renameFolder();
                const oldName = activeFileId;
                if (!files[oldName] || !isCodeFile(files[oldName])) return;
                const requestedName = prompt('Nama baru:', oldName);
                const newName = requestedName ? normalizeFileName(requestedName) : '';
                if (!newName || newName === oldName) return;
                if (!validateFileName(newName)) { showToast('⚠️ Nama file tidak valid'); return; }
                if (files[newName]) { showToast('⚠️ Nama sudah dipakai'); return; }
                const ext = newName.split('.').pop().toLowerCase();
                if (!['html', 'css', 'js', 'py'].includes(ext)) { showToast('⚠️ Ekstensi harus .html, .css, .js, atau .py'); return; }
                const oldExt = oldName.split('.').pop().toLowerCase();
                if (oldExt !== ext) {
                    showToast('⚠️ Rename tidak boleh mengubah jenis file');
                    return;
                }
                const langMap = { html: 'html', css: 'css', js: 'javascript', py: 'python' };
                const newLang = langMap[ext] || 'python';

                const oldModel = files[oldName].model;
                const oldContent = oldModel.getValue();
                const oldCommittedContent = files[oldName].committedContent;
                const oldLanguage = files[oldName].language;
                const oldModelListener = files[oldName].modelListeners;
                const previousContents = Object.fromEntries(Object.keys(files).map(id => [id, getCurrentContent(files[id])]));
                const previousOpenFileIds = [...openFileIds];
                const previousActiveFileId = activeFileId;
                const previousSelectedFileId = selectedFileId;
                const previousPreviewPageId = previewPageId;

                const newModel = monaco.editor.createModel(oldContent, newLang);

                files[newName] = {
                    content: oldContent,
                    committedContent: oldCommittedContent,
                    language: newLang,
                    dirty: oldContent !== oldCommittedContent,
                    model: newModel
                };
                openFileIds = openFileIds.map(fileId => fileId === oldName ? newName : fileId);
                attachModelListener(newModel, newName);
                rewriteReferences(oldName, newName);
                delete files[oldName];
                activeFileId = newName;
                if (!saveData()) {
                    Object.keys(previousContents).forEach(id => {
                        if (files[id] && getCurrentContent(files[id]) !== previousContents[id]) {
                            files[id].model.setValue(previousContents[id]);
                        }
                    });
                    if (getCurrentContent(oldModel) !== previousContents[oldName]) {
                        oldModel.setValue(previousContents[oldName]);
                    }
                    if (files[newName].modelListeners) files[newName].modelListeners.dispose();
                    files[newName].model.dispose();
                    delete files[newName];
                    files[oldName] = {
                        content: previousContents[oldName],
                        committedContent: oldCommittedContent,
                        language: oldLanguage,
                        dirty: previousContents[oldName] !== oldCommittedContent,
                        model: oldModel,
                        modelListeners: null
                    };
                    openFileIds = previousOpenFileIds;
                    activeFileId = previousActiveFileId;
                    selectedFileId = previousSelectedFileId;
                    previewPageId = previousPreviewPageId;
                    attachModelListener(oldModel, oldName);
                    renderFileUI();
                    return;
                }
                oldModel.dispose();
                if (oldModelListener) oldModelListener.dispose();
                if (previewPageId === oldName) previewPageId = newName;
                renderFileList();
                renderTabs();
                switchFile(newName);
                showToast('✏️ File diubah: ' + newName);
            }

            function deleteSelectedItem() {
                if (selectedFolderPath) {
                    deleteSelectedFolder();
                } else if (selectedFileId && files[selectedFileId]) {
                    deleteFile(selectedFileId);
                } else if (activeFileId) {
                    deleteFile(activeFileId);
                }
            }

            // ============================================================
            //  MODEL LISTENER — lifecycle yang rapi
            // ============================================================
            function attachModelListener(model, fileId) {
                // Dispose listener lama jika ada
                if (files[fileId] && files[fileId].modelListeners) {
                    try { files[fileId].modelListeners.dispose(); } catch (_) {}
                }
                const listener = model.onDidChangeContent(() => {
                    const f = files[fileId];
                    if (!f) return;
                    const wasDirty = f.dirty;
                    persistenceDirty = true;
                    persistenceFlushed = false;
                    syncFileState(f);
                    if (f.dirty !== wasDirty) {
                        scheduleFileUIRender();
                    }
                    scheduleUpdate();
                });
                if (files[fileId]) {
                    files[fileId].modelListeners = listener;
                }
            }

            // ============================================================
            //  DIRTY CHECK — fungsi yang benar
            // ============================================================
            function hasDirtyFiles() {
                return Object.keys(files).some(id => isFileDirty(files[id]));
            }

            function syncContentFromModels() {
                let changed = false;
                Object.keys(files).forEach(id => {
                    const f = files[id];
                    if (f.model) {
                        const newContent = f.model.getValue();
                        if (f.content !== newContent) changed = true;
                        syncFileState(f);
                    }
                });
                return changed;
            }

            // ============================================================
            //  SAVE ALL
            // ============================================================
            function saveAll(showToastMsg = true) {
                const saved = commitAllFiles();
                renderFileUI();
                if (saved) {
                    buildPreview();
                    if (showToastMsg) showToast('💾 Semua disimpan');
                }
                return saved;
            }

            // ============================================================
            //  SILENT AUTO-SAVE — perbaikan
            // ============================================================
            function persistDrafts() {
                if (!settings.autoSave || !editors.html || document.hidden || !persistenceDirty) return;
                saveData(files, activeFileId, false, openFileIds, false);
            }

            // ============================================================
            //  RUN CODE — perbaikan deteksi dirty
            // ============================================================
            function runCode() {
                syncAllFileState();
                buildPreview();
                setPreviewStatus('running');
                if (previewStatusTimer) clearTimeout(previewStatusTimer);
                previewStatusTimer = setTimeout(() => {
                    setPreviewStatus('live');
                    previewStatusTimer = null;
                }, 300);
                showToast(hasDirtyFiles() ? '▶️ Preview memakai versi tersimpan. Simpan untuk menerapkan draft.' : '✅ Kode dijalankan');
            }

            // ============================================================
            //  FORMAT (Monaco)
            // ============================================================
            function formatCode() {
                const f = files[activeFileId];
                if (!f) return;
                if (!isCodeFile(f) || !f.model) {
                    showToast('⚠️ Asset tidak dapat diformat');
                    return;
                }
                const keyMap = { html: 'html', css: 'css', javascript: 'js', python: 'python' };
                const editorKey = keyMap[f.language] || 'html';
                const editor = editors[editorKey];
                if (!editor) { showToast('⚠️ Editor tidak tersedia'); return; }
                if (editor.getModel() !== f.model) editor.setModel(f.model);
                const targetFileId = activeFileId;
                const targetModel = f.model;
                const action = editor.getAction('editor.action.formatDocument');
                if (!action) { showToast('⚠️ Format tidak didukung untuk bahasa ini'); return; }
                action.run().then(() => {
                    if (activeFileId !== targetFileId || editor.getModel() !== targetModel) return;
                    const newContent = targetModel.getValue();
                    if (f.content !== newContent) {
                        syncFileState(f);
                        renderFileList();
                        renderTabs();
                        showToast('✨ Format diterapkan (Monaco)');
                    } else {
                        showToast('ℹ️ Tidak ada perubahan');
                    }
                }).catch(() => showToast('⚠️ Gagal format'));
            }

            // ============================================================
            //  UPLOAD
            // ============================================================
            function uploadFile() { fileInput.click(); }
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > MAX_FILE_SIZE) {
                    showToast('⚠️ Ukuran file maksimum adalah 2 MB');
                    fileInput.value = '';
                    return;
                }
                const ext = file.name.split('.').pop().toLowerCase();
                const isCode = ['html', 'css', 'js', 'py'].includes(ext);
                const isPythonRequirements = file.name.toLowerCase() === 'requirements.txt';
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const content = ev.target.result;
                    const name = normalizeFileName(file.name);
                    if (!validateFileName(name)) {
                        showToast('⚠️ Nama file tidak valid');
                        fileInput.value = '';
                        return;
                    }
                    const lang = getLanguageFromFileName(name);
                    const type = isCode ? 'code' : 'asset';

                    const previousFile = files[name];
                    if (previousFile) {
                        if (!confirm(`File "${name}" sudah ada. Timpa?`)) {
                            fileInput.value = '';
                            return;
                        }
                    }

                    const model = isCode ? monaco.editor.createModel(content, lang) : null;
                    const uploadedFile = { content, committedContent: content, language: lang, type, mime: file.type || 'application/octet-stream', dirty: false, model: model };
                    const nextFiles = { ...files, [name]: uploadedFile };
                    const nextOpenFileIds = isCode ? (openFileIds.includes(name) ? openFileIds : [...openFileIds, name]) : openFileIds;
                    if (!saveData(nextFiles, isCode ? name : activeFileId, false, nextOpenFileIds)) {
                        if (model) model.dispose();
                        fileInput.value = '';
                        return;
                    }
                    if (previousFile?.modelListeners) previousFile.modelListeners.dispose();
                    if (previousFile?.model) previousFile.model.dispose();
                    files[name] = uploadedFile;
                    if (isCode && !openFileIds.includes(name)) openFileIds.push(name);
                    if (model) attachModelListener(model, name);
                    if (isCode) activeFileId = name;
                    renderFileList();
                    renderTabs();
                    switchFile(name);
                    showToast(`📄 ${name} dimuat`);
                    fileInput.value = '';
                };
                const resetUpload = message => {
                    fileInput.value = '';
                    if (message) showToast(message);
                };
                reader.onerror = () => resetUpload('⚠️ Gagal membaca file');
                reader.onabort = () => resetUpload('⚠️ Pembacaan file dibatalkan');
                if (isCode || isPythonRequirements) reader.readAsText(file);
                else reader.readAsDataURL(file);
            });

            // ============================================================
            //  THEME
            // ============================================================
            function setTheme(mode) {
                theme = mode;
                document.documentElement.setAttribute('data-theme', mode);
                const icon = themeBtn.querySelector('i');
                icon.className = mode === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                const nextMode = mode === 'dark' ? 'light' : 'dark';
                themeBtn.title = `Switch to ${nextMode} mode`;
                themeBtn.setAttribute('aria-label', `Switch to ${nextMode} mode`);
                themeBtn.setAttribute('aria-pressed', String(mode === 'dark'));
                if (editors.html) {
                    monaco.editor.setTheme(mode === 'dark' ? 'vs-dark' : 'vs');
                }
                try { localStorage.setItem(THEME_KEY, mode); } catch (_) {}
            }

            // ============================================================
            //  LAYOUT
            // ============================================================
            function toggleLayout() {
                if (isMobileViewport()) {
                    showToast('Layout vertikal digunakan pada layar kecil');
                    return;
                }
                layoutMode = layoutMode === 'horizontal' ? 'vertical' : 'horizontal';
                mainPanel.classList.toggle('vertical', layoutMode === 'vertical');
                const icon = layoutBtn.querySelector('i');
                icon.className = layoutMode === 'horizontal' ? 'fas fa-arrows-alt-h' : 'fas fa-arrows-alt-v';
                try { localStorage.setItem(LAYOUT_KEY, layoutMode); } catch (_) {}
                setTimeout(() => {
                    if (splitInstance) { try { splitInstance.destroy(); } catch (_) {} }
                    splitInstance = null;
                    document.querySelectorAll('.gutter').forEach(g => g.remove());
                    initSplit();
                    layoutActiveEditor();
                }, 50);
                showToast(layoutMode === 'horizontal' ? '↔️ Horizontal' : '↕️ Vertikal');
            }

            // ============================================================
            //  SPLIT
            // ============================================================
            function initSplit() {
                const isMobile = isMobileViewport();
                if (isMobile) {
                    if (splitInstance) { try { splitInstance.destroy(); } catch (_) {} }
                    splitInstance = null;
                    mainPanel.classList.add('vertical');
                    layoutBtn.querySelector('i').className = 'fas fa-arrows-alt-v';
                    layoutBtn.title = 'Layout vertikal (layar kecil)';
                    return;
                }
                if (typeof window.Split !== 'function') {
                    if (!splitLoadPromise) {
                        splitLoadPromise = loadExternalAsset(EXTERNAL_ASSETS.split).finally(() => {
                            splitLoadPromise = null;
                        });
                    }
                    splitLoadPromise.then(() => {
                        if (!isMobileViewport() && typeof window.Split === 'function') initSplit();
                    }).catch(() => {
                        mainPanel.classList.toggle('vertical', layoutMode === 'vertical');
                        layoutBtn.title = 'Layout otomatis';
                    });
                    return;
                }
                if (document.getElementById('editorArea') && document.getElementById('previewArea')) {
                    try {
                        if (splitInstance) { try { splitInstance.destroy(); } catch (_) {} }
                        const dir = layoutMode === 'horizontal' ? 'horizontal' : 'vertical';
                        splitInstance = window.Split(['#editorArea', '#previewArea'], {
                            sizes: [55, 45],
                            minSize: [200, 150],
                            gutterSize: 5,
                            direction: dir,
                            cursor: dir === 'horizontal' ? 'col-resize' : 'row-resize',
                            onDragEnd: layoutActiveEditor
                        });
                        mainPanel.classList.toggle('vertical', layoutMode === 'vertical');
                        layoutBtn.querySelector('i').className = layoutMode === 'horizontal' ? 'fas fa-arrows-alt-h' : 'fas fa-arrows-alt-v';
                        layoutBtn.title = 'Rotasi layout';
                    } catch (error) {
                        splitInstance = null;
                        mainPanel.classList.toggle('vertical', layoutMode === 'vertical');
                        layoutBtn.title = 'Layout otomatis';
                        console.warn('Split layout unavailable:', error);
                    }
                }
            }

            let editorLayoutFrame = 0;
            function isMobileViewport() {
                return window.matchMedia ? window.matchMedia('(max-width: 820px)').matches : window.innerWidth <= 820;
            }

            function layoutActiveEditor() {
                if (editorLayoutFrame) return;
                editorLayoutFrame = requestAnimationFrame(() => {
                    editorLayoutFrame = 0;
                    const keyMap = { html: 'html', css: 'css', javascript: 'js', python: 'python' };
                    const active = files[activeFileId];
                    const editor = active && editors[keyMap[active.language]];
                    editor?.layout();
                });
            }

            function scheduleIdleTask(task, timeout = 1000) {
                setTimeout(() => {
                    if (typeof window.requestIdleCallback === 'function') {
                        window.requestIdleCallback(task, { timeout: 1000 });
                    } else {
                        task();
                    }
                }, timeout);
            }

            function loadExternalAsset(asset) {
                if (externalAssetPromises.has(asset.src)) return externalAssetPromises.get(asset.src);
                const promise = new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = asset.src;
                    script.integrity = asset.integrity;
                    script.crossOrigin = 'anonymous';
                    script.referrerPolicy = 'no-referrer';
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error(`Gagal memuat dependency: ${asset.src}`));
                    document.head.appendChild(script);
                });
                externalAssetPromises.set(asset.src, promise);
                return promise;
            }

            function loadExternalStyle(asset) {
                const key = `style:${asset.href}`;
                if (externalAssetPromises.has(key)) return externalAssetPromises.get(key);
                const promise = new Promise((resolve, reject) => {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = asset.href;
                    link.integrity = asset.integrity;
                    link.crossOrigin = 'anonymous';
                    link.referrerPolicy = 'no-referrer';
                    link.onload = () => resolve();
                    link.onerror = () => reject(new Error(`Gagal memuat stylesheet: ${asset.href}`));
                    document.head.appendChild(link);
                });
                externalAssetPromises.set(key, promise);
                return promise;
            }

            function loadIconStylesheet() {
                return loadExternalStyle(EXTERNAL_ASSETS.iconStyle).catch(error => {
                    console.warn('Icon stylesheet unavailable:', error);
                });
            }

            // ============================================================
            //  COMMAND PALETTE
            // ============================================================
            const commands = [
                { id: 'run', label: 'Jalankan kode', icon: 'fa-play', shortcut: 'Ctrl+Enter', action: runCode },
                { id: 'runpython', label: 'Jalankan Python', icon: 'fa-python', shortcut: '', action: runPythonCode },
                { id: 'save', label: 'Simpan semua', icon: 'fa-save', shortcut: 'Ctrl+S', action: () => saveAll(true) },
                { id: 'format', label: 'Format kode (Monaco)', icon: 'fa-magic', shortcut: '', action: formatCode },
                { id: 'newfile', label: 'Buat file baru', icon: 'fa-plus', shortcut: '', action: createNewFile },
                { id: 'rename', label: 'Ubah nama file', icon: 'fa-pen', shortcut: '', action: renameFile },
                { id: 'toggleconsole', label: 'Toggle konsol', icon: 'fa-terminal', shortcut: '', action: toggleConsole },
                { id: 'togglelayout', label: 'Rotasi layout', icon: 'fa-arrows-alt-h', shortcut: '', action: toggleLayout },
                { id: 'settings', label: 'Buka pengaturan', icon: 'fa-cog', shortcut: '', action: () => openModal(settingsModal, fontSizeInput) },
            ];

            function openCmdPalette() {
                cmdPalette.classList.toggle('open');
                if (cmdPalette.classList.contains('open')) {
                    cmdPalette.setAttribute('aria-hidden', 'false');
                    cmdInput.value = '';
                    cmdInput.focus();
                    renderCmdList('');
                } else {
                    cmdPalette.setAttribute('aria-hidden', 'true');
                }
            }

            function renderCmdList(filter) {
                cmdList.innerHTML = '';
                const items = commands.filter(c => c.label.toLowerCase().includes(filter.toLowerCase()));
                items.forEach(c => {
                    const div = document.createElement('button');
                    div.type = 'button';
                    div.className = 'cmd-item';
                    div.innerHTML =
                        `<i class="fas ${c.icon}"></i> ${c.label}${c.shortcut ? '<span class="shortcut">'+c.shortcut+'</span>' : ''}`;
                    div.onclick = () => { cmdPalette.classList.remove('open');
                        cmdPalette.setAttribute('aria-hidden', 'true');
                        c.action(); };
                    cmdList.appendChild(div);
                });
            }

            cmdInput.addEventListener('input', () => renderCmdList(cmdInput.value));
            cmdInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    cmdPalette.classList.remove('open');
                    cmdPalette.setAttribute('aria-hidden', 'true');
                    cmdBtn.focus();
                }
                if (e.key === 'Enter') {
                    const first = cmdList.querySelector('.cmd-item');
                    if (first) { cmdPalette.classList.remove('open');
                        cmdPalette.setAttribute('aria-hidden', 'true');
                        first.click(); }
                }
            });

            // ============================================================
            //  TOAST
            // ============================================================
            function showToast(msg) {
                if (toastTimer) { clearTimeout(toastTimer);
                    toast.classList.remove('show'); }
                toast.textContent = msg;
                toast.classList.add('show');
                toastTimer = setTimeout(() => { toast.classList.remove('show');
                    toastTimer = null; }, 2000);
            }

            function openModal(modal, initialFocus) {
                modalTrigger = document.activeElement;
                modal.classList.add('open');
                modal.setAttribute('aria-hidden', 'false');
                requestAnimationFrame(() => initialFocus && initialFocus.focus());
            }

            function closeModal(modal) {
                modal.classList.remove('open');
                modal.setAttribute('aria-hidden', 'true');
                if (modalTrigger && typeof modalTrigger.focus === 'function') modalTrigger.focus();
                modalTrigger = null;
            }

            // ============================================================
            //  MONACO INIT
            // ============================================================
            function initMonaco() {
                return Promise.all([
                    loadExternalStyle(EXTERNAL_ASSETS.monacoStyle),
                    loadExternalAsset(EXTERNAL_ASSETS.monacoLoader)
                ]).then(() => new Promise((resolve, reject) => {
                    if (typeof monaco !== 'undefined') {
                        resolve(createEditors());
                        return;
                    }
                    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' } });
                    let settled = false;
                    const timeout = setTimeout(() => {
                        if (!settled) {
                            settled = true;
                            reject(new Error('Monaco load timeout'));
                        }
                    }, 15000);
                    require(['vs/editor/editor.main'], () => {
                        if (settled) return;
                        settled = true;
                        clearTimeout(timeout);
                        resolve(createEditors());
                    }, error => {
                        if (settled) return;
                        settled = true;
                        clearTimeout(timeout);
                        reject(error instanceof Error ? error : new Error('Monaco load failed'));
                    });
                }));
            }

            function createEditors() {
                const compactDevice = window.matchMedia?.('(max-width: 820px), (pointer: coarse)').matches === true;
                editorOptions = {
                    automaticLayout: false,
                    theme: theme === 'dark' ? 'vs-dark' : 'vs',
                    fontSize: settings.fontSize,
                    fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                    minimap: { enabled: settings.minimap && !compactDevice },
                    lineNumbers: settings.lineNumbers,
                    tabSize: settings.tabSize,
                    wordWrap: settings.wordWrap,
                    bracketPairColorization: { enabled: true },
                    autoClosingBrackets: 'always',
                    autoClosingQuotes: 'always',
                    formatOnType: true
                };
                editors = {};
                ensureEditor('html');
                return editors;
            }

            function ensureEditor(editorKey) {
                if (editors[editorKey]) return editors[editorKey];
                const slotId = { html: 'htmlEditorSlot', css: 'cssEditorSlot', js: 'jsEditorSlot', python: 'pythonEditorSlot' }[editorKey];
                const slot = document.getElementById(slotId);
                if (!slot || !editorOptions) return null;
                editors[editorKey] = monaco.editor.create(slot, { model: null, ...editorOptions });
                return editors[editorKey];
            }

            // ============================================================
            //  INIT VFS
            // ============================================================
            function initVFS(savedData = loadData()) {
                const saved = savedData;
                folders = new Set(saved?.folders || []);
                if (saved && saved.files && Object.keys(saved.files).length > 0) {
                    files = {};
                    Object.keys(saved.files).forEach(id => {
                        const f = saved.files[id];
                        const type = f.type === 'asset' ? 'asset' : 'code';
                        const lang = type === 'asset' ? 'asset' : (f.language || getLanguageFromFileName(id));
                        const model = type === 'code' ? monaco.editor.createModel(f.content || '', lang) : null;
                        files[id] = {
                            content: f.content || '',
                            committedContent: typeof f.committedContent === 'string' ? f.committedContent : (f.content || ''),
                            language: lang,
                            type,
                            mime: type === 'asset' ? (f.mime || 'application/octet-stream') : '',
                            dirty: false,
                            model: model,
                            modelListeners: null
                        };
                        syncFileState(files[id]);
                        if (model) attachModelListener(model, id);
                    });
                    const savedOpenFileIds = Array.isArray(saved.openFileIds) ?
                        saved.openFileIds.filter(id => files[id] && isCodeFile(files[id])) : Object.keys(files).filter(id => isCodeFile(files[id]));
                    openFileIds = savedOpenFileIds;
                    activeFileId = savedOpenFileIds.includes(saved.activeFileId) ? saved.activeFileId : (savedOpenFileIds[0] || '');
                    selectedFileId = activeFileId;
                } else {
                    const htmlModel = monaco.editor.createModel(DEFAULT_HTML, 'html');
                    const cssModel = monaco.editor.createModel(DEFAULT_CSS, 'css');
                    const jsModel = monaco.editor.createModel(DEFAULT_JS, 'javascript');

                    files = {
                        'index.html': { content: DEFAULT_HTML, committedContent: DEFAULT_HTML, language: 'html', dirty: false, model: htmlModel,
                            modelListeners: null },
                        'style.css': { content: DEFAULT_CSS, committedContent: DEFAULT_CSS, language: 'css', dirty: false, model: cssModel,
                            modelListeners: null },
                        'script.js': { content: DEFAULT_JS, committedContent: DEFAULT_JS, language: 'javascript', dirty: false, model: jsModel,
                            modelListeners: null }
                    };
                    attachModelListener(htmlModel, 'index.html');
                    attachModelListener(cssModel, 'style.css');
                    attachModelListener(jsModel, 'script.js');
                    activeFileId = 'index.html';
                    selectedFileId = activeFileId;
                    openFileIds = Object.keys(files);
                }

                if (activeFileId && (!files[activeFileId] || !isCodeFile(files[activeFileId]))) activeFileId = openFileIds[0] || '';
                if (!openFileIds.length && !saved?.openFileIds && activeFileId) openFileIds = [activeFileId];
                if (activeFileId && !openFileIds.includes(activeFileId)) activeFileId = openFileIds[0] || '';

                // Set model ke editor
                Object.keys(files).forEach(id => {
                    const f = files[id];
                        if (!isCodeFile(f)) return;
                    const keyMap = { html: 'html', css: 'css', javascript: 'js', python: 'python' };
                    const editorKey = keyMap[f.language] || 'html';
                    if (editors[editorKey] && editors[editorKey].getModel() === null) {
                        editors[editorKey].setModel(f.model);
                    }
                });

                // Pastikan semua editor punya model
                ['html', 'css', 'js', 'python'].forEach(key => {
                    if (editors[key] && editors[key].getModel() === null) {
                        const found = Object.keys(files).find(id => {
                            const km = { html: 'html', css: 'css', javascript: 'js', python: 'python' };
                            return km[files[id].language] === key;
                        });
                        if (found) {
                            editors[key].setModel(files[found].model);
                        } else {
                        }
                    }
                });

                renderFileList();
                renderTabs();
                const active = files[activeFileId];
                if (active) {
                    const keyMap = { html: 'html', css: 'css', javascript: 'js', python: 'python' };
                    const editorKey = keyMap[active.language] || 'html';
                    const activeEditor = editors[editorKey] || ensureEditor(editorKey);
                    if (activeEditor) {
                        activeEditor.setModel(active.model);
                    }
                    const slotMap = { html: 'htmlEditorSlot', css: 'cssEditorSlot', js: 'jsEditorSlot', python: 'pythonEditorSlot' };
                    Object.keys(slotMap).forEach(k => {
                        const slot = document.getElementById(slotMap[k]);
                        slot.classList.toggle('active', k === editorKey);
                        slot.setAttribute('aria-hidden', String(k !== editorKey));
                    });
                } else {
                    ['html', 'css', 'js', 'python'].forEach(key => editors[key]?.setModel(null));
                    document.querySelectorAll('.editor-slot').forEach(slot => slot.classList.remove('active'));
                }

                setTimeout(layoutActiveEditor, 100);
                scheduleIdleTask(buildPreview, 800);
            }

            // ============================================================
            //  RESIZE
            // ============================================================
            let resizeTimer = null;
            window.addEventListener('resize', () => {
                if (resizeTimer) clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    const isMobile = isMobileViewport();
                    if (isMobile) {
                        if (splitInstance) { try { splitInstance.destroy(); } catch (_) {} }
                        splitInstance = null;
                        mainPanel.classList.add('vertical');
                        layoutBtn.querySelector('i').className = 'fas fa-arrows-alt-v';
                        layoutBtn.title = 'Layout vertikal (layar kecil)';
                    } else {
                        if (!splitInstance) initSplit();
                        mainPanel.classList.toggle('vertical', layoutMode === 'vertical');
                        layoutBtn.querySelector('i').className = layoutMode === 'horizontal' ? 'fas fa-arrows-alt-h' : 'fas fa-arrows-alt-v';
                        layoutBtn.title = 'Rotasi layout';
                    }
                    applySettingsToEditors();
                    layoutActiveEditor();
                    resizeTimer = null;
                }, 200);
            });

            // ============================================================
            //  SIDEBAR
            // ============================================================
            let sidebarOpen = true;

            function toggleSidebar() {
                sidebarOpen = !sidebarOpen;
                sidebar.classList.toggle('collapsed', !sidebarOpen);
                mobileSidebarBtn.setAttribute('aria-label', sidebarOpen ? 'Close explorer' : 'Open explorer');
                mobileSidebarBtn.setAttribute('aria-expanded', String(sidebarOpen));
                mobileSidebarBtn.title = sidebarOpen ? 'Close explorer' : 'Open explorer';
                toggleSidebarBtn.innerHTML = sidebarOpen ? '<i class="fas fa-chevron-left"></i>' :
                    '<i class="fas fa-chevron-right"></i>';
                setTimeout(layoutActiveEditor, 100);
            }

            // ============================================================
            //  BEFOREUNLOAD
            // ============================================================
            function flushPersistence() {
                if (!settings.autoSave || persistenceFlushed || !editors.html) return;
                syncAllFileState();
                persistenceFlushed = saveData(files, activeFileId, false, openFileIds, false);
            }
            window.addEventListener('beforeunload', flushPersistence);
            window.addEventListener('pagehide', () => {
                flushPersistence();
                if (persistenceInterval) {
                    clearInterval(persistenceInterval);
                    persistenceInterval = null;
                }
                if (window.__codeplaygroundWorkerUrl) {
                    URL.revokeObjectURL(window.__codeplaygroundWorkerUrl);
                    window.__codeplaygroundWorkerUrl = null;
                }
                revokeNativeModuleUrls();
            });

            // ============================================================
            //  EVENT BINDING
            // ============================================================
            runBtn.addEventListener('click', runCode);
            runPythonBtn?.addEventListener('click', runPythonCode);
            saveBtn.addEventListener('click', () => saveAll(true));
            downloadBtn.addEventListener('click', downloadProject);
            uploadBtn.addEventListener('click', uploadFile);
            formatBtn.addEventListener('click', formatCode);
            cdnBtn.addEventListener('click', () => openModal(cdnModal, cdnInput));
            cmdBtn.addEventListener('click', openCmdPalette);
            settingsBtn.addEventListener('click', () => openModal(settingsModal, fontSizeInput));
            layoutBtn.addEventListener('click', toggleLayout);
            themeBtn.addEventListener('click', () => setTheme(theme === 'light' ? 'dark' : 'light'));
            newFileBtn.addEventListener('click', createNewFile);
            newFolderBtn?.addEventListener('click', event => {
                event.preventDefault();
                createNewFolder();
            });
            openWorkspaceBtn?.addEventListener('click', connectLocalWorkspace);
            renameFileBtn.addEventListener('click', renameFile);
            deleteItemBtn?.addEventListener('click', deleteSelectedItem);
            toggleSidebarBtn.addEventListener('click', toggleSidebar);
            mobileSidebarBtn.addEventListener('click', toggleSidebar);
            clearConsoleBtn.addEventListener('click', clearConsole);
            toggleConsoleBtn.addEventListener('click', toggleConsole);
            templatesBtn.addEventListener('click', () => openModal(templatesModal, closeTemplatesModal));
            closeTemplatesModal.addEventListener('click', () => closeModal(templatesModal));
            templatesModal.addEventListener('click', e => { if (e.target === templatesModal) closeModal(templatesModal); });
            dismissErrorBtn.addEventListener('click', hidePreviewError);
            openErrorFileBtn.addEventListener('click', () => {
                if (lastPreviewError?.file && files[lastPreviewError.file]) switchFile(lastPreviewError.file);
                hidePreviewError();
            });
            consoleFilter.addEventListener('input', () => {
                consoleFilterValue = consoleFilter.value.trim().toLowerCase();
                renderConsole();
            });
            copyConsoleBtn.addEventListener('click', async () => {
                await navigator.clipboard?.writeText(consoleEntries.map(e => `[${e.level}] ${e.message}`).join('\n'));
                showToast('Console disalin');
            });
            downloadConsoleBtn.addEventListener('click', () => {
                const blob = new Blob([consoleEntries.map(e => `[${e.timestamp}] [${e.level}] ${e.message}`).join('\n')], { type: 'text/plain' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob); link.download = 'browser-console.txt'; link.click();
                setTimeout(() => URL.revokeObjectURL(link.href), 1000);
            });

            // CDN Modal
            closeCdnModal.addEventListener('click', () => closeModal(cdnModal));
            cdnModal.addEventListener('click', (e) => { if (e.target === cdnModal) closeModal(cdnModal); });
            addCdnBtn.addEventListener('click', () => { const u = cdnInput.value.trim(); if (addCdnUrl(u)) cdnInput.value =
                ''; });
            cdnInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addCdnBtn.click(); });

            // Settings Modal
                closeSettingsModal.addEventListener('click', () => closeModal(settingsModal));
                settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeModal(settingsModal); });
            fontSizeInput.addEventListener('change', () => { settings.fontSize = clampNumber(fontSizeInput.value, 10, 28, 14);
                fontSizeInput.value = settings.fontSize;
                saveSettings(); });
            tabSizeInput.addEventListener('change', () => { settings.tabSize = clampNumber(tabSizeInput.value, 1, 8, 2);
                tabSizeInput.value = settings.tabSize;
                saveSettings(); });
            wordWrapSelect.addEventListener('change', () => { settings.wordWrap = wordWrapSelect.value;
                saveSettings(); });
            lineNumbersSelect.addEventListener('change', () => { settings.lineNumbers = lineNumbersSelect.value;
                saveSettings(); });
            minimapSelect.addEventListener('change', () => { settings.minimap = minimapSelect.value === 'true';
                saveSettings(); });
            autoSaveCheck.addEventListener('change', () => { settings.autoSave = autoSaveCheck.checked;
                saveSettings(); });
            refreshDelayRange.addEventListener('input', function() {
                refreshDelayValue.textContent = this.value + 'ms';
                settings.refreshDelay = clampNumber(this.value, 100, 800, 350);
                saveSettings();
            });
            // Keyboard
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault();
                    runCode(); }
                if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault();
                    saveAll(true); }
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') { e.preventDefault();
                    openCmdPalette(); }
                const activeModal = [cdnModal, settingsModal, templatesModal].find(modal => modal.classList.contains('open'));
                if (activeModal && e.key === 'Tab') {
                    const focusable = activeModal.querySelectorAll('button, input, select, [tabindex]:not([tabindex="-1"])');
                    if (focusable.length === 0) return;
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];
                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
                if (e.key === 'Escape') {
                    cmdPalette.classList.remove('open');
                    cmdPalette.setAttribute('aria-hidden', 'true');
                    if (cdnModal.classList.contains('open')) closeModal(cdnModal);
                    if (settingsModal.classList.contains('open')) closeModal(settingsModal);
                    if (templatesModal.classList.contains('open')) closeModal(templatesModal);
                }
            });

            // ============================================================
            //  INIT
            // ============================================================
            async function init() {
                const updateHeaderHeight = () => {
                    document.documentElement.style.setProperty('--header-height', `${document.querySelector('.header').getBoundingClientRect().height}px`);
                };
                updateHeaderHeight();
                if (window.ResizeObserver) new ResizeObserver(updateHeaderHeight).observe(document.querySelector('.header'));
                loadSettings();
                loadCdn();
                renderTemplateGrid();
                const indexedProject = await loadFromIndexedDB();
                try {
                    await initMonaco();
                } catch (err) {
                    console.error('Monaco initialization failed:', err);
                    mainPanel.setAttribute('aria-busy', 'false');
                    appLoading.textContent = 'Editor gagal dimuat. Periksa koneksi lalu muat ulang.';
                    showToast('⚠️ Editor gagal dimuat. Periksa koneksi CDN lalu muat ulang.');
                    return;
                }

                try {
                    const savedLayout = localStorage.getItem(LAYOUT_KEY);
                    if (savedLayout === 'vertical' || savedLayout === 'horizontal') {
                        layoutMode = savedLayout;
                        if (layoutMode === 'vertical') {
                            mainPanel.classList.add('vertical');
                            layoutBtn.querySelector('i').className = 'fas fa-arrows-alt-v';
                        }
                    }
                } catch (_) {}

                initVFS(indexedProject || loadData());
                scheduleIdleTask(() => saveData(), 1200);
                applySettingsToEditors();
                initSplit();
                appLoading.hidden = true;
                mainPanel.setAttribute('aria-busy', 'false');

                try {
                    const savedTheme = localStorage.getItem(THEME_KEY);
                    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme);
                    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme(
                        'dark');
                } catch (_) {}

                if (isMobileViewport()) {
                    sidebar.classList.add('collapsed');
                    sidebarOpen = false;
                    mobileSidebarBtn.setAttribute('aria-expanded', 'false');
                    mobileSidebarBtn.setAttribute('aria-label', 'Buka explorer');
                    toggleSidebarBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
                }

                setTimeout(openConsole, 400);

                // AUTO-SAVE SILENT setiap 15 detik
                persistenceInterval = setInterval(persistDrafts, 15000);

                console.log('🚀 CodePlayground Pro siap! (Semua perbaikan selesai)');
            }

            function startAfterFirstPaint() {
                requestAnimationFrame(() => {
                    appLoading.textContent = 'Klik untuk memuat editor...';
                    scheduleIdleTask(loadIconStylesheet, 1000);
                    const startInitialization = () => {
                        if (appInitStarted) return;
                        appInitStarted = true;
                        init();
                    };
                    document.addEventListener('pointerdown', startInitialization, { once: true, capture: true });
                    document.addEventListener('keydown', startInitialization, { once: true, capture: true });
                    document.addEventListener('focusin', startInitialization, { once: true, capture: true });
                });
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', startAfterFirstPaint, { once: true });
            } else {
                startAfterFirstPaint();
            }

            window.addEventListener('beforeunload', () => {
                if (updateTimer) clearTimeout(updateTimer);
            });

        })();
