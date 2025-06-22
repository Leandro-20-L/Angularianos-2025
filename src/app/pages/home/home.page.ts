import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/servicios/auth.service';
import { PushService } from 'src/app/servicios/push.service';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { QrService } from 'src/app/servicios/qr.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class HomePage implements OnInit {

  escaneando: boolean = false;
  cargando: boolean = true;
  intervalId: any;

  constructor(public toastController: ToastController, private route: Router, private auth: AuthService, private push: PushService, private acceso: AuthService, private qrService: QrService, private usuarioService: UsuarioService,) { }
  async ngOnDestroy() {
    clearInterval(this.intervalId); 
  }

  verificarSituacionCada5Segundos() {
    this.intervalId = setInterval(async () => {
      const situacion = await this.usuarioService.obtenerSituacionUsuario();
      if (situacion === 'mesaAsignado') {
        clearInterval(this.intervalId);
        this.route.navigate(['/mesa']);
      }
      this.cargando = false;
    }, 5000);
  }

  async ngOnInit() {
    
    this.verificarSituacionCada5Segundos();
  }

  async signOut() {
    await this.auth.logOut();
    this.route.navigate(["/login"])
  }

  async escanearQrYEntrarLista() {
  this.escaneando = true;
  let uid = await this.acceso.getUserUid();
  try {
    const qrContenido = await this.qrService.scan();
    console.log("Contenido del QR:", qrContenido);

    await this.usuarioService.marcarComoEsperando(qrContenido as string);

    await this.push.initializePushNotifications(uid!);

    //  notificar al maitre
    const maitre = await this.usuarioService.obtenerUsuarioPorRol("maitre");
    const tokenMaitre = await this.push.getToken(maitre[0].uid!);

    await this.push.sendNotification(
      tokenMaitre,
      "Cliente en espera",
      "Hay un nuevo cliente esperando mesa",
      'https://api-la-comanda.onrender.com/notify'
    ).toPromise();

    this.imprimirToast('Te agregamos a la lista de espera');

  } catch (error) {
    this.imprimirToast('Error al escanear');
  } finally {
    await this.cancelarEscaneo();
  }
}

  async cancelarEscaneo() {
    this.escaneando = false;
    await this.qrService.cancelarEscaneo()
  }

  async imprimirToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    })
    await toast.present();
  }

  irAEncuestas() {
  this.route.navigate(['/encuestas-previas']);
}

}
