'use strict';

import * as pq from 'proxyquire';

import { RedisInstances } from '../src/interfaces';

const proxyquire = pq.noPreserveCache();

describe('configParser', () => {
  let locateConfigSpy: jasmine.Spy;
  let readFileSyncSpy: jasmine.Spy;
  let loadSpy: jasmine.Spy;
  let parseConfig: (pattern: string | null, configOverride: string | null) => RedisInstances;

  beforeEach(() => {
    parseConfig = loadModule().parseConfig;
    mockYamlContents();
  });

  it('should parse configs', () => {
    const instances = parseConfig(null, 'zzz');

    expect(locateConfigSpy).toHaveBeenCalledWith('zzz');
    expect(readFileSyncSpy).toHaveBeenCalledWith('yyy', 'utf8');
    expect(loadSpy).toHaveBeenCalledWith('xxx');

    expect(instances).toEqual({
      'aaa-1': {
        label: 'aaa-1',
        index: 0
      },
      'aaa-2': {
        label: 'aaa-2',
        index: 1
      },
      'bbb-1': {
        label: 'bbb-1',
        index: 2
      },
      'bbb-2': {
        label: 'bbb-2',
        index: 3
      }
    } as any);
  });

  it('should parse configs with starting pattern', () => {
    const instances = parseConfig('aaa*', 'zzz');

    expect(locateConfigSpy).toHaveBeenCalledWith('zzz');
    expect(readFileSyncSpy).toHaveBeenCalledWith('yyy', 'utf8');
    expect(loadSpy).toHaveBeenCalledWith('xxx');

    expect(instances).toEqual({
      'aaa-1': {
        label: 'aaa-1',
        index: 0
      },
      'aaa-2': {
        label: 'aaa-2',
        index: 1
      }
    } as any);
  });

  it('should parse configs with ending pattern', () => {
    const instances = parseConfig('*-1', 'zzz');

    expect(locateConfigSpy).toHaveBeenCalledWith('zzz');
    expect(readFileSyncSpy).toHaveBeenCalledWith('yyy', 'utf8');
    expect(loadSpy).toHaveBeenCalledWith('xxx');

    expect(instances).toEqual({
      'aaa-1': {
        label: 'aaa-1',
        index: 0
      },
      'bbb-1': {
        label: 'bbb-1',
        index: 1
      }
    } as any);
  });

  it('should throw on missing label', () => {
   mockYamlContents([{ label: '', other: 'bad' } as any ]);

   expect(() => parseConfig(null, 'zzz'))
     .toThrowError('Missing label on {"label":"","other":"bad"}');
  });

  function mockYamlContents(override = [
    {
      label: 'aaa-1'
    }, {
      label: 'aaa-2'
    }, {
      label: 'bbb-1'
    }, {
      label: 'bbb-2'
    }
  ]) {
    loadSpy.and.returnValue(override);
  }

  function loadModule() {
    loadSpy = jasmine.createSpy();
    readFileSyncSpy = jasmine.createSpy().and.returnValue('xxx');
    locateConfigSpy = jasmine.createSpy().and.returnValue('yyy');

    return proxyquire('../src/configParser', {
      'js-yaml': {
        load: loadSpy
      },
      'fs': {
        readFileSync: readFileSyncSpy
      },
      './configLocator': {
        locateConfig: locateConfigSpy
      }
    });
  }

});
