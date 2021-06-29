export default class ColumnChart {

  constructor(params = {}) {
    this.data = params.data || [];
    this.label = params.label || '';
    this.value = params.value || '';
    this.link = params.link || '';
    this.formatHeading = params.formatHeading;
    this.chartHeight = 50;
    this.loadingClass = 'column-chart_loading';
    this.render();
  }

  render() {
    const element = document.createElement('div');
    const header = this.formatHeading ? this.formatHeading(this.value) : this.value;

    element.innerHTML = `
        <div class="column-chart" style="--chart-height: 50">
          <div class="column-chart__title">
            Total ${this.label}
            <a href="${this.link}" class="column-chart__link">View all</a>
          </div>
          <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">${header}</div>
            <div data-element="body" class="column-chart__chart"></div>
          </div>
        </div>
    `;

    this.element = element.firstElementChild;
    this.update();
  }

  update () {
    if (!this.data.length) {
      this.element.classList.add(this.loadingClass);
      return;
    }
    const charValues = this.getColumnProps(this.data);
    charValues.forEach(charValue => {
      let attr = {
        'style': `--value: ${charValue.value}`,
        'data-tooltip': charValue.percent,
      };
      let col = this.createNode('div', '', attr);
      this.element.querySelector('.column-chart__chart').append(col);
    });
    this.element.classList.remove(this.loadingClass);
  }

  getColumnProps (data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  createNode (nodeName = 'div', value = '', attr = {}) {
    const node = document.createElement(nodeName);
    for (name in attr){
      node.setAttribute(name, attr[name]);
    }
    node.textContent = value;
    return node;
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

