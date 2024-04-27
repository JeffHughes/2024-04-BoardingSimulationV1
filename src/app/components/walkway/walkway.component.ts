import { Component } from '@angular/core';

@Component({
  selector: 'app-walkway',
  standalone: true,
  imports: [],
  templateUrl: './walkway.component.html',
  styleUrl: './walkway.component.scss'
})
export class WalkwayComponent {


  walkwayOrder() {
    return Array.from({ length: 20 }, (v, k) => k + 1) ;
  }

  walkwayOrderReverse() {
    return Array.from({ length: 20 }, (v, k) => k + 1).reverse();
  }

  getID(order: any) {
    let ID = `path-${order}`;

    // if (!this.layout.layoutSquares[ID]) {
    //   setTimeout(() => {
    //     let item = document.getElementById(ID);
    //     let boundingRect = item!.getBoundingClientRect();
    //     this.layout.layoutSquares[ID] = boundingRect;
    //   }, 1000);
    // }

    return ID;
  }


}
