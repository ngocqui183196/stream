import {Component, OnDestroy, OnInit} from '@angular/core';
import {WebSocketService} from "../../../services/web-socket.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {bufferCount, interval, Observable, scan, take, toArray} from "rxjs";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  form: FormGroup<any>;
  messages: any[] = [];
  user = '';

  constructor(
    private fb: FormBuilder,
    private webSocketService: WebSocketService
  ) {
    this.webSocketService.user$.pipe(take(2)).subscribe(value => {
      console.log(value)
      this.user = value
    })
    this.form = this.fb.group({message: ['']})
  }


  ngOnInit() {
    this.webSocketService.onMessage((message: string) => {
    });
    this.webSocketService.messages$
      .pipe(
        scan((allMessages: any, newMessage: any) => {
          if (allMessages.length >= 6) {
            allMessages.shift()
          }
          return [...allMessages, newMessage]
        }, []),
      )
      .subscribe(value => this.messages = value);
  }

  sendMessage(value: any) {
    console.log(value)
    console.log(this.form.controls['message'].value)
    this.webSocketService.sendMessage({
      userId: this.user,
      message: this.form.controls['message'].value
    });
  }

  ngOnDestroy() {
    this.webSocketService.disconnect();
  }

  wsConect() {
    this.webSocketService.connect()
  }

  disconect() {
    this.webSocketService.disconnect()
  }
}
