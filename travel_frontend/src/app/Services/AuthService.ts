import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthResponse } from "../store/Auth/AuthResp_model";
import { firstValueFrom} from "rxjs";
import { User } from "./CurrentUserService";
import { environment } from "../../environments/environment";

@Injectable()

export class AuthenticationService {
    private baseApi = environment.apiBase
    private LOGIN_URL = `${this.baseApi}/auth/login`;
    private GET_USER_URL = `${this.baseApi}/auth/me`;

    // private GET_USER_URL = '/api/auth/me';

    constructor(private http: HttpClient){}

    login(email:string, password:string){
        console.log(this.LOGIN_URL)
        return this.http.post<AuthResponse>(this.LOGIN_URL, { email, password });

    }
    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
    get accessToken(): string | null {
        return localStorage.getItem('access');
    }

    isLoggedIn(): boolean {
        return !!this.accessToken;
    }
    
    getCurrentUser(): Promise<User> {
        return firstValueFrom (this.http.get<User>(
        this.GET_USER_URL,
        { withCredentials: true }
        ));
    }    
}