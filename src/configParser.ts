'use strict';

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as minimatch from 'minimatch';

import { locateConfig } from './configLocator';
import { RawConfig, RedisInstances } from './interfaces';

export function parseConfig(pattern: string | null, configOverride: string | null): RedisInstances {
  const configFile = locateConfig(configOverride);
  const config = yaml.load(fs.readFileSync(configFile, 'utf8')) as RawConfig;

  return config
    .filter(instance => !pattern || minimatch(instance.label, pattern))
    .map(instance => {
      if (!instance.label) {
        throw new Error(`Missing label on ${JSON.stringify(instance)}`);
      }
      return instance;
    })
    .reduce((configs, instance, index) => {
      configs[instance.label] = instance;
      instance.index = index;
      return configs;
    }, {} as RedisInstances);
}
