import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { MensajeService } from 'src/app/servicios/mensajes.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { SupabaseService } from 'src/app/servicios/supabase.service';
import { RouterLink } from '@angular/router';
import { PushService } from 'src/app/servicios/push.service';
import { ConsultaService } from 'src/app/servicios/consulta.service';

@Component({
  selector: 'app-consulta-mozo',
  templateUrl: './consulta-mozo.page.html',
  styleUrls: ['./consulta-mozo.page.scss'],
  standalone: true,
  imports: [RouterLink, IonicModule, CommonModule, FormsModule]
})
export class ConsultaMozoPage implements OnInit {

  id: any = 0;
  nuevoMensaje: string = '';
  mensajeError: string = "";
  mensajes = signal<any>([]);
  mesaAsignada = 0;
  perfil = "";

  constructor(
    private mensaje: MensajeService,
    private acceso: AuthService,
    private toastController: ToastController,
    private usuarioService: UsuarioService,
    private supabase: SupabaseService,
    private push: PushService,
    private consultaService: ConsultaService
  ) {
  }

  async ngOnInit() {
    this.id = await this.acceso.getUserUid();
    let usuario = await this.usuarioService.obtenerUsuarioPorUID(this.id);
    this.mesaAsignada = usuario.mesa_asignada;
    this.perfil = usuario.role;
    await this.actualizarChat();
    console.log(this.mensajes)
  }


  async enviarMensaje(mensaje: string) {
    console.log(mensaje.length)
    if (mensaje.length > 21) {
      this.mostrarToast("no se pueden superar los 21 caracteres");
      return;
    }
    if (mensaje.length == 0) {
      this.mostrarToast("mensaje no valido");
      return;
    }

    let mozo = await this.usuarioService.obtenerUsuarioPorRol("mozo");
    this.push.initializePushNotifications(mozo[0].uid!);
    let token = await this.push.getToken(mozo[0].uid!);

    await this.mensaje.escribirMensaje(mensaje, this.id, this.mesaAsignada!, mozo[0].uid);
    // await this.consultaService.enviarConsulta(this.id, mensaje.trim(), this.mesaAsignada!, mozo[0].id)

    this.push.sendNotification(token, "nueva consulta", mensaje.trim(), 'https://api-la-comanda.onrender.com/notify')
      .subscribe({
        next: res => this.mostrarToast('consulta enviada'),
        error: err => this.mostrarToast(`${err.message}`)
      });
  }

  async actualizarChat() {
    const array = await this.mensaje.obtenerMensajes();
    console.log(array)
    if (array && array.length > 0) {
      this.mensajes.set(array);
    }

    const canal = this.supabase.client.channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          table: 'mensajes_mozo',
          schema: 'public',
        },
        (cambios: any) => {
          this.mensajes.update((mensajesPrevios) => {

            this.mensaje.obtenerMensajes().then((nuevosMensajes) => {
              this.mensajes.set(nuevosMensajes);
            });
            if (this.nuevoMensaje) {
              this.nuevoMensaje = "";
            }
            return mensajesPrevios;
          });
        }
      );
    canal.subscribe();
    this.scrolearAbajo();
  }

  scrolearAbajo() {
    setTimeout(() => {
      const chat = document.getElementById('chat');
      if (chat) {
        chat.scrollTop = chat.scrollHeight;
      }
    }, 0);
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: "warning",
    });

    await toast.present();
  }

  async cerrarSesion() {
    await this.acceso.logOut();
  }
}
