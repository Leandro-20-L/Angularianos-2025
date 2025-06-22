import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonItem,IonLabel,IonList,IonButton } from '@ionic/angular/standalone';
import { PedidoService } from 'src/app/servicios/pedido.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';

@Component({
  selector: 'app-listado-pedidos-sector',
  templateUrl: './listado-pedidos-sector.page.html',
  styleUrls: ['./listado-pedidos-sector.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonItem,IonLabel,IonList,IonButton ]
})
export class ListadoPedidosSectorPage implements OnInit {

  pedidos: any[] = [];
  sector: string = '';

  constructor(private pedidoService: PedidoService, private usuarioService: UsuarioService, private auth: AuthService) {}

  async ngOnInit() {
    try {
      const uid= await this.auth.getUserUid();
      const usuario = await this.usuarioService.obtenerUsuarioPorUID(uid!); 
      this.sector = usuario?.role === 'cocinero' ? 'cocina' : 'bartender';

      this.pedidos = await this.pedidoService.traerPedidosPorSector(this.sector);

    } catch (error) {
      console.error('Error al cargar pedidos por sector:', error);
    }

}

async marcarComoCompletado(pedidoId: string) {
  const { error } = await this.pedidoService.actualizarEstadoPedido(pedidoId, 'listo para entregar');

  if (error) {
    console.error('Error al marcar como completado:', error);
    return;
  }

  // Refrescar lista
  this.pedidos = this.pedidos.filter(p => p.uid !== pedidoId);
}

}
