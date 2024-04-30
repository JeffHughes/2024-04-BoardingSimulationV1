import { Passenger } from './../classes/passenger';
import { ConsoleService } from './console.service';
import { SeatService } from './seat.service';
import { Injectable, inject, signal } from '@angular/core';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ConfigService } from './config.service';
import { HistogramIntBin, MathService } from './math.service';
import { GroupsService } from './groups.service';
import { OverheadBinsService } from './overhead-bins.service';
import { GateService } from './gate.service';
import { Seats2Service } from './seats2.service';
import { Seats3Service } from './seats3.service';
gsap.registerPlugin(MotionPathPlugin);



@Injectable({
  providedIn: 'root'
})
export class PassengersService {

  mathService = inject(MathService);
  configService = inject(ConfigService);
  groupService = inject(GroupsService);
  overheadBinService = inject(OverheadBinsService);

  seat3Service = inject(Seats3Service);
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

    passengers = this.overheadBinService.assignPassengerBins(
      groupInfo.passengers,
      groupInfo.groups,
      config.overheadBinRows, 12);

    const passengersWGateAssignments = this.gateService.assignBoardingGroups(passengers);
    let passengersInSeats = this.seat3Service.assignSeatsToPassengers(passengersWGateAssignments);
    this.passengers.set(passengersInSeats);

    setTimeout(() => { this.bigLoop(); }, 2000);
  }

  bigLoop() {

    // get the passengers with boardingGroup 1 and 2 and line em up

    const boardingGroups = this.groupPassengersByBoardingGroup(this.passengers());

    console.log({ boardingGroups });


    // let boardingGroup = 1;
    // let boardingLane = 'A';

    this.animateBoardingGroup(1, 'A', 0);

    setTimeout(() => {
      this.animateBoardingGroup(2, 'B');
    }, 2000);

  }

  animateBoardingGroup(boardingGroup: number, boardingLane: string, pause1s = 13) {
    const standbyDivId = `standby-square`;

    const passengersWithBoardingGroup = this.passengers().filter((passenger: any) => passenger.boardingGroup === boardingGroup);
    passengersWithBoardingGroup.sort((a: any, b: any) => a.boardingOrder - b.boardingOrder);

    passengersWithBoardingGroup.forEach((passenger: any, index: number) => {
      const passengerID = `passenger-${passenger.id}`;
      const endDivId = `gate-${boardingLane}-${passenger.boardingOrder}`;

      setTimeout(() => {
        this.animateCircle(passengerID, standbyDivId, endDivId, 5, 4);
      }, index * 250);
    });

    let move = 1;
    setTimeout(() => {
      let interval = setInterval(() => {

        let duration = .875;
        passengersWithBoardingGroup.forEach((passenger: any, index: number) => {
          const passengerID = `passenger-${passenger.id}`;

          let currentBoardingGroupBin = passenger.boardingOrder - move;
          let endDivId = `gate-${boardingLane}-${currentBoardingGroupBin}`;

          if (currentBoardingGroupBin < 1) {
            endDivId = `lane-${boardingLane}-complete`;
            duration = 2;

            if (currentBoardingGroupBin == 0) {
              setTimeout(() => {
                this.animateWalkway(passenger);
              }, 100);
            }
          }

          this.animateCircle2(passengerID, endDivId, duration, 2.5);
        });

        move++;
        if (move > 13) { clearInterval(interval); }

      }, 1000);
    }, 9001 + pause1s * 1000);
  }


  animateWalkway(passenger: Passenger) {
    const standbyDivId = `walkway-standby`;
    const walkwayPassengerID = `walkway-passenger-${passenger.id}`;
    const walkwayPassengerDiv = document.getElementById(walkwayPassengerID);

    const gatePassengerID = `passenger-${passenger.id}`;
    const gatePassengerDiv = document.getElementById(gatePassengerID);
    setTimeout(() => {
      gatePassengerDiv?.remove();
    }, 3000);


    let duration = .875;

    let move = 1;

    this.animateCircle2(walkwayPassengerID, standbyDivId, .1, .2);
    setTimeout(() => {
      walkwayPassengerDiv!.style.opacity = '1';

      let interval = setInterval(() => {

        let currentBoardingGroupBin = move++;
        let endDivId = `path-${currentBoardingGroupBin}`;

        if (currentBoardingGroupBin > 20) {
          endDivId = `walkway-complete`;
          duration = 2;
          clearInterval(interval);

          setTimeout(() => {
            this.animateCabin(passenger);
          }, 100);

        }

        this.animateCircle2(walkwayPassengerID, endDivId, duration);
      }, 700);
    }, 200);
  }

  animateCabin(passenger: Passenger) {
    const cabinStandByDiv = "cabin-standby";

    const cabinPassengerID = `cabin-passenger-${passenger.id}`;
    const cabinPassengerDiv = document.getElementById(cabinPassengerID);

    let duration = .875;
    this.animateCircle2(cabinPassengerID, cabinStandByDiv, .1);

    cabinPassengerDiv!.style.opacity = '1';

    let move = 1;
    let interval = setInterval(() => {

      let currentBoardingGroupBin = move;
      let endDivId = `cabin-row-${currentBoardingGroupBin}`;

      if (currentBoardingGroupBin > passenger.row!) {
        this.stowAndSeat(passenger);
        clearInterval(interval);
      } else
        this.animateCircle2(cabinPassengerID, endDivId);
      move++;
    }, 700);

  }


  stowAndSeat(passenger: Passenger) {

    // pause to stow luggage, backtrack to get to seat

    const cabinPassengerID = `cabin-passenger-${passenger.id}`;
    const cabinPassengerDiv = document.getElementById(cabinPassengerID);

    const seatPassengerID = `seat-${passenger.row}-${passenger.seat}`;

    // setTimeout(() => {
    //   this.animateCircle2(cabinPassengerID, seatPassengerID, 1, 0);
    // }, 1500);
  }


  groupPassengersByBoardingGroup(passengers: Passenger[]) {
    const pad = (num: number) => num.toString().padStart(2, '0');
    const key = (passenger: any) => `${pad(passenger.boardingGroup || -1)}-${pad(passenger.boardingOrder || -1)}`;

    let passengerGroups: { [key: string]: Passenger[]; } = {};

    passengers.forEach(passenger => {
      if (!passengerGroups[key(passenger)]) passengerGroups[key(passenger)] = [];
      passengerGroups[key(passenger)].push(passenger);
    });
    return passengerGroups;
  }

  animateCircle(passengerID: any, startDivId: any, endDivId: any, duration = 1, multiplier = 1) {
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
      const offsetXStart = Math.random() * (20 - 80) * multiplier; // Random offset between -10 and 10
      const offsetYStart = Math.random() * (20 - 40) * multiplier;
      const offsetXEnd = Math.random() * (20 - 10);
      const offsetYEnd = Math.random() * (20 - 10);

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

  animateCircle2(passengerID: any, endDivId: any, duration = 1, multiplier = 1) {
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
    const startAnimation = (endDiv: any) => {

      const endPos = getCenterPosition(endDiv);

      const offsetXEnd = (Math.random() * 20 - 10) * multiplier;
      const offsetYEnd = (Math.random() * 20 - 10) * multiplier;

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

    const endDiv = document.getElementById(endDivId);


    if (!endDiv) {
      console.error('Invalid end div element ID provided!');
    }
    if (!circle) {
      console.error('Invalid circle element ID provided!');
    }

    if (!endDiv || !circle) {
      console.error('Invalid element IDs provided!');
      return;
    }

    startAnimation(endDiv);
  }

  //console.log({ passengersBinAssigned })
  // const seats = this.seatService.assignSeatsToPassengers(gateAssignments);

  // console.log({ seats })

  // this.consoleService.displaySeatLayoutConsoleTable(this.seatService.seatLayout);

  // this.consoleService.printBoardingGroupWSeatsTable(seats);


  // this.seatService.ensureEveryPassengerHasASeat(passengers); // Make sure everyone has a seat
  // this.seatService.logSeatAssignments(passengers);
  //this.consoleService.displaySeatLayoutConsoleTable(this.seat3Service.seats);
  // this.consoleService.displaySeatLayoutConsoleTable(this.seat3Service.seats);

}

