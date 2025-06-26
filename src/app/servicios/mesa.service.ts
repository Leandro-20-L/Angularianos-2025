import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class MesaService {

  constructor(private supabase: SupabaseService) { }

  async habilitarMesa(uid: string) {
    const { data } = await this.supabase.client
      .from('mesas')
      .update({ disponible: true, id_cliente: null, })
      .eq('uid', uid)
      .select()

    console.log(data)
  }


}
