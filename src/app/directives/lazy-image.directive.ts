import { Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';

@Directive({
  selector: 'img[appLazyImage]',
})
export class LazyImageDirective implements OnChanges, OnDestroy {
  private readonly element = inject<ElementRef<HTMLImageElement>>(ElementRef);
  private observer: IntersectionObserver | null = null;
  private loaded = false;

  @Input({ alias: 'appLazyImage', required: true }) src = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['src']) {
      return;
    }

    this.loaded = false;
    this.element.nativeElement.removeAttribute('src');
    this.observer?.disconnect();

    if (!this.src) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      this.load();
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.load();
        }
      },
      { rootMargin: '0px', threshold: 0 },
    );
    this.observer.observe(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private load(): void {
    if (this.loaded) {
      return;
    }

    this.loaded = true;
    this.observer?.disconnect();
    this.element.nativeElement.src = this.src;
  }
}
