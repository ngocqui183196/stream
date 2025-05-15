import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { CPUService } from './services/cpu.service';
import { OCCPUService } from './services/occpu.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [
    // { provide: 'CPU_SPEED' , useValue: '3.5 GHz'}
  ]
})
export class AppComponent implements OnInit {
  title = 'fcm-angular-demo';

  constructor(private cpu: CPUService) {}

  ngOnInit(): void {
    // interval(1000).subscribe((i) => {
    //   console.log('AppComponent.ngOnInit');
    //   this.title = `AppComponent ${i}`
    // })
    
  }

  fal() {
    this.cpu.start()
  }
}
 