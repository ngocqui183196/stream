import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../../services/web-socket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements AfterViewInit, OnDestroy {
  @ViewChild('remoteVideo') remoteVideoRef!: ElementRef<HTMLVideoElement>;

  clients: string[] = [];
  errorMessage: string = '';
  private peerConnection: RTCPeerConnection | null = null;
  private subscriptions: Subscription[] = [];
  messages = [];

  form: FormGroup;

  constructor(
    private wsService: WebSocketService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      message: [''],

    })
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.remoteVideoRef) {
      this.errorMessage = 'Không tìm thấy phần tử video.';
      return;
    }
    this.setupSocket();
  }

  setupSocket(): void {
    // Lắng nghe client ID
    this.subscriptions.push(
      this.wsService.getUserId().subscribe((clientId: string) => {
        if (clientId && !this.clients.includes(clientId)) {
          this.clients.push(clientId);
        }
      })
    );

    // Lắng nghe client ngắt kết nối
    this.subscriptions.push(
      this.wsService.getMessages().subscribe(msg => {
        if (typeof msg === 'string' && msg.includes('disconect')) {
          const clientId = msg.slice(5, 25);
          this.clients = this.clients.filter(id => id !== clientId);
        }
      })
    );

    // Lắng nghe offer từ /media
    this.subscriptions.push(
      this.wsService.onOffer().subscribe(async (data: any) => {
        console.log('here');
        
        this.peerConnection = new RTCPeerConnection();
        this.peerConnection.ontrack = (event) => {
          if (this.remoteVideoRef) {
            this.remoteVideoRef.nativeElement.srcObject = event.streams[0];
          }
        };
        this.peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            this.wsService.sendIceCandidate(event.candidate, data.from);
          }
        };

        try {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          this.wsService.sendAnswer(answer, data.from);
        } catch (error: any) {
          this.errorMessage = 'Lỗi khi xử lý offer: ' + error.message;
          console.error('Lỗi khi xử lý offer:', error);
        }
      })
    );

    // Lắng nghe ICE candidate
    this.subscriptions.push(
      this.wsService.onIceCandidate().subscribe(async (data: any) => {
        if (!this.peerConnection) return;
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error: any) {
          this.errorMessage = 'Lỗi khi xử lý ICE candidate: ' + error.message;
          console.error('Lỗi khi xử lý ICE candidate:', error);
        }
      })
    );
  }

  stopVideo(): void {
    if (this.remoteVideoRef?.nativeElement) {
      this.remoteVideoRef.nativeElement.srcObject = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  ngOnDestroy(): void {
    this.stopVideo();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  wsConect() {
    this.wsService.connect()
  }

  disconect() {
    this.wsService.disconnect()
  }

  sendMessage(form: any) {
    console.log(form);
  }
}