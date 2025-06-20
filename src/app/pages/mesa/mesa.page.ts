import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonButton, IonFabButton, IonFab } from '@ionic/angular/standalone';
import { QrService } from 'src/app/servicios/qr.service';
import { Router, RouterLink } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { PushService } from 'src/app/servicios/push.service';
import { AuthService } from 'src/app/servicios/auth.service';

@Component({
  selector: 'app-mesa',
  templateUrl: './mesa.page.html',
  styleUrls: ['./mesa.page.scss'],
  standalone: true,
  imports: [RouterLink,CommonModule, FormsModule,IonHeader,IonTitle,IonToolbar, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonButton, IonFabButton, IonFab,IonContent]
})
export class MesaPage implements OnInit {

  numeroMesaAsignada: number | null = null;
  qrCorrecto: string | null = null;
  id: any = "";
  escaneando: boolean = false;

  constructor(private auth: AuthService, private push: PushService, private alert: AlertController, private qrService: QrService, private router: Router, private usuarioService: UsuarioService) { }

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
    this.escaneando = true;
    try {
      const resultado = await this.qrService.scan();
      console.log('QR escaneado:', resultado);
      console.log('QR correcto:', this.qrCorrecto);

      if (resultado === this.qrCorrecto) {
        this.router.navigate(['/menu']); // Redirigís a la página del menú
      } else {
        alert('El QR escaneado no corresponde con tu mesa asignada.');
      }
    } catch (error) {
      alert(error);
    }finally{
      await this.cancelarEscaneo();
    }
  }

  async signOut() {
    await this.auth.logOut();
    this.router.navigate(["/login"])
  }

  async cancelarEscaneo() {
    this.escaneando = false;
    await this.qrService.cancelarEscaneo()
  }
}
