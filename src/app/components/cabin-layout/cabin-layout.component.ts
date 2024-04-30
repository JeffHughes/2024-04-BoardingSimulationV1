import { Component, inject } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { CommonModule } from '@angular/common';
import { PassengersService } from '../../services/passengers.service';


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
  passengersService = inject(PassengersService)

  getSeatID(row: any, letter: string) {
    let ID = `seat-${row}-${letter}`;  
    return ID;
  }

  getRowID(row: any, ) {
    let ID = `cabin-row-${row}`; 
    return ID;
  }

  getBinID(binID: any, location  = 'top') {
    let ID = `bin-${location}-${binID}`;  
    return ID;
  }


}
