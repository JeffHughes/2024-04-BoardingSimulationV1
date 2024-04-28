import { ConsoleService } from './console.service';
import { SeatService } from './seat.service';
import { Injectable, inject, signal } from '@angular/core';
import { Passenger } from '../classes/passenger';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ConfigService } from './config.service';
import { HistogramIntBin, MathService } from './math.service';
import { GroupsService } from './groups.service';
import { OverheadBinsService } from './overhead-bins.service';
import { GateService } from './gate.service';
gsap.registerPlugin(MotionPathPlugin);



@Injectable({
  providedIn: 'root'
})
export class PassengersService {

  mathService = inject(MathService);
  configService = inject(ConfigService);
  groupService = inject(GroupsService);
  overheadBinService = inject(OverheadBinsService);
  seatService = inject(SeatService);
  gateService = inject(GateService)
  consoleService = inject(ConsoleService);

  passengers = signal<any[]>([{}]);

  constructor() {
    this.setup();
  }

  private async setup() {
    const config: any = await this.configService.get();
    const length = config.maxPassengers;

    let passengers: Passenger[] = Array.from({ length }, (v, i) => ({
      id: i + 1,
      // name: `${i + 1}`,
    }));

    const groupInfo = this.groupService.distributePassengersIntoGroups(passengers, false, false);
    console.log({ groupInfo })

    passengers = this.overheadBinService.assignPassengerBins(
      groupInfo.passengers,
      groupInfo.groups,
      config.overheadBinRows, 12);

    //console.log({ passengersBinAssigned })

    const gateAssignments = this.gateService.assignBoardingGroups(passengers);

    const seats = this.seatService.assignSeatsToPassengers(gateAssignments);

    console.log({ seats })

    this.consoleService.displaySeatLayoutConsoleTable(this.seatService.seatLayout);

    this.consoleService.printBoardingGroupWSeatsTable(seats);
    // console.log({ gateAssignments })

    // passengers = this.seatService.sortBySlot([...passengers], config.seatRows);

    // console.log({ passengers })

    // const filled = this.seatService.findAndFillGaps([...passengers]);

    // console.log({ filled })

    // passengers = this.seatService.sortBySlot([...filled], config.seatRows);

    // console.log({ passengers })

    this.passengers.set(gateAssignments);
  }


  animateCircle(passengerID: any, startDivId: any, endDivId: any, duration = 1) {
    const circle = document.getElementById(passengerID);

    // Function to get the current center position of a div
    const getCenterPosition = (div: any) => {
      const rect = div.getBoundingClientRect();
      return {
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY + rect.height / 2
      };
    };

    // Function to animate the circle from start to end
    const startAnimation = (startDiv: any, endDiv: any) => {
      const startPos = getCenterPosition(startDiv);
      const endPos = getCenterPosition(endDiv);

      // Random offsets
      const offsetXStart = Math.random() * 20 - 10; // Random offset between -10 and 10
      const offsetYStart = Math.random() * 20 - 10;
      const offsetXEnd = Math.random() * 20 - 10;
      const offsetYEnd = Math.random() * 20 - 10;

      // Set initial position with offsets
      gsap.set(circle, {
        x: startPos.x + offsetXStart,
        y: startPos.y + offsetYStart
      });

      // Animate to new position with offsets
      gsap.to(circle, {
        x: endPos.x + offsetXEnd,
        y: endPos.y + offsetYEnd,
        duration, // Duration between 2 and 4 seconds
        ease: "power1.inOut", // Smooth easing
        repeat: 0,
        // motionPath: {
        //   path: [{ x: startPos.x, y: startPos.y }, { x: (startPos.x + endPos.x) / 6, y: Math.min(startPos.y, endPos.y) - 5 }, { x: endPos.x, y: endPos.y }],
        //   type: "quadratic"
        // }
      });
    };
    const startDiv = document.getElementById(startDivId);
    const endDiv = document.getElementById(endDivId);

    if (!startDiv) {
      console.error('Invalid start div element ID provided!');
    }
    if (!endDiv) {
      console.error('Invalid end div element ID provided!');
    }
    if (!circle) {
      console.error('Invalid circle element ID provided!');
    }

    if (!startDiv || !endDiv || !circle) {
      console.error('Invalid element IDs provided!');
      return;
    }

    startAnimation(startDiv, endDiv);
  }
}

