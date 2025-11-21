import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormIncapacidadesComponent } from './form-incapacidades.component';

describe('FormIncapacidadesComponent', () => {
  let component: FormIncapacidadesComponent;
  let fixture: ComponentFixture<FormIncapacidadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormIncapacidadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormIncapacidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
