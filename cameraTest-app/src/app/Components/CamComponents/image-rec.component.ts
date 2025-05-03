import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-rec',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-rec.component.html',
  styleUrl: './image-rec.component.css'
})
export class ImageRecComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  videoStream: MediaStream | null = null;
  captureInterval: any;

  ngAfterViewInit(): void {
    // Check if the browser supports camera access.
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          this.videoStream = stream;
          this.videoElement.nativeElement.srcObject = stream;

          // When metadata is loaded (video dimensions available), initialize canvas and start frame capture.
          this.videoElement.nativeElement.onloadedmetadata = () => {
            this.initializeCanvas();
            this.startCapture();
          };
        })
        .catch(err => console.error('Error accessing camera:', err));
    } else {
      console.error('Browser does not support camera access.');
    }
  }

  initializeCanvas(): void {
    // Set the canvas dimensions to match the video feed.
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  startCapture(): void {
    // Periodically capture a frame every second (adjust the interval as needed).
    this.captureInterval = setInterval(() => {
      const canvas = this.canvasElement.nativeElement;
      const context = canvas.getContext('2d');
      const video = this.videoElement.nativeElement;

      if (context) {
        // Draw the current video frame onto the canvas.
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Optionally, convert canvas to a Blob to simulate processing of frame data.
        canvas.toBlob(blob => {
          if (blob) {
            console.log('Frame captured:', blob);
            // In a future integration, you could send the blob to your backend here.
          }
        }, 'image/jpeg');
      }
    }, 100); // 1000 ms = 1 second
  }

  ngOnDestroy(): void {
    // Clear the capture interval and stop the video stream when the component is destroyed.
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
    }
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
    }
  }
}
