import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QrService } from 'src/app/servicios/qr.service';
import { Router, RouterLink } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { PushService } from 'src/app/servicios/push.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { Pedido } from '../menu/menu.component';
import { PedidoService } from 'src/app/servicios/pedido.service';
import { EncuestaService } from 'src/app/servicios/encuesta.service';

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
  id: any = "";
  escaneando: boolean = false;
  mesaAsignada: any = "";
  datosMozo: any = "";

  constructor(private encuestaService: EncuestaService, private pedidoService: PedidoService, private auth: AuthService, private push: PushService, private alert: AlertController, private qrService: QrService, private router: Router, private usuarioService: UsuarioService) { }

  async ngOnInit() {
    this.datosMozo = await this.usuarioService.obtenerUsuarioPorRol("mozo")

    this.id = await this.auth.getUserUid();

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
        let estado = await this.pedidoService.traerEstado(this.id);
        if (estado?.length > 0) {

          let botones = [];

          switch (estado[0].estado) {
            case "en preparacion":
              botones.push(
                {
                  text: "juegos",
                  handler: () => {
                    console.log("Abrir juegos");
                  }
                }
              );
              break;

            case "entregado":
              botones.push(
                {
                  text: "pedir cuenta",
                  handler: async () => {
                    let token = await this.push.getToken(this.datosMozo.uid)
                    this.push.sendNotification(token, `mesa ${this.mesaAsignada}`, "el cliente pidio la cuenta", "https://api-la-comanda.onrender.com/notify")
                    this.router.navigate(["/cuenta"])
                  }
                },
                {
                  text: "juegos",
                  handler: () => {
                    console.log("Abrir juegos");
                  }
                },
                {
                  text: "realizar encuesta",
                  handler: async () => {
                    const yaCompleto = await this.encuestaService.completoEncuesta(this.id);
                    if (yaCompleto) {
                      const alerta = await this.alert.create({
                        header: "Ya completaste la encuesta",
                        buttons: ["Aceptar"]
                      });
                      await alerta.present();
                    } else {
                      this.router.navigate(['/encuesta']);
                    }
                  }
                }
              );
              break;

            case "cuenta pagada":
              botones.push(
                {
                  text: "ver encuesta",
                  handler: () => {
                    this.router.navigate(['/encuestas-previas']);
                  }
                }
              );
              break;
          }

          botones.push({
            text: "aceptar",
            role: "ok"
          });

          const alert = await this.alert.create({
            header: `Su pedido está ${estado[0].estado}`,
            buttons: botones,
            cssClass: 'custom-alert'
          });
          await alert.present();
        } else {
          // pedido no existe 
          this.router.navigate(['/menu']); // Redirigís a la página del menú
        }
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
