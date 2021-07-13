import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class ApiService {
	private readonly baseURL:String  = "https://localhost:3000/";

	private successHandler = (value : any)=>{
		return value;
	}
	private errorHandler = (value : any)=>{
		return value;
	}
	constructor(private http : HttpClient) {
		if (process.env.NODE_ENV=="PRODUCTION"){
			this.baseURL = ``;
		}
	}
	public makeRequest(requestObject:any) : any{
		let type = requestObject.type.toLowerCase();
		if (!type){
			console.log("No type Specified in the Request Object");
			return;
		}
		let body = requestObject.body || {};
		let location = requestObject.location;

		if (!location){
			console.log("No Location specified in the Request Object.");
			return;
		}
		let url = `${this.baseURL}/${location}`;

		let httpOption = {};
		if (type==="get"){
			return this.http.get(url,httpOption).toPromise().then(this.successHandler).catch(this.errorHandler);
		}else if (type==="post"){
			return this.http.post(url,body,httpOption).toPromise().then(this.successHandler).catch(this.errorHandler);
		}
		console.log("Could not make the request. Make sure a type of GET  or POST is supplied.");
	}
}
