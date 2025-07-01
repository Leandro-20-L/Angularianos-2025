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

       await this.supabase.client
      .from("usuarios")
      .update({ completo_encuesta: false })
      .eq("uid", id_cliente)
  }

  async traerEstado(uidCliente: string) {
    const { error, data } = await this.supabase.client
      .from("pedidos")
      .select("estado")
      .eq("id_cliente", uidCliente)
      .gte("fecha_pedido", new Date().toISOString());

    if (error) throw error;
    return data;
  }

  async traerPedidosPorMesa(idMesa: string) {
    const { data, error } = await this.supabase.client
      .from('pedidos')
      .select('*')
      .eq('id_mesa', idMesa);

    if (error) {
      console.error('Error al traer pedidos por mesa:', error);
      return [];
    }

    return data;

  }
  
  async traerPedidosPorMesaFecha(idMesa: string, fecha:Date) {
    const { data } = await this.supabase.client
      .from('pedidos')
      .select('*')
      .eq('id_mesa', idMesa)
      .eq('fecha_pedido', fecha.toISOString());

    return data;
  }
  
  async obtenerMesasConPedidos(): Promise<any[]> {
    const { data, error } = await this.supabase.client
      .from('pedidos')
      .select('id_mesa')
      .in('estado', ['pendiente', 'listo para entregar']);

    if (error) {
      console.error('Error al obtener mesas con pedidos:', error);
      return [];
    }


    const mesasUnicas = [...new Set(data.map(p => p.id_mesa))];
    return mesasUnicas;
  }

  async obtenerMapaMesas(): Promise<{ [uid: string]: number }> {
    const { data, error } = await this.supabase.client
      .from('mesas')
      .select('uid, numero');

    if (error) {
      console.error('Error al obtener mesas:', error);
      return {};
    }

    const mapa: { [uid: string]: number } = {};
    data.forEach((m) => {
      mapa[m.uid] = m.numero;
    });
    return mapa;
  }

  async actualizarEstadoPedido(pedidoId: string, nuevoEstado: string) {
    const { error } = await this.supabase.client
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('uid', pedidoId);

    return { error };
  }

  async traerPedidos() {
    const { data } = await this.supabase.client
      .from('pedidos')
      .select("*")
      .limit(1)

    return data;
  }

  async traerPedidosPorSector(sector: string) {
    const { data, error } = await this.supabase.client
      .from('pedidos')
      .select('*')
      .eq('item_menu_sector', sector)
      .eq('estado', 'en preparacion');

    if (error) {
      console.error('Error al traer pedidos por sector:', error);
      return [];
    }

    return data;
  }

  async guardarPropina(propina: number, id_cliente: string) {
    const { data, error } = await this.supabase.client
      .from("pedidos")
      .update({ propina, cuenta_entregada: true, estado:"cuenta entregada" })
      .eq("id_cliente", id_cliente)
      .eq("fecha_pedido", new Date().toISOString())
      .select()


    console.log(data, error)
  }

}



