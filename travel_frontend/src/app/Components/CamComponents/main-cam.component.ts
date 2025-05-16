import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from '../Shared/shared.module';
import { ImageConversionService } from '../../Services/ImageConversionService';
import { ImageDetectionService } from '../../Services/ImageDetectionService';
import { Box } from '../../store/Box/Box_model';
import { asyncScheduler, catchError, concatMap, exhaustMap, interval, Observable, of, scheduled, Subject, Subscription, switchMap, takeUntil, tap } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-cam',
  standalone: true,
  imports: [SharedModule, RouterModule, CommonModule],
  providers: [ ImageConversionService, ImageDetectionService ],
  templateUrl: './main-cam.component.html',
  styleUrl: './main-cam.component.scss'
})
export class MainCamComponent implements AfterViewInit, OnDestroy, OnInit {

  // Start of setting global vars
  breadCrumbItems!: {}[];
  lastBoxes: Box[] = []
  private scaledBoxes: {x: number, y: number, width: number, height: number}[] = [];
  showOverlay = true;
  detectedMessage = '';
  messageTimer?: any;
  isSnapshotMode = false;
  flash = false;
  public facingMode: 'user' | 'environment' = 'environment';

  private videoTrack!: MediaStreamTrack;
  minZoom = 1;
  maxZoom = 1;
  currentZoom = 1;
  private lastPinchDist = 0;
  private restartTimer: any
  private destroy$ = new Subject<void>();
  // End of setting global vars

  constructor(private imgConv: ImageConversionService,
    private imgDetectSvc: ImageDetectionService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Camera'},
      { label: 'TravelDex', active: true}
    ];
  }

  @ViewChild('videoElement', {static:false}) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', {static:false}) canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container', { static: false }) container!: ElementRef<HTMLDivElement>;
  

  videoStream: MediaStream | null = null;

  captureInterval: number = 100;

  private captureSub!: Subscription;

  private resizeCanvas() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    // use the CSS‐computed (client) pixel size of the container
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    // make the internal drawing surface match exactly
    canvas.width  = cw;
    canvas.height = ch;
}
  private detectZoomCapabilities() {
    const caps = (this.videoTrack.getCapabilities?.() || {}) as any;
    if (caps.zoom) {
      this.minZoom     = caps.zoom.min;
      this.maxZoom     = caps.zoom.max;
      this.currentZoom = caps.zoom.min;
    }
  }

  private onPinchMove(event: TouchEvent) {
    // Need exactly two touches
    if (event.touches.length !== 2) return;
    event.preventDefault();

    // Pull out the two Touch objects manually
    const t1 = event.touches.item(0);
    const t2 = event.touches.item(1);
    if (!t1 || !t2) return;

    // Compute distance
    const dx = t1.pageX - t2.pageX;
    const dy = t1.pageY - t2.pageY;
    const dist = Math.hypot(dx, dy);

    if (this.lastPinchDist) {
      const scaleDelta = dist / this.lastPinchDist;
      let newZoom = this.currentZoom * scaleDelta;
      newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));

      // Cast the constraint object to any so TS will accept `zoom`
      (this.videoTrack as any).applyConstraints({
        advanced: [{ zoom: newZoom }]
      } as any)
        .then(() => {
          this.currentZoom = newZoom;
        })
        .catch((err: any) => console.warn('Zoom constraint failed', err));
    }

    this.lastPinchDist = dist;
  } 

  ngAfterViewInit(): void {
    this.resizeCanvas();
    this.startCamera()
    // Check if the browser supports camera access.
    // if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    //   console.error('Browser does not support camera access.');
    //   return;
    // }
    // navigator.mediaDevices.getUserMedia({ video: {facingMode: this.facingMode} })
    //     .then(stream => {
    //       this.videoTrack = stream.getVideoTracks()[0];
    //       this.container.nativeElement.addEventListener('touchmove', this.onPinchMove.bind(this), { passive: false });
    //       this.container.nativeElement.addEventListener('touchend',  () => this.lastPinchDist = 0);
    //       this.videoStream = stream;
    //       this.videoElement.nativeElement.srcObject = stream;

    //       // When metadata is loaded (video dimensions available), initialize canvas and start frame capture.
    //       this.videoElement.nativeElement.onloadedmetadata = () => {
    //         this.initializeCanvas();
    //         this.detectZoomCapabilities()
    //         this.startStreamDetection();
    //       };
    //     })
    //     .catch(err => console.error('Error accessing camera:', err));
    }

  private startCamera(): void {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error('Browser does not support camera access.');
    return;
  }

  navigator.mediaDevices.getUserMedia({ 
    video: {
      facingMode: this.facingMode,
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    } 
  }).then(stream => {
    this.videoTrack = stream.getVideoTracks()[0];
    this.videoStream = stream;
    this.videoElement.nativeElement.srcObject = stream;

    // When metadata is loaded (video dimensions available), initialize canvas and start frame capture.
    this.videoElement.nativeElement.onloadedmetadata = () => {
      this.initializeCanvas();
      this.detectZoomCapabilities();
      this.startStreamDetection();
    };
  }).catch(err => {
    console.error('Error accessing camera:', err);
    // Fallback to default camera if preferred one fails
    if (err.name === 'OverconstrainedError') {
      this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
      this.startCamera();
    }
  });
}
  private stopCamera(): void {
  // Clean up existing resources
  // this.destroy$.next();
  
  if (this.videoStream) {
    this.videoStream.getTracks().forEach(track => track.stop());
    this.videoStream = null;
  }
  
  if (this.videoElement?.nativeElement) {
    this.videoElement.nativeElement.srcObject = null;
  }
}

  initializeCanvas(): void {
    // Set the canvas dimensions to match the video feed.
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  private startStreamDetection2(){
    const overlay = this.canvasElement.nativeElement;
    const ctx = overlay.getContext('2d')
    if(!ctx){
      console.error('Could not get 2D context');
      return
    }
    ctx.font = '14px sans-serif';
    ctx.textBaseline = 'top';
    const padding = 4;
    let toBeSaved = false;

    this.captureSub = interval(this.captureInterval)
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap(()=> this.captureFrameAsBlob().pipe(
        switchMap(blob => scheduled(this.imgConv.toJpeg(blob), asyncScheduler)),
        // tap(jpegBlob => console.log('✅ Ready to send frame:', jpegBlob)),
        switchMap(jpeg => this.imgDetectSvc.sendFrame(jpeg, toBeSaved)),
        catchError(err => {
          console.error('Detection stream error', err);
          return of([] as Box[])
        })))
      ).subscribe(boxes => {
          if (!this.showOverlay && boxes.length) {
            const names = Array.from(new Set(boxes.map(b => b.class_name)));
            this.detectedMessage = names.join(', ') + ' detected';
            console.log(this.detectedMessage)
            clearTimeout(this.messageTimer);
            this.messageTimer = setTimeout(() => this.detectedMessage = '', 3000);
          }

          this.lastBoxes = boxes
          const vid     = this.videoElement.nativeElement;
          const canvas  = this.canvasElement.nativeElement;
          const ctx     = canvas.getContext('2d')!;
          const cw      = canvas.width;
          const ch      = canvas.height;
          const vw      = vid.videoWidth;
          const vh      = vid.videoHeight;

          if(this.showOverlay && !this.isSnapshotMode){
        
          // 1) figure out how CSS 'cover' has scaled & cropped the source:
          const scale = Math.max(cw/vw, ch/vh);
          const sw    = cw/scale;  // how many source‐pixels wide the container shows
          const sh    = ch/scale;  // how many source‐pixels tall
          const sx    = (vw - sw)/2;  // cropped off left
          const sy    = (vh - sh)/2;  // cropped off top

          ctx.clearRect(0, 0, cw, ch);

          ctx.lineWidth    = 2;
          ctx.strokeStyle  = 'red';
          ctx.font         = '14px sans-serif';
          ctx.textBaseline = 'top';

          for (const b of boxes) {
            // 2) shift source coords into the visible window, then scale up to canvas pixels
            const x = (b.x     - sx)*scale;
            const y = (b.y     - sy)*scale;
            const w = (b.width )*scale;
            const h = (b.height)*scale;
              //  const fullX = (b.x - sx) * scale;
              //  const fullY = (b.y - sy) * scale;
              //  const fullW = b.width  * scale;
              //  const fullH = b.height * scale;

              //  // compute half-size
              //  const halfW = fullW * 0.25;
              //  const halfH = fullH * 0.25;

              //  // shift top-left so the smaller box stays centered
              //  const x = fullX + (fullW - halfW) * 0.5;   // or fullX + fullW*0.25
              //  const y = fullY + (fullH - halfH) * 0.5;   // or fullY + fullH*0.25
              //  const w = halfW;
              //  const h = halfH;


            // 3) skip any box entirely off‐screen
            if (x + w < 0 || y + h < 0 || x > cw || y > ch) continue;
            // draw the red rectangle
            ctx.strokeRect(x, y, w, h);

            // draw a little blue label background
            const label = b.class_name;
            const paddingX = 4, paddingY = 2;
            const textW = ctx.measureText(label).width + paddingX*2;
            const textH = parseInt(ctx.font,10) + paddingY*2;
            // clamp the label into [0..cw-textW]×[0..ch-textH]
            const lx = Math.max(0, Math.min(cw - textW, x));
            const ly = Math.max(0, Math.min(ch - textH, y));

            ctx.fillStyle = 'blue';
            ctx.fillRect(lx, ly, textW, textH);

            ctx.fillStyle = 'white';
            ctx.fillText(label, lx + paddingX, ly + paddingY);
          } 
        } else {
        ctx.clearRect(0, 0, cw ,ch);
      }   
      });
  }
  private startStreamDetection() {
    const overlay = this.canvasElement.nativeElement;
    const ctx = overlay.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2D context');
        return;
    }

    ctx.font = '14px sans-serif';
    ctx.textBaseline = 'top';
    const padding = 4;
    let toBeSaved = false;

    this.captureSub = interval(this.captureInterval)
        .pipe(
            takeUntil(this.destroy$),
            exhaustMap(() => this.captureFrameAsBlob().pipe(
                switchMap(blob => scheduled(this.imgConv.toJpeg(blob), asyncScheduler)),
                switchMap(jpeg => this.imgDetectSvc.sendFrame(jpeg, toBeSaved)),
                catchError(err => {
                    console.error('Detection stream error', err);
                    return of([] as Box[]);
                })
            ))
        )
        .subscribe(boxes => {
            // Show detection message
            if (!this.showOverlay && boxes.length) {
                const names = Array.from(new Set(boxes.map(b => b.class_name)));
                this.detectedMessage = names.join(', ') + ' detected';
                console.log(this.detectedMessage);
                clearTimeout(this.messageTimer);
                this.messageTimer = setTimeout(() => this.detectedMessage = '', 3000);
            }

            // Store original boxes
            this.lastBoxes = boxes;

            // Get video and canvas dimensions
            const vid = this.videoElement.nativeElement;
            const canvas = this.canvasElement.nativeElement;
            const cw = canvas.width;
            const ch = canvas.height;
            const vw = vid.videoWidth;
            const vh = vid.videoHeight;

            // Calculate scaling factors
            const scale = Math.max(cw / vw, ch / vh);
            const sw = cw / scale;
            const sh = ch / scale;
            const sx = (vw - sw) / 2;
            const sy = (vh - sh) / 2;

            // Store scaled coordinates separately
            this.scaledBoxes = boxes.map(b => ({
                x: (b.x - sx) * scale,
                y: (b.y - sy) * scale,
                width: b.width * scale,
                height: b.height * scale
            }));

            // Draw the overlay if enabled
            if (this.showOverlay && !this.isSnapshotMode) {
                ctx.clearRect(0, 0, cw, ch);

                // Style settings
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'red';
                ctx.font = '24px sans-serif';
                ctx.textBaseline = 'top';

                // Draw each box
                boxes.forEach((b, index) => {
                    const scaled = this.scaledBoxes[index];
                    
                    // Skip boxes entirely off-screen
                    if (scaled.x + scaled.width < 0 || 
                        scaled.y + scaled.height < 0 || 
                        scaled.x > cw || 
                        scaled.y > ch) {
                        return;
                    }

                    // Draw the detection box
                    ctx.strokeRect(scaled.x, scaled.y, scaled.width, scaled.height);

                    // draw a translucent fill to show the clickable area
                    // ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';   // red at 25% opacity
                    // ctx.fillRect(scaled.x, scaled.y, scaled.width, scaled.height);

                    // Draw the label background
                    const label = b.class_name;
                    const paddingX = 4, paddingY = 2;
                    const textW = ctx.measureText(label).width + paddingX * 2;
                    const textH = parseInt(ctx.font, 10) + paddingY * 2;
                    
                    // Clamp label position to stay within canvas
                    const lx = Math.max(0, Math.min(cw - textW, scaled.x));
                    const ly = Math.max(0, Math.min(ch - textH, scaled.y));

                    ctx.fillStyle = 'blue';
                    ctx.fillRect(lx, ly, textW, textH);

                    // Draw the text
                    ctx.fillStyle = 'white';
                    ctx.fillText(label, lx + paddingX, ly + paddingY);
                });
            } else {
                ctx.clearRect(0, 0, cw, ch);
            }
        });
}

  private captureFrameAsBlob(): Observable<Blob> {
    return new Observable<Blob>(obs => {
      const video = this.videoElement.nativeElement;
      // create an offscreen canvas
      const off = document.createElement('canvas');
      off.width  = video.videoWidth;
      off.height = video.videoHeight;
      const offCtx = off.getContext('2d');
      if (!offCtx) {
        obs.error(new Error('2D context not available'));
        return;
      }
      offCtx.drawImage(video, 0, 0, off.width, off.height);
      off.toBlob(blob => {
        if (blob) {
          obs.next(blob);
          obs.complete();
        } else {
          obs.error(new Error('Canvas capture failed'));
        }
      }, 'image/jpeg');
    });
  }

  toggleOverlay() {
    this.showOverlay = !this.showOverlay;
  }

onCanvasClick(evt: MouseEvent) {
  const canvas = this.canvasElement.nativeElement as HTMLCanvasElement;
  const rect   = canvas.getBoundingClientRect();
  console.log('⭘ Canvas click!', evt.clientX, evt.clientY);

  // Map CSS‐pixel coords into actual canvas‐pixel coords:
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;

  const clickX = (evt.clientX - rect.left) * scaleX;
  const clickY = (evt.clientY - rect.top ) * scaleY;

  // Now do your hit test in the same pixel space you drew your boxes:
  for (let i = 0; i < this.scaledBoxes.length; i++) {
    const { x, y, width, height } = this.scaledBoxes[i];
    const box = this.lastBoxes[i];

    if (
      clickX >= x &&
      clickX <= x + width &&
      clickY >= y &&
      clickY <= y + height
    ) {
      console.log(`✔️ Hit box ${i}`, this.scaledBoxes[i]);
      this.router.navigate(['/details', box.class_name, box.class_id + 1]);
      return;
    }
  }
}
  

  takePhoto() {
  // stop the interval subscription
  this.flash = true;
  let toBeSaved = true;
  setTimeout(() => this.flash = false, 150);

  this.captureFrameAsBlob().subscribe({
    next: blob => {
      // send to server
      this.imgConv.toJpeg(blob).then(jpegBlob => {
        this.imgDetectSvc.sendFrame(jpegBlob, toBeSaved)
          .subscribe({
            next: boxes => console.log('Got boxes back', boxes),
            error: err   => console.error('sendFrame failed', err)
          });
      });
    },
    error: err => console.error('Snapshot failed', err)
    });
  }

  public flipCamera(): void {
  // Stop the current stream and detection
  this.stopCamera();
  
  // Toggle the camera mode
  this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
  
  // Restart the camera with the new facing mode
  this.startCamera();
  console.log('flipCamera clicked')
  console.log('FacingMode: ')
  console.log(this.facingMode)
}

  ngOnDestroy(): void {
    console.log("we are in DESTROY")
    this.destroy$.next();
    this.destroy$.complete();
    if (this.restartTimer != null) {
      clearTimeout(this.restartTimer);
    }
    this.captureSub?.unsubscribe();
    this.container.nativeElement.removeEventListener('touchmove', this.onPinchMove as any);
    this.videoStream?.getTracks().forEach(track => track.stop());
  }

}