import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormvacacionesComponent } from './formvacaciones.component';

describe('FormvacacionesComponent', () => {
  let component: FormvacacionesComponent;
  let fixture: ComponentFixture<FormvacacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormvacacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormvacacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
