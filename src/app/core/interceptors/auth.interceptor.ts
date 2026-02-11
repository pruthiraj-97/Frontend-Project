import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  if (token && !req.url.includes('users?phone=')) {
    const roles = authService.getRoles();
    const role = roles.length > 0 ? roles[0] : '';
    
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'x-roles': role
      }
    });
    
    return next(clonedReq);
  }
  
  return next(req);
};

