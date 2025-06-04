import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent,IonButton,IonInput } from '@ionic/angular/standalone';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { supabase } from 'src/app/supabase.client';

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

  constructor(private router: Router) {}

  async login() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password,
    });

    console.log('Login response:', data);
    console.log('Login error:', error);

    if (error) {
      this.errorMessage = 'Credenciales inválidas';
      console.error(error.message);
    } else {
      this.errorMessage = '';
      this.router.navigate(['/home']);
    }
  }

  LlenarUsers(mail:string, pass:string){
    this.email=mail;
    this.password=pass

  }

  ngOnInit() {
    
  }


}
