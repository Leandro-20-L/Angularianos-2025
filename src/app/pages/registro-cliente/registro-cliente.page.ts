import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SupabaseService } from 'src/app/servicios/supabase.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { UsuarioService } from 'src/app/servicios/usuario.service';

@Component({
  selector: 'app-registro-cliente',
  templateUrl: './registro-cliente.page.html',
  styleUrls: ['./registro-cliente.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegistroClientePage implements OnInit {
  dni: string = "";
  tipo: string = "";
  clave: string = "";
  correo: string = "";
  nombre: string = "";
  apellido: string = "";
  foto: Blob = new Blob();
  ruta: string = "";
  anonimo: boolean = true;
  mensajeError: string = "";

  constructor(private supabase: SupabaseService, private usuario: UsuarioService) { }

  ngOnInit() {
  }

  definirTipo(tipo: string) {
    this.tipo = tipo;
  }

  async tomarFoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });

    const response = await fetch(image.webPath!);
    this.foto = await response.blob();
    this.ruta = `${this.nombre}_${Date.now()}.jpg`;
  }

  async registrar() {
    try {
      const urlFoto = await this.usuario.subirFoto(this.ruta, this.foto);

      if(this.tipo === "identificado"){
        
        await this.usuario.registrarUsuario({
          nombre: this.nombre,
          apellido: this.apellido,
          dni: this.dni,
          correo: this.correo,
          foto: urlFoto,
          role: "cliente"
        });
      }
      if(this.tipo === "anonimo"){
        
        await this.usuario.registrarUsuario({
          nombre: this.nombre,
          foto: urlFoto,
          role: "cliente"
        });

      }
    } catch (error:any) {
      this.mensajeError=error.message;
    }
  }


}
