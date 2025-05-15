import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../../services/web-socket.service';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class VideoCallComponent implements AfterViewInit, OnDestroy {
  @ViewChild('localVideo') localVideoRef!: ElementRef<HTMLVideoElement>;

  videoDevices: MediaDeviceInfo[] = [];
  selectedVideoDeviceId = new FormControl('');
  clients: string[] = [];
  streams: { clientId: string; stream: MediaStream }[] = []; // Lưu stream từ client khác
  private stream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map(); // Lưu RTCPeerConnection cho mỗi client
  errorMessage: string = '';
  private subscriptions: Subscription[] = [];
  form: FormGroup;
  messages: string[] = [];

  constructor(
    private wsService: WebSocketService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      message: [''],
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.localVideoRef) {
      this.errorMessage = 'Không tìm thấy phần tử video.';
      return;
    }
    await this.loadDevices();
    this.setupSocket();
  }

  async loadDevices(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.videoDevices = devices.filter(device => device.kind === 'videoinput');
      this.selectedVideoDeviceId.setValue(this.videoDevices[0]?.deviceId || '');
    } catch (error: any) {
      this.errorMessage = 'Không thể liệt kê thiết bị: ' + error.message;
      console.error('Lỗi khi liệt kê thiết bị:', error);
    }
  }

  setupSocket(): void {
    // Lắng nghe client ID
    this.subscriptions.push(
      this.wsService.getUserId().subscribe((clientId: string) => {
        if (clientId && !this.clients.includes(clientId)) {
          this.clients.push(clientId);
          // Tự động gọi client mới nếu đang gửi stream
          if (this.stream) {
            this.callClient(clientId);
          }
        }
      })
    );

    // Lắng nghe client ngắt kết nối
    this.subscriptions.push(
      this.wsService.getMessages().subscribe((msg: any) => {
        
        if (!!msg.message && typeof msg.message === 'string' && msg.message.includes('disconect')) {
          const clientId = msg.slice(5, 25);
          this.clients = this.clients.filter(id => id !== clientId);
          this.streams = this.streams.filter(s => s.clientId !== clientId);
          const pc = this.peerConnections.get(clientId);
          if (pc) {
            pc.close();
            this.peerConnections.delete(clientId);
          }
        } else if (typeof msg.message === 'string') {
          this.messages.push(msg); // Hiển thị tin nhắn chat
        }
      })
    );

    // Lắng nghe offer từ client khác
    this.subscriptions.push(
      this.wsService.onOffer().subscribe(async (data: any) => {
        let peerConnection = this.peerConnections.get(data.from);
        if (!peerConnection) {
          peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
          });
          this.peerConnections.set(data.from, peerConnection);

          // Xử lý stream nhận được
          peerConnection.ontrack = (event) => {
            if (event.streams[0]) {
              this.streams = this.streams.filter(s => s.clientId !== data.from);
              this.streams.push({ clientId: data.from, stream: event.streams[0] });
            }
          };

          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              this.wsService.sendIceCandidate(event.candidate, data.from);
            }
          };

          // Nếu đang gửi stream, thêm tracks vào peer connection
          if (this.stream) {
            this.stream.getTracks().forEach(track => peerConnection!.addTrack(track, this.stream!));
          }
        }

        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          this.wsService.sendAnswer(answer, data.from);
        } catch (error: any) {
          this.errorMessage = 'Lỗi khi xử lý offer: ' + error.message;
          console.error('Lỗi khi xử lý offer:', error);
        }
      })
    );

    // Lắng nghe answer từ client khác
    this.subscriptions.push(
      this.wsService.onAnswer().subscribe(async (data: any) => {
        const peerConnection = this.peerConnections.get(data.from);
        if (!peerConnection) return;
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (error: any) {
          this.errorMessage = 'Lỗi khi xử lý answer: ' + error.message;
          console.error('Lỗi khi xử lý answer:', error);
        }
      })
    );

    // Lắng nghe ICE candidate
    this.subscriptions.push(
      this.wsService.onIceCandidate().subscribe(async (data: any) => {
        const peerConnection = this.peerConnections.get(data.from);
        if (!peerConnection) return;
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error: any) {
          this.errorMessage = 'Lỗi khi xử lý ICE candidate: ' + error.message;
          console.error('Lỗi khi xử lý ICE candidate:', error);
        }
      })
    );
  }

  async startVideo(): Promise<void> {
    try {
      this.stopVideo();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.errorMessage = 'Trình duyệt không hỗ trợ WebRTC';
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: this.selectedVideoDeviceId.value ? { deviceId: { exact: this.selectedVideoDeviceId.value }, width: 640, height: 480 } : { width: 640, height: 480 },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localVideoRef.nativeElement.srcObject = this.stream;

      // Gọi tất cả client hiện có
      for (const clientId of this.clients) {
        await this.callClient(clientId);
      }

      this.errorMessage = '';
    } catch (error: any) {
      if (error.name === 'NotReadableError') {
        this.errorMessage = 'Không thể truy cập webcam. Vui lòng kiểm tra thiết bị.';
      } else {
        this.errorMessage = `Lỗi khi bắt đầu video: ${error.message}`;
      }
      console.error('Lỗi khi truy cập media:', error);
    }
  }

  async callClient(clientId: string): Promise<void> {
    if (!this.stream || this.peerConnections.has( clientId)) {
      return;
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    this.peerConnections.set(clientId, peerConnection);

    // Thêm tracks từ stream
    this.stream.getTracks().forEach(track => peerConnection.addTrack(track, this.stream!));

    // Xử lý ICE candidate
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.wsService.sendIceCandidate(event.candidate, clientId);
      }
    };

    // Xử lý stream nhận được
    peerConnection.ontrack = (event) => {
      if (event.streams[0]) {
        this.streams = this.streams.filter(s => s.clientId !== clientId);
        this.streams.push({ clientId, stream: event.streams[0] });
      }
    };

    try {
      const offer = await peerConnection.createOffer();
      // Để tối ưu hóa hiệu suất
      offer.sdp = offer.sdp?.replace('b=AS:.*\r\n', 'b=AS:512\r\n'); // Giới hạn 512kbps
      await peerConnection.setLocalDescription(offer);
      this.wsService.sendOffer(offer, clientId);
    } catch (error: any) {
      this.errorMessage = `Lỗi khi gọi ${clientId}: ${error.message}`;
      console.error(`Lỗi khi gọi ${clientId}:`, error);
      this.peerConnections.delete(clientId);
    }
  }

  stopVideo(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.localVideoRef?.nativeElement) {
      this.localVideoRef.nativeElement.srcObject = null;
    }
    this.peerConnections.forEach((pc, clientId) => {
      pc.close();
    });
    this.peerConnections.clear();
    this.streams = [];
  }

  wsConnect() {
    this.wsService.connect();
  }

  disconnect() {
    this.wsService.disconnect();
  }

  sendMessage(form: any) {
    const message = form.value.message;
    if (message) {
      this.wsService.sendMessage(message);
      this.form.reset();
    }
  }

  ngOnDestroy(): void {
    this.stopVideo();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}