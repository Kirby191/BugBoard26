import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  standalone: true,
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
  });
  login() {
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    if (!email || !password) {
      console.error('Email and password are required.');
      return;
    }
    if ( !email.includes('@') || !email.includes('.')) {
      console.error('Invalid email format.');
      return;
    }
    if (password.length < 6) {
      console.error('Password must be at least 6 characters long.');
      return;
    }
  }
}