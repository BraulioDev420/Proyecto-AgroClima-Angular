import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://proyecto-agroclima-api.onrender.com';

  constructor(private http: HttpClient) {}

  get(endpoint: string) {
    return this.http.get(`${this.baseUrl}/${endpoint}`);
  }

  post(endpoint: string, data: any) {
    return this.http.get(`${this.baseUrl}/${endpoint}`, data);
  }

  put(endpoint: string, data: any) {
    return this.http.get(`${this.baseUrl}/${endpoint}`, data);
  }

  delete(endpoint: string) {
    return this.http.get(`${this.baseUrl}/${endpoint}`); 
  }



}