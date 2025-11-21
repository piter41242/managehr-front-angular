import { TestBed } from '@angular/core/testing';

import { PostulacionesadminService } from './postulacionesadmin.service';

describe('PostulacionesadminService', () => {
  let service: PostulacionesadminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostulacionesadminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
