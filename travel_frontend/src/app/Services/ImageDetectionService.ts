import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Box } from "../store/Box/Box_model";
import { environment } from "../../environments/environment";

@Injectable()

export class ImageDetectionService {

    // Consider making a enum class or put this in environment
    private baseApi = environment.apiBase
    private ENDPOINT = `${this.baseApi}/detectFrame`;
    // private readonly ENDPOINT = '/api/detectFrame';

    constructor(private http: HttpClient){}

    sendFrame(frameBlob: Blob, tobeSaved: boolean): Observable<Box[]>{

        const form = new FormData();
        form.set('frame', frameBlob, 'frame.jpp')
        form.set('tobeSaved', tobeSaved.toString())

        return this.http
            .post<{boxes: Box[]}>(this.ENDPOINT, form)
            .pipe(map(resp=> resp.boxes))

    }

}