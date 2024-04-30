
import { CommonModule } from '@angular/common';
import { PassengersService } from '../../services/passengers.service';
import { LayoutService } from './../../services/layout.service';
import { AfterViewInit, Component, inject } from '@angular/core';

@Component({
  selector: 'app-passengers-at-gate',
  standalone: true,
  imports: [

    CommonModule
  ],
  templateUrl: './passengers-at-gate.component.html',
  styleUrl: './passengers-at-gate.component.scss'
})
export class PassengersAtGateComponent implements AfterViewInit {


  layout = inject(LayoutService)
  passengersService = inject(PassengersService)



  ngAfterViewInit(): void {

    // setTimeout(() => {
    //   this.passengersService.animateCircle('passenger-1', 'gate-A-16', 'gate-A-8');
    // }, 2000);


  }



}
