import {
  trigger,
  transition,
  style,
  query,
  animateChild,
  group,
  animate,
} from '@angular/animations';

export const slideInAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }),
    ], { optional: true }),
    
    query(':enter', [
      style({ 
        opacity: 0,
        transform: 'translateY(30px) scale(0.99)',
        filter: 'blur(2px)',
      })
    ], { optional: true }),
    
    query(':leave', animateChild(), { optional: true }),
    
    group([
      query(':leave', [
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ 
            opacity: 0,
            transform: 'translateY(-30px) scale(0.99)',
            filter: 'blur(2px)',
          })
        ),
      ], { optional: true }),
      
      query(':enter', [
        animate('500ms 250ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ 
            opacity: 1,
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0px)',
          })
        ),
      ], { optional: true }),
    ]),
  ]),
]);

export const fadeAnimation = trigger('fadeAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0 })
    ], { optional: true }),
    
    group([
      query(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ], { optional: true }),
      
      query(':enter', [
        animate('300ms 150ms ease-in', style({ opacity: 1 }))
      ], { optional: true })
    ]),
  ]),
]);

export const scaleAnimation = trigger('scaleAnimation', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        transformOrigin: 'center',
      }),
    ], { optional: true }),
    
    query(':enter', [
      style({ 
        opacity: 0,
        transform: 'scale(0.95)',
      })
    ], { optional: true }),
    
    group([
      query(':leave', [
        animate('350ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ 
            opacity: 0,
            transform: 'scale(1.05)',
          })
        ),
      ], { optional: true }),
      
      query(':enter', [
        animate('350ms 100ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ 
            opacity: 1,
            transform: 'scale(1)',
          })
        ),
      ], { optional: true }),
    ]),
  ]),
]);