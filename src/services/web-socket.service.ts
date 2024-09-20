import {Injectable, OnInit} from '@angular/core';
import { io, Socket } from 'socket.io-client';
import {BehaviorSubject, Observable, ReplaySubject, Subject, take} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnInit{
  private socket: Socket;
  message: any;

  user$ = new BehaviorSubject('');
  messages$ = new ReplaySubject(4);

  constructor() {

    // Kết nối tới WebSocket server tại cổng 4500
    this.socket = io('ws://localhost:4500', {transports: ['websocket']});
    console.log(this.socket.connected)
    this.socket.on('connect', () => {
      console.log('Connected to server');
      // this.socket.emit('message', 'Hello from client');
    });

    this.socket.on('message', (message: string) => {
      console.log('Received:', message);
      this.socket.emit('message',)
      // this.message = message;
    });

    this.socket.on('response', (msg: any) => {
      console.log('Received response:', msg);
      this.messages$.next(msg)
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('user', (data: string) => {
      this.user$.next(data)
    })
  }


  ngOnInit() {
  }
  // getUserId(): Observable<string> {
  //   return this.user$.asObservable();
  // }

  sendMessage(message: any) {
    // console.log(message)
    this.socket.emit('message', message);
  }

  onMessage(callback: (message: string) => void) {
    this.socket.on('message', callback);
  }

  disconnect() {
    this.socket.disconnect();
  }

  connect() {
    this.socket.connect()
    this.socket.open()
  }
}
