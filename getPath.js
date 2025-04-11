const fs = require('fs');
const path = require('path');

function findChromePath() {
    // Windows 常见的 Chrome 安装路径
    const commonPaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
        `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
        `${process.env.PROGRAMFILES} (x86)\\Google\\Chrome\\Application\\chrome.exe`
    ];

    // 检查路径是否存在
    for (const browserPath of commonPaths) {
        if (fs.existsSync(browserPath)) {
            return browserPath;
        }
    }

    // 如果在常见路径找不到，尝试从注册表获取
    try {
        const { execSync } = require('child_process');
        const regQuery = 'reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe" /ve';
        const regResult = execSync(regQuery, { encoding: 'utf8' });
        const match = regResult.match(/REG_SZ\s+([^\s]+)/);
        if (match && match[1]) {
            return match[1];
        }
    } catch (error) {
        console.log('Registry query failed:', error.message);
    }

    return null;
}

class GetPath {
    constructor() {
        this.chromePath = findChromePath();
    }

    getChromePath() {
        return this.chromePath;
    }

    getChromePath() {
        return this.chromePath;
    }
}
const chromePath = new GetPath();
module.exports = chromePath;
