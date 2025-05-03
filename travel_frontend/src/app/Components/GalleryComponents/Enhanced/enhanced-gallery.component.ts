import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../Shared/shared.module';
import { Lightbox, LightboxModule } from 'ngx-lightbox';
import { DetectedLandmark, EnhancedUserAlbum } from '../../../store/Album/Album_model';
import { GalleryService } from '../../../Services/GalleryService';

@Component({
  selector: 'app-enhanced-gallery',
  standalone: true,
  imports: [CommonModule, SharedModule, LightboxModule],
  providers: [GalleryService],
  templateUrl: './enhanced-gallery.component.html',
  styleUrl: './enhanced-gallery.component.scss'
})
export class EnhancedGalleryComponent implements OnInit {
  
  breadCrumbItems!: Array<{}>;
  enhancedAlbums: EnhancedUserAlbum[] = []
  images: { src: string; thumb: string; caption: string }[] = [];

  constructor(private gallerySvc: GalleryService, private lightbox: Lightbox){}


  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'My Enhanced Pictures' },
      { label: 'Gallery', active: true }
    ];

    this.gallerySvc.getEnhancedAlbum()
      .then(data =>{
        this.enhancedAlbums = data
        console.log(this.enhancedAlbums)
        this.enhancedAlbums = data.filter(
          item => item.converted_pic_url !== ''
        );
        this.images = this.enhancedAlbums.map(eAlbum => ({
          src: eAlbum.converted_pic_url ,
          thumb: eAlbum.converted_pic_url,
          caption: this.buildCaptionHtml(eAlbum.detected_landmarks)
        }))
      })
      .catch(err =>{
        console.error('Error loading albums: ', err)
      })

  }
  
  private buildCaptionHtml(landmarks: DetectedLandmark[]): string {
    if (!landmarks || landmarks.length === 0) {
      return '';
    }
    return landmarks
      .map(lm =>
        `<a href="/#/details/${encodeURIComponent(lm.class_name)}/${lm.class_id + 1}" ` +
        `class="landmark-link" ` + `onclick="closeLightbox()">` + `${lm.class_name}</a>`
      )
      .join(', ');
  }

  open(index: number): void {
    this.lightbox.open(this.images, index);
  }

}
