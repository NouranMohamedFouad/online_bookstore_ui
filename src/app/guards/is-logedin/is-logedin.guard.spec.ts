import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isLogedinGuard } from './is-logedin.guard';

describe('isLogedinGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isLogedinGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
