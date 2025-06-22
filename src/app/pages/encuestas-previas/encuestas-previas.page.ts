import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonItem,IonLabel } from '@ionic/angular/standalone';
import { SupabaseService } from 'src/app/servicios/supabase.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-encuestas-previas',
  templateUrl: './encuestas-previas.page.html',
  styleUrls: ['./encuestas-previas.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonItem,IonLabel]
})
export class EncuestasPreviasPage implements OnInit {
  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const { data: encuestas, error } = await this.supabase.client
      .from('encuestas')
      .select('*');

    if (error) {
      console.error('Error al traer encuestas:', error);
      return;
    }

    // Gráficos de comida en los 3 formatos
    this.renderChartBarOrLine(encuestas, 'comida', 'comidaChartBar', 'Comida', 'bar');
    this.renderChartBarOrLine(encuestas, 'comida', 'comidaChartLine', 'Comida', 'line');
    this.renderChartPie(encuestas, 'comida', 'comidaChartPie', 'Comida (Pie)');

    // Otros campos con bar
    this.renderChartBarOrLine(encuestas, 'atencion_cliente', 'atencionChart', 'Atención al cliente', 'bar');
    this.renderChartBarOrLine(encuestas, 'limpieza', 'limpiezaChart', 'Limpieza del lugar', 'bar');

    // Pie de "cómo nos conociste"
    this.renderConocioChart(encuestas);
  }

  renderChartBarOrLine(
  encuestas: any[],
  campo: string,
  canvasId: string,
  titulo: string,
  tipo: 'bar' | 'line' = 'bar'
) {
  const labels = Array.from({ length: 10 }, (_, i) => (i + 1).toString());
  const data = Array(10).fill(0);
  const colores = ['#FFBA08', '#6A040F', '#FAA307', '#E85D04'];

  encuestas.forEach((e) => {
    const valor = e[campo];
    if (valor >= 1 && valor <= 10) {
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
      scales: {
        y: {
          beginAtZero: true,
          max: encuestas.length > 0 ? encuestas.length : 1
        }
      }
    }
  });
}

  renderChartPie(encuestas: any[], campo: string, canvasId: string, titulo: string) {
    const labels = ['1','2','3','4','5','6','7','8','9','10'];
    const data = Array(10).fill(0);

    encuestas.forEach((e) => {
      const valor = e[campo];
      if (valor >= 1 && valor <= 10) {
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
        responsive: true
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
        responsive: true
      }
    });
  }

}
