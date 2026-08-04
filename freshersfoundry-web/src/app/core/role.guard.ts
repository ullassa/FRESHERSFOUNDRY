import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('freshersfoundry.token');

  if (token) {
    return true;
  }

  return router.parseUrl('/auth/login');
};
