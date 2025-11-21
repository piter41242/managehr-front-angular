import { TestBed } from '@angular/core/testing';

import { MispostulacionesService } from './mispostulaciones.service';

describe('MispostulacionesService', () => {
  let service: MispostulacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MispostulacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
