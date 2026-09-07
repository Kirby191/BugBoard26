import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Login } from "./core-auth/components/login/login";

@Component({
  imports: [RouterOutlet, Login],
  selector: 'app-root',
  styleUrl: './app.component.css',
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly title = signal('front-end');
}
