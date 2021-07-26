import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

  subElements = {};
  range = {
    from: new Date('2020-04-06'),
    to: new Date('2020-05-06'),
  };
  url = 'api/dashboard/bestsellers';
  element = '';

  render() {

    const element = document.createElement('div');

    const rangePicker = this.getRangePicker();
    const columnChart = this.getColumnChart();
    const sortableTable = this.getSortableTable();

    element.append(rangePicker.element);
    element.append(columnChart);
    element.append(sortableTable.element);
    this.element = element;

    this.addEventListeners();

    return element;
  }

  getRangePicker = () => {
    const rangePicker = new RangePicker(this.range);
    this.subElements.rangePicker = rangePicker.element;
    return rangePicker;
  }

  getSortableTable = (range = this.range) => {
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set('from', range.from);
    url.searchParams.set('to', range.to);

    const sortableTable = new SortableTable(
      header,
      {
        url: url.toString(),
        isSortLocally: true
      });
    this.subElements.sortableTable = sortableTable.element;

    return sortableTable;
  }

  getColumnChart = () => {
    const element = document.createElement('div');
    this.columnChart = {};
    element.classList.add('dashboard__charts');

    const range = this.range;

    const chartConfig = {
      ordersChart: {
        url: 'api/dashboard/orders',
        label: 'orders',
        range: range,
        link: '#',
      },
      salesChart: {
        url: 'api/dashboard/sales',
        label: 'sales',
        range: range,
        formatHeading: data => `$${data}`
      },
      customersChart: {
        url: 'api/dashboard/customers',
        label: 'customers',
        range: range,
      }
    };

    for (const chart in chartConfig) {
      const cssClass = chartConfig[chart].label;
      this.columnChart[chart] = new ColumnChart(chartConfig[chart]);
      this.subElements[chart] = this.columnChart[chart].element;
      this.subElements[chart].classList.add(`dashboard__chart_${cssClass}`);
      element.append(this.subElements[chart]);
    }

    return element;
  }

  updateElements = event => {
    const range = event.detail;

    this.columnChart.ordersChart.update(range.from, range.to);
    this.columnChart.salesChart.update(range.from, range.to);
    this.columnChart.customersChart.update(range.from, range.to);

    const sortableTable = this.getSortableTable(range);
    this.subElements.sortableTable.innerHTML = sortableTable;
  }

  addEventListeners() {
    document.addEventListener('date-select', this.updateElements);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener('date-select', this.updateElements);
    this.remove();
  }
}
