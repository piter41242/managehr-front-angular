import { TestBed } from '@angular/core/testing';

import { HorasExtraJefeService } from './horasextra-jefe.service';

describe('HorasExtraJefeService', () => {
  let service: HorasExtraJefeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HorasExtraJefeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
}); 