import { TestBed } from '@angular/core/testing';

import { BooksRequestsService } from './books-requests.service';

describe('BooksRequestsService', () => {
  let service: BooksRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BooksRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});


