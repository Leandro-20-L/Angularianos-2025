import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,AlertController,IonLabel,IonList,IonItem,IonText,IonButton } from '@ionic/angular/standalone';
import { SupabaseService } from 'src/app/servicios/supabase.service';

@Component({
  selector: 'app-maitre-lista-espera',
  templateUrl: './maitre-lista-espera.page.html',
  styleUrls: ['./maitre-lista-espera.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonLabel,IonList,IonItem,IonText,IonButton]
})
export class MaitreListaEsperaPage implements OnInit {

  clientes: any[] = [];
  mesasDisponibles: any[] = [];

  constructor(
    private supabase: SupabaseService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.cargarClientes();
    await this.cargarMesas();
  }

  async cargarClientes() {
    const { data, error } = await this.supabase.client
      .from('usuarios')
      .select('*')
      .eq('role', 'cliente')
      .eq('aprobado', 'aprobado')
      .eq('situacion', 'esperando_mesa')
      .is('mesa_asignada', null);

    if (!error) this.clientes = data;
  }

  async cargarMesas() {
    const { data, error } = await this.supabase.client
      .from('mesas')
      .select('*')
      .eq('disponible', true);

    if (!error) this.mesasDisponibles = data;
  }

  async asignarMesa(cliente: any) {
    const alert = await this.alertCtrl.create({
      header: `Asignar mesa a ${cliente.nombre}`,
      inputs: this.mesasDisponibles.map((mesa) => ({
        name: 'mesa',
        type: 'radio',
        label: `Mesa ${mesa.numero}`,
        value: mesa.uid,
      })),
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Asignar',
          handler: async (mesaUid: string) => {
            const mesa = this.mesasDisponibles.find((m) => m.uid === mesaUid);
            if (!mesa) return;

            
            await this.supabase.client
              .from('usuarios')
              .update({
                mesa_asignada: mesa.numero,
                situacion: 'mesaAsignado',
              })
              .eq('uid', cliente.uid);

            
            await this.supabase.client
              .from('mesas')
              .update({
                disponible: false,
                id_cliente: cliente.uid,
              })
              .eq('uid', mesa.uid);

            
            await this.cargarClientes();
            await this.cargarMesas();
          },
        },
      ],
    });

    await alert.present();
  }

}
