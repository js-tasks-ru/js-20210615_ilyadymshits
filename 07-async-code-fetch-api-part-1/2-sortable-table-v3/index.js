import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  constructor(headerConfig = [], {
    url = '',
    isSortLocally = false,
    sorted = {
      id: headerConfig[1].id, // TODO check it
      order: 'asc',
    }
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.headerConfig = headerConfig;
    this.data = [];
    this.sorted = sorted;

    this.offset = 0;
    this.interval = 30;
    this.loadingClass = 'sortable-table_empty';

    this.render();
  }

  sortOnClient (id, order) {
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];
    const { sortType } = this.headerConfig.find(item => item.id === id);

    this.data.sort((a, b) => {
      switch (sortType) {
      case 'string':
        return direction * a[id].localeCompare(b[id], ['ru', 'en'], {caseFirst: 'upper'});
      case 'number':
        return direction * (a[id] - b[id]);
      }
    });

    this.subElements.body.innerHTML = this.getTableBody(this.data);
  }

  async sortOnServer (id, order) {
    this.offset = 0;
    this.sorted.id = id;
    this.sorted.order = order;

    const data = await this.getServerData();
    this.updateTable(data);
  }

  sortOnClick = (e) => {
    const allColumns = this.subElements.header.querySelectorAll(`.sortable-table__cell`);
    const column = e.target.closest(`[data-sortable = "true"]`);

    if (!column) {return;}

    const order = column.dataset.order ? column.dataset.order : 'desc';
    const id = column.dataset.id;

    const toggleDirection = order => {
      const directions = {
        asc: 'desc',
        desc: 'asc',
      };
      return directions[order];
    };

    allColumns.forEach(node => {
      node.dataset.order = '';
      if (node.dataset.id === id) {
        node.dataset.order = toggleDirection(order);
      }
    });

    switch (this.isSortLocally) {
    case true:
      this.sortOnClient(id, order);
      break;
    case false:
      this.sortOnServer(id, order);
      break;
    }
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTable();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.data = await this.getServerData();
    this.updateTable(this.data);

    this.initEventListeners();
  }

  async getServerData () {
    const {id, order} = this.sorted;
    const start = this.offset;
    const end = this.offset + this.interval;

    const urlParams = {
      '_embed': 'subcategory.category',
      '_sort': id,
      '_order': order,
      '_start': start,
      '_end': end,
    };

    for (const key in urlParams) {
      this.url.searchParams.set(key, urlParams[key]);
    }

    const response = await fetchJson(this.url);
    if (response.length) {
      this.offset += this.interval;
      window.addEventListener('scroll', this.addRowsToTable);
    }

    return response;
  }

  updateTable (data) {
    this.element.classList.remove(this.loadingClass);

    switch (this.offset) {
    case this.interval:
      this.subElements.body.innerHTML = this.getTableBody(data);
      break;
    default:
      this.subElements.body.insertAdjacentHTML("beforeend", this.getTableBody(data));
    }
  }

  getTableHeader () {
    return this.headerConfig.map(header => {
      return `
              <div class="sortable-table__cell" data-id="${header.id}" data-sortable="${header.sortable}">
                  <span>${header.title}</span>
                  <span data-element="arrow" class="sortable-table__sort-arrow">
                    <span class="sort-arrow"></span>
                  </span>
              </div>
            `;
    }).join('');
  }

  getColls (row) {
    return this.headerConfig.map(header => {
      if (header.template) {
        return header.template(row[header.id]);
      }
      return `<div class="sortable-table__cell">${row[header.id]}</div>`;
    }).join('');
  }

  getTableBody (data) {
    return data.map(row => {
      return `
              <a href="/products/${row.id}" class="sortable-table__row">
                  ${this.getColls(row)}
              </a>
            `;
    }).join('');
  }

  getSubElements (element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');
    for (const subElements of elements) {
      const name = subElements.dataset.element;
      result[name] = subElements;
    }
    return result;
  }

  getTable = () => {
    return `
        <div data-element="productsContainer" class="products-list__container sortable-table_empty">
          <div class="sortable-table">
            <div data-element="header" class="sortable-table__header sortable-table__row">
                 ${this.getTableHeader()}
            </div>
            <div data-element="body" class="sortable-table__body">
                ${this.getTableBody(this.data)}
            </div>
            <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

            <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
              <div>
                <p>No products satisfies your filter criteria</p>
                <button type="button" class="button-primary-outline">Reset all filters</button>
              </div>
            </div>

          </div>
        </div>
     `;
  }

  initEventListeners () {
    this.subElements.header.addEventListener('pointerdown', this.sortOnClick);
  }

  addRowsToTable = async (e) => {
    const beforeBodyEnd = 100;

    let windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;
    if (windowRelativeBottom < document.documentElement.clientHeight + beforeBodyEnd) {
      window.removeEventListener('scroll', this.addRowsToTable);
      const data = await this.getServerData();
      this.updateTable(data);
    }
  }

  removeEventListeners () {
    this.subElements.header.removeEventListener('pointerdown', this.sortOnClick);
    window.removeEventListener('scroll', this.addRowsToTable);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.offset = 0;
    this.headerConfig = [];
    this.data = [];
    this.subElements = null;
  }
}
