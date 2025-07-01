import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AlertController } from "@ionic/angular/standalone"
import { PedidoService } from 'src/app/servicios/pedido.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { Pedido } from '../menu/menu.component';
import { Router } from '@angular/router';
import { PagoService } from 'src/app/servicios/pago.service';
import { QrService } from 'src/app/servicios/qr.service';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.page.html',
  styleUrls: ['./cuenta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})

export class CuentaPage implements OnInit {

  monto: number = 0;
  mostar: boolean = true;
  pedidos: any = ""
  mesa: any = ""
  datosUsuario: any = "";
  precioFinal = 0;
  escaneando = false;

  constructor(private toastController: ToastController, private qrService: QrService, private pagoService: PagoService, private router: Router, private usuarioService: UsuarioService, private auth: AuthService, private alert: AlertController, private pedidoService: PedidoService) { }

  async ngOnInit() {
    let id = await this.auth.getUserUid();
    this.datosUsuario = await this.usuarioService.obtenerUsuarioPorUID(id!);
    let idMesa = await this.usuarioService.obtenerUidMesa(id!);
    this.pedidos = await this.pedidoService.traerPedidosPorMesaFecha(idMesa![0].uid, new Date());

    this.pedidos.forEach((precio: any) => { this.precioFinal += precio.precio_total });
  }

  async guardarValor(montoElegido: number) {
    this.mostar = false;
    this.pedidoService.guardarPropina(montoElegido, this.datosUsuario.uid);
  }

  async pagar() {
    this.pedidos.forEach((pedido: any) => { this.pedidoService.actualizarEstadoPedido(pedido.uid, "cuenta pagada"); });

    this.pagoService.agregarPago((this.monto + this.precioFinal), this.datosUsuario.uid);

    const alert = await this.alert.create({
      header: `Su pago fue efectuado`,
      buttons: [{
        text: "aceptar",
        role: "ok"
      }],
      cssClass: 'custom-alert'
    });
    await alert.present();
    this.router.navigate(["/mesa"]);
  }

  async escanear() {
    try {
      this.escaneando = true;
      const qrContenido = await this.qrService.scan();

      this.monto = (this.precioFinal * (parseInt(qrContenido!)) / 100);
      this.guardarValor(this.monto + this.precioFinal);
      this.mostar = false;

    } catch (error: any) {
      this.imprimirToast(error.message);
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

}
