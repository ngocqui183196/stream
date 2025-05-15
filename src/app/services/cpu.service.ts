import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CPUService {

  constructor(@Inject('CPU_SPEED') public speed: string) { }

  start() {
    console.log(`CPU speed ${this.speed}`);
  }
}
