module.exports = {
  "!(*config).ts": ["eslint --fix", "tsc-files --noEmit", "git add"],
  "*.vue": ["eslint --fix", "tsc-files --noEmit", "git add"],
};
