import {
  Component,
  AfterViewInit,
  ElementRef,
  QueryList,
  ViewChildren,
  Inject,
  PLATFORM_ID,
  OnDestroy
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Matter from 'matter-js';

@Component({
  selector: 'app-out-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './out-services.component.html',
  styleUrls: ['./out-services.component.scss']
})
export class OutServicesComponent implements AfterViewInit, OnDestroy {
  services = [
    { label: 'Technical Consulting' ,imgSrc:"assets/svgs/services/techno.svg"},
    { label: 'Personalized Approach' ,imgSrc:"assets/svgs/services/person.svg"},
    { label: 'Mobile App Development' , imgSrc:"assets/svgs/services/mobile.svg" },
    { label: 'Discovery' ,imgSrc:"assets/svgs/services/dyscovery.svg"},
    { label: 'Post-Launch Support' ,imgSrc:"assets/svgs/services/rocket.svg"},
    { label: 'Agile Processes' ,imgSrc:"assets/svgs/services/proces.svg"},
    { label: 'Web Development',imgSrc:"assets/svgs/services/dev.svg" },
    { label: 'Results Driven' ,imgSrc:"assets/svgs/services/result.svg" },
    { label: 'UI/UX Design' ,imgSrc:"assets/svgs/services/design.svg"},
    { label: 'Transparent Communication' },
    { label: 'Experienced Team', imgSrc:"assets/svgs/services/team.svg" },
    { label: 'Custom Software' ,imgSrc:"assets/svgs/services/custom.svg"},
    { label: 'Modern Tech Stack' ,imgSrc:"assets/svgs/services/modern.svg"}
  ];

  @ViewChildren('bubble', { read: ElementRef }) bubbles!: QueryList<ElementRef>;
  engine!: Matter.Engine;
  render!: Matter.Render;
  world!: Matter.World;

  isDragging: boolean = false;
  draggedBody: Matter.Body | null = null;
  dragOffset: { x: number; y: number } = { x: 0, y: 0 };

  // Map to associate bodies with their corresponding HTML elements
  bodyElementMap: Map<number, ElementRef> = new Map();

  // Track original physics properties to restore after drag
  originalBodyProperties: {
    isSensor: boolean,
    frictionAir: number,
    friction: number,
    restitution: number,
    inertia: number,
    mass: number
  } | null = null;

  // Container boundaries with padding
  containerBounds: {
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    width: number,
    height: number
  } = {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
    width: 0,
    height: 0
  };

  isBrowser: boolean = false;
  observer!: IntersectionObserver;
  isPhysicsInitialized: boolean = false;
  animationId: number | null = null;

  // Class property to store the function reference
  private updateContainerBounds: () => void = () => {};

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    const section = window.document.querySelector('.cloud');
    if (!section) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (this.isPhysicsInitialized) {
            this.resetAndRestartAnimation();
          } else {
            this.initPhysics();
          }
        }
      });
    }, { threshold: 0.1 });

    this.observer.observe(section);
  }

  resetAndRestartAnimation(): void {
    if (this.engine) {
      Matter.Engine.clear(this.engine);
    }

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.isDragging = false;
    this.draggedBody = null;

    this.bubbles.forEach(bubble => {
      bubble.nativeElement.classList.remove('dragging');
      bubble.nativeElement.style.cursor = 'grab';
    });

    document.body.style.cursor = 'default';

    setTimeout(() => {
      this.initPhysics();
    }, 100);
  }

  initPhysics() {
    const container = document.querySelector('.cloud') as HTMLElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.engine.world.gravity.y = 1.8; // Increased gravity for faster falling

    this.addDragListeners(container);

    const wallThickness = 100;

    const floor = Matter.Bodies.rectangle(
      width / 2,
      height - wallThickness / 1000,
      width,
      wallThickness,
      {
        isStatic: true,
        render: { visible: false }
      }
    );

    const leftWall = Matter.Bodies.rectangle(
      wallThickness / 2,
      height / 2,
      wallThickness,
      height,
      {
        isStatic: true,
        render: { visible: false }
      }
    );

    const rightWall = Matter.Bodies.rectangle(
      width - wallThickness / 2,
      height / 2,
      wallThickness,
      height,
      {
        isStatic: true,
        render: { visible: false }
      }
    );

    Matter.World.add(this.world, [floor, leftWall, rightWall]);

    const boxes: Matter.Body[] = [];

    // Clear previous associations
    this.bodyElementMap.clear();

    this.bubbles.forEach((bubbleRef, i) => {
      const el = bubbleRef.nativeElement;
      const boxWidth = el.offsetWidth;
      const boxHeight = el.offsetHeight;

      const x = Math.random() * (width - boxWidth - wallThickness * 2) + wallThickness + boxWidth / 2;
      const y = -Math.random() * 300 - boxHeight - 100;

      const initialAngle = i % 2 === 0 ? (Math.random() * 0.6 - 0.3) : 0;

      const box = Matter.Bodies.rectangle(
        x,
        y,
        boxWidth,
        boxHeight,
        {
          restitution: 0.6,
          friction: 0.5,
          frictionAir: 0.05,
          angle: initialAngle,
          render: { fillStyle: 'transparent' }
        }
      );

      if (i % 2 === 0) {
        Matter.Body.setAngularVelocity(box, (Math.random() - 0.5) * 0.2);
      }

      boxes.push(box);
      Matter.World.add(this.world, box);

      // Store the association between body ID and element
      this.bodyElementMap.set(box.id, bubbleRef);

      this.addBubbleDragListeners(el, box);
      el.style.cursor = 'grab';
    });

    Matter.Events.on(this.engine, 'collisionStart', (event: Matter.IEventCollision<Matter.Engine>) => {
      event.pairs.forEach((pair: Matter.Pair) => {
        const { bodyA, bodyB } = pair;

        if (!bodyA.isStatic && !bodyB.isStatic) {
          const forceStrength = 0.002;
          const dx = bodyB.position.x - bodyA.position.x;
          const dy = bodyB.position.y - bodyA.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0) {
            const normalizedX = dx / distance;
            const normalizedY = dy / distance;

            Matter.Body.applyForce(bodyA, bodyA.position, {
              x: -normalizedX * forceStrength,
              y: -normalizedY * forceStrength
            });

            Matter.Body.applyForce(bodyB, bodyB.position, {
              x: normalizedX * forceStrength,
              y: normalizedY * forceStrength
            });
          }
        }
      });
    });

    this.isPhysicsInitialized = true;

    const update = () => {
      if (!this.engine) return;

      Matter.Engine.update(this.engine, 1000 / 60);

      boxes.forEach((box, i) => {
        const bubbleArray = this.bubbles.toArray();
        if (bubbleArray[i]) {
          const el = bubbleArray[i].nativeElement;
          const centerX = box.position.x - el.offsetWidth / 2;
          const centerY = box.position.y - el.offsetHeight / 2;

          el.style.position = 'absolute';
          el.style.left = centerX + 'px';
          el.style.top = centerY + 'px';
          el.style.transform = `rotate(${box.angle}rad)`;
        }
      });

      this.animationId = requestAnimationFrame(update);
    };

    update();
  }

  addDragListeners(container: HTMLElement) {
    // Calculate and store container boundaries once
    const updateContainerBounds = () => {
      const rect = container.getBoundingClientRect();
      const boundaryPadding = 20; // Padding to keep bubbles from touching edges

      this.containerBounds = {
        minX: boundaryPadding,
        maxX: rect.width - boundaryPadding,
        minY: boundaryPadding,
        maxY: rect.height - boundaryPadding,
        width: rect.width,
        height: rect.height
      };
    };

    // Save the function as a class property for later cleanup
    this.updateContainerBounds = updateContainerBounds;

    // Initialize container bounds
    updateContainerBounds();

    // Update bounds on window resize
    window.addEventListener('resize', updateContainerBounds);

    container.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.draggedBody) {
        const rect = container.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;

        // Get the element associated with the dragged body
        const draggedElRef = this.bodyElementMap.get(this.draggedBody.id);
        const draggedEl = draggedElRef?.nativeElement;

        // Calculate element dimensions for proper boundary clamping
        const elementWidth = draggedEl ? draggedEl.offsetWidth / 2 : 0;
        const elementHeight = draggedEl ? draggedEl.offsetHeight / 2 : 0;

        // Clamp position to container boundaries
        mouseX = Math.max(this.containerBounds.minX + elementWidth,
                 Math.min(this.containerBounds.maxX - elementWidth, mouseX));
        mouseY = Math.max(this.containerBounds.minY + elementHeight,
                 Math.min(this.containerBounds.maxY - elementHeight, mouseY));

        // Calculate target position
        const targetX = mouseX - this.dragOffset.x;
        const targetY = mouseY - this.dragOffset.y;

        // Hybrid approach: Directly set position but still allow collisions
        // by using position constraints rather than forces

        // Calculate the position delta
        const deltaX = targetX - this.draggedBody.position.x;
        const deltaY = targetY - this.draggedBody.position.y;

        // Create a smoothing factor to reduce shaking (lower = smoother but less responsive)
        // Adjust these values to balance responsiveness vs. stability
        const smoothFactor = 0.6;
        const dampingFactor = 0.8;

        // Apply velocity directly based on position difference
        const newVelX = deltaX * smoothFactor;
        const newVelY = deltaY * smoothFactor;

        // Apply damping to existing velocity
        Matter.Body.setVelocity(this.draggedBody, {
          x: newVelX,
          y: newVelY
        });

        // Reset angular velocity to prevent spinning
        Matter.Body.setAngularVelocity(this.draggedBody, 0);

        // Optional: If the item is very far from target, teleport it closer to prevent rubber banding
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance > 50) { // Only teleport for large distances
          // Move it 80% closer to target
          const newX = this.draggedBody.position.x + deltaX * 0.8;
          const newY = this.draggedBody.position.y + deltaY * 0.8;
          Matter.Body.setPosition(this.draggedBody, { x: newX, y: newY });
          }
      }
    });

    container.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.endDrag();
      }
    });

    container.addEventListener('mouseleave', () => {
      if (this.isDragging) {
        this.endDrag();
      }
    });
  }

  addBubbleDragListeners(element: HTMLElement, body: Matter.Body) {
    element.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.isDragging = true;
      this.draggedBody = body;

      // Store ALL original body properties to restore later
      this.originalBodyProperties = {
        isSensor: body.isSensor,
        frictionAir: body.frictionAir,
        friction: body.friction,
        restitution: body.restitution,
        inertia: body.inertia,
        mass: body.mass
      };

      // Optimize physics properties to reduce shaking during drag
      Matter.Body.set(body, {
        frictionAir: 0.7,     // High air friction to reduce oscillation
        friction: 0.1,        // Lower surface friction for smoother interactions
        restitution: 0.1,     // Lower bounciness to reduce bouncing
        inertia: Infinity     // Prevent rotation during drag
      });

      // Important: Set mass to a higher value to make it more dominant in collisions
      Matter.Body.setMass(body, body.mass * 3);

      // Stop any current movement
      Matter.Body.setVelocity(body, { x: 0, y: 0 });
      Matter.Body.setAngularVelocity(body, 0);

      const rect = element.getBoundingClientRect();
      const container = document.querySelector('.cloud') as HTMLElement;
      const containerRect = container.getBoundingClientRect();

      // Calculate accurate drag offset from mouse position to body center
      this.dragOffset = {
        x: e.clientX - containerRect.left - body.position.x,
        y: e.clientY - containerRect.top - body.position.y
      };

      // Set specific styling
      element.classList.add('dragging');
      element.style.cursor = 'grabbing';
      document.body.style.cursor = 'grabbing';

      // Wake up the physics engine
      Matter.Sleeping.set(body, false);

      // Wake up all other bodies to ensure interactions
      this.engine.world.bodies.forEach(otherBody => {
        if (otherBody !== body && !otherBody.isStatic) {
          Matter.Sleeping.set(otherBody, false);
        }
      });
    });

    element.addEventListener('mouseup', () => {
      if (this.isDragging && this.draggedBody === body) {
        this.endDrag();
      }
      element.classList.remove('dragging');
      element.style.cursor = 'grab';
    });

    element.addEventListener('mouseleave', () => {
      if (!this.isDragging) {
        element.classList.remove('dragging');
      }
    });
  }

  // Handle drag end logic in one place
  private endDrag() {
    this.isDragging = false;

    this.bubbles.forEach(bubble => {
      bubble.nativeElement.classList.remove('dragging');
      bubble.nativeElement.style.cursor = 'grab';
    });

    if (this.draggedBody && this.originalBodyProperties) {
      // Restore ALL original physics properties exactly as they were
      Matter.Body.set(this.draggedBody, {
        isSensor: this.originalBodyProperties.isSensor,
        frictionAir: this.originalBodyProperties.frictionAir,
        friction: this.originalBodyProperties.friction,
        restitution: this.originalBodyProperties.restitution,
        inertia: this.originalBodyProperties.inertia // Restore original inertia for proper rotation
      });

      // Restore original mass
      Matter.Body.setMass(this.draggedBody, this.originalBodyProperties.mass);

      // Apply a natural release with both linear and angular velocity
      const releaseVelocity = {
        x: (Math.random() - 0.5) * 3,
        y: Math.random() * -1.5
      };
      Matter.Body.setVelocity(this.draggedBody, releaseVelocity);

      // Add some rotation based on horizontal movement
      const angularVelocity = releaseVelocity.x * 0.02;
      Matter.Body.setAngularVelocity(this.draggedBody, angularVelocity);

      // Ensure the body isn't sleeping so it can respond to physics
      Matter.Sleeping.set(this.draggedBody, false);
    }

    this.draggedBody = null;
    this.originalBodyProperties = null;
    document.body.style.cursor = 'default';
  }

  // Helper function to check if an item is odd (already defined in the component)
  isOdd(i: number): boolean {
    return i % 2 !== 0;
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.observer) {
      this.observer.disconnect();
    }

    // Clean up window resize event listener
    window.removeEventListener('resize', this.updateContainerBounds);

    // Clear Matter.js engine
    if (this.engine) {
      Matter.Engine.clear(this.engine);
      this.engine.world.bodies = [];
      this.engine.world.constraints = [];
      this.engine.world.composites = [];
      this.world = null as any;
      this.engine = null as any;
    }

    // Clear any references
    this.bodyElementMap.clear();
    this.draggedBody = null;
  }
}
