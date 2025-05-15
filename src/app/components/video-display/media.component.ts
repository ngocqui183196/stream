import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../../services/web-socket.service';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css'],
})
export class MediaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('localVideo') localVideoRef!: ElementRef<HTMLVideoElement>;

  formGroup: FormGroup;

  videoDevices: MediaDeviceInfo[] = [];
  selectedVideoDeviceId= new FormControl();
  clients: string[] = [];
  selectedClientId = new FormControl('');
  private stream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  errorMessage: string = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private wsService: WebSocketService,
    private fb: FormBuilder
  ) {
this.formGroup = this.fb.group({
  selectedClientId: [''],
  selectedVideoDeviceId: [''],
})

    this.formGroup.get('selectedClientId')?.valueChanges.subscribe(val => console.log(val));
  
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
      this.wsService.getUserId().subscribe((clientId: any) => {
        if (clientId && !this.clients.includes(clientId)) {
          this.clients.push(clientId);
        }
      })
    );

    // Lắng nghe client ngắt kết nối
    this.subscriptions.push(
      this.wsService.getMessages().subscribe((msg: string = '') => {
        console.log(msg);
        
        if (typeof msg === 'string' && msg.includes('disconect')) {
          if (msg) {
            const clientId = msg.slice(5, 25);
            this.clients = this.clients.filter(id => id !== clientId);
          }
        }
      })
    );

    // Lắng nghe answer từ client khác
    this.subscriptions.push(
      this.wsService.onAnswer().subscribe(async (data: any) => {
        if (!this.peerConnection) return;
        try {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (error:any) {
          this.errorMessage = 'Lỗi khi xử lý answer: ' + error.message;
          console.error('Lỗi khi xử lý answer:', error);
        }
      })
    );

    // Lắng nghe ICE candidate
    this.subscriptions.push(
      this.wsService.onIceCandidate().subscribe(async (data: any) => {
        console.log(data);
        
        if (!this.peerConnection) return;
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
          console.log('Vao day');
          
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
        video: this.selectedVideoDeviceId.value ? { deviceId: { exact: this.selectedVideoDeviceId.value } } : true,
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localVideoRef.nativeElement.srcObject = this.stream;

      this.peerConnection = new RTCPeerConnection();
      this.stream.getTracks().forEach(track => this.peerConnection!.addTrack(track, this.stream!));

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.formGroup.get('selectedClientId')?.value) {
          this.wsService.sendIceCandidate(event.candidate, this.formGroup.get('selectedClientId')?.value || '');
        }
      };

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

  async callClient(): Promise<void> {
    debugger
    if (!this.peerConnection || !this.formGroup.get('selectedClientId')?.value) {
      this.errorMessage = 'Vui lòng chọn client và khởi động video trước khi gọi.';
      return;
    }

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      if (this.formGroup.get('selectedClientId')?.value) {
        this.wsService.sendOffer(offer, this.formGroup.get('selectedClientId')?.value);
      console.log('vaod ayu');
      
      } else return;
      
    } catch (error: any) {
      this.errorMessage = 'Lỗi khi tạo offer: ' + error.message;
      console.error('Lỗi khi gọi:', error);
    }
  }

  stopVideo(): void {
    if (this.stream) {
      this.stream.getTracks().forEach( track => track.stop());
      this.stream = null;
    }
    if (this.localVideoRef?.nativeElement) {
      this.localVideoRef.nativeElement.srcObject = null;
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
}