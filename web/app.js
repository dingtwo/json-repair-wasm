// Initialize WebAssembly
const go = new Go();
let wasmLoaded = false;

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
loadWasm();