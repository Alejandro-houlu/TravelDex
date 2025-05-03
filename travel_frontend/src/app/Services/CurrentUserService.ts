// app/services/current-user.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  userId: number;
  email: string;
  username: string;
  profile_pic_url: string;
}

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  // start with null until we fetch
  private userSubject = new BehaviorSubject<User | null>(null);

  // publicly exposed observable
  readonly user$: Observable<User | null> = this.userSubject.asObservable();

  // sync getter if you ever need it
  getUser(): User | null {
    return this.userSubject.value;
  }

  // call this to set the current user
  setUser(user: User) {
    console.log('[CurrentUserService] setUser:', user);
    this.userSubject.next(user);
  }
}
