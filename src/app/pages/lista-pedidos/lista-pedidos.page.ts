import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonButton, IonList,IonItem,IonLabel} from '@ionic/angular/standalone';
import { PedidoService } from 'src/app/servicios/pedido.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { AuthService } from 'src/app/servicios/auth.service';

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
    private auth: AuthService
  ) {}

  async ngOnInit() {
    await this.cargarPedidos();
  }

   async cargarPedidos() {
    try {
      this.pedidosAgrupados = {}; // <<< LIMPIAMOS antes de volver a llenar

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

  for (const pedido of pendientes) {
    const { error } = await this.pedidoService.actualizarEstadoPedido(pedido.uid, 'en preparacion');
    if (error) {
      console.error(`Error al actualizar pedido ${pedido.uid}:`, error);
    }
  }

  
  
  await this.cargarPedidos();
}

}
