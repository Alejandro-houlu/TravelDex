import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCamComponent } from './main-cam.component';

describe('MainCamComponent', () => {
  let component: MainCamComponent;
  let fixture: ComponentFixture<MainCamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainCamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainCamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
