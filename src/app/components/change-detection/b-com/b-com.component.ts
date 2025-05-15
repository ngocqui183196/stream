import { ChangeDetectionStrategy, Component, Input, DoCheck, OnChanges, SimpleChanges, ChangeDetectorRef} from '@angular/core';

@Component({
  selector: 'app-b-com',
  templateUrl: './b-com.component.html',
  styleUrl: './b-com.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BComComponent implements DoCheck {

  @Input() value: number[] = [0];
  oldLenght = this.value.length


  constructor(
    private cdr: ChangeDetectorRef
  ) {

  }

  

  ngDoCheck() {
    console.log('abc');
    console.log(this.value);
    if(this.value.length != this.oldLenght) {
      console.log('Vào đây không?');
      // this.cdr.detectChanges();
      this.cdr.markForCheck();
    }
    console.log('----------');
    console.log('   ');
    
  }
  
  ngOnChanges(change: SimpleChanges) {
    console.log(change);
    this.oldLenght = this.value.length;
  }

  handleEvent() {
    console.log('check');
  }
}
