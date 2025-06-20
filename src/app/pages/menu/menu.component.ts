import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from "@ionic/angular"
import { ProductosService } from 'src/app/servicios/productos.service';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule]
})
export class MenuComponent implements OnInit {

  productos: any[] = [];
  constructor(private productoService: ProductosService) { }

  async ngOnInit() {
    this.productos = await this.productoService.traerProductos();
  }

  agregarProducto(producto: any) {

  }

}
