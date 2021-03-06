import {Component} from "@angular/core";
import {NavController, ViewController} from "ionic-angular";
import {AuthService} from "../services/auth.service";
import {User} from "../models/user.model";
import {AuthPage} from "../app/app.component";

@Component({
    template: `
        <ion-list no-padding no-lines>
            <button ion-item detail-none (click)="onSignUser('signin')" *ngIf="!user.tokenValid">
                <ion-icon name="person" item-left></ion-icon>
                Signin
            </button>
            <button ion-item detail-none (click)="onSignUser('signup')" *ngIf="!user.tokenValid">
                <ion-icon name="log-in" item-left></ion-icon>
                Signup
            </button>
            <button ion-button full detail-none *ngIf="user.tokenValid">
                Welcome {{  user.username }}
            </button>
            <button ion-item detail-none (click)="onLogout()" *ngIf="user.tokenValid">
                <ion-icon name="log-out" item-left></ion-icon>
                Logout
            </button>
        </ion-list>
    `
})
export class PopoverComponent {
    user: User;
    constructor(public viewCtrl: ViewController, private navCtrl: NavController, private authService: AuthService) {}

    /**
     * Set User data from authentication service
     */
    ngOnInit() {
        this.user = this.authService.getUser();
    }

    /**
     * Navigate to Signin or Signup page
     * @param auth_type
     */
    onSignUser(auth_type: string = '') {
        this.navCtrl.setRoot(AuthPage, { auth_type: auth_type, data: auth_type == 'signin' ? null : {} });
        this.viewCtrl.dismiss();
    }

    /**
     * Log user out and navigate to Signin Page
     */
    onLogout() {
        this.navCtrl.setRoot(AuthPage, { auth_type: 'signin', data: null });
        this.authService.logout();
        this.viewCtrl.dismiss();
    }

}