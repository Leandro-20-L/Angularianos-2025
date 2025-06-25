import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class EncuestaService {

  constructor(private supabase: SupabaseService) { }

  async agregarEncuesta(atencion_cliente: number, comida: number, como_conocio: string, encuestado: string, limpieza: number, opinion_general: string, foto1: string | null, foto2: string | null, foto3: string | null) {
    const { error } = await this.supabase.client
      .from("encuestas")
      .insert([{ atencion_cliente, comida, como_conocio, encuestado, limpieza, opinion_general, foto1, foto2, foto3, fecha: new Date().toISOString() }]);
    if (error) throw error
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

  async completoEncuesta(id:string) {
    const { data } = await this.supabase.client
      .from('encuestas')
      .select('*')
      .eq("id_usuario", id);

    return data?.length === 0;
  }
}