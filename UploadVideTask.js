const RandomLineReader = require('./RandomLineReader');
const reader = new RandomLineReader('data.txt');
const store = require('./StateStore');

class UploadVideTask {
    constructor() {


    }

   
    async start(page, videoPath){
        await page.goto('https://www.tiktok.com/tiktokstudio/upload', { waitUntil: 'domcontentloaded',  timeout: 600000 });


        console.log('加载完成');


        console.log('点击完成');
        const [fc] = await Promise.all([
          page.waitForEvent('filechooser'),
          page.click('button:has-text("Select video")')
        ]);

       // console.log('fc:', fc);
        await fc.setFiles(videoPath);
        await page.click('div[contenteditable="true"]');
        // 全选
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        // 删除
        await page.keyboard.press('Backspace');
        // 输入新内容
        await page.keyboard.type(reader.getRandomLine());

        const progressSelector = 'div.info-progress';

        try {
          // 等待进度条 width 变为 100%，最长 600 秒
          await page.waitForFunction(
            selector => {
              const el = document.querySelector(selector);
              return el && el.style.width === '100%';
            },
            progressSelector,
            { timeout: 600000 }
          );
        
          console.log('进度条已完成（width=100%）');
          
          // 再额外等待 5 秒
          await page.waitForTimeout(3000);
        
          // 点击 Post 按钮
        // 等待按钮可点击
            await page.waitForSelector('button[data-e2e="post_video_button"]:not([aria-disabled="true"])', { timeout: 60000 });

            // 点击按钮
            await page.click('button[data-e2e="post_video_button"]');


           // 再额外等待 5 秒
           await page.waitForTimeout(5000);

        } catch (e) {
          if (e.name === 'TimeoutError') {
            console.error('等待进度条到 100% 超时，退出任务');
            // 你可以在这里做清理或退出
            return;
          } else {
            throw e; // 其它错误继续抛出
          }
        }
        
    }
}

module.exports = { UploadVideTask };