import {execPromise} from './common';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

export const npmInstallPackage = (module: string) => {
  return execPromise(`${npmCommand} install ${module} --s`);
};

export const npmUninstallPackage = (module: string) => {
  return execPromise(`${npmCommand} uninstall ${module}`);
};
