import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlantPredictionService {
  //url de pruebas local
  //private BASE_URL = 'http://localhost:8000/ia';

  //url de api desplegada render 
  private BASE_URL = 'https://proyecto-agroclima-api-ia.onrender.com/ia';
  constructor(private http: HttpClient) { }

  // Subir imagen y obtener predicción de planta
  predictPlant(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.BASE_URL}/predict-plant`, formData);
  }
}
