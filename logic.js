

const axios = require('axios');
const rp = require('request-promise');
const { ipcMain, dialog } = require('electron');



const domain = 'https://rebot.rs6bot.com';

const path = require('path');
const chromePath = require('./getPath');
const { BotManager } = require('./botmanager');

let records;
let botmsg;
let videopath;
const launchOptions = {
  headless: false,
  userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.6834.111 Safari/537.36',
  args: [
    '--disable-infobars',
    '--disable-blink-features=AutomationControlled',
     '--disable-features=PasswordLeakDetection',
      '--disable-save-password-bubble',
    '--autoplay-policy=no-user-gesture-required',
    '--no-default-browser-check',
    '--no-first-run',
    '--disable-popup-blocking',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--window-size=1978,1133',
    '--disable-incognito',
    '--no-incognito'

  ],
  ignoreHTTPSErrors: false,
       
  webGl: true,

        // 模拟电池状态
        forcedColors: 'none',
        reducedMotion: 'no-preference',
  executablePath:'',
  acceptDownloads: true,
  javaScript:true,
  locale: 'en-US',
  timezoneId: 'UTC',
  extraHTTPHeaders: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'sec-ch-ua': '"Chromium";v="134", "Google Chrome";v="134", "Not(A:Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"'
},
  chromiumSandbox: false,
  viewport: {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    isLandscape: true
},
};


//初始化机器人;
function initBotManager(dataList, videopath){
  launchOptions.executablePath =chromePath.getChromePath();
  botmsg = new BotManager();
  botmsg.setData(50, './my-user-data-dir-', videopath, dataList, launchOptions);
}


async function removeRecord(id)
{
  console.log("removeRecord:", id);
  try {
    const res = await fetch(`${domain}/api/removeRecord`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id)
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`服务器错误: ${res.status} ${errorText}`);
    }
    const result = await res.json();
    console.log("removeRecord result:", result);
    return result;
  } catch (err) {
    console.error("❌ 数据上传失败:", err);
    throw err;
  }
}


// 负责上传记录到服务器，传入一个对象，例如 { proxy: "IP:端口:账号:密码" }
async function uploadRecord(record) {
  try {
    const res = await fetch(`${domain}/api/addRecord`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record)
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`服务器错误: ${res.status} ${errorText}`);
    }
    const result = await res.json();
    console.log("uploadRecord result:", result);
    return result;
  } catch (err) {
    console.error("❌ 数据上传失败:", err);
    throw err;
  }
}

module.exports = {


  verify:async(data)=>{

    console.log('verify', data);
    console.log(data);

    //const task = new LoginTask(data);
   //botmsg.createBot(data, opt);
    //bot.addTask(task);
  },

  // 获取所有记录
  open: async (data) => {
    console.log(data);
    // const opt = {
    //   proxy:getProxy(data.IP, data.Port, data.Username, data.Password),
    //   ...launchOptions
    // }

    // const bot = await botmsg.createBot(data, opt);

  },
  // 添加代理记录，返回 { success: true, id }
// 添加代理记录，返回 { success: true, id }
openVideoFolder: async () => {

  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  // 如果用户取消，则返回 null，否则返回第一个选择的目录
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
},

  // 根据 id 更新 cookie 数据
  openF: async (path, dataList) => {
    initBotManager(dataList, path);
  },
  // 打开指纹浏览器
  updateFingerprint: async (id) => {
    let record = records.find(r => r.id === id);
    console.log('record', record);
    if (record) {
      const params = {
        proxy: record.proxy,
        ipInfo:JSON.parse(record.info),
        cookies:record.cookies

      };

      const opt = {
        proxy:getProxy(record.proxy),
        ...launchOptions
      }

      //const task = new UploadVideTask("D:/tkvd/IMG_0603.MP4", 'samlle game #game #foryou');
      const task = new LoginTask();
      const bot = await BotManager.BotMsg.createBot(id, opt);
      bot.addTask(task);
    

    }
  }
};
