// botManager.js
const { chromium} = require('playwright');
const fetch = require('node-fetch'); // npm install node-fetch@2
const path = require('path');
const {LoginTask} = require('./LoginTask');
const {WatchVideosTask} = require('./WatchVideosTask');
const CaptchaSolver = require('./CaptchaSolver');
const {UploadVideTask} = require('./UploadVideTask');
const VideoManager = require('./videoManager');
const store = require('./StateStore');





function getProxy(address, port, username, password) {
    return {
        server: `http://${address}:${port}`,
        username: username,
        password: password
    }
}



class Bot {
  constructor(data,launchOptions, userDataDir) {
    this.data = data;
    this.id = data.ID;
    this.launchOptions = launchOptions;
    this.userDataDir = userDataDir;
    this.context = null;
    this.page = null;
    this.nextBot = null;
    this.isruning = false;
  }

  // 初始化：启动持久化上下文并打开首页
  async start(disTime) {
    this.disTime = disTime;
    this.isruning = true;
    const opt = {
      proxy:getProxy(this.data.IP, this.data.Port, this.data.Username, this.data.Password),
      ...this.launchOptions
    }


    this.context = await chromium.launchPersistentContext(
      path.join(this.userDataDir, String(this.id)),
      opt
    );
    await this.context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    await this.context.grantPermissions(['notifications'], { origin: 'https://www.tiktok.com' });

    const proxpage = await this.context.newPage();

    //验证代理IP
    await proxpage.goto("https://ipinfo.io/json");
    const jsonResponse = await proxpage.evaluate(() => document.body.innerText);

    try {
      const result = JSON.parse(jsonResponse);
      console.log("当前公共 IP:", result);
      if (result.country !=  'US') {
        console.log("代理似乎未生效，返回的 IP 与预期不符。");
      } else {
        console.log("代理已成功使用！");
      }
    } catch (err) {
      console.error("解析 IP 信息失败:", err);
    }

    this.page = await this.context.newPage();
   this.monitorModal();

    console.log('monitorModal');
    await this.clickLoginButton();

    await this.checkUploadVideo();

    await this.startWatchVideo();

    await this.close();

  }

  async checkUploadVideo(){
    const botmsg = new BotManager();
    const videoPath = botmsg.videoManager.getUnusedVideo();
    console.log('checkUploadVideo:',videoPath);
    if(!videoPath) return;
    const task = new UploadVideTask();
    await task.start(this.page, videoPath, this.data);
  }



  async startWatchVideo(){
    const task = new WatchVideosTask();
    await task.start(this.page);
  }




  //是否有登录按钮
  async clickLoginButton() {

    await this.page.goto('https://www.tiktok.com', { waitUntil: 'domcontentloaded',  timeout: 600000 });
    await this.page.waitForSelector('div.TUXButton-content:has-text("For You")', { timeout:60000 });//等待按钮出现

    // 尝试查找指定的登录按钮
    const loginButton = await this.page.$('#header-login-button');
    if (loginButton) {
      console.log('Login button found, clicking...');
     const task = new LoginTask(this.data);
     await task.start(this.page);
    } else {
      console.log('Login button not found.');
    }

  }

  async monitorModal() {
    while (true) {

      if (this.page == null) {
        console.log('Page is closed. Exiting monitorModal loop.');
        break;
      }
  

      try {
      // 尝试查找 modal 元素
      const modal = await this.page.$('.TUXModal.captcha-verify-container');
      if (modal) {
        console.log('Modal found!');
        // 开始验证

          const solver = new CaptchaSolver(this.page);
          await solver.solve();

        break;
      } else {
        console.log('Modal not found. Will check again in 5 seconds.');
      }
    } catch (error) {
      // 捕获 "Execution context was destroyed" 错误
      console.error('Error during modal check:', error.message);
      // 如果错误属于执行上下文销毁，可以等待导航完成或者延迟后重试
    }
      // 等待 5 秒
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  

  // 关闭机器人（上下文和浏览器进程）
  async close() {

    console.log('bot close');
    try {
    if (this.context) await this.context.close();
    } catch(error)
    {

    }
    this.context = null;
    this.page = null;
    this.isruning = false;
    if(this.nextBot)
    {
      await new Promise(resolve => setTimeout(resolve, this.disTime));
      this.nextBot.start(this.disTime)
    }
  }
}

class BotManager {
  constructor() {
    if (BotManager.instance) {
      return BotManager.instance;
    }
    this.bots = {};
    this.videoManager = null; // 后续会由 setData 设置
    BotManager.instance = this;
  }

  async getBot(data){

    let group = this.bots[data.IP];
    for(let i = 0;i < group.length; i ++)
    {
      if(group[i].id == data.ID)
      {
        return group[i];
      }
    }
    return null;
  }
  async runBot(){
    const disTime = 10*1000;
    //
    for (const ip in this.bots) {
      let group = this.bots[ip];
      if(store.get(ip) == null)
      {
        console.log('group[0].start');
        group[0].start(disTime);
      }
      else
      {
        let id = store.get(ip);
        let bot;
        for(let i = 0;i < group.length; i ++)
        {
          bot = group[i];
          if(bot.id == id)
          {
            console.log(`group[${bot.nextBot.id}].start`);
            bot.nextBot.start(disTime);
          }
        }
          
      }
    
      
    }
  }



    //==初始化所有bot
  async setData(maxBots, userDataDir, videoPath, dataList, launchOptions){
    this.dataList = dataList;
    this.maxBots = maxBots;
 
    this.videoManager = new VideoManager(videoPath, 'videoState.json');
  // 使用对象而不是数组存储分组
let bot;
let ip;
let data;
console.log('dataList.length', dataList.length);

for (let i = 0; i < dataList.length; i++) {
  data = dataList[i];
  if (data.IP) {
    bot = new Bot(data, launchOptions, userDataDir);
    ip = data.IP;
    // 如果此 IP 分组不存在，则创建一个空数组
    if (!this.bots[ip]) {
      this.bots[ip] = [];
    }
    this.bots[ip].push(bot);
  }
}

console.log('bots.group count:', Object.keys(this.bots).length);

let z = 0;
// 为每个 IP 分组的机器人设置 nextBot 链接
for (const ip in this.bots) {
  let group = this.bots[ip];
  for (let n = 0; n < group.length; n++) {
    z ++;
    if (n === group.length - 1) {
      group[n].nextBot = group[0];
    } else {
      group[n].nextBot = group[n + 1];
    }
  }
}
    console.log('bots.length:', z);
   // this.runBot();
  }
}

module.exports = { BotManager };
