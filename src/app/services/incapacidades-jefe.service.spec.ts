import { TestBed } from '@angular/core/testing';

import { IncapacidadesJefeService } from './incapacidades-jefe.service';

describe('IncapacidadesJefeService', () => {
  let service: IncapacidadesJefeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncapacidadesJefeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
}); 