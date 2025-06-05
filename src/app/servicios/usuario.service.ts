import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private supabase: SupabaseService) { }

  async registrarUsuario(usuario: any) {
    const { error } = await this.supabase.client
      .from("usuarios")
      .insert(usuario);

    if (error) throw error;
  }

  async subirFoto(ruta: string, foto: Blob): Promise<string> {
    const { error } = await this.supabase.client.storage
      .from("usuarios")
      .upload(ruta, foto);

    if (error) throw error;

    return this.supabase.client.storage.from("usuarios").getPublicUrl(ruta).data.publicUrl;
  }

  async obtenerUsuarioPorUID(uid: string): Promise<any> {
  const { data, error } = await this.supabase.client
    .from("usuarios")
    .select("*")
    .eq("uid", uid)
    .single();

  if (error) throw error;
  return data;
}

async obtenerPendientes(): Promise<any[]> {
    const { data, error } = await this.supabase.client
      .from('usuarios')
      .select('*')
      .eq('role', 'cliente')
      .eq('aprobado', false);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async aprobarUsuario(uid: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('usuarios')
      .update({ aprobado: true })
      .eq('uid', uid);

    if (error) throw new Error(error.message);
  }
}
