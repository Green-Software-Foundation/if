import {release, platform} from 'os';

import {execFilePromise} from '../../common/util/helpers';

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
  const {stdout} = await execFilePromise('lsb_release', ['-id']);

  const parseLinuxVersion = (lsbReleaseResponse: string) => {
    const regex =
      /^Distributor ID:\t(.+)\nDescription:\t([^ ]+) +([^ ]+) +(.+)$/m;
    const match = lsbReleaseResponse.match(regex);

    return {
      os: match ? match[1] : platform(),
      'os-version': match ? `${match[3]} ${match[4]}` : release(),
    };
  };

  return parseLinuxVersion(stdout);
};

/**
 * Executes in CMD `powershell -Command "Get-WmiObject Win32_OperatingSystem | Format-List -Property Caption, Version, BuildNumber"` command.
 *
 * ```
 * Caption     : Microsoft Windows 11 Enterprise\r
 * Version     : 10.0.22631\r
 * BuildNumber : 22631\r
 * ```
 *
 * Parses os and os-version from the response.
 */
const getWindowsInfo = async () => {
  const {stdout} = await execFilePromise('powershell', [
    '-Command',
    'Get-WmiObject Win32_OperatingSystem | Format-List -Property Caption, Version, BuildNumber',
  ]);

  const parseWindowsInfo = (systemInfoResponse: string) => {
    const regex =
      /^Caption\s*:\s*(.*)\r?\nVersion\s*:\s*(.*)\r?\nBuildNumber\s*:\s*(.*)$/m;
    const match = systemInfoResponse.match(regex);

    return {
      os: match ? match[1] : platform(),
      'os-version': match ? `${match[2]} N/A Build ${match[3]}` : release(),
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
  const {stdout} = await execFilePromise('sw_vers');

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
