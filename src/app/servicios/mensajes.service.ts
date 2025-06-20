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
      .select("*, id_cliente(*), id_mozo(*)")

    return data;
  }

  async escribirMensaje(mensaje: string, clienteId: string, id_mozo: string, tipo: string, emisor:string) {
    const { data, error } = await this.supabase.client
      .from("mensajes_mozo")
      .insert({
        content: mensaje,
        id_cliente: clienteId,
        id_mozo: id_mozo,
        tipo: tipo,
        emisor:emisor
      }).select();

    if (error) throw error;
    return data;
  }

  async borrar(){
    await this.supabase.client.from("mensajes_mozo").delete().eq("id", 20)
  }
}
