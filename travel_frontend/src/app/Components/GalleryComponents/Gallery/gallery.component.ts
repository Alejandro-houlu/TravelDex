import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { SharedModule } from '../../Shared/shared.module';
import { GalleryService } from '../../../Services/GalleryService';
import { DetectedLandmark, UserAlbum } from '../../../store/Album/Album_model';
import { Lightbox, LightboxModule } from 'ngx-lightbox';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, SharedModule, LightboxModule, RouterModule],
  providers:[GalleryService],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit, AfterViewInit{
  breadCrumbItems!: Array<{}>;
  galleryFilter = 'all';
  albums: UserAlbum[] = []
  images: { src: string; thumb: string; caption: string }[] = [];
  isLoading = false;



  constructor(private gallerySvc: GalleryService, 
    private lightbox: Lightbox,
    private router: Router,
  ){}
  ngAfterViewInit(): void {
  }


  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'My Pictures' },
      { label: 'Gallery', active: true }
    ];

    this.gallerySvc.getAlbum()
      .then(data =>{
        this.albums = data
        console.log(this.albums)
        this.albums = data.filter(
          item => item.pic_url_orig && item.pic_url_orig.trim() !== ''
        );
        this.images = this.albums.map(album => ({
          src: album.pic_url_orig,
          thumb: album.pic_url_orig,
          caption: this.buildCaptionHtml(album.detected_landmarks)
        }))
      })
      .catch(err =>{
        console.error('Error loading albums: ', err)
      })

  }
  open(index: number): void {
    this.lightbox.open(this.images, index);
  }

  onConvert(direction: 'sunny2rainy'|'rainy2sunny', pic_url:string, pic_id:string ) {

    console.log(direction)
    console.log(pic_url)
    console.log(pic_id)
    this.isLoading = true;

    this.gallerySvc.convertImage(direction, pic_url, pic_id)
      .then(result => {
        console.log('Converted!', result);
        this.isLoading = false;
        this.router.navigate(['/enhancedAlbum']);
      })
      .catch(err => {
        console.error(err)
        this.isLoading = false;});
  }
  close(): void {
    this.lightbox.close();
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

  ngOnDestroy(): void {
    console.log("We are in destory")
    this.lightbox.close();
  }
  // activeCategory(category: string) {
  //   this.galleryFilter = category;
  //   if (this.galleryFilter === 'all') {
  //     this.filterredImages = this.list;
  //   } else {
  //     this.filterredImages = this.list.filter(x => x.category === this.galleryFilter);
  //   }
  // }

}
