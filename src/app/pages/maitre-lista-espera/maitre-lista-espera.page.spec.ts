import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaitreListaEsperaPage } from './maitre-lista-espera.page';

describe('MaitreListaEsperaPage', () => {
  let component: MaitreListaEsperaPage;
  let fixture: ComponentFixture<MaitreListaEsperaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MaitreListaEsperaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
