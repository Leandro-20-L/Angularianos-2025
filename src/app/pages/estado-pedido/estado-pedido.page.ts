import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PedidoService } from 'src/app/servicios/pedido.service';
import { EncuestaService } from 'src/app/servicios/encuesta.service';
import { PushService } from 'src/app/servicios/push.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { Router, RouterLink } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-estado-pedido',
  templateUrl: './estado-pedido.page.html',
  styleUrls: ['./estado-pedido.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class EstadoPedidoPage implements OnInit {

  id: any = "";
  datosMozo: any = "";
  mesaAsignada: any = "";
  estado: { estado: string }[] = [{ estado: "cargando" }];

  constructor(private alert: AlertController, private auth: AuthService, private usuarioService: UsuarioService, private router: Router, private pedidoService: PedidoService, private encuestaService: EncuestaService, private push: PushService) { }

  async ngOnInit() {
    this.id = await this.auth.getUserUid();
    this.estado = await this.pedidoService.traerEstado(this.id);
    console.log(this.estado)

    if (this.estado?.length == 0) {
      this.router.navigate(['/menu']); //si el pedido no existe Redirigís a la página del menú
    }

    this.mesaAsignada = await this.usuarioService.obtenerMesaAsignada();
    this.datosMozo = await this.usuarioService.obtenerUsuarioPorRol("mozo")
  }

  async hacerEncuesta() {
    if ((await this.encuestaService.completoEncuesta(this.id))) {

      const alerta = await this.alert.create({
        header: "ya realizaste la encuesta",
        buttons: ["Aceptar"]
      });
      await alerta.present();
    } else {
      this.router.navigate(['/encuesta']);
    }

  }

  async pedirCuenta() {
    let token = await this.push.getToken(this.datosMozo[0].uid)
    this.push.sendNotification(token, `mesa ${this.mesaAsignada}`, "el cliente pidio la cuenta", "https://api-la-comanda.onrender.com/notify")
    this.router.navigate(['/cuenta'])
  }

}
