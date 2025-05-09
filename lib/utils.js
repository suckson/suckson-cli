import chalk from 'chalk';

// 修改导出方式
export const printSuccess = (message) => {
  console.log(chalk.green(`✓ ${message}`));
};

export const printError = (message) => {
  console.log(chalk.red(`✗ ${message}`));
};
