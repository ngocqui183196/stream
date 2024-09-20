import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective {

  @Input() appTooltip: string = ''; // Tooltip text
  tooltipElement: any;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('mouseenter') onMouseEnter() {
    this.createTooltip();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.destroyTooltip();
  }

  private createTooltip() {
    this.tooltipElement = this.renderer.createElement('span');
    this.tooltipElement.innerText = this.appTooltip;
    this.renderer.appendChild(document.body, this.tooltipElement);
    this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipElement, 'background', 'black');
    this.renderer.setStyle(this.tooltipElement, 'color', 'white');
    this.renderer.setStyle(this.tooltipElement, 'padding', '5px');
    this.renderer.setStyle(this.tooltipElement, 'borderRadius', '5px');
    this.renderer.setStyle(this.tooltipElement, 'top', `${this.el.nativeElement.getBoundingClientRect().top - 30}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${this.el.nativeElement.getBoundingClientRect().left}px`);
  }

  private destroyTooltip() {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }
}