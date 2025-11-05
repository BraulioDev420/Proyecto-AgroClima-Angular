import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CultivosService, Cultivo, DashboardData } from '../../services/cultivos.service';

Chart.register(...registerables);

@Component({
  selector: 'app-cultivos',
  templateUrl: './cultivos.html',
  styleUrls: ['./cultivos.css']
})
export class Cultivos implements OnInit {
  dashboardData: DashboardData | null = null;
  cultivos: Cultivo[] = [];
  cultivosActivos: Cultivo[] = [];
  cargando: boolean = true;

  // Referencias a las gráficas para poder actualizarlas
  chartRendimiento: Chart | null = null;
  chartCosechas: Chart | null = null;
  chartDistribucion: Chart | null = null;

  constructor(private cultivosService: CultivosService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // 📥 CARGAR DATOS DE LA API
  cargarDatos() {
    this.cargando = true;
    
    this.cultivosService.getCultivosActivos().subscribe({
      next: (data) => {
        console.log('Datos recibidos de la API:', data);
        
        this.cultivos = data;
        this.cultivosActivos = data.filter(c => 
          c.estado === 'en crecimiento' || c.estado === 'cosechado'
        );
        
        // Procesar datos para el dashboard
        this.dashboardData = this.cultivosService.procesarDatosDashboard(data);
        
        console.log('Dashboard Data procesada:', this.dashboardData);
        
        //grafik
        setTimeout(() => {
          this.createOverviewChart();
          this.createYieldChart();
          this.createPieChart();
          this.cargando = false;
        }, 100);
      },
      error: (error) => {
        console.error('Error al cargar cultivos:', error);
        this.cargando = false;
        
        
        if (error.status === 0) {
          alert('No se pudo conectar con el servidor. Verifica:\n1. Que la API esté corriendo\n2. Que no haya problemas de CORS\n3. La URL: https://proyecto-agroclima-api.onrender.com');
        } else {
          alert(`Error ${error.status}: ${error.message}`);
        }
      }
    });
  }


  createOverviewChart() {
    const canvas = document.getElementById('overviewChart') as HTMLCanvasElement;
    if (!canvas || !this.dashboardData) {
      console.error('Canvas overviewChart no encontrado o no hay datos');
      return;
    }

    const labels = this.dashboardData.cultivosMensuales.map(m => m.mes);
    const data = this.dashboardData.cultivosMensuales.map(m => m.cantidad);

   
    if (this.chartRendimiento) {
      this.chartRendimiento.destroy();
    }

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
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#66bb6a',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 10,
              font: { size: 11, family: 'Poppins' },
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 10,
            cornerRadius: 6
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: {
              stepSize: 1,
              font: { family: 'Poppins', size: 10 }
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Poppins', size: 10 }
            }
          }
        }
      }
    });
  }

  createYieldChart() {
    const canvas = document.getElementById('yieldChart') as HTMLCanvasElement;
    if (!canvas || !this.dashboardData) {
      console.error('Canvas yieldChart no encontrado o no hay datos');
      return;
    }

    const labels = this.dashboardData.cultivosPorEstado.map(e => {
      return e.estado.charAt(0).toUpperCase() + e.estado.slice(1);
    });
    const data = this.dashboardData.cultivosPorEstado.map(e => e.cantidad);

   
    if (this.chartCosechas) {
      this.chartCosechas.destroy();
    }

    this.chartCosechas = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Cantidad de Cultivos',
            data: data,
            backgroundColor: [
              '#66bb6a',
              '#42a5f5',
              '#ffb300',
              '#ab47bc'
            ],
            borderRadius: 6,
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 10,
            cornerRadius: 6
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: {
              stepSize: 1,
              font: { family: 'Poppins', size: 10 }
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Poppins', size: 10 }
            }
          }
        }
      }
    });
  }

  createPieChart() {
    const canvas = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!canvas || !this.dashboardData) {
      console.error('Canvas pieChart no encontrado o no hay datos');
      return;
    }

    // Tomar los 5 cultivos más comunes
    const cultivosOrdenados = [...this.dashboardData.cultivosPorTipo]
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    const labels = cultivosOrdenados.map(c => c.tipo);
    const data = cultivosOrdenados.map(c => c.cantidad);

    const colores = [
      '#66bb6a',
      '#42a5f5',
      '#ffb300',
      '#ab47bc',
      '#ef5350'
    ];

    if (this.chartDistribucion) {
      this.chartDistribucion.destroy();
    }

    this.chartDistribucion = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colores.slice(0, data.length),
          borderColor: '#fff',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 10,
              font: { size: 11, family: 'Poppins' },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              label: function(context: any) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const porcentaje = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${porcentaje}%)`;
              }
            }
          }
        }
      }
    });
  }
}