import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private supabase: SupabaseService) { }

  async registrarUsuario(usuario: any) {
    console.log("Insertando usuario:", usuario);
    const { error } = await this.supabase.client
      .from("usuarios")
      .insert(usuario);

    if (error) throw error;
  }

  async subirFoto(ruta: string, foto: Blob): Promise<string> {
    const session = await this.supabase.client.auth.getSession();
      console.log("Sesión activa:", session);
      console.log("Ruta:", ruta);
      console.log("Foto (Blob):", foto);

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
      .eq('aprobado', 'pendiente');

    if (error) throw new Error(error.message);
    return data || [];
  }

  async aprobarUsuario(uid: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('usuarios')
      .update({ aprobado: 'aprobadoz' })
      .eq('uid', uid);

    if (error) throw new Error(error.message);
  }

  async rechazarUsuario(uid: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('usuarios')
      .update({ aprobado: 'rechazado' })
      .eq('uid', uid);

    if (error) throw new Error(error.message);
  }
}
