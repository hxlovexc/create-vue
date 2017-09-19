#!/usr/bin/env node
const program = require('commander');
const inquirer = require('inquirer');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const download = require('download-git-repo');
const ora = require('ora');
const rm = require('rimraf').sync;
const pack = require('../package.json');
const config = require('./config/index');
const renderTemplate = require('./render');

inquirer.registerPrompt('chalk-pipe', require('inquirer-chalk-pipe'));

program
  .version(pack.version);

program
  .command('init')
  .description('创建项目')
  .action(async (fileName) => {
    // 选项
    let options = {};
    // 项目目录
    let projectPath = path.join(process.cwd(), fileName);
    // 组织需要过滤的文件或目录
    let filterFiles = [];
    if (typeof fileName !== 'string') {
      console.log('文件夹名称不能为空 => demo: create-vue init projectName');
      return;
    }
    try {
      // await downloadTemplate();

      // 判断文件夹是否存在
      await isExistence(fileName);

      // 项目名称
      Object.assign(options, await prompt({
        type: 'input',
        message: '项目名称:',
        default: fileName,
        name: 'name'
      }));

      // 项目介绍
      Object.assign(options, await prompt({
        type: 'input',
        message: '项目介绍:',
        name: 'description'
      }));

      // 作者
      Object.assign(options, await prompt({
        type: 'input',
        message: '作者:',
        name: 'author'
      }));

      // 单页 or 多页
      let data = await prompt({
        type: 'list',
        name: 'type',
        message: '请选择多页或单页模式:',
        choices: ['单页', '多页']
      });

      Object.assign(options, {
        type: data.type === '单页'
      });

      // 公用模块提取方式
      Object.assign(options, await prompt({
        type: 'list',
        name: 'extractingType',
        message: '公用模块提取方式:',
        choices: ['commonsChunkPlugin', 'dll']
      }));

      // css预处理
      Object.assign(options, await prompt({
        type: 'list',
        name: 'cssPretreatment',
        message: '请选择css预处理:',
        choices: ['less', 'sass', 'stylus', '不使用']
      }));

      // 是否开启eslint
      try {
        await prompt({
          type: 'confirm',
          message: '是否开启 eslint (js代码检测) ?',
          name: 'eslint'
        });
        options.eslint = true;
      } catch (error) {
        options.eslint = false;
      };

      // 是否开启stylelint
      try {
        await prompt({
          type: 'confirm',
          message: '是否开启 stylelint (css检测) ?',
          name: 'stylelint'
        });
        options.stylelint = true;
      } catch (error) {
        options.stylelint = false;
      };

      // 是否集成vue-router
      try {
        await prompt({
          type: 'confirm',
          message: '是否集成vue-router ?',
          name: 'router'
        });
        options.router = true;
      } catch (error) {
        options.router = false;
      };
      // 渲染配置
      console.log('开始渲染模板...');
      await renderTemplate.render(options);
      console.log('模板渲染完成...');
      console.log('开始拷贝模板...');
      // 组织需要过滤的文件
      // dll
      if (options.extractingType === 'commonsChunkPlugin') filterFiles.push('webpack-dll-config.js');
      // eslint
      if (!options.eslint) filterFiles.push('/.eslintrc.js', '/.eslintignore');
      // eslint
      if (!options.stylelint) filterFiles.push('/stylelint.config.js');
      // 单页
      if (options.type) {
        filterFiles.push('/views');
      } else {
        filterFiles.push('/src/index.html', '/src/main.js');
      };
      // 路由
      if (!options.router) filterFiles.push('/router');
      await copyTemplate(config.templatePath, projectPath, filterFiles);
      console.log('项目创建完成....');
      console.log(`执行以下操作进行开发:`);
      console.log(`    cd ${fileName}`);
      console.log(`    npm run install or yarn`);
      console.log(`    npm run dev`);
    } catch (error) {
      console.error(error);
    }
  });

program.parse(process.argv);

// 文件夹是否存在
function isExistence(name) {
  return new Promise(async (resolve, reject) => {
    // 文件夹存在就询问是否继续
    if (fs.existsSync(name)) {
      try {
        await prompt({
          type: 'confirm',
          message: '文件夹已经存在, 是否继续?',
          name: 'state'
        });
        resolve();
      } catch (error) {
        reject('您已取消操作!');
      }
    } else {
      resolve();
    }
  });
}

// 
function prompt(options) {
  return new Promise((resolve, reject) => {
    inquirer.prompt(options).then((data) => {
      if (options.type === 'confirm') {
        if (data[Object.keys(data)[0]]) {
          resolve(data);
        } else {
          reject(data);
        }
      } else {
        resolve(data);
      }
    });
  });
}

// 文件下载
function downloadTemplate() {
  return new Promise((resolve, reject) => {
    // 如果文件夹存在则先删除
    if (fs.existsSync(config.templatePath)) rm(config.templatePath);
    // 下载文件
    let spinner = ora('正在下载模板文件.....');
    spinner.start();
    download(config.templateDownloadPath, config.templatePath, (error, data) => {
      spinner.stop();
      if (error) {
        console.log('模板下载失败');
        reject(error);
        return;
      }
      console.log('模板下载完成');
      resolve();
    });
  });
}

// 拷贝文件夹
function copyTemplate (src, dest, filterFiles) {
  return new Promise((resolve, reject) => {
    fse.copy(src, dest, { filter: filter })
    .then(() => {
      resolve();
    })
    .catch(err => {
      reject('模板拷贝错误...', err);
    });

    // 过滤
    function filter (src, dest) {
      let state = true;
      src = src.replace(/\\/g, '\/');
      for (let i = 0; i < filterFiles.length; i++) {
        if (src.indexOf(filterFiles[i]) >= 0) {
          state = false;
          break;
        }
      }
      return state;
    }
  });
}
