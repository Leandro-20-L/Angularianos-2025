import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class EncuestaService {

  constructor(private supabase: SupabaseService) { }

  async agregarEncuesta(atencion_cliente: number, comida: number, como_conocio: Array<any>, encuestado: string, limpieza: number, opinion_general: string, foto1: string | null, foto2: string | null, foto3: string | null) {
    await this.supabase.client
      .from("encuestas")
      .insert([{ atencion_cliente, comida, como_conocio, encuestado, limpieza, opinion_general, foto1, foto2, foto3, }])
      .select();
  }

  async traerEncuestasPrevias() {
    const { data, error } = await this.supabase.client
      .from('encuestas')
      .select('*');

    if (error) {
      console.error('Error al traer encuestas:', error);
      return;
    }
    return data;
  }

  async completoEncuesta(id: string) {
    let dosHorasAtras = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();

    const { data } = await this.supabase.client
      .from('encuestas')
      .select('*')
      .eq("encuestado", id)
      .gte("fecha", dosHorasAtras);
 
    return data?.length !== 0;
  }
}