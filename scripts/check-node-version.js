const major = Number(process.versions.node.split('.')[0]);

if (major < 22) {
  console.error(
    `Node.js 22 or newer is required. Current version: ${process.version}.`,
  );
  console.error('Run `nvm use` in this project, then retry the command.');
  process.exit(1);
}
