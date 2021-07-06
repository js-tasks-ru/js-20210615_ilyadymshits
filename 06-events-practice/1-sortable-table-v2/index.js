export default class SortableTable {
  constructor(headerConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
    this.initEventListeners();
  }


  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  sort(field, order) {
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];
    const allColumns = this.subElements.header.querySelectorAll(`.sortable-table__cell`);

    allColumns.forEach(node => {
      node.dataset.order = '';
      if (node.dataset.id === field) {
        node.dataset.order = direction > 0 ? 'desc' : 'asc';
        let test = node.dataset.order;
      }
    });

    this.headerConfig.map(header => {
      if (field === header.id) {

        switch (header.sortType) {
        case 'string':
          this.data.sort((a, b) => {
            return direction * a[field].localeCompare(b[field], ['ru', 'en'], {caseFirst: 'upper'});
          });
          break;
        case 'number':
          this.data.sort((a, b) => {
            return direction * (a[field] - b[field]);
          });
          break;
        }
      }
    });

    // this.subElements.header.innerHTML = this.getTableHeader();
    this.subElements.body.innerHTML = this.getTableBody();
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

  getTableBody () {
    return this.data.map(row => {
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


  get template() {
    return `
        <div data-element="productsContainer" class="products-list__container">
          <div class="sortable-table">

            <div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.getTableHeader()}
            </div>

            <div data-element="body" class="sortable-table__body">
                ${this.getTableBody()}
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
    this.subElements.header.addEventListener('pointerdown', (e) => {
      let target = e.target;
      while (e.currentTarget.contains(target)) {
        switch (target.dataset.sortable) {
        case 'true':
          const order = target.dataset.order ? target.dataset.order : 'desc';
          const field = target.dataset.id;
          this.sort(field, order);
          break;
        }
        target = target.parentNode;
      }
    });
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.headerConfig = [];
    this.data = [];
    this.subElements = null;
  }
}
