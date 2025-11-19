import { Component } from '@angular/core';
import { PlantPredictionService } from '../../services/plant-prediction.service';
import { CommonModule } from '@angular/common';
import { IaPrediccionService } from '../../services/ia-prediccion.service';
import { ClimaIAService, DatosClimaIA } from '../../services/climaai.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-plant-prediction',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './plant-prediction.html',
  styleUrls: ['./plant-prediction.css'],
})

export class PlantPrediction {
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  result: any = null;
  loading = false;
  cargando: boolean = false;
  datos = {
    temperatura: 0,
    humedad: 0,
    dias_sin_lluvia: 0,
  };
  resultadoRiesgo: string = '';
  riesgoPlaga: string = '';
  climaActual: DatosClimaIA | null = null;
  constructor(
    private plantpredictionservice: PlantPredictionService,
    private iaPrediccionService: IaPrediccionService,
    private climaIAService: ClimaIAService
  ) {}

  // Capturar archivo y mostrar previsualización
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.result = null;

    const reader = new FileReader();
    reader.onload = (e) => (this.imagePreview = reader.result);
    if (this.selectedFile) reader.readAsDataURL(this.selectedFile);
  }

  // Subir y predecir
  uploadAndPredict() {
    if (!this.selectedFile) return;
    this.loading = true;
    this.plantpredictionservice.predictPlant(this.selectedFile).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }
  predecir() {
    this.iaPrediccionService.predecirPlaga(this.datos).subscribe({
      next: (resp) => {
        console.log('Respuesta IA:', resp);
        this.riesgoPlaga = resp.riesgo;
      },
      error: (err) => {
        console.error('Error IA:', err);
      },
    });
  }

  predecirRiesgoPlaga() {
    if (!this.climaActual) {
      console.error('No hay datos del clima para predecir plagas.');
      return;
    }

    this.cargando = true;

    const datos = {
      temperatura: this.climaActual.temperatura,
      humedad: this.climaActual.humedad,
      dias_sin_lluvia: this.climaActual.dias_sin_lluvia,
    };

    this.iaPrediccionService.predecirPlaga(datos).subscribe({
      next: (resp) => {
        console.log('Predicción IA:', resp);
        this.riesgoPlaga = resp.riesgo; // almacena el resultado de la IA
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error IA:', err);
        this.cargando = false;
      },
    });
  }
}
