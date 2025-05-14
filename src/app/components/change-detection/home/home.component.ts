import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  title = 'Home component'

  value: number[] = []
  constructor() {

  }
  ngOnInit() {
    // interval(1000).subscribe((i) => {
    //   console.log('Home component.ngOnInit');
    //   this.title = `Home Component ${i}`
    // })
  }

  handleValue() {

    this.value.push(2223)
    // this.value = [45,2345]
  }
}
