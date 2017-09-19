const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const config = require('./config/');

exports.render = function (data) {
  return new Promise(async (resolve, reject) => {
    // 列表
    const tplList = config.templateList;
    // 遍历
    for (let i = 0; i < tplList.length; i++) {
      const filePath = path.join(config.templatePath, tplList[i]);
      let str = fs.readFileSync(filePath);
      str = ejs.render(str.toString(), data);
      // 写入
      await writeFile(filePath, str, i);
    }
    resolve();
  });
}

// 写入
function writeFile (filePath, str, i) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, str, (error, data) => {
      if (error) reject('模板写入失败', error);
      resolve();
    });
  });
}
