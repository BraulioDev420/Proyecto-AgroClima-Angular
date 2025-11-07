import { Injectable } from '@angular/core';

export interface Tarea {
  nombre: string;
  descripcion: string;
  lote?: string;
  fecha: string;
  prioridad: 'alta' | 'media' | 'baja';
  tipo: 'riego' | 'fertilizacion' | 'control_plagas' | 'cosecha' | 'monitoreo';
  estado: 'pendiente' | 'programada' | 'completada';
}

@Injectable({
  providedIn: 'root'
})
export class TareasService {

  constructor() {}

  /**
   * 📋 GENERAR TAREAS BASADAS EN LOS CULTIVOS DEL USUARIO
   * Analiza el estado de cada cultivo y genera tareas relevantes
   */
  generarTareasPorCultivos(cultivos: any[]): Tarea[] {
    const tareas: Tarea[] = [];
    const hoy = new Date();

    cultivos.forEach(cultivo => {
      const estadoLower = cultivo.estado?.toLowerCase() || '';
      const fechaSiembra = new Date(cultivo.fecha_siembra);
      const diasDesdeSiembra = Math.floor((hoy.getTime() - fechaSiembra.getTime()) / (1000 * 60 * 60 * 24));

      // 🌱 SIEMBRA / RECIÉN SEMBRADO (0-15 días)
      if (estadoLower.includes('siembra') || diasDesdeSiembra <= 15) {
        tareas.push({
          nombre: 'Riego inicial',
          descripcion: `Mantener humedad constante en ${cultivo.tipo_cultivo}`,
          lote: cultivo.id_cultivo.toString(),
          fecha: this.sumarDias(hoy, 1),
          prioridad: 'alta',
          tipo: 'riego',
          estado: 'pendiente'
        });

        tareas.push({
          nombre: 'Monitoreo de germinación',
          descripcion: `Verificar brotación de ${cultivo.tipo_cultivo}`,
          lote: cultivo.id_cultivo.toString(),
          fecha: this.sumarDias(hoy, 7),
          prioridad: 'media',
          tipo: 'monitoreo',
          estado: 'programada'
        });
      }

      // 🌿 EN CRECIMIENTO (16-60 días)
      if (estadoLower.includes('crecimiento') || (diasDesdeSiembra > 15 && diasDesdeSiembra <= 60)) {
        tareas.push({
          nombre: 'Fertilización NPK',
          descripcion: `Aplicar fertilizante a ${cultivo.tipo_cultivo}`,
          lote: cultivo.id_cultivo.toString(),
          fecha: this.sumarDias(hoy, 3),
          prioridad: 'alta',
          tipo: 'fertilizacion',
          estado: 'programada'
        });

        tareas.push({
          nombre: 'Control de malezas',
          descripcion: `Limpieza de área de ${cultivo.tipo_cultivo}`,
          lote: cultivo.id_cultivo.toString(),
          fecha: this.sumarDias(hoy, 5),
          prioridad: 'media',
          tipo: 'monitoreo',
          estado: 'programada'
        });

        tareas.push({
          nombre: 'Inspección de plagas',
          descripcion: `Revisar hojas y tallos de ${cultivo.tipo_cultivo}`,
          lote: cultivo.id_cultivo.toString(),
          fecha: this.sumarDias(hoy, 2),
          prioridad: 'media',
          tipo: 'control_plagas',
          estado: 'pendiente'
        });
      }

      // ☀️ MADURACIÓN / PRÓXIMO A COSECHA (60+ días)
      if (estadoLower.includes('cosecha') || diasDesdeSiembra > 60) {
        tareas.push({
          nombre: 'Preparar cosecha',
          descripcion: `Planificar recolección de ${cultivo.tipo_cultivo}`,
          lote: cultivo.id_cultivo.toString(),
          fecha: this.sumarDias(hoy, 7),
          prioridad: 'alta',
          tipo: 'cosecha',
          estado: 'programada'
        });

        tareas.push({
          nombre: 'Reducir riego',
          descripcion: `Disminuir frecuencia de riego en ${cultivo.tipo_cultivo}`,
          lote: cultivo.id_cultivo.toString(),
          fecha: this.sumarDias(hoy, 2),
          prioridad: 'media',
          tipo: 'riego',
          estado: 'pendiente'
        });
      }

      // 🔄 TAREAS PERIÓDICAS (para todos los cultivos activos)
      if (!estadoLower.includes('finalizado') && !estadoLower.includes('perdido')) {
        // Riego regular (cada 2 días si no hay otras tareas de riego)
        const tieneRiego = tareas.some(t => 
          t.lote === cultivo.id_cultivo.toString() && t.tipo === 'riego'
        );
        
        if (!tieneRiego) {
          tareas.push({
            nombre: 'Riego regular',
            descripcion: `Riego de mantenimiento para ${cultivo.tipo_cultivo}`,
            lote: cultivo.id_cultivo.toString(),
            fecha: this.sumarDias(hoy, 2),
            prioridad: 'media',
            tipo: 'riego',
            estado: 'programada'
          });
        }
      }
    });

    // Ordenar por fecha y prioridad
    return this.ordenarTareas(tareas);
  }

  /**
   * 🎯 TAREAS ESPECÍFICAS POR TIPO DE CULTIVO
   */
  generarTareasPorTipoCultivo(tipoCultivo: string, idCultivo: number): Tarea[] {
    const tipo = tipoCultivo.toLowerCase();
    const hoy = new Date();
    const tareas: Tarea[] = [];

    // Tareas específicas según el tipo de cultivo
    const tareasEspecificas: { [key: string]: Partial<Tarea>[] } = {
      'maíz': [
        {
          nombre: 'Control de gusano cogollero',
          descripcion: 'Inspección y control de Spodoptera frugiperda',
          prioridad: 'alta',
          tipo: 'control_plagas'
        },
        {
          nombre: 'Aplicar insecticida',
          descripcion: 'Tratamiento preventivo contra plagas',
          prioridad: 'media',
          tipo: 'control_plagas'
        }
      ],
      'café': [
        {
          nombre: 'Control de broca',
          descripcion: 'Monitoreo de Hypothenemus hampei',
          prioridad: 'alta',
          tipo: 'control_plagas'
        },
        {
          nombre: 'Poda selectiva',
          descripcion: 'Eliminar ramas improductivas',
          prioridad: 'media',
          tipo: 'monitoreo'
        }
      ],
      'papa': [
        {
          nombre: 'Aporque',
          descripcion: 'Cubrir tubérculos expuestos',
          prioridad: 'alta',
          tipo: 'monitoreo'
        },
        {
          nombre: 'Control de gota',
          descripcion: 'Prevención de Phytophthora infestans',
          prioridad: 'alta',
          tipo: 'control_plagas'
        }
      ],
      'yuca': [
        {
          nombre: 'Control de ácaros',
          descripcion: 'Inspección de Mononychellus tanajoa',
          prioridad: 'media',
          tipo: 'control_plagas'
        }
      ],
      'arroz': [
        {
          nombre: 'Control de malezas acuáticas',
          descripcion: 'Limpieza de canales de riego',
          prioridad: 'media',
          tipo: 'monitoreo'
        }
      ]
    };

    const tareasDelCultivo = tareasEspecificas[tipo] || [];

    tareasDelCultivo.forEach((tarea, index) => {
      tareas.push({
        nombre: tarea.nombre!,
        descripcion: tarea.descripcion!,
        lote: idCultivo.toString(),
        fecha: this.sumarDias(hoy, (index + 1) * 2),
        prioridad: tarea.prioridad!,
        tipo: tarea.tipo!,
        estado: index === 0 ? 'pendiente' : 'programada'
      });
    });

    return tareas;
  }

  /**
   * 📅 SUMAR DÍAS A UNA FECHA
   */
  private sumarDias(fecha: Date, dias: number): string {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    
    const dia = String(nuevaFecha.getDate()).padStart(2, '0');
    const mes = String(nuevaFecha.getMonth() + 1).padStart(2, '0');
    const anio = nuevaFecha.getFullYear();
    
    return `${dia}/${mes}/${anio}`;
  }

  /**
   * 🔢 ORDENAR TAREAS POR FECHA Y PRIORIDAD
   */
  private ordenarTareas(tareas: Tarea[]): Tarea[] {
    const prioridadPeso = { 'alta': 3, 'media': 2, 'baja': 1 };

    return tareas.sort((a, b) => {
      // Primero por fecha
      const fechaA = this.parsearFecha(a.fecha);
      const fechaB = this.parsearFecha(b.fecha);
      
      if (fechaA.getTime() !== fechaB.getTime()) {
        return fechaA.getTime() - fechaB.getTime();
      }

      // Luego por prioridad
      return prioridadPeso[b.prioridad] - prioridadPeso[a.prioridad];
    });
  }

  /**
   * 📆 PARSEAR FECHA DD/MM/YYYY
   */
  private parsearFecha(fechaStr: string): Date {
    const [dia, mes, anio] = fechaStr.split('/').map(Number);
    return new Date(anio, mes - 1, dia);
  }

  /**
   * 🎯 OBTENER TAREAS DESTACADAS (Las 5 más prioritarias)
   */
  obtenerTareasDestacadas(tareas: Tarea[]): Tarea[] {
    return tareas.slice(0, 5);
  }

  /**
   * 📊 ESTADÍSTICAS DE TAREAS
   */
  obtenerEstadisticas(tareas: Tarea[]): {
    total: number;
    pendientes: number;
    programadas: number;
    completadas: number;
  } {
    return {
      total: tareas.length,
      pendientes: tareas.filter(t => t.estado === 'pendiente').length,
      programadas: tareas.filter(t => t.estado === 'programada').length,
      completadas: tareas.filter(t => t.estado === 'completada').length
    };
  }
}