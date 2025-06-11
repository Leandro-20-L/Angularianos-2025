import { Injectable, OnInit } from '@angular/core';
import { PushNotifications, Token, } from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from './supabase.service';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class PushService implements OnInit {

  token: Token | null = null;

  constructor(
    private supabase: SupabaseService,
    private platform: Platform,
    private http: HttpClient
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

      PushNotifications.addListener('registration', async (token: Token) => {
        await this.supabase.client
          .from('usuarios')
          .update({ token_push: token.value })
          .eq("uid", id);

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

  async getToken(id: string) {
    const { error, data } = await this.supabase.client
      .from("usuarios")
      .select("token_push")
      .eq("uid", id)
      .single()

    if (error) throw error;
    return data;
  }

  sendNotification(token: any, title: string, body: string, url: string) {
    const payload = { token, title, body };
    return this.http.post(url, payload);
  }

}

