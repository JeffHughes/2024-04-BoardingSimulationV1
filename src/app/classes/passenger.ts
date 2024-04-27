export class Passenger {
    id: number;
    name?: string;
    groupID?: number;
    groupSize?: number;
    bin?: number;
    slot?: number;
    boardingGroup?: number;
    boardingGroupLetter?: string;
    boardingOrder?: number;
    hasCarryOn?: boolean;

    seat?: string;
    row?: number;

    constructor(id: number) {
        this.id = id;
    }
}
