import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouterEvent } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { AuthService } from './core/auth/auth.service';

describe('AppComponent', () => {
  let routerEvents$: Subject<RouterEvent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    routerEvents$ = new Subject<RouterEvent>();
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn']);
    authService.isLoggedIn.and.returnValue(true);

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authService },
        {
          provide: Router,
          useValue: {
            url: '/transactions',
            events: routerEvents$.asObservable()
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('shows bottom nav for authenticated non-auth routes', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;

    expect(component.shouldShowBottomNav()).toBeTrue();
  });

  it('hides bottom nav on auth routes', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    (router as unknown as { url: string }).url = '/auth/login';

    expect(component.shouldShowBottomNav()).toBeFalse();
  });
});
