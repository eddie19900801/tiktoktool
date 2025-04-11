function generateNaturalVariation(baseSize) {
    // 扩大偏差范围以更自然的方式模拟多种设备
    const widthVariation = Math.floor(baseSize.width * (0.90 + Math.random() * 0.2));
    const heightVariation = Math.floor(baseSize.height * (0.90 + Math.random() * 0.2));

    // 保持宽高比在合理范围内
    const aspectRatio = baseSize.width / baseSize.height;
    const newAspectRatio = widthVariation / heightVariation;

    if (Math.abs(aspectRatio - newAspectRatio) > 0.2) { // 宽高比的变化范围适当增大
        return {
            width: widthVariation,
            height: Math.floor(widthVariation / aspectRatio)
        };
    }

    return {
        width: widthVariation,
        height: heightVariation
    };
}

function getWindowDimensions(browserType) {
    const options = {
        chromium: [
        { width: 1920, height: 1080, weight: .35, device: 'pc', name: 'chromium' },],
        firefox: [{ width: 1366, height: 768, weight: .4, device: 'pc', name: 'firefox' },
        { width: 1920, height: 1080, weight: .35, device: 'pc', name: 'firefox' },
        { width: 1440, height: 900, weight: .1, device: 'pc', name: 'firefox' },
        { width: 1536, height: 864, weight: .05, device: 'pc', name: 'firefox' },
        { width: 1280, height: 720, weight: .05, device: 'pc', name: 'firefox' },
        { width: 2560, height: 1440, weight: .05, device: 'pc', name: 'firefox' },],
        webkit: [{ width: 1440, height: 900, weight: .05, device: 'mac', name: 'webkit' },
        { width: 1280, height: 800, weight: .05, device: 'mac', name: 'webkit' },
        { width: 1680, height: 1050, weight: .05, device: 'mac', name: 'webkit' },
        { width: 1920, height: 1080, weight: .05, device: 'mac', name: 'webkit' },
        { width: 2560, height: 1600, weight: .05, device: 'mac', name: 'webkit' },]
    }
    // 增加更多的基准尺寸
    const baseSizes = options[browserType];

    // 根据权重选择基准尺寸
    const totalWeight = baseSizes.reduce((sum, size) => sum + size.weight, 0);
    const random = Math.random() * totalWeight;
    let weightSum = 0;

    const baseSize = baseSizes.find(size => {
        weightSum += size.weight;
        return random <= weightSum;
    }) || baseSizes[0];

    const dimensions = generateNaturalVariation(baseSize);

    // 调整操作系统窗口装饰
    const osDecorationHeight = Math.floor(Math.random() * 30) + 50;
    const osDecorationWidth = Math.floor(Math.random() * 8) + 2;

    return {
        windowSize: `--window-size=${dimensions.width + osDecorationWidth},${dimensions.height + osDecorationHeight}`,
        viewport: {
            width: dimensions.width,
            height: dimensions.height
        },
        device: baseSize.device
    };
}
/** browser options */
function bwOptions(size, browserType) {

    if (browserType == 'chromium') {
        return {
            headless: false,
            acceptDownloads: true,
            chromiumSandbox: false,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--no-default-browser-check',
                '--no-first-run',
                '--disable-popup-blocking',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                `${size.windowSize}`,
                '--disable-incognito',  // 禁用无痕模式
                '--no-incognito',       // 禁用无痕模式

         
            ]
        };
    }
    if (browserType == 'firefox') {
        return {
            headless: false,
            args: [
                '-no-remote',
                '-wait-for-browser',
                '-no-default-browser-check',
                '-private-window',
                size.windowSize
            ],
            firefoxUserPrefs: {
                'dom.webdriver.enabled': false,
                'dom.automation.enabled': false,
                'privacy.resistFingerprinting': false,
                'privacy.trackingprotection.enabled': false,
                'network.http.sendRefererHeader': 2,
                'browser.cache.disk.enable': true,
                'browser.cache.memory.enable': true,
                'browser.cache.offline.enable': true,
                'media.navigator.enabled': false,
                'media.peerconnection.enabled': false,
                'permissions.default.geo': 0,
                'webgl.disabled': false,
                'canvas.capturestream.enabled': true,
                'browser.tabs.remote.autostart': true,
                'browser.sessionstore.resume_from_crash': false,
                'app.update.auto': false,
                'browser.crashReports.unsubmittedCheck.autoSubmit2': false,
                'network.http.max-connections': 1000,
                'network.http.max-persistent-connections-per-server': 10,
                'browser.sessionstore.interval': 60000,
                'devtools.toolbox.host': 'window',
                'devtools.chrome.enabled': false,
                'devtools.debugger.remote-enabled': false
            }
        };
    }
    if (browserType == 'webkit') {
        return {
            headless: false,
            args: [
                '--disable-blink-features=AutomationControlled',  // 禁用浏览器中自动化控制的标记
                '--no-sandbox',  // 关闭沙箱
                '--disable-infobars',  // 禁用信息条
                '--disable-extensions',
                '-disable-background-networking',
                '--disable-software-rasterizer',
                '--enable-features=WebUIDarkMode'
            ],
            bypassCSP: true,  // 绕过内容安全策略
        }
    }
}


function contextOptions(ipConfig, viewport, device, browserType) {

    const profile = hardwareProfiles[0];

    const agent = getUserAgent(device, browserType);

    const baseContextOptions = getBaseContextOptions(ipConfig);

    let contextOptions = {}
    switch (browserType) {
        case 'chromium':
            contextOptions = chromeContextOptions(viewport, ipConfig, profile, agent);
            break;
        case 'firefox':
            contextOptions = firefoxContextOptions(viewport, ipConfig, profile, agent);
            break;
        case 'webkit':
            contextOptions = getWebkitContextOptions(viewport, ipConfig, profile, agent);
            break;
        default:
            contextOptions = chromeContextOptions(viewport, ipConfig, profile, agent);
    }
    return {
        ...baseContextOptions,
        ...contextOptions
    };
}

// 硬件配置
const hardwareProfiles = [
    {
        // 高配电脑
        hardwareConcurrency: 4,
        deviceMemory: 8,
        gpu: {
            vendor: 'Intel Inc.',
            renderer: 'Intel(R) UHD Graphics 620'
        }
    },
    {
        // 中配电脑
        hardwareConcurrency: 8,
        deviceMemory: 16,
        gpu: {
            vendor: 'NVIDIA Inc.',
            renderer: 'NVIDIA GeForce GTX 1660'
        }
    },
    {
        // 低配电脑
        hardwareConcurrency: 4,
        deviceMemory: 8,
        gpu: {
            vendor: 'Intel Inc.',
            renderer: 'Intel(R) UHD Graphics 620'
        }
    },
    {
        // MacBook
        hardwareConcurrency: 8,
        deviceMemory: 16,
        gpu: {
            vendor: 'Apple Inc.',
            renderer: 'Apple M1'
        }
    }
];

// 颜色方案
const colorSchemes = [
    { scheme: 'light', weight: 0.7 },    // 70% 的概率
    { scheme: 'dark', weight: 0.2 },     // 20% 的概率
    { scheme: 'no-preference', weight: 0.1 }  // 10% 的概率
];

const getBaseContextOptions = (ipConfig) => {
    return {
        locale: 'en-US',
        timezoneId: ipConfig.timezone,
        geolocation: {
            latitude: Number(ipConfig.loc.split(',')[0]),
            longitude: Number(ipConfig.loc.split(',')[1])
        },
        permissions: ['geolocation', 'notifications', 'camera', 'microphone'],
        bypassCSP: true,
        javaScriptEnabled: true,
        acceptInsecureCerts: true
    };
}
const chromeContextOptions = (viewport, ipConfig, profile, agent) => {
    return {
        userAgent: agent[Math.floor(Math.random() * agent.length)],
        viewport: {
            width: viewport.width,
            height: viewport.height,
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: false,
            isLandscape: true
        },
        
        colorScheme: getRandomColorScheme(),
        ignoreHTTPSErrors: false,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        // 模拟电池状态
        forcedColors: 'none',
        reducedMotion: 'no-preference',
        screen: {
            width: viewport.width,
            height: viewport.height
        },
        acceptLanguage: 'en-US,en;q=0.9',
        javaScript: true,
        // 模拟硬件并发数
        hardwareConcurrency: profile.hardwareConcurrency,
        // 模拟内存大小
        deviceMemory: profile.deviceMemory,
        // WebGL 参数
        webGl: true,

        extraHTTPHeaders: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'sec-ch-ua': '"Chromium";v="134", "Google Chrome";v="134", "Not(A:Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        }
    }
}

const firefoxContextOptions = (viewport, ipConfig, profile, agent) => {
    return {
        // 视口设置
        viewport: {
            width: viewport.width,
            height: viewport.height,
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: false,
            isLandscape: true
        },

        // 地理位置和时区

        timezoneId: ipConfig.timezone,




        // 用户代理
        userAgent: agent[Math.floor(Math.random() * agent.length)],  // 确保是 Firefox 的 UA


        acceptLanguage: 'en-US,en;q=0.9',

        // 颜色方案
        colorScheme: getRandomColorScheme(),  // 'light' 或 'dark'

        // 安全设置
        bypassCSP: true,
        ignoreHTTPSErrors: true,

        // 功能开关
        javaScriptEnabled: true,
        hasTouch: false,
        isMobile: false,
        // 模拟硬件并发数
        hardwareConcurrency: profile.hardwareConcurrency,
        // 模拟内存大小
        deviceMemory: profile.deviceMemory,
        // WebGL 参数
        webGl: true,
        // 屏幕设置
        screen: {
            width: viewport.width,
            height: viewport.height
        },

        // 减少指纹特征
        forcedColors: 'none',
        reducedMotion: 'no-preference',

        // HTTP 头部设置
        extraHTTPHeaders: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'DNT': '1',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1'
        }
    }
}

const getWebkitContextOptions = (viewport, ipConfig, profile, agent) => {
    return {
        userAgent: agent[Math.floor(Math.random() * agent.length)],
        viewport: {
            width: viewport.width,
            height: viewport.height,
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: false,
            isLandscape: true
        },
        // WebKit 特有的功能
        colorScheme: getRandomColorScheme(),
        screen: {
            width: viewport.width,
            height: viewport.height
        },
        // WebKit 特有的 HTTP 头
        extraHTTPHeaders: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br'
        }
    }
}

const getUserAgent = (device, browserType) => {
    if (device == 'pc') {
        if (browserType == 'chromium') {
            return ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.6834.111 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.6943.127 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.6834.84 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.85 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.140 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.6943.99 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.6943.142 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.265 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.6943.54 Safari/537.36',]
        }
        if (browserType == 'firefox') {
            return [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',

                // 稍旧版本
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:118.0) Gecko/20100101 Firefox/118.0',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:117.0) Gecko/20100101 Firefox/117.0',

                // Windows 11
                'Mozilla/5.0 (Windows NT 11.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
                'Mozilla/5.0 (Windows NT 11.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',

                // Windows 10 不同版本
                'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:123.0) Gecko/20100101 Firefox/123.0',
                'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:122.0) Gecko/20100101 Firefox/122.0',
                'Mozilla/5.0 (Windows NT 10.0; Win64; rv:123.0) Gecko/20100101 Firefox/123.0',

            ]
        }
    }
    if (device == 'mac') {
        return [
            // Safari 13 on macOS Catalina
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/13.1.2 Safari/537.36",

            // Safari 14 on macOS Big Sur
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_16) AppleWebKit/537.36 (KHTML, like Gecko) Version/14.0 Safari/537.36",

            // Safari 12 on macOS Mojave
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Version/12.1.2 Safari/537.36",

            // Safari 13 on macOS Mojave
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36",

            // Safari 11 on macOS Sierra
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/11.0 Safari/602.1.50",

            // Safari 10 on macOS Sierra
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/602.4.8 (KHTML, like Gecko) Version/10.1 Safari/602.4.8",

            // Safari on macOS Big Sur
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_16) AppleWebKit/537.36 (KHTML, like Gecko) Version/14.0 Safari/537.36",

            // Safari 13 on macOS Mojave
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36",

            // Safari 11 on macOS Sierra
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/11.0 Safari/602.1.38"
        ];
    }
    if (device == 'iphone') {
        return [
            // Safari 13 on iPhone 11
            "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/537.36",

            // Safari 14 on iPhone 12
            "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/537.36",

            // Safari 12 on iPhone 10
            "Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/537.36",

            // Safari 11 on iPhone X
            "Mozilla/5.0 (iPhone X; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15E302 Safari/604.1",

            // Safari 13 on iPhone 12 Pro Max
            "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/537.36",

            // Safari 14 on iPhone 13
            "Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/537.36",

            // Safari 14 on iPhone 7
            "Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/537.36",

            // Safari 12 on iPhone 6
            "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15A372 Safari/605.1.15",

            // Safari 13 on iPhone XR
            "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/537.36",

            // Safari 10 on iPhone 5
            "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_2 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14F89 Safari/602.1"
        ];
    }

}

const screenConfigs = [
    { width: 1920, height: 1080 },  // Full HD
    // { width: 1366, height: 768 },   // HD
    // { width: 1440, height: 900 },   // WXGA+
    // { width: 1536, height: 864 },   // HD+
    // { width: 1680, height: 1050 },  // WSXGA+
    // { width: 2560, height: 1440 }   // 2K
];

function getRandomColorScheme() {
    const random = Math.random();
    let sum = 0;
    for (const option of colorSchemes) {
        sum += option.weight;
        if (random <= sum) return option.scheme;
    }
    return 'light';  // 默认值
}

function addInitScript(page) {
    page.addInitScript(`
        Object.defineProperty(navigator, 'webdriver', {get: () => undefined})
    `);
}


function initContext(context) {
    context.addInitScript((profile) => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
    }, profile);
}




module.exports = {
    bwOptions,
    getProxy,
    contextOptions,
    getWindowDimensions
};