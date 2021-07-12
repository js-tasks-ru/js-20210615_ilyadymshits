import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {

  chartHeight = 50;
  loadingClass = 'column-chart_loading';

  constructor({
    url = '',
    range = {
      from: new Date(),
      to: new Date(),
    },
    label = '',
    link = '',
    formatHeading = value => value,
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.data = {};
    this.label = label;
    this.value = formatHeading();
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove(this.loadingClass);
    }

    this.subElements = this.getSubElements(element);
    this.getServerData();
  }

  getServerData () {
    const range = this.range;
    this.url.searchParams.set('from', range.from.toISOString());
    this.url.searchParams.set('to', range.to.toISOString());

    fetchJson(this.url)
      .then(response => {
        this.getData(response);
      })
      .then(this.updateColumnChar)
      .catch(error => {
        console.error('error', error);
      })
      .finally(() => {
        this.element.classList.remove(this.loadingClass);
      });
  }

  getData(response) {
    const sum = Object.values(response).reduce((sum, current) => sum + current, 0);
    this.data = response;
    this.value = this.formatHeading(sum);
  }

  updateColumnChar = () => {
    this.subElements.body.innerHTML = this.getColumnBody(this.data);
    this.subElements.header.innerHTML = this.value;
  }

  update(dateFrom, dateTo) {
    this.range = {
      from: dateFrom,
      to: dateTo,
    };
    this.element.classList.add(this.loadingClass);
    this.getServerData();
  }

  getColumnBody (data) {
    const columnsData = Object.values(data);
    const maxValue = Math.max(...columnsData);
    const scale = this.chartHeight / maxValue;

    return columnsData.map(item => {
      const percent = (item / maxValue * 100).toFixed(0) + '%';
      const value = String(Math.floor(item * scale));

      return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
    }).join('');
  }

  get template() {
    return `
    <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        ${this.label}
        <a class="column-chart__link" href="${this.link}">View all</a>
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
          ${this.value}
        </div>
      <div data-element="body" class="column-chart__chart">
           ${this.getColumnBody(this.data)}
      </div>
    </div>
    `;
  }

  getSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      subElements[name] = subElement;
    }
    return subElements;
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.data = [];
    this.label = '';
    this.value = '';
    this.link = '';
    this.remove();
  }
}
