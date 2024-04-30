import { Injectable } from '@angular/core';
import { Passenger } from '../classes/passenger';


type Seat = {
  passengerID?: number;
  row: number;
  seat: string;
  seatRow: string;
  passengerId?: number;
  groupID?: number;
  groupSize?: number;
  orderAssigned?: number;
};

@Injectable({
  providedIn: 'root'
})
export class Seats2Service {
  public seats: Seat[];
  public seatAssigned: boolean[] = Array.from({ length: 24 * 6 }, () => false);
  private filledRows: Set<number> = new Set();
  private targetRow: number = 1; // Start from the first row by default

  // todo: use aircraft config for init
  constructor() {
    this.seats = this.initializeSeats();
    console.log(this.seats);
  }

  private initializeSeats(): Seat[] {
    let layout: Seat[] = [];
    for (let row = 1; row <= 24; row++) {
      for (let seat of ['A', 'B', 'C', 'D', 'E', 'F']) {
        layout.push({
          row,
          seat,
          seatRow: `${row + 1}${seat}`,
        });
      }
    }
    return layout;
  }


  public assignSeatsToPassengers(passengers: any[]): Passenger[] {
    const pad = (num: number) => num.toString().padStart(2, '0');
    const key = (passenger: any) => `${pad(passenger.boardingGroup)}-${pad(passenger.boardingOrder)}`;

    let passengerGroups: { [key: string]: Passenger[] } = {};

    // Group passengers by their groupID
    passengers.forEach(passenger => {
      if (!passengerGroups[key(passenger)]) passengerGroups[key(passenger)] = [];
      passengerGroups[key(passenger)].push(passenger);
    });

    // console.log('Passenger Groups:', passengerGroups)
    const keys = Object.keys(passengerGroups);
    keys.forEach((key, index) => {
      let group = passengerGroups[key];
      console.log(key, group, index)
      // Assign seats to the group based on group size
      this.assignSeatsToGroup(group.length);
      group.forEach(passenger => {
        const seatIndex = this.seatAssigned.findIndex(seat => !seat);
        if (seatIndex >= 0) {
          this.seatAssigned[seatIndex] = true;
          passenger.seat = this.seats[seatIndex].seat;
          passenger.row = this.seats[seatIndex].row;
          passenger.seatRow = this.seats[seatIndex].seatRow;
          // passenger.orderAssigned = seatAssignmentIndex++;
        }
      });
    });

    return passengers;
  }

  public assignSeatsToGroup(groupSize: number): number[] {
    const preferredSeatsForGroup = this.preferredSeats(groupSize);

    let indexes: number[] = [];
    while (this.targetRow <= 24) {
      // Skip filled rows
      if (this.filledRows.has(this.targetRow)) {
        this.targetRow++;
        continue;
      }

      // Get preferred seat blocks for the target row
      let seatBlocksForRow = preferredSeatsForGroup.map(block =>
        block.map(seatIndex => seatIndex + (this.targetRow - 1) * 6)
      );

      for (let seatBlock of seatBlocksForRow) {
        indexes = seatBlock.filter(index => index >= 0 && index < this.seatAssigned.length);

        if (indexes.length === groupSize && this.canAssign(indexes)) {
          indexes.forEach(index => this.seatAssigned[index] = true);
          // If all seats in a row are assigned, add it to filledRows
          if (this.isRowFilled(this.targetRow)) {
            this.filledRows.add(this.targetRow);
          }
          this.printSeats();
          return indexes; // Assign the first available group and then stop
        }
      }

      // Move to the next row if no suitable seats found in this row
      this.targetRow++;
    }

    // If we've reached here, the plane is fully booked or no suitable seats were found
    console.error(`Unable to assign seats for a group of size ${groupSize}.`);
    this.printSeats();
    return []; // Return an empty array indicating no assignment was possible
  }

  private isRowFilled(rowNumber: number): boolean {
    const startIndex = (rowNumber - 1) * 6;
    return this.seatAssigned.slice(startIndex, startIndex + 6).every(Boolean);
  }

  private canAssign(indexes: number[]): boolean {
    // Ensure all indices are within bounds and currently false
    return indexes.every(index => !this.seatAssigned[index]);
  }

  public printSeats(): void {
    // Print the column numbers with proper spacing for up to three digits
    let header = '  ';
    for (let i = 1; i <= 24; i++) {
      header += i.toString().padStart(4, ' ');
    }
    console.log(header);

    // Row labels from 'A' to 'F'
    const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
    rowLabels.forEach((label, row) => {
      let rowDisplay = label + ' ';
      for (let col = 0; col < 24; col++) {
        const index = col * 6 + row;
        // Add placeholder for three digits, or an 'X' with padding if the seat is unassigned
        rowDisplay += this.seatAssigned[index] ? ' ███' : '   X';
      }
      console.log(rowDisplay);
    });
  }



  public preferredSeats(groupSize: number): number[][] {

    switch (groupSize) {
      case 2:
        return this.prefSeatsPairs();
      case 3:
        return this.prefSeats3();

      default:
        return this.prefSeatsSingles();
    }

  }




  // let random = Math.random();



  prefSeatsSingles(): number[][] {
    // A,F,C,D for 5 rows, alternating F,A,D,C
    // then E, B 

    let AFCD = this.letterToSeat("A,F,C,D"); // [[1], [6], [3], [4]]
    let FADC = this.letterToSeat("F,A,D,C"); // [[6], [4], [3], [1]];

    let CDAF = this.letterToSeat("C,D,A,F"); // [[4], [6], [1], [3]];
    let DCFA = this.letterToSeat("D,C,F,A"); // [[3], [1], [6], [4]];

    let EB = this.letterToSeat("E,B"); // [[2], [5]];
    let BE = this.letterToSeat("B,E"); // [[5], [2]];

    // 60% of the time, return AFCD
    // 40% of the time, return FADC

    let preferredSeats = [];
    let secondarySeats = [];
    // let random = Math.random();
    let random = .25;

    if (random < 0.3) {
      preferredSeats = AFCD;  //WILMA Port
      secondarySeats = EB;
    } else if (random < 0.6) { //WIMA Starboard
      preferredSeats = FADC;
      secondarySeats = BE;
    } else if (random < 0.8) { // Isle then window Port
      preferredSeats = CDAF;
      secondarySeats = EB;
    } else {                  // ILWMA Starboard
      preferredSeats = DCFA;
      secondarySeats = BE;
    }

    let result: number[][] = [];
    this.addPrefSeatsInHigherNumberedRows(result, preferredSeats, 1, 3);
    this.addPrefSeatsInLowerNumberedRows(result, preferredSeats, -1, -2);
    this.addPrefSeatsInHigherNumberedRows(result, preferredSeats, 4, 5);
    this.addPrefSeatsInLowerNumberedRows(result, preferredSeats, -3, -4);
    this.addPrefSeatsInHigherNumberedRows(result, secondarySeats, 1, 3);
    this.addPrefSeatsInHigherNumberedRows(result, secondarySeats, -1, -3);

    return result;
  }

  prefSeatsPairs(): number[][] {

    let ABBCDEEF = this.letterToSeat("AB,BC,DE,EF");
    let BCCDEEFA = this.letterToSeat("FE,DE,CB,BA");

    // 60% of the time, return port
    // 40% of the time, return aft

    let preferredSeats: number[][] = [];
    // let random = Math.random();
    let random = .25;

    if (random < 0.3) {
      preferredSeats = ABBCDEEF;  //  Port 
    } else if (random < 0.6) {    //  Starboard
      preferredSeats = BCCDEEFA;
    }

    let result: number[][] = [];
    this.addPrefSeatsInHigherNumberedRows(result, preferredSeats, 1, 4);
    this.addPrefSeatsInLowerNumberedRows(result, preferredSeats, -1, -2);
    this.addPrefSeatsInHigherNumberedRows(result, preferredSeats, 5, 8);
    this.addPrefSeatsInLowerNumberedRows(result, preferredSeats, -3, -4);

    return result;
  }

  prefSeats3(): number[][] {

    let ABBCDEEF = this.letterToSeat("ABC,DEF");
    let BCCDEEFA = this.letterToSeat("DEF,ABC");

    // 60% of the time, return port
    // 40% of the time, return aft

    let preferredSeats: number[][] = [];
    // let random = Math.random();
    let random = .25;

    if (random < 0.3) {
      preferredSeats = ABBCDEEF;  //  Port 
    } else if (random < 0.6) {    //  Starboard
      preferredSeats = BCCDEEFA;
    }

    let result: number[][] = [];
    this.addPrefSeatsInHigherNumberedRows(result, preferredSeats, 1, 4);
    this.addPrefSeatsInLowerNumberedRows(result, preferredSeats, -1, -2);
    this.addPrefSeatsInHigherNumberedRows(result, preferredSeats, 5, 8);
    this.addPrefSeatsInLowerNumberedRows(result, preferredSeats, -3, -4);

    return result;
  }

  prefSeats4(): number[][] {

    let ABCDBCDECDEF = this.letterToSeat("ABCD,BCDE,CDEF");
    let BCDECDCEDEF = this.letterToSeat("CDEF,BCDE,ABCD");

    let ABGHBCHICDJKDEKL = this.letterToSeat("ABGH,BCHI,CDJK,DEKL");
    let BCGHCDHIDEKJDEKL = this.letterToSeat("DEKL,CDJK,BCHI,ABGH");

    // 60% of the time, return port
    // 40% of the time, return aft

    let preferredSeats: number[][] = [];
    let secondarySeats: number[][] = [];

    // let random = Math.random();
    let random = .25;

    if (random < 0.3) {
      preferredSeats = ABCDBCDECDEF;  //  Port 
      secondarySeats = ABGHBCHICDJKDEKL;
    } else if (random < 0.6) {    //  Starboard
      preferredSeats = BCDECDCEDEF;
      secondarySeats = BCGHCDHIDEKJDEKL;
    }

    let result: number[][] = [];
    this.addPrefSeatsInHigherNumberedRows(result, preferredSeats, 1, 4);
    this.addPrefSeatsInLowerNumberedRows(result, preferredSeats, -1, -2);
    this.addPrefSeatsInHigherNumberedRows(result, preferredSeats, 5, 8);
    this.addPrefSeatsInLowerNumberedRows(result, preferredSeats, -3, -4);

    this.addPrefSeatsInHigherNumberedRows(result, secondarySeats, 1, 4);
    this.addPrefSeatsInLowerNumberedRows(result, secondarySeats, -1, -2);
    this.addPrefSeatsInHigherNumberedRows(result, secondarySeats, 5, 8);
    this.addPrefSeatsInLowerNumberedRows(result, secondarySeats, -3, -4);

    return result;
  }


  letterToSeat(input: string) {
    const noteToNumber: any = {
      'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6,
      'G': 7, 'H': 8, 'I': 9, 'J': 10, 'K': 11, 'L': 12
    };

    return input.split(',').map(group => {
      return group.split('').map(note => noteToNumber[note]);
    });
  }

  addPrefSeatsInHigherNumberedRows(result: number[][], seats: number[][], startRow: number, endRow: number) {
    for (let i = startRow - 1; i < endRow; i++) {
      seats.forEach(row => {
        result.push(row.map(x => x + i * 6));
      });
    }
  }

  addPrefSeatsInLowerNumberedRows(result: number[][], seats: number[][], startRow: number, endRow: number) {
    for (let i = startRow; i > endRow - 1; i--) {
      seats.forEach(row => {
        result.push(row.map(x => (x + i * 6) - 1));
      });
    }
  }



}
