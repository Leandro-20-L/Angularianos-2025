import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EncuestaService } from 'src/app/servicios/encuesta.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-encuesta',
  templateUrl: './encuesta.page.html',
  styleUrls: ['./encuesta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class EncuestaPage implements OnInit {

  comoConocio = 0;
  opinion_general = "";
  contadorFotos = 1;
  id_usuario: any = "";
  estrellasMap: { [clave: string]: string[] } = {
    atencion_cliente: ['vacia', 'vacia', 'vacia', 'vacia', 'vacia'],
    comida: ['vacia', 'vacia', 'vacia', 'vacia', 'vacia'],
    limpieza: ['vacia', 'vacia', 'vacia', 'vacia', 'vacia'],
  };

  calificaciones: { [clave: string]: number } = {
    atencion_cliente: 0,
    comida: 0,
    limpieza: 0,
  };

  fotos: { [numero: string]: string | null } = { '1': null, '2': null, '3': null };

  constructor(private alert: AlertController, private router: Router, private auth: AuthService, private encuastaService: EncuestaService, private usuariosService: UsuarioService) { }

  async ngOnInit() {
    this.id_usuario = await this.auth.getUserUid()!;
  }

  cambiarEstrella(i: number, tipo: string) {
    this.estrellasMap[tipo] = this.estrellasMap[tipo].map((_, idx) =>
      idx <= i ? 'llena' : 'vacia'
    );
  }

  guardarCalificacion(tipo: string, valor: number) {
    this.calificaciones[tipo] = (valor + 1);
    console.log(this.calificaciones)
    this.cambiarEstrella(valor, tipo);
  }

  guardarComoConocio(valor: number) {
    this.comoConocio = valor;
  }

  async tomarFoto() {
    try {

      if (this.contadorFotos > 4) {
        throw new Error("Cantidad de fotos excedida");
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      const response = await fetch(image.webPath!);
      let foto = await response.blob();
      let ruta = `_${Date.now()}.jpg`;

      const urlFoto = await this.usuariosService.subirFoto(ruta, foto);
      this.fotos[this.contadorFotos.toString()] = urlFoto;
      this.contadorFotos++;

    } catch (error: any) {

      const alert = await this.alert.create({
        header: error.message,
        buttons: [{
          text: "aceptar",
          role: "ok"
        }],
        cssClass: 'custom-alert'
      });
      this.alert.create()
    }
  }

  async guardarEncuesta() {
    try {
      await this.encuastaService.agregarEncuesta(
        this.calificaciones["atencion_cliente"],
        this.calificaciones["comida"],
        [this.comoConocio],
        this.id_usuario,
        this.calificaciones["limpieza"],
        this.opinion_general,
        this.fotos["1"],
        this.fotos["2"],
        this.fotos["3"]
      );

      this.router.navigate(["/mesa"]);
    } catch (error) {

    }

  }

}