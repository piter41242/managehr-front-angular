import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorasExtraJefeComponent } from './horasextra-jefe.component';

describe('HorasExtraJefeComponent', () => {
  let component: HorasExtraJefeComponent;
  let fixture: ComponentFixture<HorasExtraJefeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorasExtraJefeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HorasExtraJefeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 