import {release, platform} from 'os';

import {execPromise} from './helpers';

/**
 * Executes `lsb_release -a` command in terminal.
 *
 * ```
 * Distributor ID: Ubuntu
 * Description:    Ubuntu 22.04.4 LTS
 * Release:        22.04
 * Codename:       jammy
 * ```
 *
 * Parses os and os-version from the response.
 */
const getLinuxInfo = async () => {
  const {stdout} = await execPromise('lsb_release -a');
  console.log('mrstdout: ', stdout);

  const parseLinuxVersion = (lsbReleaseResponse: string) => {
    const regex =
      /Distributor ID: ([^\n]+)\nDescription: +([^ ]+) +([^ ]+) +(.+)\n/;
    const match = lsbReleaseResponse.match(regex);

    return {
      os: match ? match[1] : platform(),
      'os-version': match ? `${match[3]} ${match[4]}` : release(),
    };
  };

  return parseLinuxVersion(stdout);
};

/**
 * Executes in CMD `systeminfo | findstr /B /C:"OS Name" /B /C:"OS Version"` command.
 *
 * ```
 * OS Name:                   Microsoft Windows 11 Enterprise
 * OS Version:                10.0.22631 N/A Build 22631
 * ```
 *
 * Parses os and os-version from the response.
 */
const getWindowsInfo = async () => {
  const {stdout} = await execPromise(
    'systeminfo | findstr /B /C:"OS Name" /B /C:"OS Version"'
  );

  const parseWindowsInfo = (systemInfoResponse: string) => {
    const regex =
      /OS Name:\s+([^\n]+)\nOS Version:\s+([\d.]+)\s+(N\/A\s+Build\s+(\d+))/;
    const match = systemInfoResponse.match(regex);

    return {
      os: match ? match[1] : platform(),
      'os-version': match ? `${match[2]} ${match[3]}` : release(),
    };
  };

  return parseWindowsInfo(stdout);
};

/**
 * Executes `sw_vers` command in terminal.
 *
 * ```
 * ProductName:      macOS
 * ProductVersion:   14.3.1
 * BuildVersion:     23D60
 * ```
 *
 * Parses os and os version from the response.
 */
const getMacVersion = async () => {
  const {stdout} = await execPromise('sw_vers');

  const parseMacInfo = (swVersResponse: string) => {
    const productNameRegex = /ProductName:\s*(.+)/;
    const productVersionRegex = /ProductVersion:\s*(.+)/;

    const nameMatch = swVersResponse.match(productNameRegex);
    const versionMatch = swVersResponse.match(productVersionRegex);

    return {
      os: nameMatch ? nameMatch[1].trim() : platform(),
      'os-version': versionMatch ? versionMatch[1].trim() : release(),
    };
  };

  return parseMacInfo(stdout);
};

/**
 * Finds operating system information like name and version.
 */
export const osInfo = async () => {
  const osKind = platform();

  switch (osKind) {
    case 'darwin':
      return getMacVersion();
    case 'linux':
      return getLinuxInfo();
    case 'win32':
      return getWindowsInfo();
    default:
      return {
        os: osKind,
        'os-version': release(),
      };
  }
};
