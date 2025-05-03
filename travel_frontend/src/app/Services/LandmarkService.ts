import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LandmarkDetails } from "../store/Landmark/Landmark_model";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable()

export class LandmarkService {
    private baseApi = environment.apiBase
    private DETAILS_ENDPOINT = `${this.baseApi}/details`;
    // private readonly DETAILS_ENDPOINT = '/api/details';
    constructor(private http:HttpClient){}

    getDetails(id: string): Promise<LandmarkDetails> {
    const params = new HttpParams()
        .set('id', id)
    return firstValueFrom(this.http.get<LandmarkDetails>(this.DETAILS_ENDPOINT, { params }));
  }

}