import { Component, inject } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-cabin-layout',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './cabin-layout.component.html',
  styleUrl: './cabin-layout.component.scss'
})
export class CabinLayoutComponent {

  public configService = inject(ConfigService);

  getSeatID(row: any, letter: string) {
    let ID = `seat-${row}-letter`;

    // if (!this.layout.layoutSquares[ID]) {
    //   setTimeout(() => {
    //     let item = document.getElementById(ID);
    //     let boundingRect = item!.getBoundingClientRect();
    //     this.layout.layoutSquares[ID] = boundingRect;
    //   }, 1000);
    // }

    return ID;
  }

  getID(row: any, letter: string = 'A') {
    let ID = `seat-${row}-letter`;

    // if (!this.layout.layoutSquares[ID]) {
    //   setTimeout(() => {
    //     let item = document.getElementById(ID);
    //     let boundingRect = item!.getBoundingClientRect();
    //     this.layout.layoutSquares[ID] = boundingRect;
    //   }, 1000);
    // }

    return ID;
  }


}
