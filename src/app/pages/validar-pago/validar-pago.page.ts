import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PagoService } from 'src/app/servicios/pago.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { RouterLink } from '@angular/router';
import { MesaService } from 'src/app/servicios/mesa.service';

@Component({
  selector: 'app-validar-pago',
  templateUrl: './validar-pago.page.html',
  styleUrls: ['./validar-pago.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class ValidarPagoPage implements OnInit {

  pagos: any = [];

  constructor(private pagoService: PagoService, private usuarioService: UsuarioService,
    private auth: AuthService, private mesaService: MesaService) {

  }

  async ngOnInit() {
    this.pagos = await this.pagoService.traerPagos();
  }

  async confirmar(idCliente: string, idPedido: string) {
    let mesa = await this.usuarioService.obtenerUidMesa(idCliente);

    await this.pagoService.confirmarPago(mesa![0].uid);
    this.pagos = await this.pagoService.traerPagos();

    this.mesaService.habilitarMesa(mesa![0].uid);
  }

}
