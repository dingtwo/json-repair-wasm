// Initialize WebAssembly
const go = new Go();
let wasmLoaded = false;

// Language support
let currentLanguage = 'en';

// Translation data
const translations = {
    en: {
        'title': 'JSON Repair Online',
        'subtitle': 'Fix malformed JSON online — fast, private, and accurate. Runs fully in your browser with no uploads.',
        'loading': 'Loading WebAssembly module...',
        'main-heading': 'Fix malformed JSON online, safely',
        'main-description': 'Use this free <strong>JSON repair online</strong> tool to automatically correct common JSON syntax errors. It can handle quotes, commas, brackets, and escape sequences. Your data never leaves your device.',
        'input-label': 'Malformed JSON Input:',
        'escape-help': '<strong>Escape Processing Instructions:</strong><br>• <strong>Parse Escape Sequences</strong>: Convert escape sequences like <code>\\n</code>, <code>\\t</code> to actual newlines, tabs, etc.<br>• <strong>Unescape</strong>: Handle escaped characters like <code>\\"</code> → <code>"</code><br>• <strong>Advanced Unescape</strong>: For JSON strings copied from other sources with surrounding quotes<br>• Recommended order: "Parse Escape Sequences" first, then "Repair JSON"',
        'input-placeholder': 'Enter your malformed JSON here...',
        'btn-parse-escape': 'Parse Escape Sequences',
        'btn-parse-escape-title': 'Convert \\n, \\t escape sequences to actual characters',
        'btn-unescape': 'Unescape',
        'btn-unescape-title': 'Handle common escape characters like \\", \\n, \\t, etc.',
        'btn-advanced-unescape': 'Advanced Unescape',
        'btn-advanced-unescape-title': 'Advanced escape processing for JSON strings copied with surrounding quotes',
        'btn-repair': 'Repair JSON',
        'btn-must-repair': 'Must Repair JSON',
        'output-label': 'Repaired JSON Output:',
        'btn-copy': 'Copy to Clipboard',
        'faq-heading': 'FAQs about JSON Repair Online',
        'faq-q1': 'What is JSON Repair Online?',
        'faq-a1': 'It\'s a browser‑based tool that automatically fixes malformed JSON quickly and privately.',
        'faq-q2': 'Is it private?',
        'faq-a2': 'Yes. Everything runs locally in your browser via WebAssembly; nothing is uploaded.',
        'faq-q3': 'What errors can it fix?',
        'faq-a3': 'Missing quotes, extra commas, unbalanced brackets, and bad escape sequences, among others.'
    },
    zh: {
        'title': 'JSON 在线修复工具',
        'subtitle': '在线修复格式错误的 JSON — 快速、私密、准确。完全在浏览器中运行，无需上传。',
        'loading': '正在加载 WebAssembly 模块...',
        'main-heading': '安全地在线修复格式错误的 JSON',
        'main-description': '使用这个免费的 <strong>JSON 在线修复</strong> 工具自动纠正常见的 JSON 语法错误。它可以处理引号、逗号、括号和转义序列。您的数据不会离开您的设备。',
        'input-label': '格式错误的 JSON 输入：',
        'escape-help': '<strong>转义处理说明：</strong><br>• <strong>解析转义序列</strong>：将 <code>\\n</code>, <code>\\t</code> 等转义序列转换为实际的换行符、制表符等<br>• <strong>去转义</strong>：处理被转义的引号等字符，如 <code>\\"</code> → <code>"</code><br>• <strong>高级去转义</strong>：适用于从其他地方复制的引号包围的JSON字符串<br>• 推荐使用顺序：先"解析转义序列"，再"修复JSON"',
        'input-placeholder': '在此输入您的格式错误的 JSON...',
        'btn-parse-escape': '解析转义序列',
        'btn-parse-escape-title': '将 \\n, \\t 等转义序列转换为实际字符',
        'btn-unescape': '去转义',
        'btn-unescape-title': '处理常见转义字符如 \\", \\n, \\t 等',
        'btn-advanced-unescape': '高级去转义',
        'btn-advanced-unescape-title': '高级转义处理，适用于从引号包围的JSON字符串',
        'btn-repair': '修复 JSON',
        'btn-must-repair': '强制修复 JSON',
        'output-label': '修复后的 JSON 输出：',
        'btn-copy': '复制到剪贴板',
        'faq-heading': 'JSON 在线修复工具常见问题',
        'faq-q1': '什么是 JSON 在线修复工具？',
        'faq-a1': '这是一个基于浏览器的工具，可以快速、私密地自动修复格式错误的 JSON。',
        'faq-q2': '它是私密的吗？',
        'faq-a2': '是的。所有操作都通过 WebAssembly 在您的浏览器中本地运行；不会上传任何内容。',
        'faq-q3': '它可以修复哪些错误？',
        'faq-a3': '缺失的引号、多余的逗号、不平衡的括号和错误的转义序列等。'
    }
};

// Load and initialize the WASM module
async function loadWasm() {
    try {
        const response = await fetch('./jsonrepair.wasm');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        const result = await WebAssembly.instantiate(buffer, go.importObject);

        go.run(result.instance);

        // Wait for functions to be available
        await waitForWasm();

        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        wasmLoaded = true;

        showMessage('WebAssembly module loaded successfully!', 'success');
    } catch (error) {
        console.error('Failed to load WASM:', error);
        document.getElementById('loading').innerHTML =
            `Failed to load WebAssembly: ${error.message}`;
    }
}

// Wait for WASM functions to be available
function waitForWasm() {
    return new Promise((resolve) => {
        const check = () => {
            if (typeof window.repairJSON === 'function' && typeof window.mustRepairJSON === 'function') {
                resolve();
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}

// Repair JSON with error handling
function handleRepairJSON() {
    if (!wasmLoaded) {
        showMessage('WebAssembly not loaded yet. Please wait...', 'error');
        return;
    }

    const input = document.getElementById('input').value.trim();
    if (!input) {
        showMessage('Please enter some JSON to repair.', 'error');
        return;
    }

    try {
        const result = window.repairJSON(input);

        if (result.error) {
            showMessage(`Error: ${result.error}`, 'error');
            document.getElementById('output').value = '';
        } else {
            document.getElementById('output').value = result.result;
            showMessage('JSON repaired successfully!', 'success');

            // Pretty print if valid JSON
            try {
                const parsed = JSON.parse(result.result);
                document.getElementById('output').value = JSON.stringify(parsed, null, 2);
            } catch (e) {
                // Keep original if not valid JSON
            }
        }
    } catch (error) {
        showMessage(`Unexpected error: ${error.message}`, 'error');
    }
}

// Repair JSON without error handling
function handleMustRepairJSON() {
    if (!wasmLoaded) {
        showMessage('WebAssembly not loaded yet. Please wait...', 'error');
        return;
    }

    const input = document.getElementById('input').value.trim();
    if (!input) {
        showMessage('Please enter some JSON to repair.', 'error');
        return;
    }

    try {
        const result = window.mustRepairJSON(input);

        if (result.error) {
            showMessage(`Error: ${result.error}`, 'error');
            document.getElementById('output').value = '';
        } else {
            document.getElementById('output').value = result.result;
            showMessage('JSON repaired successfully!', 'success');

            // Pretty print if valid JSON
            try {
                const parsed = JSON.parse(result.result);
                document.getElementById('output').value = JSON.stringify(parsed, null, 2);
            } catch (e) {
                // Keep original if not valid JSON
            }
        }
    } catch (error) {
        showMessage(`Unexpected error: ${error.message}`, 'error');
    }
}

// Handle escape sequences in input
function handleUnescape() {
    const input = document.getElementById('input');
    const text = input.value;

    if (!text.trim()) {
        showMessage('请先输入一些内容。', 'error');
        return;
    }

    try {
        const unescaped = unescapeInput(text);
        input.value = unescaped;
        showMessage('转义字符处理完成!', 'success');
    } catch (error) {
        showMessage(`处理转义时出错: ${error.message}`, 'error');
    }
}

// Unescape common escape sequences
function unescapeInput(text) {
    // 处理常见的转义序列
    return text
        // 处理双引号转义
        .replace(/\\"/g, '"')
        // 处理单引号转义
        .replace(/\\'/g, "'")
        // 处理反斜杠转义
        .replace(/\\\\/g, '\\')
        // 处理换行符转义
        .replace(/\\n/g, '\n')
        // 处理回车符转义
        .replace(/\\r/g, '\r')
        // 处理制表符转义
        .replace(/\\t/g, '\t')
        // 处理退格符转义
        .replace(/\\b/g, '\b')
        // 处理换页符转义
        .replace(/\\f/g, '\f')
        // 处理Unicode转义序列 (如 \\u0020)
        .replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
            return String.fromCharCode(parseInt(code, 16));
        })
        // 处理16进制转义序列 (如 \\x20)
        .replace(/\\x([0-9a-fA-F]{2})/g, (match, code) => {
            return String.fromCharCode(parseInt(code, 16));
        });
}

// Advanced unescape for JSON strings (when input is a quoted JSON string)
function handleAdvancedUnescape() {
    const input = document.getElementById('input');
    let text = input.value.trim();
    
    if (!text) {
        showMessage('请先输入一些内容。', 'error');
        return;
    }
    
    try {
        // 如果文本是以引号包围的字符串，先尝试解析为JSON字符串
        if ((text.startsWith('"') && text.endsWith('"')) || 
            (text.startsWith("'") && text.endsWith("'"))) {
            
            // 移除外层引号
            const quote = text[0];
            text = text.slice(1, -1);
            
            // 如果是双引号包围，尝试用JSON.parse解析
            if (quote === '"') {
                try {
                    text = JSON.parse('"' + text + '"');
                } catch (e) {
                    // 如果JSON.parse失败，使用手动转义
                    text = unescapeInput(text);
                }
            } else {
                // 单引号包围的情况，手动处理转义
                text = unescapeInput(text);
            }
        } else {
            // 不是引号包围的字符串，直接处理转义
            text = unescapeInput(text);
        }
        
        input.value = text;
        showMessage('高级转义处理完成!', 'success');
    } catch (error) {
        showMessage(`高级转义处理出错: ${error.message}`, 'error');
    }
}

// Parse escape sequences (convert \n to actual newlines, etc.)
function handleParseEscapeSequences() {
    const input = document.getElementById('input');
    let text = input.value;
    
    if (!text.trim()) {
        showMessage('请先输入一些内容。', 'error');
        return;
    }
    
    try {
        const parsed = parseEscapeSequences(text);
        input.value = parsed;
        showMessage('转义序列解析完成!', 'success');
    } catch (error) {
        showMessage(`解析转义序列时出错: ${error.message}`, 'error');
    }
}

// Parse escape sequences like \n, \t, etc. into actual characters
function parseEscapeSequences(text) {
    return text
        // 处理换行符
        .replace(/\\n/g, '\n')
        // 处理回车符
        .replace(/\\r/g, '\r')
        // 处理制表符
        .replace(/\\t/g, '\t')
        // 处理双引号
        .replace(/\\"/g, '"')
        // 处理单引号
        .replace(/\\'/g, "'")
        // 处理反斜杠 (要放在最后处理)
        .replace(/\\\\/g, '\\')
        // 处理退格符
        .replace(/\\b/g, '\b')
        // 处理换页符
        .replace(/\\f/g, '\f')
        // 处理垂直制表符
        .replace(/\\v/g, '\v')
        // 处理空字符
        .replace(/\\0/g, '\0')
        // 处理Unicode转义序列 (如 \u0020)
        .replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
            return String.fromCharCode(parseInt(code, 16));
        })
        // 处理16进制转义序列 (如 \x20)
        .replace(/\\x([0-9a-fA-F]{2})/g, (match, code) => {
            return String.fromCharCode(parseInt(code, 16));
        });
}

// Copy output to clipboard
function copyOutput() {
    const output = document.getElementById('output');
    if (!output.value.trim()) {
        showMessage('No output to copy.', 'error');
        return;
    }

    output.select();
    document.execCommand('copy');
    showMessage('Output copied to clipboard!', 'success');
}

// Show message to user
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="${type}">${text}</div>`;

    // Auto-clear success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            if (messageDiv.querySelector('.success')) {
                messageDiv.innerHTML = '';
            }
        }, 3000);
    }
}

// Initialize when page loads
// Language switching functions
/**
 * Switch the interface language
 * @param {string} lang - Language code ('en' or 'zh')
 */
function switchLanguage(lang) {
    if (lang === currentLanguage) return;
    
    currentLanguage = lang;
    
    // Update language button states
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
    
    // Update all translatable elements
    updateLanguage();
    
    // Save language preference
    localStorage.setItem('json-repair-language', lang);
}

/**
 * Update all translatable elements on the page
 */
function updateLanguage() {
    const langData = translations[currentLanguage];
    
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (langData[key]) {
            element.innerHTML = langData[key];
        }
    });
    
    // Update placeholder text
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (langData[key]) {
            element.placeholder = langData[key];
        }
    });
    
    // Update title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (langData[key]) {
            element.title = langData[key];
        }
    });
    
    // Update document title and meta tags
    if (currentLanguage === 'zh') {
        document.title = 'JSON 在线修复工具 | 在浏览器中安全修复格式错误的 JSON';
        document.querySelector('meta[name="description"]').content = 'JSON 在线修复工具 – 粘贴格式错误的 JSON 并在浏览器中立即修复语法错误。安全、快速、保护隐私，无需上传。支持引号、逗号、括号和转义序列。';
        document.querySelector('html').lang = 'zh-CN';
    } else {
        document.title = 'JSON Repair Online | Fix malformed JSON safely in your browser';
        document.querySelector('meta[name="description"]').content = 'JSON Repair Online – paste malformed JSON and instantly fix syntax errors in your browser. Safe, fast, privacy‑friendly, no uploads. Supports quotes, commas, brackets, and escape sequences.';
        document.querySelector('html').lang = 'en';
    }
}

/**
 * Initialize language on page load
 */
function initializeLanguage() {
    // Get saved language preference or default to English
    const savedLang = localStorage.getItem('json-repair-language') || 'en';
    switchLanguage(savedLang);
}

// Initialize language when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLanguage);
} else {
    initializeLanguage();
}

loadWasm();