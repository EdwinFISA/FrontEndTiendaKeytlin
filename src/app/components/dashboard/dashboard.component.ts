import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { ChartOptions, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false 
})
export class DashboardComponent implements OnInit { 

  resumen: any;

  // Configuración del gráfico de barras (últimas ventas)
  barChartLabels: string[] = [];
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Últimas ventas (Q)',
        backgroundColor: '#3b82f6'
      }
    ]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: true }
    }
  };
  constructor(private dashboardService: DashboardService) { }
  
 ngOnInit(): void {
    this.dashboardService.obtenerResumen().subscribe({
      next: (data) => {
        this.resumen = data;

        // Preparar datos para gráfico de barras
        this.barChartLabels = data.ultimasVentas.map((v: any) =>
          new Date(v.fechaVenta).toLocaleDateString()
        );
        this.barChartData.labels = this.barChartLabels;
        this.barChartData.datasets[0].data = data.ultimasVentas.map((v: any) => v.total);
      },
      error: (err) => console.error('Error al cargar el dashboard', err)
    });
  }
}
