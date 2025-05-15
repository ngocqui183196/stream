import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private http: HttpClient) {}

  sendNotification(token: string, severKey: string): Observable<any> {
    // return this.http.post('https://fcm.googleapis.com/fcm/send', {
      return this.http.post('https://fcm.googleapis.com/v1/projects/demo-web-messaging-noti/messages:send', {
        notification: {
          title: "Thông báo từ Localhost",
          // body: "Tel'annas: Nếu mà có tầm đánh thì kể cả nước bọt có dame tao cũng nhổ.!!!"
          body: "Cappheny: Vừa đi vừa đái cũng có dame, cũng có anh xin chết.!!!"
        },
        to: token
      },
      {
        headers: new HttpHeaders({
          'Authorization': `key=${severKey}`,
        'Content-Type': 'application/json'})
      }
    );
  }
}
