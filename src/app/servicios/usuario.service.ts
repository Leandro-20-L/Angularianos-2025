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


}
