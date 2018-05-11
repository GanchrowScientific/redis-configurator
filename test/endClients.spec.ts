'use string';

import { endClients } from '../src/endClients';

describe('endClients', () => {
  it('should end all clients', () => {
    const clients = {
      a: { end: jasmine.createSpy() },
      b: { end: jasmine.createSpy() },
    };

    endClients(clients as any);

    expect(clients.a.end).toHaveBeenCalled();
    expect(clients.b.end).toHaveBeenCalled();
  });
});
