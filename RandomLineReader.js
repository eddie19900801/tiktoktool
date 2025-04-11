const fs = require('fs');

class RandomLineReader {
  /**
   * 构造函数
   * @param {string} filePath - TXT 文件路径
   */
  constructor(filePath) {
    this.filePath = filePath;
    this.lines = [];
    this._loadFile();
  }

  /**
   * 读取文件并按行存储到 this.lines 中
   */
  _loadFile() {
    try {
      // 读取文件内容，使用 UTF-8 编码
      const data = fs.readFileSync(this.filePath, 'utf-8');
      // 按换行符分割文件，过滤掉空白行
      this.lines = data.split(/\r?\n/).filter(line => line.trim() !== "");
    } catch (err) {
      console.error("读取文件错误:", err);
    }
  }

  /**
   * 获取随机一行文本
   * @returns {string|null} 返回随机的一行文本，如果没有内容则返回 null
   */
  getRandomLine() {
    if (this.lines.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * this.lines.length);
    return this.lines[randomIndex];
  }
}

module.exports = RandomLineReader;
