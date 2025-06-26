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

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.page.html',
  styleUrls: ['./cuenta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})

export class CuentaPage implements OnInit {

  monto: any = '';
  mostar: boolean = true;
  pedidos: any = ""
  mesa: any = ""
  datosUsuario: any = "";
  precioFinal = 0;


  constructor(private pagoService: PagoService, private router: Router, private usuarioService: UsuarioService, private auth: AuthService, private alert: AlertController, private pedidoService: PedidoService) { }

  async ngOnInit() {
    let id = await this.auth.getUserUid();
    this.datosUsuario = await this.usuarioService.obtenerUsuarioPorUID(id!)
    let idMesa = await this.usuarioService.obtenerUidMesa(id!);
    this.pedidos = await this.pedidoService.traerPedidosPorMesaFecha(idMesa![0].uid, new Date());

    this.pedidos.forEach((precio: any) => { this.precioFinal += precio.precio_total });
  }

  async guardarValor(eleccion: string) {
    this.mostar = false;
    if (eleccion == "noGracias") {
      this.monto = 0;
    } else {
      if (this.monto == "") {
        this.mostar = true;
        const alert = await this.alert.create({
          header: `monto invalido `,
          buttons: [{
            text: "aceptar",
            role: "ok"
          }],
          cssClass: 'custom-alert'
        });

        await alert.present();
      }
    }
    console.log(this.pedidos)
    this.pedidoService.guardarPropina(this.monto, this.datosUsuario.uid, this.pedidos[0].fecha_pedido);
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

}
