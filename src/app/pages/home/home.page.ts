import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/servicios/auth.service';
import { PushService } from 'src/app/servicios/push.service';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonicModule],
})
export class HomePage implements OnInit {
  constructor(public toastController: ToastController, private route: Router, private auth: AuthService, private push: PushService, private acceso: AuthService) {
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

  async imprimirToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    })
    await toast.present();
  }

}
