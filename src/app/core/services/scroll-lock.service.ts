import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollLockService {
  private currentLockedSection = new BehaviorSubject<string | null>(null);
  public currentLockedSection$ = this.currentLockedSection.asObservable();
  
  private lastUnlockedSection: string | null = null;
  private lastUnlockTime: number = 0;
  private exitDirection: 'up' | 'down' | null = null;
  
  // Minimum time before the same section can re-lock (ms)
  private readonly RELOCK_COOLDOWN = 2000;
  
  // Minimum scroll distance before allowing re-lock (pixels)
  private readonly MIN_SCROLL_DISTANCE = 300;
  private unlockScrollPosition: number = 0;
  
  constructor() {}
  
  canSectionLock(sectionId: string, scrollDirection: 'up' | 'down'): boolean {
    const currentLocked = this.currentLockedSection.value;
    const currentScrollY = window.scrollY;
    const timeSinceUnlock = Date.now() - this.lastUnlockTime;
    const scrollDistance = Math.abs(currentScrollY - this.unlockScrollPosition);
    
    // Another section is currently locked
    if (currentLocked && currentLocked !== sectionId) {
      return false;
    }
    
    // This section just unlocked - check conditions
    if (this.lastUnlockedSection === sectionId) {
      // Not enough time has passed
      if (timeSinceUnlock < this.RELOCK_COOLDOWN) {
        return false;
      }
      
      // Not enough scroll distance
      if (scrollDistance < this.MIN_SCROLL_DISTANCE) {
        return false;
      }
      
      // Trying to re-lock from the same direction we exited
      if (this.exitDirection && this.exitDirection === scrollDirection) {
        return false;
      }
    }
    
    return true;
  }
  
  lockSection(sectionId: string): void {
    this.currentLockedSection.next(sectionId);
    // Clear exit tracking when locking
    if (this.lastUnlockedSection === sectionId) {
      this.lastUnlockedSection = null;
      this.exitDirection = null;
    }
  }
  
  unlockSection(sectionId: string, exitDirection: 'up' | 'down'): void {
    if (this.currentLockedSection.value === sectionId) {
      this.currentLockedSection.next(null);
      this.lastUnlockedSection = sectionId;
      this.lastUnlockTime = Date.now();
      this.exitDirection = exitDirection;
      this.unlockScrollPosition = window.scrollY;
    }
  }
  
  isAnySectionLocked(): boolean {
    return this.currentLockedSection.value !== null;
  }
  
  getCurrentLockedSection(): string | null {
    return this.currentLockedSection.value;
  }
}