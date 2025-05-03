import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EnhancedUserAlbum, UserAlbum } from "../store/Album/Album_model";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable()

export class GalleryService{
 
    headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    });
    private baseApi = environment.apiBase
    private ALBUM_URL = `${this.baseApi}/album`;
    private CONVERT_URL = `${this.baseApi}/convertImage`;
    private GET_CONVERTED_URL = `${this.baseApi}/getConvertedAlbum`;
    // private ALBUM_URL = '/api/album';
    constructor(private http:HttpClient){}

    getAlbum(): Promise<UserAlbum[]> {
        return firstValueFrom(
            this.http.get<{ album: UserAlbum[] }>(this.ALBUM_URL,{headers:this.headers})
        ).then(response => response.album)
    }

    convertImage(direction:string, pic_url:string, pic_id:string): Promise<any>{
        const form = new FormData();
        let headers = new HttpHeaders({
        'ngrok-skip-browser-warning': 'true'
        });
        form.set('pic_id', pic_id)
        form.set('pic_url', pic_url)
        form.set('direction', direction)
        return firstValueFrom(this.http.post<any>(this.CONVERT_URL,form,{headers:headers}));
    }

    getEnhancedAlbum():Promise<EnhancedUserAlbum[]>{
        return firstValueFrom(
            this.http.get<{converted_images: EnhancedUserAlbum[] }>(this.GET_CONVERTED_URL, {headers:this.headers})
        ).then(response => response.converted_images)
    }

}