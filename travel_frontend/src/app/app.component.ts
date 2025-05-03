import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from "./Components/Layouts/layout.component";
import { FooterComponent } from './Components/Layouts/footer/footer.component';
import { CurrentUserService } from './Services/CurrentUserService';
import { AuthenticationService } from './Services/AuthService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  providers: [AuthenticationService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private userSvc: CurrentUserService,
    private authSvc: AuthenticationService
  ){}
  title = 'travel_frontend';

  ngOnInit(): void {

    this.authSvc.getCurrentUser()
      .then(user =>{
        this.userSvc.setUser(user)
        console.log('Rehydrated user:', user)
      })
      .catch(()=>{
        console.log('Not logged in')
      })

  }
}
