import { TestBed } from '@angular/core/testing';

import { HojaDeVidaService } from './hoja-de-vida.service';

describe('HojaDeVidaService', () => {
  let service: HojaDeVidaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HojaDeVidaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
