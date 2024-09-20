import {Component, inject, OnInit} from '@angular/core';
import { messaging } from '../../../configs/firebase.config';
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

  ) {}
  ngOnInit(): void {
    this.requestPermission();
    this.listen();
  }

  requestPermission() {
    messaging.getToken({vapidKey: environment.firebaseConfig.vapidKey})
      .then((currentToken) => {
        if (currentToken) {
          console.log(currentToken);
          this.tokenPermission = currentToken
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      }).catch((err) => {
      console.log(err);
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
