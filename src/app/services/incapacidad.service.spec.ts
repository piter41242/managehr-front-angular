import { TestBed } from '@angular/core/testing';

import { IncapacidadService } from './incapacidad.service';

describe('IncapacidadService', () => {
  let service: IncapacidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncapacidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
