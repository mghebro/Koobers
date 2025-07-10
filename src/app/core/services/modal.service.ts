import {
  ApplicationRef,
  ComponentFactoryResolver,
  EmbeddedViewRef,
  Injectable,
  Injector
} from '@angular/core';
import { ModalForm } from '../../shared/modal-form/modal-form';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
    private resolver: ComponentFactoryResolver
  ) {}

  openModal(): void {
    // 1. Create component
    const factory = this.resolver.resolveComponentFactory(ModalForm);
    const componentRef = factory.create(this.injector);

    // 2. Set inputs
    componentRef.instance.isOpen = true;

    // 3. Listen for close event to clean up
    componentRef.instance.onClose.subscribe(() => {
      this.closeModal(componentRef);
    });

    // 4. Attach to appRef
    this.appRef.attachView(componentRef.hostView);

    // 5. Add to DOM
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
  }

  private closeModal(componentRef: any): void {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }
}
