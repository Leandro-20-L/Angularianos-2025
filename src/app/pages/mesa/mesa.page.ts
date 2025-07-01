import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QrService } from 'src/app/servicios/qr.service';
import { Router, RouterLink } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { AuthService } from 'src/app/servicios/auth.service';

@Component({
  selector: 'app-mesa',
  templateUrl: './mesa.page.html',
  styleUrls: ['./mesa.page.scss'],
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, IonicModule]
})
export class MesaPage implements OnInit {

  numeroMesaAsignada: number | null = null;
  qrCorrecto: string | null = null;
  escaneando: boolean = false;
  mesaAsignada: any = "";

  constructor(private auth: AuthService, private alert: AlertController, private qrService: QrService, private router: Router, private usuarioService: UsuarioService) { }

  async ngOnInit() {
    this.mesaAsignada = await this.usuarioService.obtenerMesaAsignada();

    if (this.mesaAsignada) {
      this.numeroMesaAsignada = this.mesaAsignada.numero;
      this.qrCorrecto = this.mesaAsignada.qr;
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
        await this.cancelarEscaneo();
        this.router.navigate(["/estado-pedido"])

      } else {
        const alerta = await this.alert.create({
          header: "El QR escaneado no corresponde con tu mesa asignada.",
          buttons: ["Aceptar"]
        });
        await alerta.present();
      }
    } finally {
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
