import { Routes } from '@angular/router';
import { LandingComponent } from './Components/HomeComponents/landing.component';
import { MainCamComponent } from './Components/CamComponents/main-cam.component';
import { DetailsComponent } from './Components/DetailsComponents/details.component';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './Components/AuthComponents/login.component';
import { LayoutComponent } from './Components/Layouts/layout.component';
import { GalleryComponent } from './Components/GalleryComponents/Gallery/gallery.component';
import { EnhancedGalleryComponent } from './Components/GalleryComponents/Enhanced/enhanced-gallery.component';

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {
        path:'',
        component: LayoutComponent,
        children: [
            {path: 'home', component:LandingComponent, canActivate:[AuthGuard]},
            {path: '', redirectTo: 'home', pathMatch: 'full' },
            {path: 'cam', component:MainCamComponent, canActivate:[AuthGuard]},
            {path: 'details/:className/:classId', component:DetailsComponent, canActivate:[AuthGuard]},
            {path: 'album', component:GalleryComponent, canActivate:[AuthGuard]},
            {path: 'enhancedAlbum', component:EnhancedGalleryComponent, canActivate:[AuthGuard]},
        ]
    }
 
];
