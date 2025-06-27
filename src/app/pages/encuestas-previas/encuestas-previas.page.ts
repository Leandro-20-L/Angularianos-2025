import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonItem,IonLabel } from '@ionic/angular/standalone';
import { SupabaseService } from 'src/app/servicios/supabase.service';
import Chart from 'chart.js/auto';
import { EncuestaService } from 'src/app/servicios/encuesta.service';

@Component({
  selector: 'app-encuestas-previas',
  templateUrl: './encuestas-previas.page.html',
  styleUrls: ['./encuestas-previas.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule,IonItem,IonLabel]
})
export class EncuestasPreviasPage implements OnInit {
  constructor(private encuestaService: EncuestaService) {}

  async ngOnInit() {
    const encuestas = await this.encuestaService.traerEncuestasPrevias()
    
    this.renderChartBarOrLine(encuestas!, 'comida', 'comidaChartBar', 'Comida', 'bar');
    this.renderChartBarOrLine(encuestas!, 'comida', 'comidaChartLine', 'Comida', 'line');
    this.renderChartPie(encuestas!, 'comida', 'comidaChartPie', 'Comida (Pie)');

    
    this.renderChartBarOrLine(encuestas!, 'atencion_cliente', 'atencionChart', 'Atención al cliente', 'bar');
    this.renderChartBarOrLine(encuestas!, 'limpieza', 'limpiezaChart', 'Limpieza del lugar', 'bar');

    
    this.renderConocioChart(encuestas!);
  }

  renderChartBarOrLine(
  encuestas: any[],
  campo: string,
  canvasId: string,
  titulo: string,
  tipo: 'bar' | 'line' = 'bar'
) {
  const labels = Array.from({ length: 5 }, (_, i) => (i + 1).toString());
  const data = Array(5).fill(0);
  const colores = ['#FFBA08', '#6A040F', '#FAA307', '#E85D04'];

  encuestas.forEach((e) => {
    const valor = e[campo];
    if (valor >= 1 && valor <= 5) {
      data[valor - 1]++;
    }
  });

  const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext('2d');
  if (!ctx) return;

  new Chart(ctx, {
    type: tipo,
    data: {
      labels,
      datasets: [{
        label: titulo,
        data,
        backgroundColor: tipo === 'bar'
          ? labels.map((_, i) => colores[i % colores.length])
          : 'transparent',
        borderColor: tipo === 'line' ? colores[0] : undefined,
        borderWidth: 3,
        fill: false,
        tension: 0.3,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: '#ffffff', // leyenda
            font: {
              size: 14,
              weight: 'bold',
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#ffffff', // eje x
            font: {
              size: 12,
            }
          }
        },
        y: {
          ticks: {
            color: '#ffffff', // eje y
            font: {
              size: 12,
            }
          },
          beginAtZero: true,
          max: encuestas.length > 0 ? encuestas.length : 1
        }
      }
    }
  });
}

  renderChartPie(encuestas: any[], campo: string, canvasId: string, titulo: string) {
    const labels = ['1','2','3','4','5'];
    const data = Array(5).fill(0);

    encuestas.forEach((e) => {
      const valor = e[campo];
      if (valor >= 1 && valor <= 5) {
        data[valor - 1]++;
      }
    });

    const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: titulo,
          data,
          backgroundColor: labels.map(() => '#ff9f40'),
        }]
      },
      options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: '#000000', // texto negro para fondo claro
            font: {
              size: 14,
              weight: 'bold',
            }
          }
        }
      }
    }
    });
  }

  renderConocioChart(encuestas: any[]) {
    const labels = ['Recomendación', 'Redes Sociales', 'Publicidad', 'Otro'];
    const data = [0, 0, 0, 0];

    encuestas.forEach((e) => {
      e.como_conocio?.forEach((valor: number) => {
        if (data[valor] !== undefined) {
          data[valor]++;
        }
      });
    });

    const ctx = (document.getElementById('conocioChart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: '¿Cómo nos conociste?',
          data,
          backgroundColor: ['#FFBA08', '#6A040F', '#FAA307', '#E85D04', '#FFBA08', '#6A040F', '#FAA307', '#E85D04', '#FFBA08', '#6A040F'],
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: '#000000', // texto negro para fondo claro
              font: {
                size: 14,
                weight: 'bold',
              }
            }
          }
        }
      }
    });
  }

}
