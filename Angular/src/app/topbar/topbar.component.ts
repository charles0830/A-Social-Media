import { Component, OnInit, OnDestroy } from '@angular/core';
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {LocalStorageService} from "../local-storage.service";
import {EventEmitterService} from "../event-emitter.service";
import {UserDataService} from "../user-data.service";
import {ApiService} from "../api.service";
import { AutoUnsubscribe } from "../unsubscribe";

@Component({
	selector: 'app-topbar',
	templateUrl: './topbar.component.html',
	styleUrls: ['./topbar.component.css']
})
@AutoUnsubscribe
export class TopbarComponent implements OnInit {

	public userName:string = "";
	public userID:any;
	public profilePicture :string = "default_avatar";

	public alertMessage :string = "";
	public subscriptions = [];
	public messagePreview:any = [];
	public query:string="";
	public sendMessageObject = {
		id : "",
		name : "",
		content:""
	}

	public notifications = {
		alert : 0,
		friendRequests:0,
		messages:0
	}

	constructor(
		public auth: AuthService,
		private router:Router,
		private localStorage:LocalStorageService,
		private alerts:EventEmitterService,
		private userData:UserDataService,
		public api:ApiService
	) {  }

	ngOnInit(): void {
		let parsedToken = this.localStorage.getParsedToken();
		this.userName = parsedToken.name;
		this.userID = parsedToken._id;

		let alertEvent = this.alerts.onAlertEvent.subscribe((message:string)=>{
			this.alertMessage = message;
		});

		let friendAlert = this.alerts.updateNumberOfFriendRequestEvent.subscribe((message:string)=>{
			this.notifications.friendRequests--;
		});
		let userDataEvent = this.userData.getUserData.subscribe((data)=>{
			this.notifications.friendRequests = data.friendRequests.length;
			this.notifications.messages = data.latestMessageNotifications.length;
			this.profilePicture = data.profileImage;
			this.setMessagePreview(data.messages,data.latestMessageNotifications);
		});

		let updateMessageEvent = this.alerts.updateSendMessageObjectEvent.subscribe((val:any)=>{
			this.sendMessageObject.id = val.id;
			this.sendMessageObject.name = val.name;
		});

		let resetMessagesEvent = this.alerts.resetSendMessageObjectEvent.subscribe((val:any)=>{
			this.notifications.messages = 0;
		});

		let requestObject = {
			method : "GET",
			location : `users/get-user-data/${this.userID}`
		}
		this.api.makeRequest(requestObject).then((data:any)=>{
			this.userData.getUserData.emit(data.user);
		})
		// @ts-ignore
		this.subscriptions.push(alertEvent,friendAlert,userDataEvent,updateMessageEvent,resetMessagesEvent);
	}

	public searchForFriends(){
		this.router.navigate(['/search-results',{ query : this.query }]).then(_ =>{ });
	}

	public sendMessage(){
		this.api.sendMessage(this.sendMessageObject);
		this.sendMessageObject.content = "";
	}

	public resetMessageNotifications(){
		this.api.resetMessageNotifications().then(()=>{

		});
	}

	private setMessagePreview(messages:any,messageNotifications:any){
		for (let i = messages.length-1; i >=0 ; i--) {
			let lastMessage = messages[i].content[messages[i].content.length-1];
			let preview = {
				messengerName : messages[i].messengerName,
				messageContent : lastMessage.message,
				messengerImage : "",
				messengerID : messages[i]._id,
				isNew : false
			}

			if (lastMessage.messenger.toString() === this.userID.toString()){
				preview.messengerImage = this.profilePicture;
			}else {
				preview.messengerImage = messages[i].messengerProfileImage;
				if (messageNotifications.includes(messages[i].fromID)){
					preview.isNew = true;
				}
			}
			if (preview.isNew){
				this.messagePreview.unshift(preview);
			}else {
				this.messagePreview.push(preview);
			}
		}
	}
}
