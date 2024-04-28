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



    public findClosestAvailableSeat(bin: number, slot: number, groupSize: number): Seat[] {

        const totalBins = 12; // TODO: make this a variable
        // First, we convert the bin to the actual row number
        let invertBin = totalBins + 1 - bin; // Since bin numbers are reverse-ordered

        let targetRow = invertBin * 2; // Each bin corresponds to 2 rows
        // TODO: figureout the actual ratio of bins to seats 

        const seatPreference = slot >= 7 ?
            ['F', 'A', 'D', 'E', 'E', 'B'] :
            ['A', 'F', 'C', 'D', 'B', 'E'];

        // if there are 6 members in the group
        // we'll take ABCDEF, or ABC, ABC 2 rows, or  DEF, DEF as a first choice  
        // 
        // if there are 2 members in the group 
        // AB, BC, DE, or EF are preferred
        // 
        // If there are 3 members ABC or DEF 
        // 
        // 4 members: ABC D, BC DE, or CDEF
        // 
        // 5 members: ABC DE, or BC DEF, or AB ABC, or DE DEF or BC ABC or EF DEF 
        // 
        // if you can't find one of the first choices, check the next row back before giving up

        if (bin == 0) {
            targetRow = 1;
        }

        const getSeatsByPreference = (row: number): Seat[] => {
            let availableSeats: Seat[] = [];
            for (let seatLetter of seatPreference) {
                let seat = this.seatLayout[row]?.find(s => s.seat === seatLetter && !s.isOccupied);
                if (seat) availableSeats.push(seat);
            }
            return availableSeats;
        };

        let assignedSeats: Seat[] = [];
        let rowOffset = 0;
        let foundSeats = false;


        while (!foundSeats && (targetRow - rowOffset >= 1 || targetRow + rowOffset <= 24)) { // TODO: make 24 a variable
            let seatsBelow = targetRow + rowOffset <= 24 ? getSeatsByPreference(targetRow + rowOffset) : [];
            let seatsAbove = targetRow - rowOffset >= 1 ? getSeatsByPreference(targetRow - rowOffset) : [];

            // Check if enough contiguous seats are available in either row
            for (let seatsArray of [seatsBelow, seatsAbove]) {
                if (seatsArray.length >= groupSize) {
                    for (let i = 0; i < groupSize; i++) {
                        assignedSeats.push(seatsArray[i]);
                        seatsArray[i].isOccupied = true;
                    }
                    foundSeats = true;
                    break;
                }
            }

            if (!foundSeats) rowOffset++;
        }

        // If we can't find enough contiguous seats, we'll assign whatever we can find
        if (!foundSeats) {
            let attempts = 0;
            while (assignedSeats.length < groupSize && attempts < this.seatLayout.length * seatPreference.length) {
                let rowToTry = attempts % this.seatLayout.length + 1;
                let seatsInRow = getSeatsByPreference(rowToTry);
                if (seatsInRow.length > 0) {
                    let seat = seatsInRow[0];
                    assignedSeats.push(seat);
                    seat.isOccupied = true;
                    attempts += seatPreference.length - seatsInRow.indexOf(seat); // Skip to next row after finding a seat
                } else {
                    attempts += seatPreference.length; // Skip to next row if no seats are available
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
