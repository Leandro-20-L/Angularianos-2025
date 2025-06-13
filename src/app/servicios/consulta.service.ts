import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ConsultaService {

  constructor(private supabase: SupabaseService) { }

  async enviarConsulta(id_cliente: string, mensaje: string, numeroMesa: Number, id_mozo: string,) {
    const { error, data } = await this.supabase.client
      .from("mensajes_mozo")
      .insert({ user_id: id_cliente, content: mensaje, numero_mesa: numeroMesa, id_asignado: id_mozo })

    if (error) throw error;
    return !!data;
  }
}
