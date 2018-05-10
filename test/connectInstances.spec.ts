'use strict';

import * as pq from 'proxyquire';

const proxyquire = pq.noPreserveCache();

describe('connectInstances', () => {
  let redisClientSpy: jasmine.Spy;
  let client1: { on: jasmine.Spy, end: jasmine.Spy };
  let client2: { on: jasmine.Spy, end: jasmine.Spy };
  let connectInstances: any;
  let instances: any;

  beforeEach(() => {
    connectInstances = loadModule().connectInstances;
    instances = {
      i1: { label: 'i1' },
      i2: { label: 'i2' },
    };
  });

  it('should connect instances without error', async (done) => {
    try {
      const promise = connectInstances(instances);

      expect(redisClientSpy).toHaveBeenCalledTimes(2);
      expect(redisClientSpy).toHaveBeenCalledWith(instances.i1);
      expect(redisClientSpy).toHaveBeenCalledWith(instances.i2);

      expect(client1.on).toHaveBeenCalledTimes(2);
      expect(client1.on).toHaveBeenCalledWith('ready', jasmine.anything());
      expect(client1.on).toHaveBeenCalledWith('error', jasmine.anything());

      expect(client2.on).toHaveBeenCalledTimes(2);
      expect(client2.on).toHaveBeenCalledWith('ready', jasmine.anything());
      expect(client2.on).toHaveBeenCalledWith('error', jasmine.anything());

      // invokes the ready callback
      client1.on.calls.argsFor(0)[1]();
      client2.on.calls.argsFor(0)[1]();

      const { clients, errors } = await promise;
      expect(clients).toEqual({
        i1: client1,
        i2: client2
      });

      expect(client1.end).not.toHaveBeenCalled();
      expect(client2.end).not.toHaveBeenCalled();

      expect(errors).toEqual({});
    } catch (e) {
      fail(e);
    }
    done();
  });

  it('should connect instances with one error', async (done) => {
    try {
      const promise = connectInstances(instances);

      expect(redisClientSpy).toHaveBeenCalledTimes(2);
      expect(redisClientSpy).toHaveBeenCalledWith(instances.i1);
      expect(redisClientSpy).toHaveBeenCalledWith(instances.i2);

      expect(client1.on).toHaveBeenCalledTimes(2);
      expect(client1.on).toHaveBeenCalledWith('ready', jasmine.anything());
      expect(client1.on).toHaveBeenCalledWith('error', jasmine.anything());

      expect(client2.on).toHaveBeenCalledTimes(2);
      expect(client2.on).toHaveBeenCalledWith('ready', jasmine.anything());
      expect(client2.on).toHaveBeenCalledWith('error', jasmine.anything());

      // invokes the ready callback
      client1.on.calls.argsFor(0)[1]();

      // invokes the error callback
      client2.on.calls.argsFor(1)[1]('ERROR');

      expect(client1.end).not.toHaveBeenCalled();
      expect(client2.end).toHaveBeenCalled();

      const { clients, errors } = await promise;
      expect(clients).toEqual({
        i1: client1
      });

      expect(errors).toEqual({
        i2: 'ERROR'
      });
    } catch (e) {
      fail(e);
    }
    done();
  });

  it('should connect instances with two errors', async (done) => {
    try {
      const promise = connectInstances(instances);

      expect(redisClientSpy).toHaveBeenCalledTimes(2);
      expect(redisClientSpy).toHaveBeenCalledWith(instances.i1);
      expect(redisClientSpy).toHaveBeenCalledWith(instances.i2);

      expect(client1.on).toHaveBeenCalledTimes(2);
      expect(client1.on).toHaveBeenCalledWith('ready', jasmine.anything());
      expect(client1.on).toHaveBeenCalledWith('error', jasmine.anything());

      expect(client2.on).toHaveBeenCalledTimes(2);
      expect(client2.on).toHaveBeenCalledWith('ready', jasmine.anything());
      expect(client2.on).toHaveBeenCalledWith('error', jasmine.anything());

      // invokes the error callback
      client1.on.calls.argsFor(1)[1]('ERROR1');
      client2.on.calls.argsFor(1)[1]('ERROR2');

      expect(client1.end).toHaveBeenCalled();
      expect(client2.end).toHaveBeenCalled();

      const { clients, errors } = await promise;
      expect(clients).toEqual({
      });

      expect(errors).toEqual({
        i1: 'ERROR1',
        i2: 'ERROR2'
      });
    } catch (e) {
      fail(e);
    }
    done();
  });

  it('should connect instances with error on ready function', async (done) => {
    try {
      const promise = connectInstances(instances);

      expect(redisClientSpy).toHaveBeenCalledTimes(2);
      expect(redisClientSpy).toHaveBeenCalledWith(instances.i1);
      expect(redisClientSpy).toHaveBeenCalledWith(instances.i2);

      expect(client1.on).toHaveBeenCalledTimes(2);
      expect(client1.on).toHaveBeenCalledWith('ready', jasmine.anything());
      expect(client1.on).toHaveBeenCalledWith('error', jasmine.anything());

      expect(client2.on).toHaveBeenCalledTimes(2);
      expect(client2.on).toHaveBeenCalledWith('ready', jasmine.anything());
      expect(client2.on).toHaveBeenCalledWith('error', jasmine.anything());

      // invokes the ready callback
      client1.on.calls.argsFor(0)[1]();
      client2.on.calls.argsFor(0)[1]('ERROR2');

      expect(client1.end).not.toHaveBeenCalled();
      expect(client2.end).toHaveBeenCalled();

      const { clients, errors } = await promise;
      expect(clients).toEqual({
        i1: client1,
      });

      expect(errors).toEqual({
        i2: 'ERROR2'
      });
    } catch (e) {
      fail(e);
    }
    done();
  });

  function loadModule() {
    client1 = {
      on: jasmine.createSpy(),
      end: jasmine.createSpy()
    };
    client2 = {
      on: jasmine.createSpy(),
      end: jasmine.createSpy()
    };
    redisClientSpy = jasmine.createSpy().and.returnValues(client1, client2);

    return proxyquire('../src/connectInstances', {
      redis: {
        RedisClient: redisClientSpy
      }
    });
  }
});
