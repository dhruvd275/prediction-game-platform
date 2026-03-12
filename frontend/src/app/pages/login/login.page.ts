import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LoginPage {

  email = '';
  password = '';

  constructor(private api: Api, private router: Router) {}

  login() {

    this.api.login(this.email, this.password).subscribe({

      next: (res: any) => {

        this.api.setToken(res.token);

        this.router.navigateByUrl('/home');

      },

      error: (err) => {
        alert(err.error.message || 'Login failed');
      }

    });

  }

}