const fs = require('fs');
const path = require('path');

class VideoManager {
  /**
   * @param {string|null} folderPath 短视频所在的文件夹路径，若为 null 则仅加载旧状态
   * @param {string} stateFile  本地保存视频状态的文件名称
   */
  constructor(folderPath, stateFile) {
    // 若 folderPath 为假值（undefined、null、空字符串），则不进行扫描，只加载旧状态
    this.folderPath = folderPath || null;
    this.stateFile = stateFile;
    this.videoList = []; // 数组中每项为 { path: string, used: boolean }
    this._loadVideos();
  }

  _loadVideos() {
    let scannedFiles = [];
    // 如果提供了视频目录，则扫描当前目录中符合视频格式的文件（忽略非文件）
    if (this.folderPath) {
      try {
        scannedFiles = fs.readdirSync(this.folderPath);
      } catch (err) {
        console.error(`读取目录 ${this.folderPath} 错误: ${err.message}`);
        scannedFiles = [];
      }
  
      const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.flv', '.wmv'];
      scannedFiles = scannedFiles.filter(file => {
        const fullPath = path.join(this.folderPath, file);
        try {
          if (!fs.statSync(fullPath).isFile()) return false;
        } catch (err) {
          console.error(`Error accessing ${fullPath}: ${err.message}`);
          return false;
        }
        const ext = path.extname(file).toLowerCase();
        return videoExtensions.includes(ext);
      }).map(file => path.join(this.folderPath, file));
    }
    
    // 读取旧状态（如果存在），保存格式为数组 [{path, used}, ...]
    let savedList = [];
    if (fs.existsSync(this.stateFile)) {
      try {
        const data = fs.readFileSync(this.stateFile, 'utf-8');
        savedList = JSON.parse(data);
      } catch (err) {
        console.error('读取状态文件失败，使用空状态', err);
      }
    }
    
    // 用对象保存旧状态，key 为文件路径，value 为 used 状态
    const savedDict = {};
    savedList.forEach(entry => {
      savedDict[entry.path] = entry.used;
    });
    
    // 对扫描到的视频：若不在旧状态中，则添加，初始 used 为 false
    scannedFiles.forEach(filePath => {
      if (!(filePath in savedDict)) {
        savedDict[filePath] = false;
      }
    });
    
    // 构造最终 videoList，保留所有旧记录和扫描到的新文件
    this.videoList = [];
    for (const filePath in savedDict) {
      this.videoList.push({
        path: filePath,
        used: savedDict[filePath]
      });
    }
    
    this._saveState();
  }

  _saveState() {
    fs.writeFileSync(this.stateFile, JSON.stringify(this.videoList, null, 2));
  }

  /**
   * 获取第一个未使用的视频，并将其标记为已使用
   * @returns {string|null} 视频完整路径，若不存在则返回 null
   */
  getUnusedVideo() {
    const video = this.videoList.find(v => !v.used);
    if (video) {
      video.used = true;
      this._saveState();
      return video.path;
    }
    return null;
  }

  /**
   * 将指定视频标记为未使用
   * @param {string} videoPath 
   */
  releaseVideo(videoPath) {
    const video = this.videoList.find(v => v.path === videoPath);
    if (video) {
      video.used = false;
      this._saveState();
    }
  }

  /**
   * 更新视频目录，重新扫描该目录的视频文件，
   * 将新扫描到的文件添加到状态记录中，保留旧记录（不删除或覆盖 used 状态）
   * @param {string} newFolderPath 新的视频目录
   */
  updateFolderPath(newFolderPath) {
    this.folderPath = newFolderPath;
    this._loadVideos();
  }
}

module.exports = VideoManager;
