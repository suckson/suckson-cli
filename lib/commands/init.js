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
    
    // 更新 package.json
    const pkgPath = path.join(targetDir, 'package.json');
    let pkg;
    // 将 require(pkgPath) 改为动态导入
     pkg = await import(pkgPath);
    // 改为：
     pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
    
    // 修改后的 package.json 更新部分
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
    Object.assign(pkg, {
      name: answers.projectName,
      version: answers.version,
      description: answers.description,
      author: answers.author
    });
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    
    console.log(chalk.green('\nProject initialization completed!'));
    console.log(`\nTo get started:\n\n  cd ${projectName}\n  npm install\n  npm run dev\n`);
  } catch (error) {
    spinner.fail('Failed to download template: ' + error.message);
  }
}

function downloadTemplate(template, targetDir) {
  return new Promise((resolve, reject) => {
    download(`github:username/template-${template}`, targetDir, { clone: true }, err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// 只保留一个导出语句（删除文件末尾的重复定义）
export default init;