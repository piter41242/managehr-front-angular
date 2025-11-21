import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JefePersonalComponent } from './jefe-personal.component';

describe('JefePersonalComponent', () => {
  let component: JefePersonalComponent;
  let fixture: ComponentFixture<JefePersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JefePersonalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JefePersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
