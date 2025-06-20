import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class MensajeService {

  constructor(private supabase: SupabaseService) { }

  async obtenerMensajes() {
    const { data, error } = await this.supabase.client
      .from("mensajes_mozo")
      .select("*, user_id(*), id_asignado(*)")

    return data;
  }

  async escribirMensaje(mensaje: string, clienteId: string, numeroMesa: number, id_mozo: string) {
    const { data, error } = await this.supabase.client
      .from("mensajes_mozo")
      .insert({
        content: mensaje,
        user_id: clienteId,
        id_asignado: id_mozo,
        numero_mesa: numeroMesa
      }).select();

    if (error) throw error;
    return data;
  }
}
