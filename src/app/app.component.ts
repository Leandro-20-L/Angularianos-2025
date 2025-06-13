import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { StatusBar, Style } from '@capacitor/status-bar';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, CommonModule],
})
export class AppComponent {
  showSplash = true;

  constructor() {
    this.initializeApp();
   }

  private async initializeApp() {
    
     StatusBar.setOverlaysWebView({ overlay: false });
    
     StatusBar.setStyle({ style: Style.Default });
  }

  ngOnInit() {
    setTimeout(() => {
      this.showSplash = false;
    }, 3000);
  }
}
