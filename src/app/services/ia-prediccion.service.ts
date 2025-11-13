import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IaPrediccionService {

  private API_URL = 'http://localhost:8000/ia/prediccion-plagas';

  constructor(private http: HttpClient) {}

  predecirPlaga(datos: any): Observable<any> {
    return this.http.post(this.API_URL, datos);
  }
}
