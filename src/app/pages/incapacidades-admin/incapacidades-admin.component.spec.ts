import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncapacidadesAdminComponent } from './incapacidades-admin.component';

describe('IncapacidadesAdminComponent', () => {
  let component: IncapacidadesAdminComponent;
  let fixture: ComponentFixture<IncapacidadesAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncapacidadesAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncapacidadesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
