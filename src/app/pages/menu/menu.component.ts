import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from "@ionic/angular"
import { PedidoService } from 'src/app/servicios/pedido.service';
import { ProductosService } from 'src/app/servicios/productos.service';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/servicios/auth.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule, RouterLink]
})

export class MenuComponent implements OnInit {

  productos: any[] = [];
  pedido: Pedido[] = [];
  cantidad: any = "";
  uid: any = "";
  usuario: any = "";

  constructor(private router: Router, private usuarioService: UsuarioService, private authService: AuthService, private alert: AlertController, private productoService: ProductosService, private pedidoService: PedidoService) { }

  async ngOnInit() {
    this.productos = await this.productoService.traerProductos();
    this.uid = await this.authService.getUserUid()!
    this.usuario = await this.usuarioService.obtenerUsuarioPorUID(this.uid)
  }

  async agregarAlPedido(p: any) {
    try {
      if (this.cantidad == "" || this.cantidad <= 0) throw new Error("agrega la cantidad")

      this.pedido.push(new Pedido(p.nombre, (p.precio * this.cantidad), p.sector, p.tiempo_elaboracion, this.cantidad))
      this.cantidad = "";
    } catch (error: any) {

      const alert = await this.alert.create({
        header: error.message,
        buttons: ["aceptar"],
        cssClass: 'custom-alert'
      });
      await alert.present();
    }
  }

  async finalizarPedido() {
    let mensaje = ""
    try {
      if (this.pedido.length == 0) throw new Error("primero debes agregar los productos");

      const maxTiempo = Math.max(...this.pedido.map(p => p.tiempo));
      let mesaUid = await this.usuarioService.obtenerUidMesa(this.uid)

      this.pedido.forEach(p => {
        this.pedidoService.agregarPedido(this.uid, mesaUid![0].uid, p.precio, p.nombre, maxTiempo, p.cantidad, p.sector)
      });
      mensaje = `tomamos su pedido y estara listo en ${maxTiempo} minutos`
      this.router.navigate(["/mesa"]);
    } catch (err: any) {
      mensaje = err.message;
    } finally {

      const alert = await this.alert.create({
        header: mensaje,
        buttons: ["aceptar"],
        cssClass: 'custom-alert'
      });
      await alert.present();
    }
  }

}

export class Pedido {
  nombre: string = "";
  precio: number = 0;
  sector: string = "";
  tiempo: number = 0;
  cantidad: number = 0;

  constructor(nombre: string, precio: number = 0, sector: string = "", tiempo: number = 0, cantidad: number = 0,) {
    this.nombre = nombre;
    this.precio = precio;
    this.sector = sector;
    this.tiempo = tiempo;
    this.cantidad = cantidad;
  }
}
