import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncapacidadesJefeComponent } from './incapacidades-jefe.component';

describe('IncapacidadesJefeComponent', () => {
  let component: IncapacidadesJefeComponent;
  let fixture: ComponentFixture<IncapacidadesJefeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncapacidadesJefeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IncapacidadesJefeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 