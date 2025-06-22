import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoPedidosSectorPage } from './listado-pedidos-sector.page';

describe('ListadoPedidosSectorPage', () => {
  let component: ListadoPedidosSectorPage;
  let fixture: ComponentFixture<ListadoPedidosSectorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListadoPedidosSectorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
