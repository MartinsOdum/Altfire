import {Component, ViewChild} from '@angular/core';
import {ModalController, NavController, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {AuthPage} from "../pages/auth/auth";
import {AuthService} from "../services/auth.service";
import {SettingsPage} from "../pages/settings/settings";
import {User} from "../models/user.model";
import {TabsPage} from "../pages/tabs/tabs";
import {StorageService} from "../services/storage.service";
import {SigninModal} from "../pages/modals/signin-modal/signin-modal";
import {HelperService} from "../services/helpers";

export {HomePage} from '../pages/home/home';
export {TabsPage} from '../pages/tabs/tabs';
export {GraphqlPage} from '../pages/graphql/graphql';
export {RestfulPage} from '../pages/restful/restful';
export {AuthPage} from '../pages/auth/auth';
export {SettingsPage} from '../pages/settings/settings';

export {MethodsComponent} from '../components/methods';
export {RequestHeaderComponent} from '../components/header';
export {RequestBodyComponent} from '../components/body';
export {PopoverComponent} from '../components/popover';
export {RequestAuthorizationComponent} from '../components/authorization';
export {SigninModal} from '../pages/modals/signin-modal/signin-modal';

@Component({
    templateUrl: 'app.html'
})
export class Entry {
    private _date = new Date();
    authPage = AuthPage;
    settingsPage = SettingsPage;
    user: User;
    @ViewChild('nav') nav: NavController;

    /**
     * Application Entry Component Constructor
     * @param _platform
     * @param _statusBar
     * @param _splashScreen
     * @param modalCtrl
     * @param authService
     * @param storageService
     * @param h
     */
    constructor(private _platform: Platform,
                private _statusBar: StatusBar,
                private _splashScreen: SplashScreen,
                private modalCtrl: ModalController,
                private authService: AuthService,
                private storageService: StorageService,
                private h: HelperService) {
        this._initializeApp();
    }

    _initializeApp() {
        this._platform.ready().then(() => {
            this._statusBar.styleDefault();
            setTimeout(() => {
                this._splashScreen.hide();
            }, 10);
        });
    }

    /**
     * Render Last App State, Fetch App unique Id, User Token from storage
     * ngOnInit lifecycle hook
     */
    ngOnInit() {
        console.log('Initializing MENU');
        this.storageService.renderData();
        this.storageService.getAltfireApp().then((data) => {
            console.log('Altfire App Id: SUCCESS', data);
            this.storageService.getUser().then((user: User) => {
                console.log('User in Secure Storage: SUCCESS', user);
                if(user.token && user.expire > this._date.getTime()) {
                    user.tokenValid = true;
                    this.authService.setUser(user);
                    this.nav.setRoot(TabsPage);
                } else if (user.token && user.expire <= this._date.getTime()) {
                    this.h.loader({msg: 'signing you in . . .'});
                    let modal = this.modalCtrl.create(SigninModal, user);
                    modal.onDidDismiss((data) => {
                        if(data && data == 'continue') {
                            // TODO: Try to send refresh token to firebase to refresh user token
                            user.tokenValid = true;
                            this.onShowToast('Logged in as ' + user.username);
                            this.authService.setUser(user);
                        } else {
                            this.storageService.deleteToken().then(() => {
                                user.tokenValid = false;
                                this.onShowToast('please signin to save your work');
                                this.nav.setRoot(this.authPage, {auth_type: 'signin', data: this._initInput(user)});
                            });
                        }
                    });
                    modal.present();
                } else {
                    this.nav.setRoot(this.authPage, { auth_type: 'signin', data: this._initInput(user)});
                }
            }).catch(() => {
                this.nav.setRoot(this.authPage, { auth_type: 'signup', data: {} });
            });
        }).catch((err) => {
            console.log('Error from either Altfire Id or User: ERROR', err);
            this.nav.setRoot(this.authPage, { auth_type: 'signup', data: {} });
            this.storageService.setAltfireApp().then();
        });
    }

    /**
     * TODO: DELETE
     * ionViewWillEnter lifecycle hook
     */
    ionViewWillEnter() {
        console.log('ionViewDidEnter MENU');
    }

    /**
     * Display toast message
     * @param data
     * @param duration
     */
    onShowToast(data: string, duration?: number) {
        this.h.toast({msg: data, duration: duration ? duration : 2000}).present();
    }

    /**
     * Set User Form fields initialization data
     * @param user
     * @returns {User}
     * @private
     */
    _initInput(user?) {
        this.user.email = user && user.email ? user.email : null;
        this.user.username = 'hidden';
        this.user.firstname = 'hidden';
        this.user.lastname = 'hidden';
        this.user['cpassword'] = 'hidden';
        this.user.tokenValid = false;
        return this.user;
    }

}
