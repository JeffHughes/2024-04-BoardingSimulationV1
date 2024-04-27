import { Component } from '@angular/core';
import { GateLayoutComponent } from '../../components/gate-layout/gate-layout.component';
import { PassengersAtGateComponent } from '../../components/passengers-at-gate/passengers-at-gate.component';
import { WalkwayComponent } from '../../components/walkway/walkway.component';
import { CabinLayoutComponent } from '../../components/cabin-layout/cabin-layout.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    GateLayoutComponent,
    PassengersAtGateComponent,
    WalkwayComponent,
    CabinLayoutComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {


  constructor() {
    this.getData();
  }

  async getData() {

    // const data = await fetch('../assets/configs/737-700.json');
    // const js = await data.json();

    // console.log(js);
  }

}
