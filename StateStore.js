const fs = require('fs');
const path = require('path');

// 默认数据文件位置，可以根据需要修改
const DEFAULT_STATE_FILE = path.join(__dirname, 'state.json');

class StateStore {
  /**
   * @param {string} filePath - JSON 状态文件路径，默认为 DEFAULT_STATE_FILE
   */
  constructor(filePath = DEFAULT_STATE_FILE) {
    // 如果已有实例，直接返回该实例，确保全局唯一
    if (StateStore.instance) {
      return StateStore.instance;
    }
    this.filePath = filePath;
    this.data = {};
    this._load();
    StateStore.instance = this;
  }

  /**
   * 从 JSON 文件中加载状态数据
   */
  _load() {
    if (fs.existsSync(this.filePath)) {
      try {
        const content = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(content);
      } catch (e) {
        console.error('加载状态数据失败，使用空状态。错误：', e);
        this.data = {};
      }
    } else {
      this.data = {};
    }
  }

  /**
   * 保存状态数据到 JSON 文件
   */
  _save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error('保存状态数据失败。错误：', e);
    }
  }

  /**
   * 获取指定 key 对应的值
   * @param {string} key
   * @returns {any} 返回存储的值
   */
  get(key) {
    return this.data[key];
  }

  /**
   * 设置 key 对应的值，并保存到文件
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    this.data[key] = value;
    this._save();
  }

  /**
   * 批量更新状态数据（合并到现有数据中），并保存
   * @param {Object} newData
   */
  update(newData) {
    this.data = Object.assign({}, this.data, newData);
    this._save();
  }

  /**
   * 返回整个状态数据对象
   * @returns {Object}
   */
  getAll() {
    return this.data;
  }
}

// 导出单例实例，确保全局只有一个 StateStore 对象
module.exports = new StateStore();
