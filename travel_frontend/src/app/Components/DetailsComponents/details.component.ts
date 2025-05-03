import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';
import { SharedModule } from '../Shared/shared.module';
import { LandmarkService } from '../../Services/LandmarkService';
import { LandmarkDetails } from '../../store/Landmark/Landmark_model';
import { LayoutComponent } from '../Layouts/layout.component';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, RouterModule,NgbPaginationModule,SimplebarAngularModule, SharedModule],
  providers:[LandmarkService],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit, AfterViewInit {
  className!: string;
  classId!: string;
  breadCrumbItems!: Array<{}>;
  landmarkDetails!: LandmarkDetails
  isLoading = true;


  constructor(private route: ActivatedRoute, 
    private landmarkSvc: LandmarkService) {}


  ngOnInit() {
    // this.route.queryParams.subscribe(params => {
    //   console.log('🔍 DetailsComponent.queryParams:', params);
    //   this.className = params['class'];
    //   this.trackId   = +params['track'];
    //   console.log(
    //     '→ Received className=', this.className,
    //     'trackId=', this.trackId
    //   );
    // });

    // const params = this.route.snapshot.queryParams;
    // console.log('🔍 DetailsComponent.snapshot:', params);
    
    // I feel like path var is better in this case because details are not sensitive plus this makes for easier navigation
    // Above is by queryParams either by subscribing, this works for if the camera is on the same screen then the other is a 1 time

    this.className = this.route.snapshot.paramMap.get('className') || 'unknown';
    this.classId  =  this.route.snapshot.paramMap.get('classId') || 'unknown';
    console.log("Class name:", this.className)
    console.log("Class id:", this.classId)

    this.breadCrumbItems = [
      { label: this.className },
      { label: 'Landmarks', active: true }
    ];

    // Call for the landmark details
    this.landmarkSvc.getDetails(this.classId)
      .then(details => this.landmarkDetails = details)
      .then(()=>console.log(this.landmarkDetails))
      .then(()=> this.isLoading = false)
      .catch(err => {
        console.error('Failed to load details', err)
        this.isLoading = false
      })
  }

  ngAfterViewInit(): void {
  }

}
