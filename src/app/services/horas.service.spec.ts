import { TestBed } from '@angular/core/testing';

import { HorasService } from './horas.service';

describe('HorasService', () => {
  let service: HorasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HorasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
