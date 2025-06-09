import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,ToastController,IonList,IonItem,IonLabel,IonAvatar,IonText,IonSpinner,IonButton} from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { EmailService } from 'src/app/servicios/email.service';


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

  constructor(private usuarioService: UsuarioService, private toastCtrl: ToastController,private emailService: EmailService) {}

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
    const cliente = this.clientesPendientes.find(c => c.uid === uid);
    if (!cliente) {
      this.mostrarToast('Cliente no encontrado.');
      return;
    }

    await this.usuarioService.aprobarUsuario(uid);

    // Enviar correo de aprobación
    await this.emailService.enviarCorreo(
      cliente.nombre,
      cliente.correo,
      'Cuenta Aprobada',
      `${cliente.nombre}, tu cuenta en Angularianos ha sido aprobada exitosamente. ¡Bienvenido!`
    );

    this.mostrarToast('Cliente aprobado y notificado.');
    this.cargarPendientes(); 
  } catch (e) {
    console.error('Error al aprobar cliente:', e);
    this.mostrarToast('Error al aprobar cliente.');
  }
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 2000 });
    toast.present();
  }

  async rechazar(uid: string) {
  try {
    const cliente = this.clientesPendientes.find(c => c.uid === uid);
    if (!cliente) {
      this.mostrarToast('Cliente no encontrado.');
      return;
    }
    
    await this.usuarioService.rechazarUsuario(uid); 

    await this.emailService.enviarCorreo(
      cliente.nombre,
      cliente.correo,
      'Cuenta Rechazada',
      `${cliente.nombre}, lamentamos informarte que tu cuenta en Angularianos fue rechazada.`
    );

    this.mostrarToast('Cliente rechazado y notificado.');
    this.cargarPendientes();
  } catch (e) {
    console.error('Error al rechazar cliente:', e);
    this.mostrarToast('Error al rechazar cliente.');
  }
}

}
