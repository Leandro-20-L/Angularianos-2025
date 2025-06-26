import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { from } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private supabase: SupabaseService, private authService: AuthService) { }

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
      .update({ aprobado: 'aprobado' })
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

  async marcarComoEsperando(qrContenido: string): Promise<void> {

    const uid = await this.authService.getUserUid();

    if (qrContenido === 'lista-espera') {
      // QR general de entrada
      const { error } = await this.supabase.client
        .from('usuarios')
        .update({ situacion: 'esperando_mesa', mesa_asignada: null }) 
        .eq('uid', uid);

      if (error) throw error;
    } else {
      // Si no es el QR general, buscar una mesa específica
      const { data: mesa, error: mesaError } = await this.supabase.client
        .from('mesas')
        .select('*')
        .eq('qr', qrContenido)
        .single();

      if (mesaError || !mesa) throw new Error('QR inválido o mesa inexistente');

      const { error } = await this.supabase.client
        .from('usuarios')
        .update({ situacion: 'esperando_mesa', mesa_asignada: mesa.id })
        .eq('uid', uid);

      if (error) throw error;
    }
  }

  async obtenerMesaAsignada(): Promise<{ numero: number, qr: string } | null> {
    const uid = await this.authService.getUserUid();
    console.log("UID del usuario:", uid);

    // Obtener número de mesa asignada
    const { data: user, error: errorUser } = await this.supabase.client
      .from('usuarios')
      .select('mesa_asignada')
      .eq('uid', uid)
      .single();
    console.log("Usuario encontrado:", user);
    if (errorUser || !user?.mesa_asignada) return null;

    // Buscar mesa con ese número
    const { data: mesa, error: errorMesa } = await this.supabase.client
      .from('mesas')
      .select('qr, numero')
      .eq('numero', user.mesa_asignada)
      .single();

    if (errorMesa || !mesa) return null;

    return {
      numero: mesa.numero,
      qr: mesa.qr
    };
  }

  async obtenerMesaUid(uidCliente:string){
    const { data: mesa, error: errorMesa } = await this.supabase.client
      .from('mesas')
      .select('uid')
      .eq('id_cliente',uidCliente )
      .single();
      console.log('Resultado mesa:', mesa);

      return mesa;
  }

  async obtenerSituacionUsuario(): Promise<string | null> {
    const uid = await this.authService.getUserUid();

    if (!uid) {
      console.error("UID inválido, no se puede obtener la situación del usuario.");
      return null;
    }
    const { data, error } = await this.supabase.client
      .from('usuarios')
      .select('situacion')
      .eq('uid', uid)
      .single();

    if (error || !data?.situacion) return null;

    return data.situacion;
  }

  async obtenerUsuarioPorRol(rol: string) {
    const { error, data } = await this.supabase.client
      .from("usuarios")
      .select("*")
      .eq("role", rol)

    if (error) throw error;
    return data;
  }

  async obtenerUidMesa(uid: string) {
    const { error, data } = await this.supabase.client
      .from("usuarios")
      .select("mesa_asignada")
      .eq("uid", uid)
      console.log(data)

    if (error) throw error;

    const { data: uidMesa } = await this.supabase.client
      .from("mesas")
      .select("uid")
      .eq("numero", data[0].mesa_asignada)

    return uidMesa
  }
}
