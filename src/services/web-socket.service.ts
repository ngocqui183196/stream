import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket;
  private user$ = new BehaviorSubject<string>('');
  private messages$ = new ReplaySubject<any>(4);
  private offer$ = new Subject<any>();
  private answer$ = new Subject<any>();
  private iceCandidate$ = new Subject<any>();

  constructor() {
    // Kết nối tới server socket.io
    this.socket = io('http://localhost:4500', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server:', this.socket.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Nhận client ID
    this.socket.on('user', (clientId: string) => {
      this.user$.next(clientId);
    });

    // Nhận thông báo ngắt kết nối
    this.socket.on('userDisconnected', (clientId: string) => {
      this.user$.next(clientId); // Có thể dùng Subject riêng nếu cần
    });

    // Nhận signaling messages
    this.socket.on('offer', (data: any) => {
      this.offer$.next(data);
    });

    this.socket.on('answer', (data: any) => {
      this.answer$.next(data);
    });

    this.socket.on('icecandidate', (data: any) => {
      console.log('Received ICE candidate:', data);
      this.iceCandidate$.next(data);
    });

    // Nhận response (dành cho debug hoặc chat text nếu cần)
    this.socket.on('listenMessage', (msg: any) => {
      console.log(msg)
      this.messages$.next(msg);
    });
  }

  // Lấy socket instance
  getSocket(): Socket {
    return this.socket;
  }

  // Observable cho client ID
  getUserId(): Observable<string> {
    return this.user$.asObservable();
  }

  // Observable cho messages (debug hoặc chat text)
  getMessages(): Observable<any> {
    return this.messages$.asObservable();
  }

  // Observable cho signaling
  onOffer(): Observable<any> {
    return this.offer$.asObservable();
  }

  onAnswer(): Observable<any> {
    return this.answer$.asObservable();
  }

  onIceCandidate(): Observable<any> {
    return this.iceCandidate$.asObservable();
  }

  // Gửi signaling messages
  sendOffer(offer: any, to: string): void {
    console.log('send offer')
    this.socket.emit('offer', { offer, to });
  }

  sendAnswer(answer: any, to: string): void {
    this.socket.emit('answer', { answer, to });
  }

  sendIceCandidate(candidate: any, to: string): void {
    this.socket.emit('icecandidate', { candidate, to });
  }

  // Gửi message chung (dành cho debug hoặc chat text)
  sendMessage(message: any): void {
    const data = { message, clientId: this.socket.id}
    this.socket.emit('sendMessage', data);
  }

  // Kết nối lại nếu cần
  connect(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  // Ngắt kết nối
  disconnect(): void {
    this.socket.disconnect();
  }
}
