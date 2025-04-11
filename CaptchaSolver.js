// CaptchaSolver.js
const axios = require('axios');
const qs = require('querystring');
const BASE_URL = 'https://www.bingtop.com/ocr/upload';
const BASE_USERNAME = 'eddie';
const BASE_PASSWORD = "zhudi8673";

class CaptchaSolver {
  constructor(page) {
    this.page = page;
  }

  // Take a screenshot of the element and return base64
  async _downloadImage(el) {
    if (!el) return null;
    const buf = await el.screenshot({ type: 'png' });
    return buf.toString('base64');
  }

  async _solveShapes(modal) {
    console.log('[CaptchaSolver] Detected 3D Shapes captcha');

  // 修改图片选择器，适应新页面 alt
  const img = await modal.waitForSelector('img[alt="Verify that you’re not a robot"]', { timeout: 10000 });
  if (!img) {
    console.warn('[CaptchaSolver] Shapes: image not found, skipping');
    return;
  }

  const b64 = await this._downloadImage(img);
  if (!b64) { 
    console.warn('[CaptchaSolver] Shapes: image download failed, skipping');
    return;
  }

  const captchaType = 2301;
  // 注意：确保 BASE_USERNAME 和 BASE_PASSWORD 在作用域中已经定义
  const params = qs.stringify({
    BASE_USERNAME,
    BASE_PASSWORD,
    captchaData: b64,
    captchaType
  });

  let resdata;
  try {
    const response = await axios.post('https://www.bingtop.com/ocr/upload/', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    // 获取响应 JSON 数据
    resdata = response.data;
    console.log('[Shapes data]:', resdata);
  } catch (error) {
    if (error.response) {
      console.error(`服务器返回错误: ${error.response.status}`);
    } else {
      console.error(`请求失败: ${error.message}`);
    }
    return;
  }

  const coordinateStrings  = resdata.data.recognition.split("|");

  const coordinates = coordinateStrings.map(pair => {
    const [x, y] = pair.split(",").map(Number);
    return { x, y };
  });


    const box = await img.boundingBox();
    await this.page.mouse.click(box.x + coordinates[0].x * box.width, box.y + coordinates[0].y * box.height);
    await this.page.mouse.click(box.x + coordinates[1].x * box.width, box.y + coordinates[1].x * box.height);
    console.log('[CaptchaSolver] Shapes captcha solved');

    await this.page.waitForTimeout(5000);
  }

  async _solveRotate(modal) {
    console.log('[CaptchaSolver] Detected Rotate captcha');

      // Wait for both images
      const outer    = await modal.waitForSelector('img[alt="Captcha"]',             { timeout: 10000 });
      const inner = await modal.waitForSelector('img[alt="Captcha"]:nth-of-type(2)', { timeout: 10000 });
  
      // Hide piece and screenshot background
      await inner.evaluate(el => el.style.visibility = 'hidden');
      const o64 = await this._downloadImage(outer);

      // Hide background and screenshot piece
      await outer.evaluate(el => el.style.visibility = 'hidden');
      await inner.evaluate(el => el.style.visibility = 'visible');
      const i64 = await this._downloadImage(inner);

      await outer.evaluate(el => el.style.visibility = 'visible');


    if (!o64 || !i64) { console.warn('[CaptchaSolver] Rotate: images missing, skipping'); return; }

            // 请求参数
            const params = qs.stringify({
                "username": BASE_USERNAME,
                "password": BASE_PASSWORD,
                "captchaData": o64,
                "subCaptchaData": i64,
                "captchaType": 1122
            });

            let recognition;
            // 发送POST请求
            await axios.post('https://www.bingtop.com/ocr/upload/', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            }).then(response => {
            // 自动解析JSON响应
               // console.log('格式化响应:');
                console.log(JSON.stringify(response.data, null, 2));
                recognition = response.data.data.recognition;
            }).catch(error => {
                if (error.response) {
                    console.error(`服务器返回错误: ${error.response.status}`);
                } else {
                    console.error(`请求失败: ${error.message}`);
                }
            });

    const handle = await modal.$('#captcha_slide_button');
    const track = await modal.$('div.cap-flex.cap-w-full.cap-mt-6.cap-mb-4');

    if (!handle || !track) { console.warn('[CaptchaSolver] Rotate: slider or track missing, skipping'); return; }

    const [hb, tb] = await Promise.all([ handle.boundingBox(), track.boundingBox() ]);
    const d =  recognition / 180 * (tb.width - hb.width) ;


   await this.page.mouse.move(hb.x + hb.width/2, hb.y + hb.height/2);
   await this.page.mouse.down();
   await this.page.mouse.move(hb.x + hb.width/2 + d, hb.y + hb.height/2, { steps: 50 });
 //  await this.page.waitForTimeout(500000);
   await this.page.mouse.up();
    console.log('[CaptchaSolver] Rotate captcha solved');
  }

  async _solvePuzzle(modal) {
    console.log('[CaptchaSolver] Detected Puzzle captcha');
    // Wait for both images
    const bg    = await modal.waitForSelector('img[alt="Captcha"]',             { timeout: 10000 });
    const piece = await modal.waitForSelector('img[alt="Captcha"]:nth-of-type(2)', { timeout: 10000 });

    // Hide piece and screenshot background
    await piece.evaluate(el => el.style.visibility = 'hidden');
    const b64 = await this._downloadImage(bg);

    // Hide background and screenshot piece
    await bg.evaluate(el => el.style.visibility = 'hidden');
    await piece.evaluate(el => el.style.visibility = 'visible');
    const p64 = await this._downloadImage(piece);

    // Restore background
    await bg.evaluate(el => el.style.visibility = 'visible');

    if (!b64 || !p64) { console.warn('[CaptchaSolver] Puzzle: images missing, skipping'); return; }

    // 请求参数
    const params = qs.stringify({
      "username": BASE_USERNAME,
      "password": BASE_PASSWORD,
      "captchaData": b64,
      "subCaptchaData": p64,
      "captchaType": 1122
  });

  let recognition;
  // 发送POST请求
  await axios.post('https://www.bingtop.com/ocr/upload/', params, {
  headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
  }
  }).then(response => {
  // 自动解析JSON响应
     // console.log('格式化响应:');
      console.log(JSON.stringify(response.data, null, 2));
      recognition = response.data.data.recognition;
  }).catch(error => {
      if (error.response) {
          console.error(`服务器返回错误: ${error.response.status}`);
      } else {
          console.error(`请求失败: ${error.message}`);
      }
  });

  
    const handle = await modal.$('#captcha_slide_button');
    const track = await modal.$('#cap-flex cap-w-full cap-mt-6 cap-mb-4');
    if (!handle || !track) { console.warn('[CaptchaSolver] Puzzle: slider or track missing, skipping'); return; }

    const [hb, tb] = await Promise.all([ handle.boundingBox(), track.boundingBox() ]);
    const d = (tb.width-hb.width)*slideXProportion/360;
    console.log('[d]:', d);
    await this.page.mouse.move(hb.x + hb.width/2, hb.y + hb.height/2);
    await this.page.mouse.down();
    await this.page.mouse.move(hb.x + hb.width/2 + d, hb.y + hb.height/2, { steps: 30 });

    await this.page.waitForTimeout(200000);
    await this.page.mouse.up();
    console.log('[CaptchaSolver] Puzzle captcha solved');
  }

  async _solveIcon(modal) {
    console.log('[CaptchaSolver] Detected Icon captcha');
    const img = await modal.waitForSelector('.captcha-verify-image', { timeout: 10000 });
    const b64 = await this._downloadImage(img);
    if (!b64) { console.warn('[CaptchaSolver] Icon: image missing, skipping'); return; }

    const challenge = await modal.$eval('span', el => el.innerText.trim());
    const res = await fetch(`${BASE_URL}/icon?licenseKey=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge, imageB64: b64 })
    });
    const { points } = await res.json();
    if (!points?.length) { console.warn('[CaptchaSolver] Icon: no points, skipping'); return; }

    const box = await img.boundingBox();
    for (const { x: px, y: py } of points) {
      await this.page.mouse.click(box.x + px * box.width, box.y + py * box.height);
    }
    console.log('[CaptchaSolver] Icon captcha solved');
  }

  async solve() {
    const modal = await this.page.waitForSelector('.TUXModal.captcha-verify-container', { timeout: 60000 }).catch(() => null);
    if (!modal) {
      console.log('[CaptchaSolver] No captcha modal detected');
      return false;
    }

    const text = await modal.evaluate(el => el.innerText.toLowerCase());
    console.log('[CaptchaSolver] Captcha modal text:', text);

    if (text.includes('Drag the puzzle piece into place')) {
      await this._solvePuzzle(modal);
    } else if (text.includes('the same shape')) {
      await this._solveShapes(modal);
    } else if (text.includes('rotate')) {
      await this._solveRotate(modal);
    } else if (text.includes('which of these') || text.includes('brim') || text.includes('icon')) {
      await this._solveIcon(modal);
    } else {
      console.warn('[CaptchaSolver] Unable to detect captcha type, defaulting to Puzzle');
      await this._solveRotate(modal);
    }

   // await modal.waitForElementState('detached', { timeout: 30000 });
    console.log('[CaptchaSolver] Captcha modal closed');
    return true;
  }
}

module.exports = CaptchaSolver;
