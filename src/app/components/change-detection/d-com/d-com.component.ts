import { ChangeDetectorRef, Component, DoCheck, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-d-com',
  templateUrl: './d-com.component.html',
  styleUrl: './d-com.component.css'
})
export class DComComponent implements OnChanges{
  
    @Input() value: number[] = [];

    constructor(private cdr: ChangeDetectorRef) {
      
    }
  ngOnChanges(changes: SimpleChanges): void {
    
    console.log(changes);
    
  }
    // ngDoCheck(): void {
    //   console.log(this.value);
    //   this.cdr.markForCheck();
    // }
}
