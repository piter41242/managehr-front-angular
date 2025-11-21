import { TestBed } from '@angular/core/testing';

import { SolicitudesVacacionesService } from './solicitudes-vacaciones.service';

describe('SolicitudesVacacionesService', () => {
  let service: SolicitudesVacacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolicitudesVacacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
