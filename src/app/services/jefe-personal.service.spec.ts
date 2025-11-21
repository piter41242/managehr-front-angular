import { TestBed } from '@angular/core/testing';

import { JefePersonalService } from './jefe-personal.service';

describe('JefePersonalService', () => {
  let service: JefePersonalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JefePersonalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
