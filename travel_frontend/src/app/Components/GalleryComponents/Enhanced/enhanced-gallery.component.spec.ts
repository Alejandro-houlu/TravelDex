import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnhancedGalleryComponent } from './enhanced-gallery.component';

describe('EnhancedGalleryComponent', () => {
  let component: EnhancedGalleryComponent;
  let fixture: ComponentFixture<EnhancedGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnhancedGalleryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnhancedGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
