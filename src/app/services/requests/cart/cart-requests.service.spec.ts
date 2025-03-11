import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CartRequestsService } from './cart-requests.service';

describe('CartRequestsService', () => {
  let service: CartRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CartRequestsService]
    });
    service = TestBed.inject(CartRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
}); 