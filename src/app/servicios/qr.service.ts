import { Injectable } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

@Injectable({
  providedIn: 'root'
})
export class QrService {

  constructor() { }
  escaneando:Boolean = false;

  async scan() {
    this.escaneando = true;
    BarcodeScanner.hideBackground();

    const permission = await BarcodeScanner.checkPermission({ force: true });
    if (!permission.granted) {
      throw new Error("Permiso de cámara denegado");
      return;
    }

    document.body.classList.add('scanner-active');

    const result: { hasContent: boolean, content?: string } = await BarcodeScanner.startScan();

    if (result.hasContent && result.content) {
      await this.cancelarEscaneo();
      return result.content;
    } else {
      throw new Error("No se detectó ningún código.");
    }
  }

  async cancelarEscaneo() {
    this.escaneando = false;
    await BarcodeScanner.stopScan();
    BarcodeScanner.showBackground();
    document.body.classList.remove('scanner-active');
  }
}
