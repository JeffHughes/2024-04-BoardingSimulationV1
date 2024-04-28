import { Injectable } from '@angular/core';
import { Passenger } from '../classes/passenger';

 
interface PassengerGroups {
  [key: string]: Passenger[];
}

@Injectable({
  providedIn: 'root'
})
export class ConsoleService {

  printBoardingGroupTable(passengers: Passenger[]) {
    // Group passengers by boardingGroupLetter using a more specific type
    const groups: PassengerGroups = passengers.reduce((acc: PassengerGroups, passenger: Passenger) => {
      acc[passenger.boardingGroup!] = acc[passenger.boardingGroup!] || [];
      acc[passenger.boardingGroup!].push(passenger);
      return acc;
    }, {});

    // Print each group in a table, sorted by boardingOrder
    for (const [groupNumber, group] of Object.entries(groups)) {
      console.log(`Boarding Group ${groupNumber}:`);
      // Sorting the group by boardingOrder
      group.sort((a: any, b: any) => a.boardingOrder - b.boardingOrder);
      console.table(group, ["boardingGroupLetter", "boardingOrder", "id", "groupID", "groupSize", "bin", "slot", "hasCarryOn"]);
    }
  }

  printGroupTable(passengers: Passenger[]) {
    // Group passengers by groupID
    const groups: Record<number, Passenger[]> = passengers.reduce((acc: Record<number, Passenger[]>, passenger: Passenger) => {
      acc[passenger.groupID!] = acc[passenger.groupID!] || [];
      acc[passenger.groupID!].push(passenger);
      return acc;
    }, {});

    // Print each group in a table, sorted by boardingOrder
    for (const [groupId, group] of Object.entries(groups)) {
      console.log(`Group ID ${groupId}:`);
      // Sorting the group by boardingOrder
      group.sort((a: any, b: any) => a.boardingOrder - b.boardingOrder);
      console.table(group, ["boardingOrder", "id", "groupID", "groupSize", "bin", "slot", "hasCarryOn"]);
    }
  }


  displaySeatLayoutConsoleTable(seatLayout: any): void {
    const tableFormat = seatLayout.map((row: any, rowIndex: any) => {
      const rowObject: { [seatLabel: string]: number | 'Empty' } = {};
      row.forEach((item: any) => {
        rowObject[item.seat] = item.isOccupied && item.passengerId ? item.passengerId.toString() : 'Empty';
      });
      return rowObject;
    });
    console.log('Seat Layout:');
    console.table(tableFormat);
  }
  
  displaySeatAssignmentOrderConsoleTable(seatLayout: any): void {
    const tableFormat = seatLayout.map((row: any, rowIndex: any) => {
      const rowObject: { [seatLabel: string]: number | 'Empty' } = {};
      row.forEach((item: any) => {
        rowObject[item.seat] = item.isOccupied && item.passengerId ?  item.orderAssigned.toString() : 'Empty';
      });
      return rowObject;
    });
    console.log('Seat Layout:');
    console.table(tableFormat);
  }

  

  printBoardingGroupWSeatsTable(passengers: Passenger[]): void {
    const groups: PassengerGroups = passengers.reduce((acc: PassengerGroups, passenger: Passenger) => {
      const groupKey = passenger.boardingGroupLetter!;
      acc[groupKey] = acc[groupKey] || [];
      acc[groupKey].push(passenger);
      return acc;
    }, {});

    for (const [groupNumber, group] of Object.entries(groups)) {
      console.log(`Boarding Group ${groupNumber}:`);
      group.sort((a: Passenger, b: Passenger) => a.boardingOrder! - b.boardingOrder!);
      console.table(group.map(passenger => ({
        ...passenger,
        seatRow: passenger.seatRow
      })), ["boardingGroupLetter", "boardingOrder", "id", "groupID", "groupSize", "bin", "slot", "hasCarryOn", "seatRow"]);
    }
  }

}
