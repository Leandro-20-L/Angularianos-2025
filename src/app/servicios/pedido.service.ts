import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  constructor(private supabase: SupabaseService) { }

  async agregarPedido(id_cliente: string, id_mesa: string, precio: number, nombre_producto: string, tiempo: number, cantidad: number, responsabilidad: string) {
    const { error, data } = await this.supabase.client
      .from("pedidos")
      .insert({
        id_cliente,
        id_mesa,
        precio_total: precio,
        item_menu: nombre_producto,
        item_menu_sector: responsabilidad,
        cantidad_item_menu: cantidad
      });
  }

}
