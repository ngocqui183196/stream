import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'app-a-com',
  templateUrl: './a-com.component.html',
  styleUrl: './a-com.component.css'
})
export class AComComponent {
  value: number[] = [10];
  constructor(private cd: ChangeDetectorRef) {
    // setTimeout(() => {
    //   //  this.value.push(200)

    //   this.value = [23, 34, 456]
    // }
     
    // , 1110)
   }

   handleValue() {
    this.value.push(2344);
    this.cd.markForCheck();
   }
}
