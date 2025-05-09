// 修改导入方式
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import download from 'download-git-repo';

async function init(projectName, options) {
  const cwd = process.cwd();
  const targetDir = path.join(cwd, projectName);
  
  // 检查目录是否存在
  if (fs.existsSync(targetDir)) {
    if (options.force) {
      await fs.remove(targetDir);
    } else {
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
          choices: [
            { name: 'Overwrite', value: 'overwrite' },
            { name: 'Cancel', value: false }
          ]
        }
      ]);
      
      if (!action) {
        return;
      } else if (action === 'overwrite') {
        console.log(`\nRemoving ${chalk.cyan(targetDir)}...`);
        await fs.remove(targetDir);
      }
    }
  }
  
  // 收集用户输入
  const answers = await inquirer.prompt([
    {
      name: 'projectName',
      message: 'Project name:',
      default: projectName
    },
    {
      name: 'version',
      message: 'Project version:',
      default: '1.0.0'
    },
    {
      name: 'description',
      message: 'Project description:'
    },
    {
      name: 'author',
      message: 'Author:'
    },
    {
      name: 'template',
      type: 'list',
      message: 'Select a template:',
      choices: ['vue', 'react', 'node']
    }
  ]);
  
  // 下载模板
  const spinner = ora('Downloading template...').start();
  try {
    await downloadTemplate(answers.template, targetDir);
    spinner.succeed('Template downloaded successfully!');
    
    // 修复路径协议问题
    const pkgPath = path.join(targetDir, 'package.json');
    let pkg;
    // 使用正确的文件读取方式
    pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
    
    Object.assign(pkg, {
      name: answers.projectName,
      version: answers.version,
      description: answers.description,
      author: answers.author
    });
    
    // 使用fs-extra的writeJSON方法
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    
    console.log(chalk.green('\nProject initialization completed!'));
    console.log(`\nTo get started:\n\n  cd ${projectName}\n  npm install\n  npm run dev\n`);
  } catch (error) {
    spinner.fail('Failed to download template: ' + error.message);
  }
}
//suckson_admin
function downloadTemplate(template, targetDir) {
  return new Promise((resolve, reject) => {  // 移除 async 关键字
    // 使用立即执行异步函数包裹原有逻辑
    (async () => {
      const repoUrl = 'direct:https://github.com/suckson/suckson_admin/archive/main.zip';
      const timeoutDuration = 60000;

      const timeoutPromise = new Promise((_, rej) => 
        setTimeout(() => rej(new Error('下载超时，请检查网络连接')), timeoutDuration)
      );

      try {
        await Promise.race([
          new Promise((res, rej) => {
            // 添加下载进度反馈
            let downloaded = 0;
            const progressCallback = (chunk) => {
              downloaded += chunk.length;
              console.log(`\r已下载 ${(downloaded/1024/1024).toFixed(1)}MB `);
            };

            download(
              repoUrl,
              targetDir,
              {
                clone: false,
                headers: {
                  'User-Agent': 'suckson-cli/1.0' // 添加必要请求头
                },
                extract: true,
                mode: '755',
                filter: () => true,
                onResponse: (res) => {
                  res.on('data', progressCallback);
                }
              },
              (err) => err ? rej(err) : res()
            );
          }),
          timeoutPromise
        ]);
        resolve();
      } catch (err) {
        console.error('\n下载故障排查建议:');
        console.log('1. 尝试切换镜像源: https://ghproxy.com/' + repoUrl);
        console.log('2. 检查防火墙/VPN设置');
        console.log('3. 执行 ping github.com 测试连通性');
        reject(err);
      }
    })();  // 立即执行异步函数
  });
}

// 只保留一个导出语句（删除文件末尾的重复定义）
export default init;