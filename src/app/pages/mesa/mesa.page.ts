import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonButton } from '@ionic/angular/standalone';
import { QrService } from 'src/app/servicios/qr.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { PushService } from 'src/app/servicios/push.service';
import { ConsultaService } from 'src/app/servicios/consulta.service';
import { AuthService } from 'src/app/servicios/auth.service';

@Component({
  selector: 'app-mesa',
  templateUrl: './mesa.page.html',
  styleUrls: ['./mesa.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonButton]
})
export class MesaPage implements OnInit {

  numeroMesaAsignada: number | null = null;
  qrCorrecto: string | null = null;
  id: any = "";

  constructor(private auth: AuthService, private consultaService: ConsultaService, private push: PushService, private alert: AlertController, private qrService: QrService, private router: Router, private usuarioService: UsuarioService) { }

  async ngOnInit() {
    this.id = await this.auth.getUserUid();

    const mesa = await this.usuarioService.obtenerMesaAsignada();

    if (mesa) {
      this.numeroMesaAsignada = mesa.numero;
      this.qrCorrecto = mesa.qr;
    } else {
      this.numeroMesaAsignada = null;
      this.qrCorrecto = null;
    }
  }

  async escanearQR() {
    try {
      const resultado = await this.qrService.scan();

      if (resultado === this.qrCorrecto) {
        await this.qrService.cancelarEscaneo();
        this.router.navigate(['/menu']); // Redirigís a la página del menú
      } else {
        await this.qrService.cancelarEscaneo();
        alert('El QR escaneado no corresponde con tu mesa asignada.');
      }
    } catch (error) {
      await this.qrService.cancelarEscaneo();
      alert(error);
    }
  }

  async preguntar() {
    const alert = await this.alert.create({
      header: 'Ingrese su consulta',
      cssClass: 'custom-alert',
      inputs: [
        {
          name: 'consulta',
          type: 'text'
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'enviar',
          handler: async (data: any) => {
            if (data.trim().length > 100) {
              throw new Error("consulta muy larga");
            }
            if(data.trim().length == 0){
              throw new Error("mensaje vacio");
            }

            let mozo = await this.usuarioService.obtenerUsuarioPorRol("mozo");
            this.push.initializePushNotifications(mozo[0].uid!);
            let token = await this.push.getToken(mozo[0].uid!);

            this.consultaService.enviarConsulta(this.id, data.trim(), this.numeroMesaAsignada!, mozo[0].id)

            await this.push.sendNotification(token, "nueva consulta", data.trim(), 'https://api-la-comanda.onrender.com/notify')
              .subscribe({
                next: res => this.alert.create({ header: 'consulta enviada' }),
                error: err => this.alert.create({ header: `${err.message}` })
              });
            console.log('Datos ingresados:', data);
          }
        }
      ]
    });
    await alert.present();
  }

}
