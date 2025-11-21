import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HojaDeVidaComponent } from './hoja-de-vida.component';

describe('HojaDeVidaComponent', () => {
  let component: HojaDeVidaComponent;
  let fixture: ComponentFixture<HojaDeVidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HojaDeVidaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HojaDeVidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
