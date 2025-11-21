import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacacionesJefeComponent } from './vacaciones-jefe.component';

describe('VacacionesJefeComponent', () => {
  let component: VacacionesJefeComponent;
  let fixture: ComponentFixture<VacacionesJefeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacacionesJefeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VacacionesJefeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
