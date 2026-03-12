import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Api } from '../services/api';

export const authGuard: CanActivateFn = () => {
  const api = inject(Api);
  const router = inject(Router);

  if (api.getToken()) {
    return true;
  }

  router.navigateByUrl('/login');
  return false;
};