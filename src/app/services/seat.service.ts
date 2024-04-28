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



    findClosestAvailableSeat(bin: number, slot: number, groupSize: number): Seat[] {

        const totalBins = 12; // TODO: make this a variable
        const maxRowOffset = 6; // Maximum number of rows to search up or down

        // First, we convert the bin to the actual row number
        let invertBin = totalBins + 1 - bin; // Since bin numbers are reverse-ordered
        let targetRow = invertBin * 2 - 1; // Each bin corresponds to 2 rows

        // Define preferred seat blocks for different group sizes
        const seatBlocks = groupSize === 2 ? [['A', 'B'], ['B', 'C'], ['D', 'E'], ['E', 'F']] :
            groupSize === 3 ? [['A', 'B', 'C'], ['D', 'E', 'F']] :
                groupSize === 4 ? [['A', 'B', 'C', 'D'], ['B', 'C', 'D', 'E'], ['C', 'D', 'E', 'F']] :
                    groupSize === 5 ? [['A', 'B', 'C', 'D', 'E'], ['B', 'C', 'D', 'E', 'F']] :
                        groupSize === 6 ? [['A', 'B', 'C', 'D', 'E', 'F']] : [['A'], ['F'], ['C'], ['D'], ['B'], ['E']]; // Default to single seats if no specific block matches


        // Define a function to find seats by the preferred blocks
        const getSeatsByPreference = (row: number, preferences: string[]): Seat[] => {
            if (row < 0 || row >= this.seatLayout.length) return []; // Guard against invalid row index
            let availableSeats: Seat[] = [];
            for (let seatLetter of preferences) {
                let seatIndex = this.seatLayout[row].findIndex(s => s.seat === seatLetter);
                if (seatIndex !== -1 && !this.seatLayout[row][seatIndex].isOccupied) {
                    availableSeats.push(this.seatLayout[row][seatIndex]);
                }
            }
            return availableSeats;
        };

        let assignedSeats: Seat[] = [];
        let rowOffset = 0;

        // Try to find seats according to preference for the group size
        while (rowOffset <= maxRowOffset) {
            let currentRowAbove = targetRow - rowOffset;
            let currentRowBelow = targetRow + rowOffset;

            // Try to find a block of seats that fits the group size in one row
            for (let block of seatBlocks) {
                let seatsAbove = currentRowAbove >= 1 ? getSeatsByPreference(currentRowAbove, block) : [];
                let seatsBelow = currentRowBelow <= 24 ? getSeatsByPreference(currentRowBelow, block) : [];

                if (seatsAbove.length === block.length) {
                    seatsAbove.forEach(seat => seat.isOccupied = true);
                    return seatsAbove;
                } else if (seatsBelow.length === block.length) {
                    seatsBelow.forEach(seat => seat.isOccupied = true);
                    return seatsBelow;
                }
            }

            rowOffset++;
        }

        // If no preferred blocks are available, assign the first available seats
        if (assignedSeats.length < groupSize) {
            for (let row = 1; row <= 24 && assignedSeats.length < groupSize; row++) {
                const availableSeats = this.seatLayout[row]?.filter(seat => !seat.isOccupied);
                while (availableSeats?.length > 0 && assignedSeats?.length < groupSize) {
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
