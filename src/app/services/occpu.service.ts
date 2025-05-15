import { Inject, Injectable } from '@angular/core';
import { CPUService } from './cpu.service';

@Injectable({
  providedIn: 'root'
})
export class OCCPUService{

  constructor(@Inject('OCCPU_SPEED') public speed: string) {
    // super(speed);
  }

    start(): void {
      console.log(`OCCPU speed ${this.speed}`);
   }
}
