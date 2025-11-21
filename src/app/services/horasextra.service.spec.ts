import { TestBed } from '@angular/core/testing';

import { HorasextraService } from './horasextra.service';

describe('HorasextraService', () => {
  let service: HorasextraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HorasextraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
