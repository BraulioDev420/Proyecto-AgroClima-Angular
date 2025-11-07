import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service'; 

export interface Cultivo {
  id_cultivo: number;
  id_usuario: number;
  tipo_cultivo: string;
  fecha_siembra: string;
  fecha_cosecha: string | null;
  estado: string;
  EstLogico: number;
}

export interface DashboardData {
  totalCultivos: number;
  areaTotal: number;
  rendimiento: number;
  ingresos: number;
  cultivosPorTipo: { tipo: string; cantidad: number }[];
  cultivosPorEstado: { estado: string; cantidad: number }[];
  cultivosMensuales: { mes: string; cantidad: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class CultivosService {

  constructor(private apiService: ApiService) {}

  // Obtener todos los cultivos activos
  getCultivosActivos(): Observable<Cultivo[]> {
    return this.apiService.get('cultivos/activos/') as Observable<Cultivo[]>;
  }

  // Obtener cultivos activos de un usuario específico
  getCultivosPorUsuario(id_usuario: number): Observable<any> {
    return this.apiService.get(`cultivos/usuario/${id_usuario}`).pipe(
      map((response: any) => {
        // La API devuelve { mensaje, codigo, data }
        if (response.codigo === 'OK' && response.data) {
          return response.data;
        }
        return [];
      })
    );
  }

  // Obtener un cultivo por ID
  getCultivoById(id: number): Observable<Cultivo[]> {
    return this.apiService.get(`cultivos/activos/${id}`) as Observable<Cultivo[]>;
  }

  // Crear nuevo cultivo
  crearCultivo(cultivo: any): Observable<any> {
    return this.apiService.post('cultivos/', cultivo);
  }

  // Actualizar cultivo
  actualizarCultivo(cultivo: any): Observable<any> {
    return this.apiService.put('cultivos/', cultivo);
  }

  // Eliminar cultivo (lógico)
  eliminarCultivo(id: number): Observable<any> {
    return this.apiService.delete(`cultivos/${id}`);
  }

  // 💧 OBTENER RIEGOS DE UN CULTIVO
  getRiegosPorCultivo(id_cultivo: number): Observable<any> {
    return this.apiService.get(`riegos/cultivos/${id_cultivo}`).pipe(
      map((response: any) => {
        // La API devuelve { mensaje, codigo, data }
        if (response.codigo === 'OK' && response.data) {
          return response.data;
        }
        return [];
      })
    );
  }

  // 📊 PROCESAR DATOS PARA EL DASHBOARD
  procesarDatosDashboard(cultivos: Cultivo[]): DashboardData {
    // Total de cultivos
    const totalCultivos = cultivos.length;

    // Área total (simulada - puedes agregar este campo a tu BD)
    const areaTotal = Math.round(totalCultivos * 1.5 * 10) / 10; // Promedio 1.5 ha por cultivo

    // Rendimiento (simulado)
    const rendimiento = totalCultivos * 10; // 10 toneladas por cultivo promedio

    // Ingresos (simulado)
    const ingresos = rendimiento * 150; // $150 por tonelada

    // Contar cultivos por tipo
    const cultivosPorTipo = this.contarPorTipo(cultivos);

    // Contar cultivos por estado
    const cultivosPorEstado = this.contarPorEstado(cultivos);

    // Contar siembras por mes
    const cultivosMensuales = this.contarPorMes(cultivos);

    return {
      totalCultivos,
      areaTotal,
      rendimiento,
      ingresos,
      cultivosPorTipo,
      cultivosPorEstado,
      cultivosMensuales
    };
  }

  // Contar cultivos por tipo
  private contarPorTipo(cultivos: Cultivo[]): { tipo: string; cantidad: number }[] {
    const conteo: { [key: string]: number } = {};
    
    cultivos.forEach(c => {
      const tipo = c.tipo_cultivo || 'Desconocido';
      conteo[tipo] = (conteo[tipo] || 0) + 1;
    });

    return Object.keys(conteo)
      .map(tipo => ({
        tipo: tipo,
        cantidad: conteo[tipo]
      }))
      .sort((a, b) => b.cantidad - a.cantidad); // Ordenar por cantidad descendente
  }

  // Contar cultivos por estado
  private contarPorEstado(cultivos: Cultivo[]): { estado: string; cantidad: number }[] {
    const conteo: { [key: string]: number } = {};
    
    cultivos.forEach(c => {
      const estado = c.estado || 'desconocido';
      conteo[estado] = (conteo[estado] || 0) + 1;
    });

    return Object.keys(conteo)
      .map(estado => ({
        estado: estado,
        cantidad: conteo[estado]
      }))
      .sort((a, b) => b.cantidad - a.cantidad); // Ordenar por cantidad descendente
  }

  // Contar siembras por mes del año actual
  private contarPorMes(cultivos: Cultivo[]): { mes: string; cantidad: number }[] {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const conteo: number[] = new Array(12).fill(0);

    const añoActual = new Date().getFullYear();

    cultivos.forEach(c => {
      if (c.fecha_siembra) {
        const fecha = new Date(c.fecha_siembra);
        // Solo contar cultivos del año actual
        if (fecha.getFullYear() === añoActual) {
          const mes = fecha.getMonth();
          conteo[mes]++;
        }
      }
    });

    return meses.map((mes, index) => ({
      mes: mes,
      cantidad: conteo[index]
    }));
  }

  // 📊 FUNCIÓN AUXILIAR: Obtener color para cada tipo de cultivo
  getColorForCultivo(tipo: string): string {
    const colores: { [key: string]: string } = {
      'maiz': '#66bb6a',
      'café': '#8d6e63',
      'yuca': '#ffa726',
      'arroz': '#42a5f5',
      'plátano': '#ffeb3b',
      'cacao': '#795548',
      'papa': '#ab47bc',
      'tomate': '#ef5350',
      'aguacate': '#4caf50',
      'coco': '#ff9800'
    };

    const tipoLower = tipo.toLowerCase();
    return colores[tipoLower] || '#9e9e9e'; // Gris por defecto
  }
}