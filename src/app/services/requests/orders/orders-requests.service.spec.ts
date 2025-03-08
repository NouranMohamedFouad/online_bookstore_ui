import { TestBed } from '@angular/core/testing';

import { OrdersRequestsService } from './orders-requests.service';

describe('OrdersRequestsService', () => {
  let service: OrdersRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdersRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
