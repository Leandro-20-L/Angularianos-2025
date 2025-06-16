import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent,IonButton,IonInput,ToastController } from '@ionic/angular/standalone';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { supabase } from 'src/app/supabase.client';
import { AuthService } from 'src/app/servicios/auth.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule,IonButton,IonInput, RouterLink]
})
export class LoginPage implements OnInit {

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  phone: string = '';

  constructor(private router: Router,private afAuth: AuthService,public toastController : ToastController,private usuario: UsuarioService) {}

  async login() {
    try {
    const { user } = await this.afAuth.logIn(this.email, this.password);

   
    const datosUsuario = await this.usuario.obtenerUsuarioPorUID(user.id);

    if (datosUsuario.aprobado != "aprobado") {
      this.imprimirToast(`Tu cuenta esta ${datosUsuario.aprobado} no podes entrar`);
      return;
    }

    switch (datosUsuario.role) {
      case 'supervisor':
        this.router.navigate(['/clientes-pendientes']); 
        break;
      case 'dueño':
        this.router.navigate(['/clientes-pendientes']); 
        break;
      case 'maitre':
        this.router.navigate(['/maitre-lista-espera']);
        break;
      default:
        this.router.navigate(['/home']);
    }

  } catch (error) {
    this.imprimirToast("Correo o clave incorrecto");
  }
  }

  LlenarUsers(mail:string, pass:string){
    this.email=mail;
    this.password=pass

  }

  ngOnInit() {
    
  }

  async imprimirToast(mensaje:string)
  {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    })
    await toast.present();
  }

}
