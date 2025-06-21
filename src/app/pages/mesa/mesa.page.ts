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

  constructor(private pedidoService: PedidoService, private auth: AuthService, private push: PushService, private alert: AlertController, private qrService: QrService, private router: Router, private usuarioService: UsuarioService) { }

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
        let estado = await this.pedidoService.traerEstado(this.id);
        if (estado?.length > 0) {
          // pedido existe
          let botones = []
          switch (estado[0].estado) {
            case "pendiente":
              botones.push("aceptar")
              break;

            case "en preparacion":
              botones.push("aceptar");
              botones.push("juegos");
              break;

            case "listo para entregar":
              botones.push("aceptar");
              break;

            case "entregado":
              botones.push("aceptar");
              botones.push("pedir cuenta");
              botones.push("juegos");
              botones.push("realizar encuesta");
              break;

            case "cuenta solicitada":
              botones.push("aceptar")
              break;

            case "cuenta pagada a revision":
              botones.push("aceptar")
              break;

            case "cuenta pagada":
              botones.push("aceptar");
              // si hizo la encuesta mostrar este boton
              botones.push("ver encuesta");
              break;
          }
          this.alert.create({ header:`su pedido esta ${estado[0].estado}`, buttons: botones, cssClass: 'custom-alert' });
          //si el estado == a confirmar -> solo muestra el estado
          //si el estado == confirmado -> muestra el estado y botones de juegos y encuesta
          //si el estado == listo para entregar -> muestra el estado
          //si el estado == entregado -> muestra el estado botoners de juegos y pedir cuenta
          //si el estado == entregado && completoEncuesta -> boton ver estadisticas

        } else {
          // pedido no existe 
          this.router.navigate(['/menu']); // Redirigís a la página del menú
        }
      } else {
        throw new Error('El QR escaneado no corresponde con tu mesa asignada.');
      }
    } catch (error: any) {
      this.alert.create({ header: error.message, buttons: ["aceptar"] });
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
