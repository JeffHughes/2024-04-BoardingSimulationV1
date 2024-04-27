import { Injectable } from '@angular/core';
import { Passenger } from '../classes/passenger';

@Injectable({
  providedIn: 'root'
})
export class SeatService {

  constructor() { }


  // sortBySlot(passengers: any[], seatRows: number = 12) {
  //   // Function to determine the slot with the lowest number of passengers
  //   const findMinimumOccupiedSlot = (group: Passenger[], allPassengers: Passenger[]): string => {
  //     const slotCount: { [slot: string]: number } = {};
  //     allPassengers.forEach(p => {
  //       if (p.slot) {
  //         slotCount[p.slot] = (slotCount[p.slot] || 0) + 1;
  //       }
  //     });

  //     return Object.entries(slotCount).reduce((minSlot, [slot, count]) => {
  //       return count < (minSlot.count || Infinity) ? { slot, count } : minSlot;
  //     }, { slot: 'A1', count: Infinity }).slot;
  //   };

  //   // Function to assign the least occupied slot and boardingGroup to each passenger
  //   const assignLowestSlotsAndBoardingGroup = (passengerList: Passenger[]): void => {
  //     const groupedByGroupID = passengerList.reduce<{ [key: number]: Passenger[] }>((acc, p: any) => {
  //       acc[p.groupID] = acc[p.groupID] || [];
  //       acc[p.groupID].push(p);
  //       return acc;
  //     }, {});

  //     for (const [groupID, group] of Object.entries(groupedByGroupID)) {
  //       const minSlot = findMinimumOccupiedSlot(group, passengerList.filter(p => p.bin));
  //       group.forEach(passenger => {
  //         passenger.slot = minSlot;
  //         passenger.boardingGroup = (passenger.bin || 'FIRST') + minSlot;
  //       });
  //     }
  //   };

  //   // Sort function prioritizing slot, then bin, then groupID
  //   const sortPassengers = (passengerList: Passenger[]): Passenger[] => {
  //     const passengersWithBins = passengerList.filter(p => p.bin);
  //     const passengersWithoutBins = passengerList.filter(p => !p.bin);

  //     assignLowestSlotsAndBoardingGroup(passengersWithBins);

  //     // Sort passengers with bins by slot, then by bin, then by groupID
  //     const sortedWithBins = passengersWithBins.sort((a: any, b: any) => {
  //       const slotComp = (a.slot || '').localeCompare(b.slot || '');
  //       if (slotComp !== 0) return slotComp;
  //       const binComp = (a.bin || 'FIRST').localeCompare(b.bin || 'FIRST');
  //       if (binComp !== 0) return binComp;
  //       return a.groupID - b.groupID;
  //     });

  //     // Concatenate passengers without bins at the beginning
  //     return [...passengersWithoutBins, ...sortedWithBins];
  //   };


  //   return sortPassengers(passengers);
  // }


  // findAndFillGaps(passengers: Passenger[]): Passenger[] {
  //   // Helper function to get the boarding group number safely
  //   const getGroupNumber = (bg: string | undefined): number => {
  //     if (!bg) return -1; // Return -1 for undefined or invalid boarding groups
  //     return parseInt(bg.slice(0, -1));
  //   };

  //   // Helper function to get the boarding group letter safely
  //   const getGroupLetter = (bg: string | undefined): string => {
  //     if (!bg) return ''; // Return empty string for undefined boarding groups
  //     return bg.slice(-1);
  //   };

  //   // Sort passengers by bin, slot, and numeric part of boarding group, handling undefined boarding groups
  //   passengers.sort((a, b) => {
  //     const binSlotCompare = `${a.bin}${a.slot}`.localeCompare(`${b.bin}${b.slot}`);
  //     if (binSlotCompare !== 0) return binSlotCompare;
  //     return getGroupNumber(a.boardingGroup) - getGroupNumber(b.boardingGroup);
  //   });

  //   // Find gaps and adjust boarding groups
  //   for (let i = 0; i < passengers.length - 1; i++) {
  //     if (!passengers[i].boardingGroup || !passengers[i + 1].boardingGroup) continue; // Skip if boarding group is undefined

  //     if (passengers[i].bin === passengers[i + 1].bin && passengers[i].slot === passengers[i + 1].slot) {
  //       const currentGroup = passengers[i].boardingGroup;
  //       const nextGroup = passengers[i + 1].boardingGroup;
  //       const currentNumber = getGroupNumber(currentGroup);
  //       const nextNumber = getGroupNumber(nextGroup);

  //       if (nextNumber > currentNumber + 1) {
  //         // There's a gap; change the next group to fill the gap
  //         passengers[i + 1].boardingGroup = `${currentNumber + 1}${getGroupLetter(nextGroup)}`;
  //       }
  //     }
  //   }

  //   return passengers;
  // }


  // findAndFillGaps3(passengers: Passenger[]): Passenger[] {
  //   // Helper function to parse the numeric part of the boarding group, with safety check
  //   const parseGroupNumber = (boardingGroup: string | undefined): number => {
  //     if (!boardingGroup) {
  //       // console.error("Invalid boarding group found");
  //       return 0;  // Return an invalid group number if undefined
  //     }
  //     return parseInt(boardingGroup.substring(0, boardingGroup.length - 1));
  //   };

  //   // Organize passengers by bin and slot
  //   const boardingGroups: Record<string, Passenger[]> = {};
  //   passengers.forEach(p => {
  //     const key = `${p.bin}-${p.slot}`;
  //     if (!boardingGroups[key]) {
  //       boardingGroups[key] = [];
  //     }
  //     boardingGroups[key].push(p);
  //   });

  //   // Sort passengers within each bin and slot by boarding group
  //   for (const key in boardingGroups) {
  //     boardingGroups[key].sort((a, b) => parseGroupNumber(a.boardingGroup) - parseGroupNumber(b.boardingGroup));
  //   }

  //   // Fill gaps
  //   for (const key in boardingGroups) {
  //     const groupList = boardingGroups[key];
  //     let expectedGroupNumber = parseGroupNumber(groupList[0].boardingGroup);
  //     if (expectedGroupNumber === -1) continue;  // Skip processing if initial boarding group is invalid

  //     for (let i = 0; i < groupList.length; i++) {
  //       const currentGroupNumber = parseGroupNumber(groupList[i].boardingGroup);
  //       if (currentGroupNumber === -1) continue;  // Skip entries with invalid boarding groups

  //       if (currentGroupNumber > expectedGroupNumber) {
  //         // Find the smallest group from the later groups to move up
  //         for (let j = i; j < groupList.length; j++) {
  //           if (parseGroupNumber(groupList[j].boardingGroup) === currentGroupNumber) {
  //             groupList[j].boardingGroup = `${expectedGroupNumber}${groupList[j].boardingGroup!.slice(-1)}`;
  //           }
  //         }
  //         expectedGroupNumber++;
  //       } else {
  //         expectedGroupNumber++;
  //       }
  //     }
  //   }

  //   // Flatten the object back to an array
  //   return Object.values(boardingGroups).flat();
  // }



  // assignSeats3(passengers: any[], seatRows: number = 12) {

  //   // Function to determine the minimum slot in a group
  //   const findMinimumSlot = (group: Passenger[]): string => {
  //     const slots = group.map(p => p.slot).filter(slot => slot !== undefined) as string[];
  //     return slots.sort()[0];
  //   };

  //   // Function to assign the lowest slot and boardingGroup to each passenger based on groupID
  //   const assignLowestSlotsAndBoardingGroup = (passengerList: Passenger[]): void => {
  //     const groupedByGroupID = passengerList.reduce<{ [key: number]: Passenger[] }>((acc, p: any) => {
  //       acc[p.groupID] = acc[p.groupID] || [];
  //       acc[p.groupID].push(p);
  //       return acc;
  //     }, {});

  //     // Calculate the lowest slot for each group and assign to each passenger
  //     for (const [groupID, group] of Object.entries(groupedByGroupID)) {
  //       const minSlot = findMinimumSlot(group);
  //       group.forEach(passenger => {
  //         passenger.slot = minSlot || '';
  //         passenger.boardingGroup = minSlot || '' + (passenger.bin || '0');
  //       });
  //     }
  //   };

  //   // Sorting function for passengers, prioritizing slot, then bin, then groupID
  //   const sortPassengers = (passengerList: Passenger[]): Passenger[] => {
  //     // Assign the lowest slots and boarding groups to passengers
  //     assignLowestSlotsAndBoardingGroup(passengerList);



  //     // Sort passengers by slot, then by bin (with fallback to 'FIRST'), then by groupID
  //     return passengerList.sort((a: any, b: any) => {
  //       const slotComp = (a.slot || '').localeCompare(b.slot || '');
  //       if (slotComp !== 0) return slotComp;
  //       const binComp = (a.bin || '0').localeCompare(b.bin || '0');
  //       if (binComp !== 0) return binComp;
  //       return a.groupID - b.groupID;
  //     });
  //   };

  //   return sortPassengers(passengers);
  // }

  // assignSeats2(passengers: any[], seatRows: number) {

  //   // Function to determine the minimum slot in a group
  //   const findMinimumSlot = (group: Passenger[]): string => {
  //     const slots = group.map(p => p.slot).filter(slot => slot !== undefined) as string[];
  //     return slots.sort()[0];
  //   };

  //   // Function to assign boardingGroup based on the lowest slot in each group
  //   const assignBoardingGroups = (passengerList: Passenger[]): void => {
  //     const groupMapping: { [key: number]: string } = {};

  //     // Create a map of groupID to their respective minimum slot
  //     passengerList.forEach((passenger: any) => {
  //       if (passenger.slot) {
  //         const currentMin = groupMapping[passenger.groupID];
  //         if (!currentMin || passenger.slot < currentMin) {
  //           groupMapping[passenger.groupID] = passenger.slot;
  //         }
  //       }
  //     });

  //     // Assign the boardingGroup to each passenger
  //     passengerList.forEach(passenger => {
  //       passenger.boardingGroup = groupMapping[passenger.groupID!] || 0;  // Default to 'ZZ' if no slot defined
  //     });
  //   };

  //   // Sorting function with boardingGroup consideration
  //   const sortPassengers = (passengerList: Passenger[]): Passenger[] => {
  //     // First assign boarding groups to all passengers
  //     assignBoardingGroups(passengerList);

  //     // Filter passengers by those with and without bin assignments
  //     const withBin = passengerList.filter(p => p.bin);
  //     const withoutBin = passengerList.filter(p => !p.bin);

  //     // Sort those with bin by boardingGroup, then by slot, and then by groupID
  //     const sortedWithBin = withBin.sort((a, b) => {
  //       const compGroup = a.boardingGroup!.localeCompare(b.boardingGroup!);
  //       return compGroup !== 0 ? compGroup : a.slot!.localeCompare(b.slot!);
  //     });

  //     // Combine arrays, placing those without bin assignments first
  //     return [...withoutBin, ...sortedWithBin];
  //   };

  //   return sortPassengers(passengers);
  // }

  // assignSeats1(passengers: any[], seatRows: number) {

  //   // Helper function to determine the minimum slot in a group
  //   const findMinimumSlot = (group: Passenger[]): string => {
  //     const slots = group.map(p => p.slot).filter(slot => slot !== undefined) as string[];
  //     return slots.sort()[0];
  //   };

  //   // Sorting function
  //   const sortPassengers = (passengerList: Passenger[]): any => {
  //     // Filter passengers by those with and without bin assignments
  //     const withBin = passengerList.filter(p => p.bin);
  //     const withoutBin = passengerList.filter(p => !p.bin);

  //     // Group by groupID for those with bin assignments
  //     const groupedByBin = withBin.reduce((acc: any, p: any) => {
  //       acc[p.groupID] = acc[p.groupID] || [];
  //       acc[p.groupID].push(p);
  //       return acc;
  //     }, {} as { [key: number]: Passenger[] });

  //     // Sort each group by the minimum slot, then flatten the sorted groups
  //     const sortedWithBin = Object.values(groupedByBin).sort((a: any, b: any) => {
  //       const minSlotA = findMinimumSlot(a);
  //       const minSlotB = findMinimumSlot(b);
  //       return minSlotA.localeCompare(minSlotB);
  //     }).flat();

  //     // Combine and sort final array, putting those without bin assignments first
  //     return [...withoutBin, ...sortedWithBin];
  //   };

  //   return sortPassengers(passengers);
  // }
}
