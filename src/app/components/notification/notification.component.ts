import {Component, inject, OnInit} from '@angular/core';
import { messaging } from '../../../configs/firebase.config';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { environment } from '../../../environments/environment';
import { NotificationService } from "../../../apis/notification.service";



@Component({
  selector: 'app-notification',
  templateUrl: 'notification.component.html',
  styleUrl: './notification.component.css',
  providers: [NotificationService]
})
export class NotificationComponent implements OnInit {
  tokenPermission: string | undefined
  private api = inject(NotificationService)
  constructor(
    private afMessaging: AngularFireMessaging
  ) {}
  ngOnInit(): void {
    this.requestPermission();
    this.listen();
  }

  requestPermission() {
    this.afMessaging.requestToken.subscribe(
      (token) => {
        console.log('Notification permission granted. Token:', token);
        if(token) {
          this.tokenPermission = token
        }
      
        // Gửi token này về server để lưu trữ và quản lý
      },
      (error) => {
        console.error('Unable to get permission to notify.', error);
      }
    );

    // messaging.getToken({vapidKey: environment.firebaseConfig.vapidKey})
    //   .then((currentToken) => {
    //     if (currentToken) {
    //       console.log(currentToken);
    //       this.tokenPermission = currentToken
    //     } else {
    //       console.log('No registration token available. Request permission to generate one.');
    //     }
    //   }).catch((err) => {
    //   console.log(err);
    // });
  }

  receiveMessage() {
    this.afMessaging.messages.subscribe((message) => {
      console.log('Message received:', message);
      // Xử lý hiển thị thông báo trong ứng dụng
    });
  }

  listen() {

    // Đây là hàm lắng nghe notification khi tab trình duyệt được mở đúng link.
    messaging.onMessage((incomingMessage) => {
      console.log(incomingMessage);
      notificationBg(
        incomingMessage['notification']['title'],
        {
          body:incomingMessage['notification']['body'],
          icon: '/firebase-logo.png'
        }
      )
    })
  }

  sendNotification() {
    if (this.tokenPermission) {
      console.log(environment['severKey'])
      this.api.sendNotification(this.tokenPermission, environment['severKey']).subscribe(
        (res) => console.log(res),
        (error) => console.log(error))
    }
  }
}
