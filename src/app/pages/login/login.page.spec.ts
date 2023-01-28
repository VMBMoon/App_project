import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { Store, StoreModule } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';
import { User } from 'src/app/model/user/user';
import { environment } from 'src/environments/environment';
import { loadingReducer } from 'src/store/loading/loading.reducers';
import { loginReducer } from 'src/store/login/login.reducers';

import { AppState } from './../../../store/AppState';
import { recoverPassword, recoverPasswordFail, recoverPasswordSuccess, loginFail, login, loginSuccess } from './../../../store/login/LoginActions';
import { AppRoutingModule } from './../../app-routing.module';
import { AuthService } from './../../services/auth/auth.service';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let router: Router;
  let page: any;
  let store: Store<AppState>;
  let toastController: ToastController;


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginPage ],
      imports: [IonicModule.forRoot(),
        AppRoutingModule,
        ReactiveFormsModule,
      StoreModule.forRoot([]),
      StoreModule.forFeature("loading", loadingReducer),
      StoreModule.forFeature("login", loginReducer),
      AngularFireModule.initializeApp(environment.firebase)]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    router = TestBed.inject(Router);
    store = TestBed.inject(Store);
    toastController = TestBed.inject(ToastController);

    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create form on init', ()=>{
    component.ngOnInit();
    expect(component.form).not.toBeUndefined();
  })


  it('should go to register page on register', () => {
    spyOn(router, 'navigate');

    component.register();

    expect(router.navigate).toHaveBeenCalledWith(['register']);
  });

  it('should recover email/password on forgot email/password', () => {

    fixture.detectChanges();
    component.form.get('email')?.setValue('valid@email.com');
    page.querySelector("recoverPasswordButton").click();
    store.select('login').subscribe(LoginState => {
      expect(LoginState.isRecoveredPassword).toBeTruthy();
    })
    store.select('loading').subscribe(LoadingState => {
      expect(LoadingState.show).toBeTruthy();
    })
  });

  it('give user is recovering password, when success, then hide loading and show success message', () =>{
    spyOn(toastController, 'create');

    fixture.detectChanges();
    store.dispatch(recoverPassword({email: "any@email.com"}));
    store.dispatch(recoverPasswordSuccess());
    store.select('loading').subscribe(loadingState => {
      expect(loadingState.show).toBeFalsy();
    })

    expect(toastController.create).toHaveBeenCalledTimes(1);
  })
  it('give user is recovering password, when fail, then hide loading and show error message', () =>{
    spyOn(toastController, 'create').and.returnValue(<any> Promise.resolve({present:() => {}}));


    fixture.detectChanges();
    store.dispatch(recoverPassword({email: "any@email.com"}));
    store.dispatch(recoverPasswordFail({error: "message"}));
    store.select('loading').subscribe(loadingState => {
      expect(loadingState.show).toBeFalsy();
    })
    expect(toastController.create).toHaveBeenCalledTimes(1);
  })

  it('should show loading and start login when logging in', () => {

    fixture.detectChanges();
    component.form.get('email')?.setValue('valid@email.com');
    component.form.get('password')?.setValue('anyPassword');
    page.querySelector('#loginButton').click();
    store.select('loading').subscribe(loadingState => {
      expect(loadingState.show).toBeTruthy();
    })
    store.select('login').subscribe(loginState => {
      expect(loginState.isLogginIn).toBeTruthy();
    })
  })

  it('given user is logging in, when success, then hide loading and send user to home page', () => {
    spyOn(router, 'navigate');


    fixture.detectChanges();
    store.dispatch(login({email: "valid@email.com", password: "anyPassword"}));
    store.dispatch(loginSuccess({user: new User()}));

    store.select('loading').subscribe(loginState => {
      expect(loginState.show).toBeFalsy();
    })
    store.select('login').subscribe(loginState => {
      expect(loginState.isLoggedIn).toBeTruthy();
    })
    expect(router.navigate).toHaveBeenCalledWith(['home']);
  })

  it('given user is logging in, when fail, then hide loading and show error message', () => {

    spyOn(toastController, 'create').and.returnValue(<any> Promise.resolve({present:() => {}}));

    fixture.detectChanges();
    store.dispatch(login({email: "valid@email.com", password: "anyPassword"}));
    store.dispatch(loginFail({error: {message: 'error message'}}));

    store.select('loading').subscribe(loadingState => {
      expect(loadingState.show).toBeFalsy();
    })
    expect(toastController.create).toHaveBeenCalledTimes(1);
  })
});