import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { CultivosService, Cultivo, DashboardData } from '../../services/cultivos.service';
import { AuthService } from '../../services/auth.service';
import { ClimaIAService, DatosClimaIA } from '../../services/climaai.service';
import { TareasService, Tarea } from '../../services/tareas.service';
import { IaPrediccionService } from '../../services/ia-prediccion.service';

Chart.register(...registerables);

@Component({
  selector: 'app-cultivos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cultivos.html',
  styleUrls: ['./cultivos.css'],
})
export class Cultivos implements OnInit, OnDestroy, AfterViewInit {
  dashboardData: DashboardData | null = null;
  cultivos: Cultivo[] = [];
  cultivosActivos: Cultivo[] = [];
  cargando: boolean = true;
   datos = {
    temperatura: 0,
    humedad: 0,
    dias_sin_lluvia: 0
  };
  resultadoRiesgo: string = '';
  riesgoPlaga: string = '';

  // 🤖 CLIMA CON IA
  climaActual: DatosClimaIA | null = null;
  cargandoClima: boolean = false;
  mostrarModalUbicacion: boolean = false;

  // 📋 TAREAS PREDETERMINADAS
  tareas: Tarea[] = [];
  tareasDestacadas: Tarea[] = [];

  // ➕ CREAR CULTIVO
  mostrarFormulario: boolean = false;
  nuevoCultivo = {
    tipo_cultivo: '',
    fecha_siembra: '',
    fecha_cosecha: '',
    estado: 'siembra',
  };

  idUsuarioActual: number = 0;
  chartRendimiento: Chart | null = null;
  chartCosechas: Chart | null = null;
  chartDistribucion: Chart | null = null;

  // Flag para evitar múltiples creaciones
  private graficasCreadas: boolean = false;
  private datosListos: boolean = false;

  constructor(
    private cultivosService: CultivosService,
    private authService: AuthService,
    private climaIAService: ClimaIAService,
    private tareasService: TareasService,
    private iaPrediccionService: IaPrediccionService
  ) {}

  ngOnInit(): void {
    this.obtenerUsuarioActual();

    if (this.idUsuarioActual === 0) {
      console.error('❌ No hay usuario logueado');
      alert('Debes iniciar sesión para ver tus cultivos');
      this.cargando = false;
      return;
    }

    // Cargar datos
    this.cargarDatos();

    // 🌍 SOLICITAR UBICACIÓN AL USUARIO
    this.solicitarUbicacion();
  }

  ngAfterViewInit(): void {
    // Intentar crear gráficas cuando la vista está lista
    if (this.datosListos && !this.graficasCreadas) {
      this.crearGraficasSeguro();
    }
  }

  ngOnDestroy(): void {
    console.log('🗑️ Destruyendo componente y gráficas...');
    this.destruirTodasLasGraficas();
  }

  private destruirTodasLasGraficas(): void {
    if (this.chartRendimiento) {
      this.chartRendimiento.destroy();
      this.chartRendimiento = null;
    }
    if (this.chartCosechas) {
      this.chartCosechas.destroy();
      this.chartCosechas = null;
    }
    if (this.chartDistribucion) {
      this.chartDistribucion.destroy();
      this.chartDistribucion = null;
    }
    this.graficasCreadas = false;
  }

  obtenerUsuarioActual() {
    const usuario = this.authService.obtenerUsuario();
    if (usuario) {
      this.idUsuarioActual = usuario.IdUsuario || usuario.id_usuario || usuario.id || 0;
      console.log('🆔 ID Usuario:', this.idUsuarioActual);
    }
  }

  cargarDatos() {
    this.cargando = true;

    this.cultivosService.getCultivosPorUsuario(this.idUsuarioActual).subscribe({
      next: (data) => {
        console.log('✅ Cultivos recibidos:', data);

        this.cultivos = data;
        this.cultivosActivos = data.filter(
          (c: Cultivo) =>
            c.estado === 'en crecimiento' || c.estado === 'cosechado' || c.estado === 'siembra'
        );

        this.dashboardData = this.cultivosService.procesarDatosDashboard(data);

        // 📋 GENERAR TAREAS BASADAS EN LOS CULTIVOS
        this.generarTareas();

        this.cargando = false;
        this.datosListos = true;

        // Crear gráficas con un único intento después del render
        setTimeout(() => {
          if (!this.graficasCreadas) {
            this.crearGraficasSeguro();
          }
        }, 300);
      },
      error: (error) => {
        console.error('❌ Error al cargar cultivos:', error);
        this.cargando = false;
        this.manejarErrorCarga(error);
      },
    });
  }

  /**
   * ➕ ABRIR FORMULARIO DE CREAR CULTIVO
   */
  abrirFormulario() {
    this.mostrarFormulario = true;
  }

  /**
   * ❌ CERRAR FORMULARIO
   */
  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.limpiarFormulario();
  }

  /**
   * 🧹 LIMPIAR FORMULARIO
   */
  limpiarFormulario() {
    this.nuevoCultivo = {
      tipo_cultivo: '',
      fecha_siembra: '',
      fecha_cosecha: '',
      estado: 'siembra',
    };
  }

  /**
   * 💾 GUARDAR NUEVO CULTIVO
   */
  guardarCultivo() {
    // Validaciones
    if (!this.nuevoCultivo.tipo_cultivo || !this.nuevoCultivo.fecha_siembra) {
      alert('⚠️ Completa los campos obligatorios (Tipo de Cultivo y Fecha de Siembra)');
      return;
    }

    const cultivoData = {
      id_usuario: this.idUsuarioActual,
      tipo_cultivo: this.nuevoCultivo.tipo_cultivo.toLowerCase(),
      fecha_siembra: this.nuevoCultivo.fecha_siembra,
      fecha_cosecha: this.nuevoCultivo.fecha_cosecha || null,
      estado: this.nuevoCultivo.estado,
      EstLogico: 1,
    };

    console.log('📤 Enviando cultivo:', cultivoData);

    this.cultivosService.crearCultivo(cultivoData).subscribe({
      next: (response) => {
        console.log('✅ Cultivo creado:', response);
        alert('✅ Cultivo creado exitosamente');
        this.cerrarFormulario();
        this.cargarDatos(); // Recargar lista
      },
      error: (error) => {
        console.error('❌ Error al crear cultivo:', error);
        alert('❌ Error al crear cultivo. Intenta nuevamente.');
      },
    });
  }

  /**
   * 📊 CREAR GRÁFICAS DE FORMA SEGURA (UNA SOLA VEZ)
   */
  private crearGraficasSeguro(): void {
    if (this.graficasCreadas) {
      console.warn('⚠️ Gráficas ya creadas, evitando duplicación');
      return;
    }

    if (!this.dashboardData) {
      console.warn('⚠️ No hay datos para crear gráficas');
      return;
    }

    console.log('📊 Iniciando creación de gráficas...');

    // Verificar que todos los canvas existen
    const overviewCanvas = document.getElementById('overviewChart') as HTMLCanvasElement;
    const yieldCanvas = document.getElementById('yieldChart') as HTMLCanvasElement;
    const pieCanvas = document.getElementById('pieChart') as HTMLCanvasElement;

    if (!overviewCanvas || !yieldCanvas || !pieCanvas) {
      console.error('❌ No se encontraron todos los canvas');
      return;
    }

    try {
      this.createOverviewChart();
      this.createYieldChart();
      this.createPieChart();
      this.graficasCreadas = true;
      console.log('✅ Todas las gráficas creadas exitosamente');
    } catch (error) {
      console.error('❌ Error al crear gráficas:', error);
    }
  }

  /**
   * 🌍 SOLICITAR UBICACIÓN DEL USUARIO
   */
  solicitarUbicacion() {
    const ubicacionGuardada = localStorage.getItem('clima_ubicacion_solicitada');

    if (ubicacionGuardada === 'rechazada') {
      console.log('⚠️ Usuario rechazó ubicación previamente, usando predeterminada');
      this.cargarClimaPrederterminado();
      return;
    }

    this.mostrarModalUbicacion = true;
  }

  /**
   * ✅ USUARIO ACEPTA COMPARTIR UBICACIÓN
   */
  aceptarUbicacion() {
    this.mostrarModalUbicacion = false;
    this.cargandoClima = true;

    console.log('📍 Usuario aceptó compartir ubicación');

    this.climaIAService.solicitarUbicacionUsuario().subscribe({
      next: (clima) => {
        console.log('✅ Clima obtenido con ubicación real:', clima);
        this.climaActual = clima;
        this.cargandoClima = false;
        localStorage.setItem('clima_ubicacion_solicitada', 'aceptada');
      },
      error: (error) => {
        console.error('❌ Error al obtener clima con ubicación:', error);
        this.cargarClimaPrederterminado();
      },
    });
  }

  /**
   * ❌ USUARIO RECHAZA COMPARTIR UBICACIÓN
   */
  rechazarUbicacion() {
    this.mostrarModalUbicacion = false;
    console.log('❌ Usuario rechazó compartir ubicación');
    localStorage.setItem('clima_ubicacion_solicitada', 'rechazada');
    this.cargarClimaPrederterminado();
  }

  /**
   * 🌤️ CARGAR CLIMA PREDETERMINADO
   */
  private cargarClimaPrederterminado() {
    this.cargandoClima = true;
    console.log('🔄 Cargando clima predeterminado...');

    this.climaIAService.obtenerClimaConIA('Barranquilla, Atlántico').subscribe({
      next: (clima) => {
        console.log('✅ Clima predeterminado cargado:', clima);
        this.climaActual = clima;
        this.predecirRiesgoPlaga();
        this.cargandoClima = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar clima predeterminado:', error);
        this.cargandoClima = false;

        this.climaActual = {
          temperatura: 28,
          humedad: 70,
          viento: 12,
          descripcion: 'Parcialmente nublado',
          icono: '⛅',
          recomendaciones: [
            '🌱 Regar temprano en la mañana',
            '☀️ Proteger cultivos del sol directo',
            '💧 Mantener humedad constante',
          ],
          ciudad: 'Barranquilla',
        };
      },
    });
  }

  /**
   * 🔄 ACTUALIZAR CLIMA (botón para refrescar)
   */
  actualizarClima() {
    const ubicacionAceptada = localStorage.getItem('clima_ubicacion_solicitada') === 'aceptada';

    if (ubicacionAceptada) {
      this.cargandoClima = true;
      this.climaIAService.solicitarUbicacionUsuario().subscribe({
        next: (clima) => {
          this.climaActual = clima;
          this.cargandoClima = false;
        },
        error: () => {
          this.cargarClimaPrederterminado();
        },
      });
    } else {
      this.mostrarModalUbicacion = true;
    }
  }

  /**
   * 📋 GENERAR TAREAS BASADAS EN CULTIVOS
   */
  generarTareas() {
    if (this.cultivos.length === 0) {
      console.warn('⚠️ No hay cultivos para generar tareas');
      this.tareas = [];
      this.tareasDestacadas = [];
      return;
    }

    console.log('📋 Generando tareas predeterminadas...');

    this.tareas = this.tareasService.generarTareasPorCultivos(this.cultivosActivos);

    this.cultivosActivos.forEach((cultivo) => {
      const tareasEspecificas = this.tareasService.generarTareasPorTipoCultivo(
        cultivo.tipo_cultivo,
        cultivo.id_cultivo
      );
      this.tareas = [...this.tareas, ...tareasEspecificas];
    });

    this.tareasDestacadas = this.tareasService.obtenerTareasDestacadas(this.tareas);

    console.log('✅ Tareas generadas:', this.tareasDestacadas);
  }

  getClaseEstadoTarea(estado: string): string {
    const clases: { [key: string]: string } = {
      pendiente: 'pendiente',
      programada: 'programada',
      completada: 'completada',
    };
    return clases[estado] || 'programada';
  }

  getTextoEstado(estado: string): string {
    const textos: { [key: string]: string } = {
      pendiente: 'Pendiente',
      programada: 'Programada',
      completada: 'Completada',
    };
    return textos[estado] || 'Programada';
  }

  private manejarErrorCarga(error: any) {
    if (error.status === 0) {
      alert('No se pudo conectar con el servidor');
    } else if (error.status === 404) {
      this.dashboardData = {
        totalCultivos: 0,
        areaTotal: 0,
        rendimiento: 0,
        ingresos: 0,
        cultivosPorTipo: [],
        cultivosPorEstado: [],
        cultivosMensuales: [],
      };
    }
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const anio = date.getFullYear();
      return `${dia}/${mes}/${anio}`;
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  obtenerClaseEstado(estado: string): string {
    const estadoLower = estado.toLowerCase();
    const clases: { [key: string]: string } = {
      'en crecimiento': 'crecimiento',
      crecimiento: 'crecimiento',
      cosechado: 'recoleccion',
      recoleccion: 'recoleccion',
      siembra: 'siembra',
      finalizado: 'finalizado',
      perdido: 'perdido',
    };
    return clases[estadoLower] || 'otro';
  }

  obtenerIconoEstado(estado: string): string {
    const estadoLower = estado.toLowerCase();
    const iconos: { [key: string]: string } = {
      'en crecimiento': '🌿',
      crecimiento: '🌿',
      cosechado: '✅',
      recoleccion: '☀️',
      siembra: '🌾',
      finalizado: '✔️',
      perdido: '❌',
    };
    return iconos[estadoLower] || '🌱';
  }

  createOverviewChart() {
    const canvas = document.getElementById('overviewChart') as HTMLCanvasElement;
    if (!canvas || !this.dashboardData) {
      console.error('❌ No se puede crear overviewChart');
      return;
    }

    if (this.chartRendimiento) {
      this.chartRendimiento.destroy();
      this.chartRendimiento = null;
    }

    const labels = this.dashboardData.cultivosMensuales.map((m) => m.mes);
    const data = this.dashboardData.cultivosMensuales.map((m) => m.cantidad);

    this.chartRendimiento = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Siembras por Mes',
            data: data,
            borderColor: '#66bb6a',
            backgroundColor: 'rgba(102, 187, 106, 0.2)',
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
      },
    });
    console.log('✅ overviewChart creado');
  }

  createYieldChart() {
    const canvas = document.getElementById('yieldChart') as HTMLCanvasElement;
    if (!canvas || !this.dashboardData) {
      console.error('❌ No se puede crear yieldChart');
      return;
    }

    if (this.chartCosechas) {
      this.chartCosechas.destroy();
      this.chartCosechas = null;
    }

    const labels = this.dashboardData.cultivosPorEstado.map(
      (e) => e.estado.charAt(0).toUpperCase() + e.estado.slice(1)
    );
    const data = this.dashboardData.cultivosPorEstado.map((e) => e.cantidad);

    this.chartCosechas = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Cantidad de Cultivos',
            data: data,
            backgroundColor: ['#66bb6a', '#42a5f5', '#ffb300', '#ab47bc'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
    console.log('✅ yieldChart creado');
  }

  createPieChart() {
    const canvas = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!canvas || !this.dashboardData) {
      console.error('❌ No se puede crear pieChart');
      return;
    }

    if (this.chartDistribucion) {
      this.chartDistribucion.destroy();
      this.chartDistribucion = null;
    }

    const cultivosOrdenados = [...this.dashboardData.cultivosPorTipo]
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    const labels = cultivosOrdenados.map((c) => c.tipo);
    const data = cultivosOrdenados.map((c) => c.cantidad);

    this.chartDistribucion = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ['#66bb6a', '#42a5f5', '#ffb300', '#ab47bc', '#ef5350'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
          },
        },
      },
    });
    console.log('✅ pieChart creado');
  }
predecir() {
  this.iaPrediccionService.predecirPlaga(this.datos).subscribe({
    next: (resp) => {
      console.log("Respuesta IA:", resp);
      this.riesgoPlaga = resp.riesgo;
    },
    error: (err) => {
      console.error("Error IA:", err);
    }
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
