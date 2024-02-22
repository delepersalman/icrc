import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'src/app/shared/services/message.service';
import { TokenStorageService } from '../services/token.storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  title: string;
  returnUrl: string;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService,
  ) {

  }

  ngOnInit() {

    this.title = 'Login';
    this.createForm();
    // reset login status
    this.authService.logout();

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  createForm() {
    this.loginForm = this.fb.group({
      email: [''],
      password: ['']
    })
  }

  onSubmit() {
    this.authService.login({
      email: this.loginForm.get('email').value,
      password: this.loginForm.get('password').value
    }).subscribe(
      result => {
        this.router.navigateByUrl(this.returnUrl);
      }
    )
  }
}



//export class LoginComponent implements OnInit {

//  loginForm: FormGroup;
//  title: string;

//  constructor(
//    private fb: FormBuilder,
//    private router: Router,
//    private authService: AuthService,
//    private messageService: MessageService,
//    private tokenService: TokenStorageService
//  ) {
//    if (this.authService.isLoggedIn()) {
//      this.router.navigateByUrl('/');
//    }
//  }

//  ngOnInit() {
//    this.title = 'Login';
//    this.createForm();
//  }

//  createForm() {
//    this.loginForm = this.fb.group({
//      email: [''],
//      password: ['']
//    })
//  }

//  onSubmit() {

//    if (this.authService.isLoggedIn()) {
//      this.router.navigateByUrl('/');
//      return;
//    }

//    this.authService.login({
//      email: this.loginForm.get('email').value,
//      password: this.loginForm.get('password').value
//    }).subscribe(
//      result => {
//        if (result) {

//          debugger;

//          this.tokenService.saveToken(result.toString())
//          this.tokenService.saveUser({ email: 'aditya@eventcombo.com', name: 'Aditya' })

//          this.messageService.clear();
//          this.router.navigateByUrl('/');
//        }
//      }
//    )
//  }
//}
