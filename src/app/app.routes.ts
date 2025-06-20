import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'registroCliente',
    loadComponent: () => import('./pages/registro-cliente/registro-cliente.page').then( m => m.RegistroClientePage)
  },
  {
    path: 'clientes-pendientes',
    loadComponent: () => import('./pages/clientes-pendientes/clientes-pendientes.page').then( m => m.ClientesPendientesPage)
  },
  {
    path: 'maitre-lista-espera',
    loadComponent: () => import('./pages/maitre-lista-espera/maitre-lista-espera.page').then( m => m.MaitreListaEsperaPage)
  },
  {
    path: 'mesa',
    loadComponent: () => import('./pages/mesa/mesa.page').then( m => m.MesaPage)
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu.component').then( m => m.MenuComponent)
  },
   {
    path: 'lista-pedidos',
    loadComponent: () => import('./pages/lista-pedidos/lista-pedidos.page').then( m => m.ListaPedidosPage)
  },
  {
    path: 'propina',
    loadComponent: () => import('./pages/propina/propina.page').then( m => m.PropinaPage)
  },
  {
    path: 'encuestas-previas',
    loadComponent: () => import('./pages/encuestas-previas/encuestas-previas.page').then( m => m.EncuestasPreviasPage)
  },
  {
    path: 'ConsultaMozo',
    loadComponent: () => import('./pages/consulta-mozo/consulta-mozo.page').then( m => m.ConsultaMozoPage)
  },  {
    path: 'mozo',
    loadComponent: () => import('./pages/mozo/mozo.page').then( m => m.MozoPage)
  }

];
