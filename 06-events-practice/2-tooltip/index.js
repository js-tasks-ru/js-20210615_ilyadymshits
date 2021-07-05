class Tooltip {
  static activated = null;
  root = document.querySelector('body');

  constructor() {
    if (Tooltip.activated) {
      return Tooltip.activated;
    }
    Tooltip.activated = this;
    this.render();
  }

  initialize() {
    this.root.addEventListener('pointerover', this.addTooltip);
    this.root.addEventListener('pointerout', this.removeTooltip);
  }

  addTooltip = (e) => {
    if (e.target.dataset.tooltip) {
      this.show(e.target.dataset.tooltip);
      this.root.addEventListener('pointermove', this.move);
    }
  }

  removeTooltip = () => {
    this.root.removeEventListener('pointermove', this.move);
    this.remove();
  }

  move = (e) => {
    this.element.style.left = e.pageX + 10 + 'px';
    this.element.style.top = e.pageY + 10 + 'px';
  }

  show(text) {
    this.element.innerHTML = text;
    this.root.append(this.element);
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.root.append(this.element);
  }

  get template() {
    return `<div class = "tooltip"></div>`;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.root.removeEventListener('pointerover', this.addTooltip);
    this.root.removeEventListener('pointerout', this.removeTooltip);
  }

}

export default Tooltip;
