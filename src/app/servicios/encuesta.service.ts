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

    await this.supabase.client
      .from("usuarios")
      .update({ completo_encuesta: true })
      .eq("uid", encuestado)
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

  async completoEncuesta(id: string): Promise<boolean> {
  const { data, error } = await this.supabase.client
    .from('usuarios')
    .select('*')
    .eq("completo_encuesta", true)
    .eq("uid", id);

  console.log("DATA:", data);
  console.log("ERROR:", error);

  return Array.isArray(data) && data.length > 0;
}
}