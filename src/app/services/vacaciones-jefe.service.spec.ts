import { TestBed } from '@angular/core/testing';

import { VacacionesJefeService } from './vacaciones-jefe.service';

describe('VacacionesJefeService', () => {
  let service: VacacionesJefeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VacacionesJefeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
