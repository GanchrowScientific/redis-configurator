'use string';

import { iterateClients } from '../src/iterateClients';

describe('iterateClients', () => {
  it('should end all clients', () => {
    const clients = {
      a: { client: 1 },
      c: { client: 3 },
      b: { client: 2 },
    };

    const instances = {
      b: { index: 2 },
      c: { index: 3 },
      a: { index: 1 },
    };

    const results: any[] = [];
    iterateClients(clients as any, instances as any, async (instance, client) =>
      (results.push([ instance, client ]), undefined));

    expect(results).toEqual([
      [ instances.a, clients.a ],
      [ instances.b, clients.b ],
      [ instances.c, clients.c ],
    ]);
  });
});
