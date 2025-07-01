import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { IonContent, IonTitle, IonButton, IonInput, ToastController, IonFabButton, IonFab } from '@ionic/angular/standalone';
import { QrService } from 'src/app/servicios/qr.service';
import { Router } from '@angular/router';
import { PushService } from 'src/app/servicios/push.service';

@Component({
  selector: 'app-registro-cliente',
  templateUrl: './registro-cliente.page.html',
  styleUrls: ['./registro-cliente.page.scss'],
  standalone: true,
  imports: [IonFab, IonFabButton, CommonModule, FormsModule, IonContent, IonTitle, IonButton, IonInput]
})
export class RegistroClientePage implements OnInit {
  dni: string = "";
  tipo: string = "";
  clave: string = "";
  correo: string = "";
  nombre: string = "";
  apellido: string = "";
  claveRepetida: string = "";
  foto: Blob = new Blob();
  ruta: string = "";
  escaneando: boolean = false;
  anonimo: boolean = true;
  mensajeError: string = "";
  dniData: string | null = null;

  constructor(
    private push: PushService,
    private route: Router,
    private usuario: UsuarioService,
    public toastController: ToastController,
    private authService: AuthService,
    private qrService: QrService) { }

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
    if (!this.validarDatos()) {
      return;
    }

    try {
      let user;
      let correoFinal = this.correo;
      let claveFinal = this.clave;

      if (this.tipo === "anonimo") {
        correoFinal = `anonimo_${Date.now()}@anonimo.com`;
        claveFinal = "123456";
      }

      user = await this.authService.signUp(correoFinal, claveFinal);
      const uid = user;

      await this.push.initializePushNotifications(uid);

      const urlFoto = await this.usuario.subirFoto(this.ruta, this.foto);

      if (this.tipo === "identificado") {
        await this.usuario.registrarUsuario({
          uid,
          nombre: this.nombre,
          apellido: this.apellido,
          dni: this.dni,
          correo: this.correo,
          foto: urlFoto,
          role: "cliente",
          aprobado: "pendiente"
        });

        this.route.navigate(['/login']);

      } else if (this.tipo === "anonimo") {
        await this.usuario.registrarUsuario({
          uid,
          nombre: this.nombre,
          correo: correoFinal,
          foto: urlFoto,
          aprobado: "aprobado",
          role: "anonimo"
        });

        this.route.navigate(['/home']);
      }

      let admin = await this.usuario.obtenerUsuarioPorRol("dueno");
      let tokenAdmin = await this.push.getToken(admin[0].uid!);

      let supervisor = await this.usuario.obtenerUsuarioPorRol("supervisor");
      let tokenSupervisor = await this.push.getToken(supervisor[0].uid!);

      await this.push.sendNotification(tokenAdmin, "angularianos", "hay nuevos usuarios a aprobar", 'https://api-la-comanda.onrender.com/notify').toPromise();

      this.push.sendNotification(tokenSupervisor, "angularianos", "hay nuevos usuarios a aprobar", 'https://api-la-comanda.onrender.com/notify')
        .subscribe({
          next: res => this.imprimirToast('Notificación enviada:'),
          error: err => this.imprimirToast(err.message)
        });

      this.imprimirToast("Registro exitoso.");

    } catch (error: any) {
      console.error("ERROR REGISTRO:", error);
      this.mensajeError = error.message;
    }
  }


  validarDatos(): boolean {

    if (!this.nombre.trim()) {
      this.imprimirToast("El nombre es obligatorio.");
      console.log("falta nombre");
      return false;
    }

    if (!this.foto || this.foto.size === 0) {
      this.imprimirToast("Debe tomarse una foto.");
      return false;
    }

    if (this.tipo === "identificado") {
      if (!this.apellido.trim()) {
        this.imprimirToast("El apellido es obligatorio.");
        return false;
      }

      if (!this.dni.trim()) {
        this.imprimirToast("El DNI es obligatorio.");
        return false;
      }

      if (!/^\d{7,8}$/.test(this.dni)) {
        this.imprimirToast("El DNI debe contener 7 u 8 números.");
        return false;
      }

      if (!this.correo.trim()) {
        this.imprimirToast("El correo es obligatorio.");
        return false;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(this.correo)) {
        this.imprimirToast("El correo no tiene un formato válido.");
        return false;
      }

      if (!this.clave.trim()) {
        this.imprimirToast("La clave es obligatoria.");
        return false;
      }
      if (!this.claveRepetida.trim()) {
        this.imprimirToast("falta repetir la clave");
        return false;
      }
      if (this.claveRepetida !== this.clave) {
        this.imprimirToast("las claves no coinciden");
        return false;
      }

      if (this.clave.length < 6) {
        this.imprimirToast("La clave debe tener al menos 6 caracteres.");
        return false;
      }
    }

    return true;
  }

  async imprimirToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    })
    await toast.present();
  }

  async scan() {
    this.escaneando = true;
    try {
      let resultado = await this.qrService.scan();
      const datos = resultado!.split('@');
      const apellido = datos[1];
      const nombres = datos[2];
      this.dni = datos[4];

      this.apellido = apellido.trim();
      this.nombre = nombres.trim();
      await this.cancelarEscaneo()
    } catch (error: any) {
      this.imprimirToast(error.message);
    }
  }

  async cancelarEscaneo() {
    this.escaneando = false;
    await this.qrService.cancelarEscaneo();
  }
}
