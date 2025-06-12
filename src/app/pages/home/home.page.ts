import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/servicios/auth.service';
import { PushService } from 'src/app/servicios/push.service';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { QrService } from 'src/app/servicios/qr.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonicModule],
})
export class HomePage implements OnInit {
  constructor(public toastController: ToastController, private route: Router, private auth: AuthService, private push: PushService, private acceso: AuthService,private qrService: QrService,private usuarioService: UsuarioService,){}
  async ionViewWillEnter() {
  const situacion = await this.usuarioService.obtenerSituacionUsuario();

  if (situacion === 'mesaAsignado') {
    this.route.navigate(['/mesa']);
  }
}
  async ngOnInit() {
    try {
      let uid = await this.acceso.getUserUid();
      let token = await this.push.getToken(uid!);

      this.push.initializePushNotifications(uid!);
      this.push.sendNotification(token, "hola", "mensaje personalizado desde ts", 'https://api-la-comanda.onrender.com/notify')
        .subscribe({
          next: res => this.imprimirToast('Notificación enviada:'),
          error: err => this.imprimirToast(err.message)
        });

    } catch (error: any) {
      console.log(error.message)
    }
  }

  async signOut() {
    await this.auth.logOut();
    this.route.navigate(["/login"])
  }

  async escanearQrYEntrarLista() {
    try {
      const qrContenido = await this.qrService.scan();
      console.log("Contenido del QR:", qrContenido);

      await this.usuarioService.marcarComoEsperando(qrContenido as string);

      this.imprimirToast('Te agregamos a la lista de espera');
    } catch (error) {
      this.imprimirToast( 'Error al escanear');
    } finally {
      await this.qrService.cancelarEscaneo(); 
    }
  }

  async imprimirToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    })
    await toast.present();
  }

}
