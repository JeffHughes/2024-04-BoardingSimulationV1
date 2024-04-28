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

    seatRow?: string;


    constructor(id: number, name: string, groupID: number, groupSize: number) {
        this.id = id;
        this.name = name;
        this.groupID = groupID;
        this.groupSize = groupSize;
    }

}
