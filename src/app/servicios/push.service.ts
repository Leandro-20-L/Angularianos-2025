import { Injectable } from '@angular/core';
import { PushNotifications, Token, } from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular';
import { SupabaseService } from './supabase.service';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  token: Token | null = null;

  constructor(
    private supabase: SupabaseService,
    private platform: Platform
  ) { }

  async registrarTokenPush(userId: number) {
    if (!this.platform.is('capacitor')) {
      console.warn('Push notifications only work on device (not web)');
      return;
    }

    const permiso = await PushNotifications.requestPermissions();
    if (permiso.receive !== 'granted') {
      console.log('No se concedieron permisos para notificaciones');
      return;
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', async (token) => {
      console.log('Token FCM:', token.value);

      const { error } = await this.supabase.client.from('fcm_tokens').insert([
        {
          user_id: userId,
          token: token.value
        }
      ]);

      if (error) {
        console.error('Error al guardar token en Supabase:', error.message);
      } else {
        console.log('Token guardado en Supabase.');
      }
    });

    PushNotifications.addListener('registrationError', err => {
      console.error('Error de registro FCM:', err);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', notification => {
      console.log('Notificación interactuada:', notification);
    });

    this.escucharNotificaciones();
  }

  private escucharNotificaciones() {
    PushNotifications.addListener('pushNotificationReceived', async (notification) => {
      console.log('Notificación recibida:', notification);

      // Mostrar la notificación local si la app está en primer plano
      await LocalNotifications.schedule({
        notifications: [{
          title: notification.title || 'Nuevo mensaje',
          body: notification.body || '',
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 100) },
          sound: '', // null no es permitido según el error
          attachments: [], // null no es permitido
          actionTypeId: '',
          extra: {}
        }]
      });
    });
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

