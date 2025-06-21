import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  constructor(private supabase: SupabaseService) { }

  async agregarPedido(id_cliente: string, id_mesa: string, precio: number, nombre_producto: string, tiempo: number, cantidad: number, responsabilidad: string) {
    await this.supabase.client
      .from("pedidos")
      .insert({
        id_cliente,
        id_mesa,
        precio_total: precio,
        item_menu: nombre_producto,
        item_menu_sector: responsabilidad,
        cantidad_item_menu: cantidad,
        estado: "pendiente",
        tiempo_estimado: tiempo
      });
  }

  async traerEstado(uidCliente: string) {
    const dosHorasAtras = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();

    const { error, data } = await this.supabase.client
      .from("pedidos")
      .select("estado")
      .eq("id_cliente", uidCliente)
      .gte("fecha_pedido", dosHorasAtras);

    if (error) throw error;
    return data;
  }
}
