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

    this.renderChart(encuestas, 'comida', 'comidaChart', 'Calificaciones de la comida');
    this.renderChart(encuestas, 'atencion_cliente', 'atencionChart', 'Atención al cliente');
    this.renderChart(encuestas, 'limpieza', 'limpiezaChart', 'Limpieza del lugar');
    this.renderConocioChart(encuestas);
  }

  renderChart(encuestas: any[], campo: string, canvasId: string, titulo: string) {
    const labels = Array.from({ length: 10 }, (_, i) => (i + 1).toString());
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
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: titulo,
          data,
          backgroundColor: '#4e54c8',
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
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
          backgroundColor: '#ff9f40',
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

}
