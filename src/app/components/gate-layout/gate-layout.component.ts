import { Component, inject } from '@angular/core';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-gate-layout',
  standalone: true,
  imports: [],
  templateUrl: './gate-layout.component.html',
  styleUrl: './gate-layout.component.scss'
})
export class GateLayoutComponent {

  layout = inject(LayoutService)

  public aircraftConfig = {
    "maxPassengers": 143,

    "overheadBinRows": 16,
    "overheadBinSlotsAndBoardingGroups": 12,

    "cabinLengthMeters": 30,
    "seatRows": 26,
  };


  allBoardingGroups() {
    return Array.from({ length: this.aircraftConfig.overheadBinSlotsAndBoardingGroups }, (v, k) => String.fromCharCode(65 + k));
  }

  currentBoardingGroups(start: number) {
    let boardingGroups = this.allBoardingGroups();

    let boardingGroups2 = boardingGroups.slice(start, start + 2);
    return boardingGroups2;
  }

  boardingOrder() {
    return Array.from({ length: this.aircraftConfig.overheadBinRows }, (v, k) => k + 1).reverse();
  }

  getID(row: any, order: any) {
    let ID = `gate-${row}-${order}`;

    if (!this.layout.layoutSquares[ID]) {
      setTimeout(() => {
        let item = document.getElementById(ID);
        let boundingRect = item!.getBoundingClientRect();
        this.layout.layoutSquares[ID] = boundingRect;
      }, 1000);
    }

    return ID;
  }

}
