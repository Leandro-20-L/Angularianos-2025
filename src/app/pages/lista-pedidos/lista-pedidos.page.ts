import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonButton, IonList,IonItem,IonLabel,IonFabButton,IonFab} from '@ionic/angular/standalone';
import { PedidoService } from 'src/app/servicios/pedido.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { PushService } from 'src/app/servicios/push.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-lista-pedidos',
  templateUrl: './lista-pedidos.page.html',
  styleUrls: ['./lista-pedidos.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule,IonList,IonItem,IonLabel,IonButton]
})
export class ListaPedidosPage implements OnInit {
  pedidosAgrupados: { [idMesa: string]: any[] } = {};

  constructor(
    private pedidoService: PedidoService,
    private usuarioService: UsuarioService,
    private auth: AuthService,
    private pushService: PushService,
    private route: Router
    //private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.cargarPedidos();
  }

  
  async cargarPedidos() {
    try {
      this.pedidosAgrupados = {};

      const mesasConPedidos = await this.pedidoService.obtenerMesasConPedidos();
      const mapaMesas = await this.pedidoService.obtenerMapaMesas();

      for (let idMesa of mesasConPedidos) {
        const pedidosMesa = await this.pedidoService.traerPedidosPorMesa(idMesa);
        const numeroMesa = mapaMesas[idMesa] ?? 'Sin número';

        if (!this.pedidosAgrupados[numeroMesa]) {
          this.pedidosAgrupados[numeroMesa] = [];
        }

        this.pedidosAgrupados[numeroMesa].push(...pedidosMesa);
      }

      console.log('Pedidos agrupados por número de mesa:', this.pedidosAgrupados);
    } catch (error) {
      console.error('Error al cargar pedidos agrupados:', error);
    }
  }

  
  async aprobarPedidosPorMesa(mesaId: string) {
    const pendientes = this.pedidosAgrupados[mesaId].filter(p => p.estado === 'pendiente');
    const sectoresNotificados = new Set<string>();

    for (const pedido of pendientes) {
      const { error } = await this.pedidoService.actualizarEstadoPedido(pedido.uid, 'en preparacion');
      if (error) {
        console.error(`Error al actualizar pedido ${pedido.uid}:`, error);
      }

      if (!sectoresNotificados.has(pedido.item_menu_sector)) {
      sectoresNotificados.add(pedido.item_menu_sector);
      await this.notificarSector(pedido.item_menu_sector, mesaId);
      }
    }

    await this.cargarPedidos();
  }


  async entregarPedido(uid: string) {
    const { error } = await this.pedidoService.actualizarEstadoPedido(uid, 'entregado');
    if (error) {
      console.error('Error al marcar como entregado:', error);
    } else {
      await this.cargarPedidos(); 
    }
  }

  async notificarSector(sector: string, mesaId: string) {
  try {
    const usuarios = await this.usuarioService.obtenerUsuarioPorRol(sector);

    for (const usuario of usuarios) {
      if (!usuario.token_push) continue;

      await this.pushService.sendNotification(
        usuario.token_push,
        'Nuevo pedido asignado',
        `Tenés un pedido en preparación de la mesa ${mesaId}`,
        'https://api-la-comanda.onrender.com/notify' 
      );
    }
  } catch (error) {
    console.error(`Error al notificar al sector ${sector}:`, error);
  }
}
  async signOut() {
    await this.auth.logOut();
    this.route.navigate(["/login"])
  }
}
