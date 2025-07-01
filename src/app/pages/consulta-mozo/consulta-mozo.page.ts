import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { MensajeService } from 'src/app/servicios/mensajes.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { SupabaseService } from 'src/app/servicios/supabase.service';
import { Router } from '@angular/router';
import { PushService } from 'src/app/servicios/push.service';
import { Preferences } from '@capacitor/preferences';
import { Token } from '@angular/compiler';
import { AlertController } from '@ionic/angular/standalone';


@Component({
  selector: 'app-consulta-mozo',
  templateUrl: './consulta-mozo.page.html',
  styleUrls: ['./consulta-mozo.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ConsultaMozoPage implements OnInit {

  id: any = 0;
  nuevoMensaje: string = '';
  mensajeError: string = "";
  mensajes = signal<any>([]);
  mesaAsignada = 0;
  perfil = "";
  id_cliente: string | null = null;

  constructor(
    private mensaje: MensajeService,
    private acceso: AuthService,
    private toastController: ToastController,
    private usuarioService: UsuarioService,
    private supabase: SupabaseService,
    private push: PushService,
    private router: Router,
    private alert: AlertController
  ) {
  }

  async ngOnInit() {
    this.mensaje.borrar()
    this.id = await this.acceso.getUserUid();
    let usuario = await this.usuarioService.obtenerUsuarioPorUID(this.id);
    this.mesaAsignada = usuario.mesa_asignada;
    this.perfil = usuario.role;
    await this.actualizarChat();

  }

  volverAtras() {
    if (this.perfil === "cliente") {
      this.router.navigate(["/mesa"])
    } else if (this.perfil === "mozo") {
      this.router.navigate(["/mozo"])
    }
  }

  async enviarMensaje(mensaje: string) {
    try {
      if (mensaje.length > 100) {
        throw new Error("no se pueden superar los 100 caracteres");
      }
      if (mensaje.length == 0) {
        throw new Error("mensaje no valido");
      }

      let token = "";
      let tipo = (): string => { if (this.perfil === "cliente") return 'consulta'; else return 'respuesta' };

      if (this.perfil === "mozo") {
        console.log(this.id_cliente)
        if (this.id_cliente == null) throw new Error('primero debes elegir qué mensaje responder')

        token = await this.push.getToken(this.id_cliente);
        await this.mensaje.escribirMensaje(mensaje, this.id_cliente, this.id, tipo(), this.id);

      } else {

        let mozo = await this.usuarioService.obtenerUsuarioPorRol("mozo");
        this.push.initializePushNotifications(mozo[0].uid!);
        token = await this.push.getToken(mozo[0].uid!);
        await this.mensaje.escribirMensaje(mensaje, this.id, mozo[0].uid!, tipo(), this.id);
      }

      this.push.sendNotification(token, `nueva ${tipo()}`, mensaje.trim(), 'https://api-la-comanda.onrender.com/notify')
        .subscribe({
          next: res => this.mostrarToast('consulta enviada'),
          error: err => { throw err; }
        });
    } catch (err: any) {

      const alerta = await this.alert.create({
        header: err.message,
        buttons: ["Aceptar"]
      });
      await alerta.present();
    }
  }

  async actualizarChat() {
    const array = await this.mensaje.obtenerMensajes();
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

  guardarId(uid: string) {
    this.id_cliente = uid;
    console.log(this.id_cliente);
  }

  formatearFecha(fecha: Date): string {
    const f = new Date(fecha);

    const dia = f.getDate().toString().padStart(2, '0');
    const mes = (f.getMonth() + 1).toString().padStart(2, '0');
    const horas = (parseInt(f.getHours().toString().padStart(2, '0')) -3);
    const minutos = f.getMinutes().toString().padStart(2, '0');

    return `${dia}/${mes} ${horas}:${minutos}`;
  }
}
