

class LoginTask {
    constructor(data) {
        this.data = data;

    }

   
    async start(page){
        await page.goto('https://www.tiktok.com/login/phone-or-email/email', { waitUntil: 'domcontentloaded',  timeout: 600000 });

        await page.waitForTimeout(3000);
        // 2. 如果已经登录，检测 URL 变化并退出
        if (!page.url().includes('/login')) {
            console.log('已检测到已登录状态，当前 URL:', page.url());
            return;
        }
        await page.waitForTimeout(1000);
  // 3. 填写用户名
  await page.fill('input[placeholder="Email or username"]', this.data.TK_Username);
  await page.waitForTimeout(1000);
  // 4. 填写密码
  await page.fill('input[placeholder="Password"]', this.data.TK_Password);
  await page.waitForTimeout(3000);
    // 1. 点击登录
    await page.click('button[data-e2e="login-button"]');

// 2. 等待验证码 Modal 出现（最多等 60 秒）
//const modal = await page.waitForSelector('.TUXModal.captcha-verify-container', { timeout: 60000 }).catch(() => null);

await page.waitForTimeout(10000);//等待10秒，会进入验证码
// if (modal) {
//   console.log('验证码 Modal 已出现，开始破解');
//   // 3. 破解验证码
//   const solver = new CaptchaSolver(page);
//   const solved = await solver.solve();

// } else {
//   console.log('未检测到验证码 Modal，直接继续');
// }

// 如果破解后页面未自动跳转，再等待导航完成
if (page.url().includes('/login')) {
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 });
}

console.log('登录流程结束，当前 URL:', page.url());

    }
}
module.exports = {LoginTask};