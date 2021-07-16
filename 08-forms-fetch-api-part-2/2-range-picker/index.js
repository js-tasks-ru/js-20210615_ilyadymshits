export default class RangePicker {

  locale = 'ru';
  numberOfMonths = 2;

  constructor ({
    from = new Date(),
    to = new Date(),
  } = {}) {
    this.from = from;
    this.to = to;
    this.element = '';
    this.classes = {
      'openCalendar': 'rangepicker_open'
    };

    this.render();
  }

  render () {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    this.initEventListeners();
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return `${day}.${month}.${year}`;
  }

  get template() {
    return `
      <div class="rangepicker">

        <div class="rangepicker__input" data-element="input">
          <span data-element="from" data-timestamp ="${this.from}">${this.formatDate(this.from)}</span> -
          <span data-element="to" data-timestamp = "${this.to}">${this.formatDate(this.to)}</span>
        </div>
         <div class="rangepicker__selector" data-element="selector">
            ${this.getMonths()}
        </div>
      </div>
    `;
  }

  getMonths(
    yearFrom = this.from.getFullYear(),
    monthFrom = this.from.getMonth()
  ) {
    const monthContent = [];

    for (let i = 0; i < this.numberOfMonths; i++) {
      monthContent.push(this.getMonth(yearFrom, monthFrom + i));
    }

    return `
          <div class="rangepicker__selector-arrow"></div>
          <div class="rangepicker__selector-control-left"></div>
          <div class="rangepicker__selector-control-right"></div>
             ${monthContent.join('')}
          </div>
    `;
  }

  getMonth(year, rawMonth) {

    let day = 1;
    let date = new Date(year, rawMonth, day);
    const month = date.getMonth();
    const firstMonthDay = new Date(year, rawMonth, day);
    const days = [];

    while (date.getMonth() === month) {
      days.push(date);
      date = new Date(year, month, ++day);
    }

    const getWeekDays = () => {
      let weekDays = '';
      for (let d = 0; d < 7 ; d++) {
        let weekDay = new Date(2000, 1, d).toLocaleDateString(this.locale, {weekday: 'short'});
        weekDays += `<div>${weekDay.charAt(0).toUpperCase() + weekDay.slice(1)}</div>`;
      }
      return weekDays;
    };

    const getDays = () => {

      const getStatus = currentDay =>{
        const tsFrom = this.from.getTime();
        const tsTo = this.to.getTime();
        const tsCurrentDay = currentDay.getTime();

        switch (true) {
        case (tsCurrentDay === tsFrom) :
          return 'rangepicker__selected-from';
        case (tsCurrentDay > tsFrom && tsCurrentDay < tsTo) :
          return 'rangepicker__selected-between';
        case (tsCurrentDay === tsTo) :
          return 'rangepicker__selected-to';
        default:
          return '';
        }
      };

      return days.map(day => {
        let style = (day.getDate() === 1) ? `style="--start-from: ${day.getDay()}"` : '';
        return `
            <button type="button" class="rangepicker__cell ${getStatus(day)}"
                data-value="${day}" ${style}>${day.getDate()}
            </button>
        `;
      }).join('');

    };

    return `
        <div class="rangepicker__calendar">
          <div class="rangepicker__month-indicator">
            <time datetime="${firstMonthDay.getTime()}">${firstMonthDay.toLocaleDateString(this.locale, {month: 'long'})} - ${firstMonthDay.getFullYear()}</time>
          </div>

          <div class="rangepicker__day-of-week">
            ${getWeekDays()}
          </div>

          <div class="rangepicker__date-grid">
             ${getDays()}
            </div>
        </div>
      `;
  }

  selectDate = (e) => {
    const moveLeft = e.target.closest(`.rangepicker__selector-control-left`);
    const moveRight = e.target.closest(`.rangepicker__selector-control-right`);
    const chooseDay = e.target.closest(`button`);

    switch (true) {
    case (Boolean(moveLeft)) :
      this.updateMonths('prev');
      break;
    case (Boolean(moveRight)):
      this.updateMonths('next');
      break;
    case (Boolean(chooseDay)):
      this.updateRange(chooseDay);
      break;
    }
  }

  updateInput() {
    this.subElements.input.innerHTML = `
        <span data-element="from" data-timestamp ="${this.from}">${this.formatDate(this.from)}</span> -
        <span data-element="to" data-timestamp = "${this.to}">${this.formatDate(this.to)}</span>
    `;
  }

  updateRange(selectedDay) {
    const newDate = new Date(selectedDay.dataset.value);

    if (this.from.getTime() === this.to.getTime()) {
      const prevDate = Math.min(this.from.getTime(), newDate.getTime());
      const nextDate = Math.max(this.to.getTime(), newDate.getTime());
      this.from = new Date(prevDate);
      this.to = new Date(nextDate);


      this.dispatchEvents();
      this.updateInput();
      this.toggleCalendar();

    } else {
      this.from = newDate;
      this.to = newDate;
    }

    this.subElements.selector.innerHTML = this.getMonths();
  }

  updateMonths(nav) {
    const directions = {
      next: 1,
      prev: -1
    };
    const direction = directions[nav];
    const timestamp = this.element.querySelector('time').dateTime;
    const date = new Date(parseInt(timestamp));

    this.subElements.selector.innerHTML = this.getMonths(date.getFullYear(), date.getMonth() + direction);
  }

  toggleCalendar = () => {
    this.subElements.rangepicker.classList.toggle(this.classes.openCalendar);
  }

  hideCalendar = e => {
    if (!this.element.contains(e.target)) {
      this.subElements.rangepicker.classList.remove(this.classes.openCalendar);
    }
  }

  getSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      subElements[name] = subElement;
    }

    subElements['rangepicker'] = element.querySelector('.rangepicker');
    return subElements;
  }

  initEventListeners() {
    this.subElements.input.addEventListener('pointerdown', this.toggleCalendar);
    this.subElements.selector.addEventListener('pointerdown', this.selectDate);
    document.body.addEventListener('pointerdown', this.hideCalendar, {capture: true});
  }

  dispatchEvents = () => {
    const eventName = 'date-select';
    const event = new CustomEvent(eventName, {
      detail: {
        from: this.from,
        to: this.to
      }
    });

    this.element.dispatchEvent(event);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    document.body.removeEventListener('pointerdown', this.hideCalendar, {capture: true});
  }
}
