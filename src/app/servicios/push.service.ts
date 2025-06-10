import { Injectable, OnInit } from '@angular/core';
import { PushNotifications, Token, } from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular';
import { SupabaseService } from './supabase.service';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class PushService implements OnInit {

  token: Token | null = null;

  constructor(
    private supabase: SupabaseService,
    private platform: Platform
  ) { }

  ngOnInit() {
  }

  initializePushNotifications(id: string) {
    if (this.platform.is('capacitor')) {

      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        } else {
          console.error('Permiso de notificación denegado');
        }
      });

      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token: ' + token.value);
        this.supabase.client
          .from('usuarios')
          .update([{ token_push: token.value }])
          .eq("uid", id)
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error al registrar notificaciones push', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        console.log('Notificación recibida: ', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Acción de notificación: ', notification);
      });
    }
  }

  async enviarNotificacionAlBackend(titulo: string, cuerpo: string, tokenUsuario: string) {
    try {
      const response = await fetch('https://tu-backend.com/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: tokenUsuario,
          title: titulo,
          body: cuerpo
        })
      });

      const data = await response.json();
      console.log('Respuesta backend notificación:', data);
    } catch (error) {
      console.error('Error enviando notificación al backend:', error);
    }
  }


}

