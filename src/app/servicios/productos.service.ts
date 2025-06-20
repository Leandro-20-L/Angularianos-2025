import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  constructor(private supabase: SupabaseService) { }

  async traerProductos(){
    const {error, data}=await this.supabase.client
    .from("productos")
    .select("*")

    if(error) throw error;
    console.log(data);
    return data;
  }

}