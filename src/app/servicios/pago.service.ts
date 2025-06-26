import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  constructor(private supabase: SupabaseService) { }

  async agregarPago(monto: number, uid: string) {
    let { data } = await this.supabase.client
      .from("pagos")
      .insert({ monto, estado: 'pendiente de confirmacion', id_usuario: uid })
      .select()
    console.log(data)
  }

  async traerPagos() {
    let { data } = await this.supabase.client
      .from("pagos")
      .select("*, id_usuario(*) ")
      .eq("estado", "pendiente de confirmacion")
    return data;
  }

  async confirmarPago(id:number) {
    await this.supabase.client
      .from("pagos")
      .update({ "estado": "pagado" })
      .eq("id", id);
  }

}
