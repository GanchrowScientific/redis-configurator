'use strict';

import * as path from 'path';
import * as pq from 'proxyquire';

const proxyquire = pq.noPreserveCache();

describe('configLocator', () => {
  let existsSyncSpy: jasmine.Spy;
  let isFileSpy: jasmine.Spy;
  let statSyncSpy: jasmine.Spy;
  let locateConfig: (configOverride: string | null) => string;

  beforeEach(() => {
    locateConfig = loadModule().locateConfig;
  });

  it('should locate the config using an override', () => {
    existsSyncSpy.and.returnValue(true);
    isFileSpy.and.returnValue(true);

    expect(locateConfig('xxx')).toBe('xxx');
    expect(existsSyncSpy).toHaveBeenCalledWith('xxx');
    expect(statSyncSpy).toHaveBeenCalledWith('xxx');
  });

  it('should throw when override doesn\'t exist', () => {
    existsSyncSpy.and.returnValue(false);
    isFileSpy.and.returnValue(true);

    expect(() => locateConfig('xxx')).toThrowError('xxx not found.');
    expect(existsSyncSpy).toHaveBeenCalledWith('xxx');
  });

  it('should throw when override not a file', () => {
    existsSyncSpy.and.returnValue(true);
    isFileSpy.and.returnValue(false);

    expect(() => locateConfig('xxx')).toThrowError('xxx is not a file.');
    expect(existsSyncSpy).toHaveBeenCalledWith('xxx');
    expect(statSyncSpy).toHaveBeenCalledWith('xxx');
  });

  it('should find config in current directory', () => {
    existsSyncSpy.and.returnValue(true);
    isFileSpy.and.returnValue(true);

    const cwdSpy = spyOn(process, 'cwd').and.returnValue(path.join('a', 'b', 'c'));
    const config = locateConfig(null);

    expect(cwdSpy).toHaveBeenCalled();
    expect(config).toEqual(path.join('a', 'b', 'c', 'redis-configurator.yaml'));
  });

  it('should find dot config in current directory', () => {
    existsSyncSpy.and.returnValues(false, true);
    isFileSpy.and.returnValue(true);

    const cwdSpy = spyOn(process, 'cwd').and.returnValue(path.join('a', 'b', 'c'));
    const config = locateConfig(null);

    expect(cwdSpy).toHaveBeenCalled();
    expect(config).toEqual(path.join('a', 'b', 'c', '.redis-configurator'));
  });

  it('should find config in parent directory', () => {
    existsSyncSpy.and.returnValues(false, false, true);
    isFileSpy.and.returnValue(true);

    const cwdSpy = spyOn(process, 'cwd').and.returnValue(path.join('a', 'b', 'c'));
    const config = locateConfig(null);

    expect(cwdSpy).toHaveBeenCalled();
    expect(config).toEqual(path.join('a', 'b', 'redis-configurator.yaml'));
  });

  it('should find dot config in parent directory', () => {
    existsSyncSpy.and.returnValues(false, false, false, true);
    isFileSpy.and.returnValue(true);

    const cwdSpy = spyOn(process, 'cwd').and.returnValue(path.join('a', 'b', 'c'));
    const config = locateConfig(null);

    expect(cwdSpy).toHaveBeenCalled();
    expect(config).toEqual(path.join('a', 'b', '.redis-configurator'));
  });

  it('should find config in home directory', () => {
    existsSyncSpy.and.callFake((arg: string) => arg.startsWith(path.join('home', 'body')));
    isFileSpy.and.returnValue(true);

    const cwdSpy = spyOn(process, 'cwd').and.returnValue(path.join('home', 'body'));
    const config = locateConfig(null);

    expect(cwdSpy).toHaveBeenCalled();
    expect(config).toEqual(path.join('home', 'body', 'redis-configurator.yaml'));
  });

  it('should find dot config in home directory', () => {
    existsSyncSpy.and.callFake((arg: string) => arg.startsWith(path.join('home', 'body', '.r')));
    isFileSpy.and.returnValue(true);

    const cwdSpy = spyOn(process, 'cwd').and.returnValue(path.join('home', 'body'));
    const config = locateConfig(null);

    expect(cwdSpy).toHaveBeenCalled();
    expect(config).toEqual(path.join('home', 'body', '.redis-configurator'));
  });

  it('should fail to find a config file', () => {
    spyOn(process, 'cwd').and.returnValue(path.join('home', 'body'));
    expect(() => locateConfig(null)).toThrowError('No config file found.');
  });

  function loadModule() {
    existsSyncSpy = jasmine.createSpy();
    isFileSpy = jasmine.createSpy();
    statSyncSpy = jasmine.createSpy();
    return proxyquire('../src/configLocator', {
      fs: {
        existsSync: existsSyncSpy,
        statSync: statSyncSpy.and.returnValue({
          isFile: isFileSpy
        })
      },
      os: {
        homedir: () => path.join('home', 'body')
      }
    });
  }
});
