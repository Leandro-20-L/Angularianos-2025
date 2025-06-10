import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/servicios/auth.service';
import { PushService } from 'src/app/servicios/push.service';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonicModule],
})
export class HomePage implements OnInit {
  constructor(private route: Router, private auth: AuthService, private push: PushService, private acceso: AuthService) {
  }

  async ngOnInit() {
    let uid = await this.acceso.getUserUid();
    this.push.initializePushNotifications(uid!);
  }

  async signOut() {
    await this.auth.logOut();
    this.route.navigate(["/login"])
  }

}
