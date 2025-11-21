import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorasextraAdminComponent } from './horasextra-admin.component';

describe('HorasextraAdminComponent', () => {
  let component: HorasextraAdminComponent;
  let fixture: ComponentFixture<HorasextraAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorasextraAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorasextraAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
