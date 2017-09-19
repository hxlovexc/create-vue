/**
 * @author [小缘]
 * @email [1440806569@qq.com]
 * @create date 2017-09-18 05:02:53
 * @modify date 2017-09-18 05:02:53
 * @desc [配置文件]
*/
const userHome = require('user-home');
const path = require('path');
let templateName = '.create-vue-templates';

let config = {
  // 模板文件名
  templateName,
  // 模板路径
  templatePath: path.join(userHome, templateName),
  // 模板下载地址
  templateDownloadPath: 'hxlovexc/webpack-project-config',
  templateList: [
    'package.json',
    '/config/index.js',
    '/build/webpack-base-config.js',
    '/build/webpack-dev-config.js',
    '/build/webpack-build-config.js',
    '/build/utils.js',
    '/src/main.js',
    '/.eslintignore'
  ]
};

module.exports = config;
