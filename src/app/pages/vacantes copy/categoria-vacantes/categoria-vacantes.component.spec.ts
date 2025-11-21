import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaVacantesComponent } from './categoria-vacantes.component';

describe('CategoriaVacantesComponent', () => {
  let component: CategoriaVacantesComponent;
  let fixture: ComponentFixture<CategoriaVacantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaVacantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriaVacantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
