#!/usr/bin/env node
import { program } from 'commander';
// 修改 JSON 导入方式
import pkg from '../package.json' with { type: 'json' };
import chalk from 'chalk';
// 添加 init 命令导入
import init from '../lib/commands/init.js';

program
  .name('SUCKSON CLI')
  .description('suckson project management tool')
  .version(pkg.version)
  .configureHelp({
    // 添加帮助标题
    helpTitle: chalk.green('\nSUCKSON CLI 使用指南\n'),
    // 自定义命令描述格式
    commandDescription: cmd => {
      return `${chalk.cyan(cmd.name().padEnd(15))}${cmd.description()}`
    }
  });

program
  .command('init <project-name>')
  .description(chalk.yellow('Initialize a new project'))
  // 添加参数校验提示
  .addHelpText('after', chalk.red('\n错误: 缺少必填参数 <project-name>'))
  .option('-f, --force', chalk.red('Overwrite target directory if it exists'))
  .action(init);  // 现在 init 函数已正确导入

program.parse(process.argv);