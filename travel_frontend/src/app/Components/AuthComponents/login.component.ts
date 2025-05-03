import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../Services/ToastService';
import { AuthenticationService } from '../../Services/AuthService';
import { ToastsContainer } from './toasts-container.component';
import { CurrentUserService } from '../../Services/CurrentUserService';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastsContainer],
  providers:[ToastService, AuthenticationService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  submitted: boolean = false;
  fieldTextType!: boolean;
  year: number = new Date().getFullYear();



  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastSvc: ToastService,
    private authSvc: AuthenticationService,
    private currUserSvc: CurrentUserService
  ){}


  ngOnInit(): void {
    this.loginForm = this.fb.group({
      // make sure these match your formControlName's
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
  this.submitted = true;
  if (this.loginForm.invalid) return;

  console.log(this.loginForm)

  const { email, password } = this.loginForm.value;
  this.authSvc.login(email, password).subscribe({
    next: resp => {
      if (resp.status === 'success') {
        localStorage.setItem('toast', 'true');
        localStorage.setItem('currentUser', JSON.stringify(resp.data.username))
        localStorage.setItem('access_token', resp.access);
        localStorage.setItem('refresh_token', resp.refresh);
        this.currUserSvc.setUser(resp.data)
        console.log(this.currUserSvc.getUser())
        this.router.navigateByUrl('/home');
      } else {
        this.toastSvc.show(resp.data.email, { classname: 'bg-danger text-white' });
      }
    },
    error: err => {
      console.error(err);
      this.toastSvc.show('Login failed', { classname: 'bg-danger text-white' });
    }
  });
}

get f() { return this.loginForm.controls; }

toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

}
