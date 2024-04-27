import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor() { }

  config: any = signal(
    {
      "maxPassengers": 143,

      "seatRows": 24, // maxPassengers / 6
      "overheadBinRows": 12, // seatRows / 2

      "cabinLengthMeters": 30,
    }

  )

  async get() {
    //if (this.config) return this.config; 
    return this.config();
  }

  getABCRows() {
    return ['A', 'B', 'C']
  }

  getDEFRows() {
    return ['D', 'E', 'F']
  }

  seatRows() {
    const length = this.config().seatRows;
    return Array.from({ length }, (v, k) => k + 1);
  }

  overheadBins() {
    length = this.config().overheadBinRows;
    return Array.from({ length }, (v, k) => k + 1).reverse();
  }

  cabinPathway() {
    const length = this.config().cabinLengthMeters;
    return Array.from({ length }, (v, k) => k + 1).reverse();
  }

  seatID(row: any, letter: string) {
    return `seat-${row}-${letter}`;
  }

  seatStyle() {
    const rows = this.config().overheadBinRows;
    const width = "calc(100 % / " + (rows ) + ")";
    return {
      border: "1px solid black",
      width,
      "text-align": "center",
      "vertical-align": "middle",
    }

  }


}
