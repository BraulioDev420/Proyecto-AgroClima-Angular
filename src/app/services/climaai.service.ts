import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

export interface DatosClimaIA {
  temperatura: number;
  humedad: number;
  viento: number;
  descripcion: string;
  icono: string;
  recomendaciones: string[];
  ciudad: string;
  coordenadas?: { lat: number; lon: number };
  dias_sin_lluvia?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClimaIAService {

  private readonly API_URL = 'https://api.open-meteo.com/v1/forecast';
  private readonly GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

  constructor() {}

  /**
   * 🌍 SOLICITAR UBICACIÓN DEL USUARIO
   */
  solicitarUbicacionUsuario(): Observable<DatosClimaIA> {
    console.log('📍 Solicitando ubicación del usuario...');
    
    if (!navigator.geolocation) {
      console.warn('⚠️ Geolocalización no disponible');
      return this.obtenerClimaConIA('Barranquilla, Atlántico');
    }

    return new Observable<DatosClimaIA>(observer => {
      navigator.geolocation.getCurrentPosition(
        // Éxito: tenemos coordenadas
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          console.log(`✅ Ubicación obtenida: ${lat}, ${lon}`);
          
          // Obtener el nombre de la ciudad desde las coordenadas
          this.obtenerCiudadPorCoordenadas(lat, lon).pipe(
            switchMap(ciudad => this.obtenerClimaPorCoordenadas(lat, lon, ciudad))
          ).subscribe({
            next: (clima) => {
              observer.next(clima);
              observer.complete();
            },
            error: (err) => {
              console.error('❌ Error al obtener clima por coordenadas:', err);
              observer.error(err);
            }
          });
        },
        // Error: usuario rechazó o error de geolocalización
        (error) => {
          console.warn('⚠️ Usuario rechazó geolocalización o error:', error.message);
          observer.error(error);
        },
        // Opciones
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      );
    }).pipe(
      catchError(err => {
        console.log('🔄 Usando ubicación predeterminada');
        return this.obtenerClimaConIA('Barranquilla, Atlántico');
      })
    );
  }

  /**
   * 🗺️ OBTENER NOMBRE DE CIUDAD DESDE COORDENADAS
   */
  private obtenerCiudadPorCoordenadas(lat: number, lon: number): Observable<string> {
    // Usar API de geocodificación inversa de Open-Meteo
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=es`;
    
    return from(
      fetch(url, {
        headers: {
          'User-Agent': 'AgroApp/1.0'
        }
      }).then(res => res.json())
    ).pipe(
      map(data => {
        const ciudad = data.address?.city || 
                      data.address?.town || 
                      data.address?.village || 
                      data.address?.state || 
                      'Ubicación actual';
        console.log('🏙️ Ciudad detectada:', ciudad);
        return ciudad;
      }),
      catchError(err => {
        console.warn('⚠️ No se pudo obtener nombre de ciudad:', err);
        return of('Ubicación actual');
      })
    );
  }

  /**
   * 🌤️ OBTENER CLIMA POR COORDENADAS
   */
  private obtenerClimaPorCoordenadas(lat: number, lon: number, ciudad: string): Observable<DatosClimaIA> {
    const url = `${this.API_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m`;

    return from(fetch(url).then(res => res.json())).pipe(
      map(data => {
        const resultado = this.mapearDatosClima(data, ciudad);
        resultado.coordenadas = { lat, lon };
        return resultado;
      }),
      catchError(err => {
        console.error('❌ Error al obtener clima por coordenadas:', err);
        return of(this.getClimaPorDefecto(ciudad));
      })
    );
  }

  /**
   * 🌤️ OBTENER CLIMA USANDO CIUDAD (método existente)
   */
  obtenerClimaConIA(ciudad: string = 'Barranquilla, Atlántico'): Observable<DatosClimaIA> {
    const coords = this.obtenerCoordenadas(ciudad);

    const url = `${this.API_URL}?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=relative_humidity_2m`;

    return from(fetch(url).then(res => res.json())).pipe(
      map(data => this.mapearDatosClima(data, ciudad)),
      catchError(err => {
        console.error('❌ Error al obtener clima:', err);
        return of(this.getClimaPorDefecto(ciudad));
      })
    );
  }

  /**
   * 🔄 MAPEAR RESPUESTA DE API A NUESTRO MODELO
   */
  private mapearDatosClima(data: any, ciudad: string): DatosClimaIA {
    const clima = data.current_weather;
    const humedad = data.hourly?.relative_humidity_2m?.[0] ?? 70;

    const descripcion = this.obtenerDescripcionClima(clima.weathercode);
    const icono = this.obtenerIconoClima(descripcion);

    const recomendaciones = this.generarRecomendaciones(descripcion, clima.temperature);

    return {
      temperatura: Math.round(clima.temperature),
      humedad: humedad,
      viento: Math.round(clima.windspeed),
      descripcion,
      icono,
      recomendaciones,
      ciudad
    };
  }

  /**
   * 🗺️ Coordenadas aproximadas de ciudades predefinidas
   */
  private obtenerCoordenadas(ciudad: string): { lat: number; lon: number } {
    const mapa: any = {
      'Cartagena, Bolívar': { lat: 10.39, lon: -75.51 },
      'Magangué, Bolívar': { lat: 9.24, lon: -74.75 },
      'Barranquilla, Atlántico': { lat: 10.96, lon: -74.78 },
      'El Carmen de Bolívar, Bolívar': { lat: 9.72, lon: -75.12 },
      'Santa Marta, Magdalena': { lat: 11.24, lon: -74.21 },
      'Montería, Córdoba': { lat: 8.75, lon: -75.88 },
      'Sincelejo, Sucre': { lat: 9.30, lon: -75.40 }
    };

    return mapa[ciudad] || { lat: 10.96, lon: -74.78 };
  }

  
  private obtenerDescripcionClima(codigo: number): string {
    const codigos: any = {
      0: 'Despejado',
      1: 'Mayormente despejado',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Niebla',
      48: 'Niebla con escarcha',
      51: 'Llovizna ligera',
      53: 'Llovizna moderada',
      55: 'Llovizna intensa',
      61: 'Lluvia ligera',
      63: 'Lluvia moderada',
      65: 'Lluvia fuerte',
      71: 'Nevada ligera',
      73: 'Nevada moderada',
      75: 'Nevada intensa',
      80: 'Lluvias aisladas',
      81: 'Chubascos moderados',
      82: 'Chubascos violentos',
      95: 'Tormenta',
      96: 'Tormenta con granizo ligero',
      99: 'Tormenta con granizo fuerte'
    };
    return codigos[codigo] || 'Clima variable';
  }

  obtenerIconoClima(descripcion: string): string {
    const desc = descripcion.toLowerCase();
    if (desc.includes('sol') || desc.includes('despejado')) return '☀️';
    if (desc.includes('nublado')) return '⛅';
    if (desc.includes('lluvia') || desc.includes('llovizna')) return '🌧️';
    if (desc.includes('tormenta')) return '⛈️';
    if (desc.includes('niebla')) return '🌫️';
    if (desc.includes('nieve') || desc.includes('nevada')) return '❄️';
    if (desc.includes('granizo')) return '🌨️';
    return '🌤️';
  }

  /**
   * 💡 Genera recomendaciones agrícolas según el clima
   */
  private generarRecomendaciones(descripcion: string, temperatura: number): string[] {
    const desc = descripcion.toLowerCase();
    const recomendaciones: string[] = [];

    // Recomendaciones por temperatura
    if (temperatura > 35) {
      recomendaciones.push('🌡️ Temperatura muy alta: aumentar frecuencia de riego');
      recomendaciones.push('☀️ Proteger cultivos sensibles con mallas de sombra');
    } else if (temperatura < 15) {
      recomendaciones.push('❄️ Temperatura baja: proteger cultivos sensibles al frío');
    }

    // Recomendaciones por condición climática
    if (desc.includes('sol') || desc.includes('despejado')) {
      recomendaciones.push('🌱 Regar temprano (6-8 AM) para evitar evaporación');
      recomendaciones.push('💧 Mantener sombra en plántulas jóvenes');
      if (recomendaciones.length < 3) {
        recomendaciones.push('🌾 Buen momento para aplicar tratamientos foliares');
      }
    } else if (desc.includes('lluv') || desc.includes('tormenta')) {
      recomendaciones.push('💦 Asegurar buen drenaje en todos los cultivos');
      recomendaciones.push('🌧️ Suspender riego y fertilización foliar');
      recomendaciones.push('🚜 Evitar labores en el campo durante lluvia intensa');
    } else if (desc.includes('nublado')) {
      recomendaciones.push('🌤️ Condiciones ideales para labores de campo');
      recomendaciones.push('💧 Revisar humedad del suelo antes de regar');
      recomendaciones.push('🌾 Monitorear aparición de hongos por humedad');
    }

    // Recomendaciones generales si faltan
    if (recomendaciones.length === 0) {
      recomendaciones.push('👨‍🌾 Mantener monitoreo constante del clima');
      recomendaciones.push('🌿 Ajustar riego según condiciones actuales');
      recomendaciones.push('⚙️ Verificar equipos de irrigación');
    }

    return recomendaciones.slice(0, 3); // Máximo 3 recomendaciones
  }

  /**
   * 🔄 Datos de clima por defecto
   */
  private getClimaPorDefecto(ciudad: string): DatosClimaIA {
    return {
      temperatura: 30,
      humedad: 70,
      viento: 10,
      descripcion: 'Parcialmente nublado',
      icono: '⛅',
      recomendaciones: [
        '🌱 Regar temprano en la mañana o al atardecer',
        '☀️ Proteger cultivos sensibles del sol directo',
        '💧 Mantener humedad del suelo constante'
      ],
      ciudad
    };
  }
}