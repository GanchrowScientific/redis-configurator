'use strict';

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

/**
 * Locates the config file to use for this run. Algorithm is as follows:
 *
 * 1. If specified as a command line argument, use that one (fail if not found)
 * 2. Else look in CWD for redis-configurator.yaml or .redis-configurator
 * 3. Walk parent directories looking for file
 * 4. Look in home directory
 * 5. FAIL
 */

const FILENAME = 'redis-configurator.yaml';
const DOT_FILENAME = '.redis-configurator';

export function locateConfig(configOverride: string | null): string {
  if (configOverride) {
    if (!fs.existsSync(configOverride)) {
      throw new Error(`${configOverride} not found.`);
    } else if (!fs.statSync(configOverride).isFile()) {
      throw new Error(`${configOverride} is not a file.`);
    }
    return configOverride;
  }

  let currentDir = process.cwd();
  do {
    const fname = tryDir(currentDir);
    if (fname) {
      return fname;
    }

    currentDir = path.dirname(currentDir);
  } while (currentDir && currentDir !== path.sep && currentDir !== '.');

  const homeName = tryDir(os.homedir());
  if (homeName) {
    return homeName;
  }

  throw new Error('No config file found.');
}

function tryDir(dirname: string): string | undefined {
  let fname = path.join(dirname, FILENAME);
  if (fs.existsSync(fname) && fs.statSync(fname).isFile()) {
    return fname;
  }
  fname = path.join(dirname, DOT_FILENAME);
  if (fs.existsSync(fname) && fs.statSync(fname).isFile()) {
    return fname;
  }

  return;
}
