import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonCard,IonCardHeader,IonCardContent,IonCardTitle,IonButton } from '@ionic/angular/standalone';
import { QrService } from 'src/app/servicios/qr.service';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/servicios/usuario.service';

@Component({
  selector: 'app-mesa',
  templateUrl: './mesa.page.html',
  styleUrls: ['./mesa.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule,IonCard,IonCardHeader,IonCardContent,IonCardTitle,IonButton]
})
export class MesaPage implements OnInit {

  numeroMesaAsignada: number | null = null;
  qrCorrecto: string | null = null;

  constructor(private qrService: QrService,private router: Router,private usuarioService: UsuarioService) { }

  async ngOnInit() {
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
    try {
      const resultado = await this.qrService.scan();

      if (resultado === this.qrCorrecto) {
        await this.qrService.cancelarEscaneo();
        this.router.navigate(['/lista-productos']); // Redirigís a la página del menú
      } else {
        await this.qrService.cancelarEscaneo();
        alert('El QR escaneado no corresponde con tu mesa asignada.');
      }
    } catch (error) {
      await this.qrService.cancelarEscaneo();
      alert(error);
    }
  }

}
