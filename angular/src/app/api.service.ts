import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from "./local-storage.service";

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    private baseUrl = "http://localhost:3000";
    private successHandler(value){
        return value;
    }
    private errorHandler(value){
        return value;
    }
    constructor(private http:HttpClient,private storage:LocalStorageService) { }
    /**
    * makeRequest
    */
    public makeRequest(requestObject):any {
        let type = requestObject.type.toLowerCase();
        if (!type) {
            return console.log("No type Specified in the request object.");
        }
        let body = requestObject.body || {};
        let location = requestObject.location;
        if (!location) {
            return console.log("No location Specified in the request object");
        }
        let url = `${this.baseUrl}/${location}`;
        let httpOptions = {};

        if (requestObject.authorize) {
            httpOptions = {
                headers:new HttpHeaders({
                    'Authorization':`Bearer ${this.storage.getToken()}`
                })
            }
        }

        if (type == "get") {
            return this.http.get(url,httpOptions).toPromise()
            .then(this.successHandler).catch(this.errorHandler);
        }


        if (type == "post") {
            return this.http.post(url,body,httpOptions).toPromise()
            .then(this.successHandler).catch(this.errorHandler);
        }
        console.log("Could not make the request.Make Sure a type of GET or Post is Supplied");
    }

    /**
     * makeFriendRequest
     */
    public makeFriendRequest(to:String) {
        let from = this.storage.getParsedToken()._id;

        let requestObject = {
            location:`users/make-friend-request/${from}/${to}`,
            type:"POST",
            authorize:true
        }

        this.makeRequest(requestObject).then((val)=>{
            console.log(val);

        })

    }
}
