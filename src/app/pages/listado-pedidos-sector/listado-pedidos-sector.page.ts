import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonItem,IonLabel,IonList,IonButton,IonFab,IonFabButton } from '@ionic/angular/standalone';
import { PedidoService } from 'src/app/servicios/pedido.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { Router } from '@angular/router';
import { PushService } from 'src/app/servicios/push.service';

@Component({
  selector: 'app-listado-pedidos-sector',
  templateUrl: './listado-pedidos-sector.page.html',
  styleUrls: ['./listado-pedidos-sector.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule,IonItem,IonLabel,IonList,IonButton,IonFab,IonFabButton]
})
export class ListadoPedidosSectorPage implements OnInit {

  pedidos: any[] = [];
  sector: string = '';

  constructor(private pedidoService: PedidoService, private usuarioService: UsuarioService, private auth: AuthService,private route:Router,private pushService: PushService) {}

  async ngOnInit() {
    try {
      const uid= await this.auth.getUserUid();
      const usuario = await this.usuarioService.obtenerUsuarioPorUID(uid!); 
      this.sector = usuario?.role === 'cocina' ? 'cocina' : 'bartender';

      this.pedidos = await this.pedidoService.traerPedidosPorSector(this.sector);

    } catch (error) {
      console.error('Error al cargar pedidos por sector:', error);
    }

}

async marcarComoCompletado(pedidoId: string,idMesa: string) {
  const { error } = await this.pedidoService.actualizarEstadoPedido(pedidoId, 'listo para entregar');

  if (error) {
    console.error('Error al marcar como completado:', error);
    return;
  }
   await this.notificarMozo(idMesa);
  
  this.pedidos = this.pedidos.filter(p => p.uid !== pedidoId);
}

  async signOut() {
    await this.auth.logOut();
    this.route.navigate(["/login"])
  }

  async notificarMozo(idMesa: string) {
  try {
    const mozos = await this.usuarioService.obtenerUsuarioPorRol('mozo');

    for (const mozo of mozos) {
      if (!mozo.token_push) continue;

      await this.pushService.sendNotification(
        mozo.token_push,
        'Pedido listo para entregar',
        `Hay productos listos para entregar en la mesa ${idMesa}`,
        'https://api-la-comanda.onrender.com/notify'
      );
    }
  } catch (error) {
    console.error('Error al notificar al mozo:', error);
  }
}
}
