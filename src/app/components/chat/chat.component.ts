import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, Validators} from '@angular/forms';
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
  messages: any[] = [];

  form: FormGroup;

  constructor(
    private wsService: WebSocketService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      message: ['', Validators.required],

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

    // Lắng nghe client sendMess
    this.subscriptions.push(
      this.wsService.getMessages().subscribe(msg => {
        if (typeof msg === 'object' && !!msg.clientId) {

          const newData = [...this.messages, msg]
          this.messages = newData;
        }
      })
    );

    // Lắng nghe offer từ /media
    this.subscriptions.push(
      this.wsService.onOffer().subscribe(async (data: any) => {

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
    form.get('message')?.setValue((form.get('message')?.value).trim())
    if (form.get('message')?.invalid) return
    this.wsService.sendMessage(form.get('message')?.value)
  }
}
