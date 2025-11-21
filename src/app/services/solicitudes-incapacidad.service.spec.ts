import { TestBed } from '@angular/core/testing';

import { SolicitudesIncapacidadService } from './solicitudes-incapacidad.service';

describe('SolicitudesIncapacidadService', () => {
  let service: SolicitudesIncapacidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolicitudesIncapacidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
