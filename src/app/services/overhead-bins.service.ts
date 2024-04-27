import { Injectable, inject } from '@angular/core';
import { ConfigService } from './config.service';
import { Passenger } from '../classes/passenger';


interface Group {
  members: number[];
  maxSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class OverheadBinsService {

  configService = inject(ConfigService);

  constructor() { }

  assignPassengerBins(passengers: Passenger[], groups: Group[], totalBins: number, slotsPerBin: number = 12): Passenger[] {
    // const totalSlots = totalBins * slotsPerBin;
    // const slotsToFill = Math.floor(totalSlots * 0.95); // 95% fill rate

    //make a dictionary of bins and the bin's slots
    let bins: any = {};
    for (let bin = 0; bin <= totalBins; bin++) {
      bins[bin] = [];
    }

    //const sortedGroups = groups.sort((a, b) => b.maxSize - a.maxSize);

    function shuffleBySize(groups: any) {
      return groups.sort((a: any, b: any) => {
        // Compare the maxSize properties randomly
        return 0.5 - Math.random();
      }).sort((a: any, b: any) => {
        // Additional sorting step to shuffle based on maxSize
        if (Math.random() > 0.5) {
          return b.maxSize - a.maxSize;
        } else {
          return a.maxSize - b.maxSize;
        }
      });
    }

    const sortedGroups: Group[] = shuffleBySize(groups);

    // starting w bin 12 assign 1 group per bin, when you get to 1 go back to 12
    let currentBin = totalBins;
    let currentSlotIndex = 1;
    for (let group of sortedGroups) {
      if (group.maxSize > slotsPerBin) continue;
      if (currentSlotIndex + group.maxSize > slotsPerBin) {
        currentBin--;
        currentSlotIndex = 1;
      }
      if (currentBin < 1) break;
      group.members.forEach((memberId, index) => {
        const passengerIndex = passengers.findIndex(p => p.id === memberId);

        if (passengerIndex !== -1) {
          let passenger = passengers[passengerIndex];

          passenger.bin = currentBin;
          passenger.slot = +(currentSlotIndex++ + 1);
          passenger.hasCarryOn = true;

          bins[currentBin].push({ passenger });
        }
      });
    }

    let bagless = 0;
    //for each passenger, if it is not assigned to a slot assign it to First group
    passengers.forEach((passenger: any) => {
      if (!passenger.slot) {
        passenger.bin = 0;
        passenger.slot = 1;
        passenger.boardingGroup = 0;
        passenger.boardingGroupLetter = 'First';
        passenger.hasCarryOn = false;
        bins[0].push({ passenger });

        console.log('passenger w no bags', passenger)
        bagless++;
      }
    });

    const carryOns = passengers.filter(p => p.hasCarryOn).length;
    const totalPassengers = passengers.length;
    console.log()

    const percentageWBags = (totalPassengers - bagless) / totalPassengers * 100;
    console.log('total passengers', totalPassengers,
      'carry-ons', carryOns, 'bagless', bagless,
      'percentage w bags', percentageWBags.toFixed(1), '%'
    )

    console.log(bins)

    return passengers;
  }

  // foreach passenger, assign a bin and slot to everyone in their group
  // for (let group of groups) {
  //   for (let memberId of group.members) {
  //     let passenger = passengers.find(p => p.id == memberId);
  //     if (passenger) {
  //       let bin = currentPassengerIndex % totalBins + 1;
  //       let slot = String.fromCharCode(65 + Math.floor(currentPassengerIndex / totalBins));
  //       bins[bin].push({ passenger: passenger, slot: slot });

  //     }
  //   }
  // }

  // start w totalBins = 12, and work down to 1
  // for (let bin = totalBins; bin > 0; bin--) {
  //   for (let slot = 0; slot < slotsPerBin; slot++) {

  //   }
  // }








  // // find the passenger with the startBin and startSlot
  // let passenger = passengers.find(p => p.bin == bin.toString() && p.slot == String.fromCharCode(65 + slot));
  // if (passenger) {
  //   // find the all the members of that passenger's group
  //   let group = passengers.filter(p => p.groupId == passenger.groupId);

  //   // assign boarding group and order to all members of the group
  //   group.forEach(p => {
  //     p.bin = bin.toString();
  //     p.slot = String.fromCharCode(65 + slot);
  //   });
  // }

  // // Sort groups by size in descending order to prioritize larger groups
  // const sortedGroups = Array.from(groupSizes.values()).sort((a, b) => b.size - a.size);

  // // Prepare all slots
  // const allSlots: any = [];
  // for (let i = 1; i <= totalBins; i++) {
  //   for (let slot = 0; slot < slotsPerBin; slot++) {
  //     allSlots.push({ bin: i, slotLabel: String.fromCharCode(65 + slot) }); // A to L
  //   }
  // }

  // // Shuffle the slots to randomize assignment
  // for (let i = allSlots.length - 1; i > 0; i--) {
  //   const j = Math.floor(Math.random() * (i + 1));
  //   [allSlots[i], allSlots[j]] = [allSlots[j], allSlots[i]];
  // }

  // // Assign slots to passengers in prioritized groups
  // const updatedPassengers = [...passengers]; // Clone the original array to avoid mutating it directly
  // let slotIndex = 0;

  // sortedGroups.forEach(group => {
  //   group.members.forEach(passenger => {
  //     if (slotIndex < slotsToFill) {
  //       const slot = allSlots[slotIndex++];
  //       passenger.bin = slot.bin;
  //       passenger.slot = slot.slotLabel;
  //     }
  //   });
  // });

  //   return updatedPassengers;

  // }

  // assignPassengerBins(passengers: Passenger[], groups: Group[], totalBins: number, slotsPerBin: number = 12): Passenger[] {
  //   const updatedPassengers = [...passengers]; // Clone passengers array

  //   // Sort groups by size in descending order to prioritize larger groups
  //   // const sortedGroups = groups.sort((a, b) => b.maxSize - a.maxSize);

  //   function shuffleBySize(groups: any) {
  //     return groups.sort((a: any, b: any) => {
  //       // Compare the maxSize properties randomly
  //       return 0.5 - Math.random();
  //     }).sort((a: any, b: any) => {
  //       // Additional sorting step to shuffle based on maxSize
  //       if (Math.random() > 0.5) {
  //         return b.maxSize - a.maxSize;
  //       } else {
  //         return a.maxSize - b.maxSize;
  //       }
  //     });
  //   }

  //   const sortedGroups: Group[] = shuffleBySize(groups);

  //   let currentBin = totalBins;
  //   let currentSlotIndex = 0;

  //   // Assign bins and slots
  //   sortedGroups.forEach((group: any) => {
  //     if (group.maxSize > slotsPerBin) return; // Skip if group cannot fit in any bin

  //     // Check if the current group can fit in the remaining slots of the current bin
  //     if (currentSlotIndex + group.maxSize > slotsPerBin) {
  //       currentBin--; // Move to the next bin
  //       currentSlotIndex = 0; // Reset slot index at the new bin
  //     }

  //     if (currentBin < 1) return; // No more bins available

  //     // Assign bin and slots to each member of the group
  //     group.members.forEach((memberId: any, index: any) => {
  //       const passengerIndex = updatedPassengers.findIndex(p => p.id === memberId);
  //       if (passengerIndex !== -1) {
  //         updatedPassengers[passengerIndex].bin = currentBin.toString();
  //         updatedPassengers[passengerIndex].slot = String.fromCharCode(65 + currentSlotIndex + index + 1); // B to K
  //       }
  //     });

  //     currentSlotIndex += group.maxSize; // Update slot index after assigning the group
  //   });

  //   // for each passenger, if it is not assigned to a slot assign it to A

  //   // updatedPassengers.forEach((passenger: any) => {
  //   //   if (!passenger.slot) {
  //   //     passenger.slot = 'A';
  //   //     passenger.bin = '0';
  //   //   }
  //   // });

  //   // order all passengers by bin and slot 
  //   // updatedPassengers.sort((a, b) => {
  //   //   if (a.bin === b.bin) {
  //   //     return a.slot!.localeCompare(b.slot!);
  //   //   } else {
  //   //     return a.bin!.localeCompare(b.bin!);
  //   //   }
  //   // });

  //   return updatedPassengers;
  // }

  /*
    assignPassengerBins4(passengers: Passenger[], groups: Group[], totalBins: number, slotsPerBin: number): Passenger[] {
      const totalSlots = totalBins * slotsPerBin;
      const slotsToFill = Math.floor(totalSlots * 0.95); // 95% fill rate
  
      // Sort groups by size in descending order to prioritize larger groups
      const sortedGroups = groups.sort((a, b) => b.maxSize - a.maxSize);
  
      // Create bin slots
      const availableBins = Array.from({ length: totalBins }, (_, i) => i + 1);
  
      // Shuffle bins to randomize starting points
      for (let i = availableBins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableBins[i], availableBins[j]] = [availableBins[j], availableBins[i]];
      }
  
      const updatedPassengers = [...passengers]; // Clone passengers array
      let currentBinIndex = 0;
      let filledSlots = 0;
  
      // Assign bins
      for (const group of sortedGroups) {
        if (filledSlots + group.maxSize > slotsToFill || group.maxSize > slotsPerBin) continue;
        if (currentBinIndex >= availableBins.length) break;
  
        const bin = availableBins[currentBinIndex];
        for (const memberId of group.members) {
          const passengerIndex = updatedPassengers.findIndex(p => p.id === memberId);
          if (passengerIndex !== -1) {
            updatedPassengers[passengerIndex].bin = bin.toString() ;
          }
        }
  
        filledSlots += group.maxSize;
        if (filledSlots % slotsPerBin === 0) {
          currentBinIndex++; // Move to next bin if current bin is filled
        }
      }
  
      return updatedPassengers;
    }
  
    assignPassengerBins3(
      passengers: Passenger[],
      groups: Group[],
      totalBins: number,
      slotsPerBin: number): Passenger[] {
  
      const totalSlots = totalBins * slotsPerBin;
      const slotsToFill = Math.floor(totalSlots * 0.95); // 95% fill rate
  
      // Create bin slots
      const slots: { bin: number; slot: string }[] = [];
      for (let bin = 1; bin <= totalBins; bin++) {
        for (let slot = 0; slot < slotsPerBin; slot++) {
          slots.push({ bin, slot: String.fromCharCode(65 + slot) }); // A to L
        }
      }
  
      // Shuffle slots to randomize assignment
      for (let i = slots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [slots[i], slots[j]] = [slots[j], slots[i]];
      }
  
      // Group passengers by their need for bins
      const groupPriority: Group[] = groups.sort((a, b) => b.maxSize - a.maxSize);
  
      // Assign bins based on group priority
      let slotIndex = 0;
      const updatedPassengers = passengers.map(p => ({ ...p }));
  
      groupPriority.forEach(group => {
        group.members.forEach((memberId: any) => {
          if (slotIndex < slotsToFill) {
            const passengerIndex = updatedPassengers.findIndex(p => p.id === memberId);
            if (passengerIndex !== -1) {
              updatedPassengers[passengerIndex].bin = slots[slotIndex].bin.toString() ;
              updatedPassengers[passengerIndex].slot = slots[slotIndex].slot;
              slotIndex++;
            }
          }
        });
      });
  
      return updatedPassengers;
    }
  
    assignPassengerBins2(passengers: any[], totalBins: number, slotsPerBin: number): Passenger[] {
      const totalSlots = totalBins * slotsPerBin;
      const slotsToFill = Math.floor(totalSlots * 0.95); // 95% fill rate
  
      // Filter out passengers who need bin space and group them
      const passengersNeedingBins = passengers.filter(p => p.needsBin);
      const groupSizes = new Map<number, { size: number, members: Passenger[] }>();
  
      passengersNeedingBins.forEach(passenger => {
        if (!groupSizes.has(passenger.groupId)) {
          groupSizes.set(passenger.groupId, { size: 0, members: [] });
        }
        const group = groupSizes.get(passenger.groupId)!;
        group.size++;
        group.members.push(passenger);
      });
  
      // Sort groups by size in descending order to prioritize larger groups
      const sortedGroups = Array.from(groupSizes.values()).sort((a, b) => b.size - a.size);
  
      // Prepare all slots
      const allSlots: any = [];
      for (let i = 1; i <= totalBins; i++) {
        for (let slot = 0; slot < slotsPerBin; slot++) {
          allSlots.push({ bin: i, slotLabel: String.fromCharCode(65 + slot) });
        }
      }
  
      // Shuffle the slots to randomize assignment
      for (let i = allSlots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allSlots[i], allSlots[j]] = [allSlots[j], allSlots[i]];
      }
  
      // Assign slots to passengers in prioritized groups
      const updatedPassengers = [...passengers]; // Clone the original array to avoid mutating it directly
      let slotIndex = 0;
  
      sortedGroups.forEach(group => {
        group.members.forEach(passenger => {
          if (slotIndex < slotsToFill) {
            const slot = allSlots[slotIndex++];
            passenger.bin =   slot.bin ;
            passenger.slot = slot.slotLabel;
          }
        });
      });
  
      return passengers;
    }
  
    assignPassengerBins1(passengers: Passenger[], totalBins: number = 12,
      slotsPerBin: number = 12): Passenger[] {
      // Calculate the total number of slots available
      const totalSlots = totalBins * slotsPerBin;
      const slotsToFill = Math.floor(totalSlots * 0.95); // 95% fill rate
  
      // Create a list of all possible bin slots
      const allSlots = [];
      for (let i = 1; i <= totalBins; i++) {
        for (let slot = 0; slot < slotsPerBin; slot++) {
          allSlots.push({ bin: i, slotLabel: String.fromCharCode(65 + slot) }); // 65 is ASCII for 'A'
        }
      }
  
      // Shuffle the slots to randomize assignment
      // for (let i = allSlots.length - 1; i > 0; i--) {
      //   const j = Math.floor(Math.random() * (i + 1));
      //   [allSlots[i], allSlots[j]] = [allSlots[j], allSlots[i]];
      // }
  
      // Assign passengers to these randomized slots
      const updatedPassengers = passengers.map(p => ({ ...p }));
      for (let i = 0; i < slotsToFill; i++) {
        if (i >= passengers.length) break; // Prevent assigning more passengers than we have
        updatedPassengers[i].bin = allSlots[i].bin.toString() ;
        updatedPassengers[i].slot = allSlots[i].slotLabel;
      }
  
      return updatedPassengers;
    }
  */

}
