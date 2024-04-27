import { Injectable } from '@angular/core';
import { Passenger } from '../classes/passenger';

type Seat = {
    row: number;
    seat: string;
    isOccupied: boolean;
    passengerId?: number;
    groupID?: number;
};

@Injectable({
    providedIn: 'root'
})
export class SeatService {
    public  seatLayout: Seat[][];

    constructor() {
        this.seatLayout = this.initializeSeats();
    }

    private initializeSeats(): Seat[][] {
        let layout: Seat[][] = [];
        for (let row = 1; row <= 24; row++) {
            layout[row] = [];
            for (let seat of ['A', 'B', 'C', 'D', 'E', 'F']) {
                layout[row].push({
                    row: row,
                    seat: seat,
                    isOccupied: false
                });
            }
        }
        return layout;
    }

    assignSeatsToPassengers(passengers: Passenger[]): Passenger[] {

        for (let passenger of passengers) {
            let seats = this.findClosestAvailableSeat(passenger.bin!, passenger.groupSize!);
            for (let seat of seats) {
                seat.isOccupied = true;
                seat.passengerId = passenger.id;
                seat.groupID = passenger.groupID;
            }
            if (seats.length > 0) {
                passenger.seat = seats.map(s => s.seat).join(",");
                passenger.row = seats[0].row;
            }
        }
        return passengers;
    }



    public findClosestAvailableSeat(bin: number, slot: number, groupSize: number): Seat[] {

        // First, we convert the bin to the actual row number
        let invertBin = 13 - bin; // Since bin numbers are reverse-ordered

        let targetRow = invertBin * 2; // Each bin corresponds to 2 rows
        // TODO: figureout the actual ratio 

            const seatPreference = slot > 7 ?
                    ['F', 'A', 'D', 'E', 'E', 'B'] :
            ['A', 'F', 'C', 'D', 'B', 'E']; 


        // Helper function to get seats by preference for a given row
        const getSeatsByPreference = (row: number): Seat[] => {
            let availableSeats: Seat[] = [];
            for (let seatLetter of seatPreference) {
                try {
                    let seat = this.seatLayout[row].find(s => s.seat === seatLetter && !s.isOccupied);
                    if (seat) availableSeats.push(seat);
                } catch (error) { }
            }
            return availableSeats;
        };

        let assignedSeats: Seat[] = [];

        // We need to check for contiguous seats, starting from the target row and moving outwards
        let rowOffset = 0;
        let foundSeats = false;

        while (!foundSeats && (targetRow - rowOffset >= 1 || targetRow + rowOffset <= 24)) { // TODO: make 24 a variable
            let seatsBelow = targetRow + rowOffset <= 24 ? getSeatsByPreference(targetRow + rowOffset) : [];
            let seatsAbove = targetRow - rowOffset >= 1 ? getSeatsByPreference(targetRow - rowOffset) : [];

            // Check if enough contiguous seats are available in either row
            for (let seatsArray of [seatsBelow, seatsAbove]) {
                if (seatsArray.length >= groupSize) {
                    // Assign seats and mark as occupied
                    for (let i = 0; i < groupSize; i++) {
                        assignedSeats.push(seatsArray[i]);
                        seatsArray[i].isOccupied = true;
                    }
                    foundSeats = true;
                    break;
                }
            }

            // If not found, increase the offset to check the next set of rows
            if (!foundSeats) {
                rowOffset++;
            }
        }

        // If we can't find enough contiguous seats, we'll assign whatever we can find
        if (!foundSeats) {
            let attempts = 0;
            while (assignedSeats.length < groupSize && attempts < 48) { // Each row has 6 seats, 24 rows in total
                let rowToTry = attempts % 24 + 1;
                let seatsInRow = getSeatsByPreference(rowToTry);
                if (seatsInRow.length > 0) {
                    assignedSeats.push(seatsInRow[0]);
                    seatsInRow[0].isOccupied = true;
                }
                attempts++;
            }
        }

        return assignedSeats;
    }







}
