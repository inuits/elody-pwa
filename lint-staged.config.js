module.exports = {
  "*.ts": ["eslint --fix", "tsc-files --noEmit"],
  "*.vue": ["eslint --fix", "tsc-files --noEmit"],
};
