import { Injectable } from '@angular/core';
import { Passenger } from '../classes/passenger';

type Seat = {
    row: number;
    seat: string;
    isOccupied: boolean;
    passengerId?: number;
    groupID?: number;
    orderAssigned?: number;

};

@Injectable({
    providedIn: 'root'
})
export class SeatService {
    public seatLayout: Seat[][];

    constructor() {
        this.seatLayout = this.initializeSeats();
        console.log(this.seatLayout);
    }

    private initializeSeats(): Seat[][] {
        let layout: Seat[][] = [];
        for (let row = 0; row < 24; row++) {
            layout.push([]);
            for (let seat of ['A', 'B', 'C', 'D', 'E', 'F']) {
                layout[row].push({
                    row: row + 1, // Add 1 to keep the row numbering starting at 1
                    seat: seat,
                    isOccupied: false
                });
            }
        }
        return layout;
    }

    assignSeatsToPassengers(passengers: Passenger[]): Passenger[] {

        let passengerGroups: { [groupID: number]: Passenger[] } = {};

        // Group passengers by their groupID
        passengers.forEach(passenger => {
            if (!passengerGroups[passenger.groupID!]) {
                passengerGroups[passenger.groupID!] = [];
            }
            passengerGroups[passenger.groupID!].push(passenger);
        });

        let seatAssignmentIndex = 1;
        // Process each group to assign seats
        Object.values(passengerGroups).forEach(group => {
            // Assuming the first passenger in the group has the correct bin and group size for all
            let seats = this.findClosestAvailableSeat(group[0].bin!, group[0].slot!, group[0].groupSize!);

            // Assign seats to each passenger in the group
            group.forEach((passenger, index) => {
                if (index < seats.length) { // Make sure we do not assign more passengers than seats available
                    let seat = seats[index];
                    const seatRowIndex = seat.row - 1; // Adjust for zero-based array index
                    const seatIndex = this.seatLayout[seatRowIndex].findIndex(s => s.seat === seat.seat);

                    // Verify that the seat was found before trying to assign it
                    if (seatIndex !== -1) {
                        // Update the seatLayout array directly with the new seat information
                        this.seatLayout[seatRowIndex][seatIndex].isOccupied = true;
                        this.seatLayout[seatRowIndex][seatIndex].passengerId = passenger.id;
                        this.seatLayout[seatRowIndex][seatIndex].groupID = passenger.groupID;
                        this.seatLayout[seatRowIndex][seatIndex].orderAssigned = seatAssignmentIndex++;

                        // Set passenger's seat and row information
                        passenger.seat = seat.seat;
                        passenger.row = seat.row;
                        passenger.seatRow = `${seat.row}${seat.seat}`;
                    } else {
                        // Log an error or handle the case where the seat is not found
                        console.error(`Seat not found: row ${seat.row}, seat ${seat.seat}`);
                    }
                }
            });
        });


        let availableSeats: Seat[] = [];
        this.seatLayout.forEach(row => {
            row.forEach(seat => {
                if (!seat.isOccupied) {
                    availableSeats.push(seat);
                }
            });
        });

        // Final pass to ensure every passenger has a seat using the list of available seats
        passengers.forEach(passenger => {
            if (!passenger.seat) {
                if (availableSeats.length > 0) {
                    const seat = availableSeats.shift()!; // Take the first available seat
                    seat.isOccupied = true;
                    seat.passengerId = passenger.id;
                    seat.groupID = passenger.groupID;

                    passenger.seat = seat.seat;
                    passenger.row = seat.row;
                    passenger.seatRow = `${seat.row}${seat.seat}`;
                } else {
                    console.error(`No available seats left for passenger ID: ${passenger.id}`);
                }
            }
        });

        return passengers;
    }

    getSeatBlocks(groupSize: number): string[][] {
        switch (groupSize) {
            case 1:
                return [['A', 'F', 'D', 'C'], ['B', 'E']];  // Priority for singles
            case 2:
                return [['A', 'B'], ['B', 'C'], ['D', 'E'], ['E', 'F']];
            case 3:
                return [['A', 'B', 'C'], ['D', 'E', 'F']];
            case 4:
                return [['A', 'B', 'C', 'D'], ['B', 'C', 'D', 'E'], ['C', 'D', 'E', 'F']];
            case 5:
                return [['A', 'B', 'C', 'D', 'E'], ['B', 'C', 'D', 'E', 'F']];
            case 6:
                return [['A', 'B', 'C', 'D', 'E', 'F']];
            default:
                return [['A'], ['F'], ['C'], ['D'], ['B'], ['E']];  // Default to single seats if no specific block matches
        }
    }

    public findClosestAvailableSeat(bin: number, slot: number, groupSize: number): Seat[] {
        // Constants and initialization
        const totalBins = 12;
        const maxRowOffset = 6;
        let invertBin = totalBins + 1 - bin;
        let stdTargetRow = invertBin * 2 - 1;
        let targetRow = (bin === 0 || slot === 0) ? 0 : stdTargetRow;

        // Preferred seat blocks setup
        const seatBlocks = this.getSeatBlocks(groupSize); // Assuming this returns an array of seat preference arrays.

        let assignedSeats: Seat[] = [];
        let rowOffset = 0;

        // Find seats within row offset limits
        while (rowOffset <= maxRowOffset && assignedSeats.length < groupSize) {
            let currentRows = this.getCurrentRows(targetRow, rowOffset);
            assignedSeats = this.tryAssignSeats(currentRows, seatBlocks, groupSize);
            if (assignedSeats.length >= groupSize) break;
            rowOffset++;
        }

        // Assign any remaining seats if not all seats were found in preferred rows
        if (assignedSeats.length < groupSize) {
            assignedSeats = [...assignedSeats, ...this.assignRemainingSeats(groupSize - assignedSeats.length)];
        }

        return assignedSeats;
    }

    private getCurrentRows(targetRow: number, rowOffset: number): number[] {
        let rows = [];
        if (targetRow - rowOffset >= 0) rows.push(targetRow - rowOffset);
        if (targetRow + rowOffset < this.seatLayout.length) rows.push(targetRow + rowOffset);
        return rows;
    }

    private tryAssignSeats(currentRows: number[], seatBlocks: string[][], groupSize: number): Seat[] {
        let assignedSeats = [];
        for (let row of currentRows) {
            for (let block of seatBlocks) {
                let availableSeats = this.getSeatsByPreference(row, block);
                if (availableSeats.length === block.length) {
                    availableSeats.forEach(seat => seat.isOccupied = true);
                    assignedSeats.push(...availableSeats);
                    if (assignedSeats.length >= groupSize) return assignedSeats;
                }
            }
        }
        return assignedSeats;
    }

    private getSeatsByPreference(row: number, preferences: string[]): Seat[] {
        let availableSeats: Seat[] = [];
        preferences.forEach(seatLetter => {
            let seatIndex = this.seatLayout[row].findIndex(s => s.seat === seatLetter && !s.isOccupied);
            if (seatIndex !== -1) availableSeats.push(this.seatLayout[row][seatIndex]);
        });
        return availableSeats;
    }

    private assignRemainingSeats(seatsNeeded: number): Seat[] {
        let remainingSeats: Seat[] = [];
        for (let row = 0; row < this.seatLayout.length && remainingSeats.length < seatsNeeded; row++) {
            let availableSeats = this.seatLayout[row].filter(seat => !seat.isOccupied);
            availableSeats.forEach(seat => {
                seat.isOccupied = true;
                remainingSeats.push(seat);
            });
        }
        return remainingSeats;
    }








    public findClosestAvailableSeat3(bin: number, slot: number, groupSize: number): Seat[] {
        const totalBins = 12; // TODO: make this a variable
        const maxRowOffset = 6; // Maximum number of rows to search up or down

        let invertBin = totalBins + 1 - bin; // Since bin numbers are reverse-ordered
        let stdTargetRow = invertBin * 2 - 1; // Each bin corresponds to 2 rows

        let targetRow = (bin === 0 || slot === 0) ? 0 : stdTargetRow; // Convert to zero-based index

        // Define preferred seat blocks for different group sizes
        const seatBlocks = {
            1: [['A', 'F', 'D', 'C'], ['B', 'E']], // Priority for singles
            2: [['A', 'B'], ['B', 'C'], ['D', 'E'], ['E', 'F']],
            3: [['A', 'B', 'C'], ['D', 'E', 'F']],
            4: [['A', 'B', 'C', 'D'], ['B', 'C', 'D', 'E'], ['C', 'D', 'E', 'F']],
            5: [['A', 'B', 'C', 'D', 'E'], ['B', 'C', 'D', 'E', 'F']],
            6: [['A', 'B', 'C', 'D', 'E', 'F']]
        }[groupSize] || [['A'], ['F'], ['C'], ['D'], ['B'], ['E']]; // Default to single seats if no specific block matches

        const getSeatsByPreference = (row: number, block: string[]): Seat[] => {
            if (row < 0 || row >= this.seatLayout.length) return []; // Guard against invalid row index
            return block.map(seatLetter => {
                let seatIndex = this.seatLayout[row].findIndex(s => s.seat === seatLetter && !s.isOccupied);
                return seatIndex !== -1 ? this.seatLayout[row][seatIndex] : null;
            }).filter(s => s !== null) as Seat[];
        };

        let assignedSeats: Seat[] = [];
        let rowOffset = 0;

        // Try to find seats according to preference for the group size
        while (rowOffset <= maxRowOffset && assignedSeats.length < groupSize) {
            let currentRows = [];
            if (targetRow - rowOffset >= 0) currentRows.push(targetRow - rowOffset);
            if (targetRow + rowOffset < this.seatLayout.length) currentRows.push(targetRow + rowOffset);

            for (let row of currentRows) {
                for (let block of seatBlocks) {
                    let availableSeats = getSeatsByPreference(row, block);
                    if (availableSeats.length === block.length) {
                        assignedSeats.push(...availableSeats);
                        assignedSeats.forEach(seat => seat.isOccupied = true);
                        break;
                    }
                }
                if (assignedSeats.length === groupSize) break;
            }
            if (assignedSeats.length < groupSize) rowOffset++;
        }

        // If no preferred blocks are available, assign the first available seats
        if (assignedSeats.length < groupSize) {
            for (let row = 0; row < this.seatLayout.length && assignedSeats.length < groupSize; row++) {
                let availableSeats = this.seatLayout[row].filter(seat => !seat.isOccupied);
                while (availableSeats.length > 0 && assignedSeats.length < groupSize) {
                    let seat = availableSeats.shift();
                    if (seat) {
                        seat.isOccupied = true;
                        assignedSeats.push(seat);
                    }
                }
            }
        }

        return assignedSeats;
    }


    public findClosestAvailableSeat2(bin: number, slot: number, groupSize: number): Seat[] {
        const totalBins = 12; // TODO: make this a variable
        const maxRowOffset = 6; // Maximum number of rows to search up or down

        let invertBin = totalBins + 1 - bin; // Since bin numbers are reverse-ordered
        let stdTargetRow = invertBin * 2 - 1; // Each bin corresponds to 2 rows

        let targetRow = (bin === 0 || slot === 0) ? 0 : stdTargetRow; // Convert to zero-based index

        const seatBlocks = {
            1: [['A', 'F', 'D', 'C'], ['B', 'E']], // Priority for singles
            2: [['A', 'B'], ['B', 'C'], ['D', 'E'], ['E', 'F']],
            3: [['A', 'B', 'C'], ['D', 'E', 'F']],
            4: [['A', 'B', 'C', 'D'], ['B', 'C', 'D', 'E'], ['C', 'D', 'E', 'F']],
            5: [['A', 'B', 'C', 'D', 'E'], ['B', 'C', 'D', 'E', 'F']],
            6: [['A', 'B', 'C', 'D', 'E', 'F']]
        }[groupSize];

        const getSeatsByPreference = (row: number, preferences: string[]): Seat[] => {
            if (row < 0 || row >= this.seatLayout.length) return []; // Guard against invalid row index
            let availableSeats: Seat[] = [];
            preferences.forEach((block: any) => {
                let seats = block.map((seatLetter: any) => {
                    let seatIndex = this.seatLayout[row].findIndex(s => s.seat === seatLetter && !s.isOccupied);
                    return seatIndex !== -1 ? this.seatLayout[row][seatIndex] : null;
                }).filter((s: any) => s !== null);
                if (seats.length === block.length) {
                    availableSeats.push(...seats);
                }
            });
            return availableSeats;
        };

        let assignedSeats: Seat[] = [];
        let rowOffset = 0;

        while (rowOffset <= maxRowOffset && assignedSeats.length < groupSize) {
            let currentRows = [];
            if (targetRow - rowOffset >= 0) currentRows.push(targetRow - rowOffset);
            if (targetRow + rowOffset < this.seatLayout.length) currentRows.push(targetRow + rowOffset);

            for (let row of currentRows) {
                for (let preference of seatBlocks!) {
                    let availableSeats = getSeatsByPreference(row, preference);
                    if (availableSeats.length === groupSize) {
                        assignedSeats.push(...availableSeats);
                        assignedSeats.forEach(seat => seat.isOccupied = true);
                        break;
                    }
                }
                if (assignedSeats.length === groupSize) break;
            }
            if (assignedSeats.length < groupSize) rowOffset++;
        }

        if (assignedSeats.length < groupSize) {
            for (let row = 0; row < this.seatLayout.length && assignedSeats.length < groupSize; row++) {
                let availableSeats = this.seatLayout[row].filter(seat => !seat.isOccupied);
                while (availableSeats.length > 0 && assignedSeats.length < groupSize) {
                    let seat = availableSeats.shift();
                    if (seat) {
                        seat.isOccupied = true;
                        assignedSeats.push(seat);
                    }
                }
            }
        }

        return assignedSeats;
    }


    ensureEveryPassengerHasASeat(passengers: Passenger[]): void {
        passengers.forEach(passenger => {
            if (!passenger.seat) {
                // If the passenger doesn't have a seat, find the first available seat
                for (let i = 0; i < this.seatLayout.length; i++) { // Use index-based loop
                    for (let j = 0; j < this.seatLayout[i].length; j++) { // Inner loop over the seats
                        let seat = this.seatLayout[i][j];
                        if (!seat.isOccupied) {
                            // Assign the seat to the passenger
                            seat.isOccupied = true;
                            seat.passengerId = passenger.id;
                            seat.groupID = passenger.groupID;
                            passenger.seat = seat.seat;
                            passenger.row = seat.row;
                            return; // Exit the function since we've assigned a seat
                        }
                    }
                }
            }
        });
    }

    // Call this method to log total available and assigned seats
    logSeatAssignments(passengers: Passenger[]): void {
        let totalSeats = 0;
        let assignedSeats = 0;
        this.seatLayout.forEach(row => {
            totalSeats += row.length;
            assignedSeats += row.filter(seat => seat.isOccupied).length;
        });
        const unassignedSeats = totalSeats - assignedSeats;
        const totalPassengers = passengers.length;
        const unassignedPassengers = passengers.filter(p => !p.seat).length;

        console.log(`Total seats: ${totalSeats}`);
        console.log(`Assigned seats: ${assignedSeats}`);
        console.log(`Unassigned seats: ${unassignedSeats}`);
        console.log(`Total passengers: ${totalPassengers}`);
        console.log(`Unassigned passengers: ${unassignedPassengers}`);
        console.log(`Percentage of passengers with assigned seats: ${(assignedSeats / totalPassengers * 100).toFixed(2)}%`);

        // if not 100% of seats assigned, show a big error 
        if (assignedSeats !== totalPassengers) {
            console.error('ERROR: Not all passengers have been assigned a seat!');
        }

    }




}
