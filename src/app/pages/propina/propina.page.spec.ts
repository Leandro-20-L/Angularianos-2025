import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropinaPage } from './propina.page';

describe('PropinaPage', () => {
  let component: PropinaPage;
  let fixture: ComponentFixture<PropinaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PropinaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
