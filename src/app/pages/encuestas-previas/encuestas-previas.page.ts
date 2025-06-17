import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-encuestas-previas',
  templateUrl: './encuestas-previas.page.html',
  styleUrls: ['./encuestas-previas.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EncuestasPreviasPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
