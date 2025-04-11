/**
 * 根据权重生成观看时长
 * 90%: 10–30 秒
 *  8%: 30–50 秒
 *  2%: 50–180 秒
 */
function getWeightedWatchSeconds() {
    const r = Math.random();
    if (r < 0.90) {
      // 90% 概率：10–30
      return Math.floor(Math.random() * 5 + 10);
    } else if (r < 0.98) {
      // 下一个 8%：30–50
      return Math.floor(Math.random() * 50 + 10);
    } else {
      // 剩余 2%：50–180
      return Math.floor(Math.random() * 80+ 20);
    }
  }
  

  
class WatchVideosTask {

    constructor() {
      //this.mainURL = 'https://www.tiktok.com';
    }

   
    async start(page){

      console.log(`page.url:`,page.url);

      if(page.url != this.mainURL){
        await page.goto('https://www.tiktok.com', { waitUntil: 'domcontentloaded',  timeout: 600000 });
      }
      
    
        const videoCount = Math.floor(Math.random() * 2 + 2);
        console.log(`将随机观看 ${videoCount} 个视频`);


        for (let i = 0; i < videoCount; i++) {
            // 等待视频播放器加载
            await new Promise(resolve => setTimeout(resolve, 3000));
        
            // 随机观看时长：10 秒到 180 秒（3 分钟）
            const watchSeconds = getWeightedWatchSeconds();
            console.log(`第 ${i + 1} 个视频，观看 ${watchSeconds} 秒`);

             
        
            // 记录是否超过 120 秒
            const longWatch = watchSeconds > 120;
        
            // 逐秒等待，并在 120 秒时执行关注逻辑
            for (let elapsed = 0; elapsed < watchSeconds; elapsed++) {
              await page.waitForTimeout(1000);
              // 60秒的时候点关注
              if (elapsed === 60 && longWatch) {
                await page.waitForSelector('button[data-e2e="feed-follow"]', { timeout: 10000 });

                // 获取视口高度和当前滚动位置
                const viewportHeight = page.viewportSize().height;
                const scrollY = await page.evaluate(() => window.scrollY);
              
                // 获取所有关注按钮
                const followButtons = await page.$$('button[data-e2e="feed-follow"]');
                let followed = false;
              
                for (const btn of followButtons) {
                  const box = await btn.boundingBox();
                  if (!box) continue;
              
                  // 计算按钮中心点相对于视口顶部的位置
                  const midY = box.y + box.height / 2 - scrollY;
              
                  // 如果中心点落在视口中部（25% 到 75% 高度），则认为是当前视频的关注按钮
                  if (midY > viewportHeight * 0.25 && midY < viewportHeight * 0.75) {
                    await btn.click();
                    console.log('已关注当前视频作者');
                    followed = true;
                    break;
                  }
                }
              }
            }
        
           // 4. 50% 概率点赞
           if (Math.random() < 0.5) {
            await page.waitForSelector('span[data-e2e="like-icon"]', { timeout: 10000 });

            // 获取视口高度和滚动位置
            const viewportHeight = page.viewportSize().height;
            const scrollY = await page.evaluate(() => window.scrollY);
          
            // 获取所有图标元素
            const icons = await page.$$('span[data-e2e="like-icon"]');
          
            let clicked = false;
            for (const icon of icons) {
              const box = await icon.boundingBox();
              if (!box) continue;
          
              // 计算图标中心点相对于视口顶部的位置
              const iconMidY = box.y + box.height / 2 - scrollY;
          
              // 如果中心点落在视口中部区域（例如 25% 到 75% 高度）则认为是当前视频
              if (iconMidY > viewportHeight * 0.25 && iconMidY < viewportHeight * 0.75) {
                await icon.click();
                console.log('已点击当前视频的点赞图标');
                clicked = true;
                break;
              }

            }
           }

           await page.waitForTimeout(2000);
        
            // 2.1 移动到下一个视频
            //TikTok 网页版通常是通过滚动来加载下一个视频
           await page.keyboard.press('PageDown');
        //    等待短暂时间让下一个视频加载
           
          }
        
          console.log('刷视频任务完成');
    }
}

module.exports = {WatchVideosTask};