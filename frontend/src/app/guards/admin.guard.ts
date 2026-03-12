import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Api } from '../services/api';

export const adminGuard: CanActivateFn = () => {
  const api = inject(Api);
  const router = inject(Router);

  if (api.getAdminKey()) {
    return true;
  }

  router.navigateByUrl('/admin-login');
  return false;
};
