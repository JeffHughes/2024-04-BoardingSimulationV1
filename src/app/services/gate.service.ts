import { Injectable } from '@angular/core';
import { Passenger } from '../classes/passenger';

@Injectable({
  providedIn: 'root'
})
export class GateService {


  assignBoardingGroups(passengers: Passenger[]) {

    const pad = (num: number) => num.toString().padStart(2, '0');
    const key = (passenger: any) => `${pad(passenger.slot)}-${pad(passenger.bin)}`;
    const boardingGroupAndKey = (passenger: any) => `${pad(passenger.boardingGroup || 10)}-${key(passenger)}`;

    // Sort passengers by bin, slot, and numeric boarding group
    passengers.sort((a: any, b: any) => {
      const binSlotCompare = boardingGroupAndKey(a).localeCompare(boardingGroupAndKey(b));
      if (binSlotCompare !== 0) return binSlotCompare;
      return (a.boardingGroup) - (b.boardingGroup);
    });

    console.log('Sorted Passengers:', passengers)

    // create a dictionary for boarding groups
    const boardingGroups: Record<string, Passenger[]> = {};

    passengers.forEach((passenger, index) => {

      // find all the passengers with the same groupID and assign a
      // boarding group and order
      const groupPassengers = passengers.filter(p => p.groupID === passenger.groupID);
      groupPassengers.forEach(groupPassenger => {
        groupPassenger.boardingGroup = passenger.slot;
        groupPassenger.boardingOrder = passenger.bin;
      });

      boardingGroups[key(passenger)] = groupPassengers;

    });

    compressBoardingGroups();

    console.log('Boarding Groups (compressed):', boardingGroups);

    // go thru each passenger and assign a letter boarding group 
    passengers.forEach(passenger => {
      if (!passenger.boardingGroupLetter)
        passenger.boardingGroupLetter = String.fromCharCode('A'.charCodeAt(0) + passenger.boardingGroup! - 1);
    });

    return passengers;

    function compressBoardingGroups() {
      for (let slot = 1; slot <= 12; slot++) {
        for (let bin = 1; bin <= 12; bin++) {
          const binSlot = `${pad(slot)}-${pad(bin)}`;
          if (!boardingGroups[binSlot]) {
            for (let nextSlot = slot + 1; nextSlot <= 12; nextSlot++) {
              const nextSlotAndBin = `${pad(nextSlot)}-${pad(bin)}`;
              if (boardingGroups[nextSlotAndBin]) {
                boardingGroups[binSlot] = boardingGroups[nextSlotAndBin];
                delete boardingGroups[nextSlotAndBin];
                break;
              }
            }
          }
        }
      }
    }
  }


  // assignBoardingGroups(passengers: Passenger[]) {
  //   const organizedPassengers = new Map<string, Passenger[]>();

  //   // Organize passengers by bin and slot
  //   passengers.forEach(passenger => {
  //     if (passenger.bin && passenger.slot) {
  //       const key = `${passenger.bin}-${passenger.slot}`;
  //       if (!organizedPassengers.has(key)) {
  //         organizedPassengers.set(key, []);
  //       }
  //       organizedPassengers.get(key)!.push(passenger);
  //     }
  //   });

  //   let currentBoardingGroup = 'B';
  //   let currentBoardingOrder = 1;

  //   // Example starting point
  //   const startBin = "1";
  //   const startSlot = "B";

  //   for (let bin of organizedPassengers.keys()) {
  //     if (bin.startsWith(startBin) && bin.endsWith(startSlot)) {
  //       const passengersInSlot = organizedPassengers.get(bin);
  //       if (passengersInSlot) {
  //         passengersInSlot.forEach(passenger => {
  //           if (!passenger.boardingGroup  ) {
  //             // Assign boarding group and order
  //             passenger.boardingGroup = currentBoardingGroup;
  //             passenger.boardingOrder = currentBoardingOrder;
  //           }
  //         });
  //         currentBoardingOrder++;  // Increment boarding order for the next group
  //       }
  //     }
  //   }

  //   return passengers;
  // }


  // public assignBoardingGroups(passengers: Passenger[]): void {
  //   // Group passengers by groupID
  //   const groups: Record<number, Passenger[]> = {};
  //   passengers.forEach((passenger: Passenger) => {
  //     if (passenger.groupID && passenger.bin) {  // Ensure passenger has a groupID and bin
  //       if (!groups[passenger.groupID]) {
  //         groups[passenger.groupID] = [];
  //       }
  //       groups[passenger.groupID].push(passenger);
  //     }
  //   });

  //   // Sort groups by bin ensuring that bin is not undefined
  //   const sortedGroups = Object.values(groups).map((group: any) => {
  //     return group.sort((a: Passenger, b: Passenger) => (a.bin || 'A').localeCompare(b.bin || 'A'));
  //   });

  //   // Implement boarding logic here according to the specified rules
  //   const boardingGroups: Passenger[][] = [];
  //   sortedGroups.forEach((group: Passenger[]) => {
  //     let currentBoardingGroup: Passenger[] = [];
  //     let currentBinCount: Record<string, number> = {};

  //     group.forEach(passenger => {
  //       const bin = passenger.bin || 'A';  // already checked for undefined
  //       const binCount = currentBinCount[bin] || 0;

  //       if (currentBoardingGroup.length + 1 > 32 ||
  //         (binCount > 3 && currentBinCount[bin] > 3) ||
  //         (binCount > 6 && currentBinCount[bin] > 6)) {
  //         boardingGroups.push(currentBoardingGroup);
  //         currentBoardingGroup = [];
  //         currentBinCount = {};
  //       }

  //       currentBoardingGroup.push(passenger);
  //       currentBinCount[bin] = binCount + 1;
  //     });

  //     if (currentBoardingGroup.length) {
  //       boardingGroups.push(currentBoardingGroup);
  //     }
  //   });

  //   // Flatten boarding groups and assign group letters
  //   this.assignGroupLetters(boardingGroups);

  //   // flatten out boardingGroups
  //   const flatBoardingGroups = boardingGroups.flat();

  //   // sort by boarding group
  //   flatBoardingGroups.sort((a: any, b: any) => a.boardingGroup.localeCompare(b.boardingGroup));

  //   console.log('Boarding Groups:', flatBoardingGroups);
  // }

  // private assignGroupLetters(boardingGroups: Passenger[][]): void {
  //   let groupLetter = 'A';
  //   boardingGroups.forEach(group => {
  //     group.forEach(passenger => {
  //       passenger['boardingGroup'] = groupLetter;  // Mutate passenger to add boardingGroup property
  //     });
  //     groupLetter = String.fromCharCode(groupLetter.charCodeAt(0) + 1);  // Move to the next letter in the alphabet
  //   });
  // }
}
