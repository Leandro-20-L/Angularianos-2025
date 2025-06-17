import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EncuestasPreviasPage } from './encuestas-previas.page';

describe('EncuestasPreviasPage', () => {
  let component: EncuestasPreviasPage;
  let fixture: ComponentFixture<EncuestasPreviasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EncuestasPreviasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
