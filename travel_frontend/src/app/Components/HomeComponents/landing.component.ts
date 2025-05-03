import { Component, OnInit } from '@angular/core';
import { CurrentUserService, User } from '../../Services/CurrentUserService';
import { NgbCarouselModule, NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../Shared/shared.module';
import { FooterComponent } from '../Layouts/footer/footer.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NgbCarouselModule, SharedModule, NgbSlide, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {

  currUser!: User | null
  currentSection = 'home';
  showNavigationArrows: any;
  showNavigationIndicators: any;

  constructor(private userSvc: CurrentUserService){}

  ngOnInit(): void {

  }
  topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }


}
