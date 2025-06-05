import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,ToastController,IonList,IonItem,IonLabel,IonAvatar,IonText,IonSpinner,IonButton} from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/servicios/usuario.service';

@Component({
  selector: 'app-clientes-pendientes',
  templateUrl: './clientes-pendientes.page.html',
  styleUrls: ['./clientes-pendientes.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonList,IonItem,IonLabel,IonAvatar,IonText,IonSpinner,IonButton]
})
export class ClientesPendientesPage implements OnInit {

  clientesPendientes: any[] = [];
  cargando: boolean = false;

  constructor(private usuarioService: UsuarioService, private toastCtrl: ToastController) {}

  ngOnInit() {
    this.cargarPendientes();
  }

  async cargarPendientes() {
    this.cargando = true;
    try {
      this.clientesPendientes = await this.usuarioService.obtenerPendientes();
    } catch (e) {
      this.mostrarToast('Error al cargar clientes.');
    }
    this.cargando = false;
  }

  async aprobar(uid: string) {
    try {
      await this.usuarioService.aprobarUsuario(uid);
      this.mostrarToast('Cliente aprobado.');
      this.cargarPendientes(); 
    } catch (e) {
      this.mostrarToast('Error al aprobar cliente.');
    }
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 2000 });
    toast.present();
  }

}
