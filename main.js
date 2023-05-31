console.log('Hello world!')

const ws = new WebSocket('ws://localhost:8080')

formChat.addEventListener('submit', (e) => {
    e.preventDefault()
    ws.send(textField.value)
    textField.value = null
})

ws.onopen = (e) => {
    console.log('Hello WebSocket!')
}

ws.onmessage = (e) => {
    const data = e.data;
    let element;

    try {
        const jsonData = JSON.parse(data);
        const dates = Object.keys(jsonData);
        let previousTable = null;

        for (const date of dates) {
            const tableData = jsonData[date];
            const table = createTable(tableData, date);
            if (previousTable) {
                const tableWrapper = document.createElement('div');
                tableWrapper.style.marginTop = '30px'; // Добавляем отступ сверху для таблицы
                tableWrapper.appendChild(table);
                subscribe.appendChild(tableWrapper);
            } else {
                subscribe.appendChild(table);
            }
            previousTable = table;
        }
    } catch (error) {
        element = createTextElement(data);
        subscribe.appendChild(element);
    }
}

function createTable(tableData, date) {
  const table = document.createElement('table');
  table.classList.add('currency-table'); // Добавляем класс таблицы для стилизации

  // Создаем заголовок таблицы и добавляем его в таблицу
  const headerRow = document.createElement('tr');
  const dateHeader = document.createElement('th');
  dateHeader.textContent = 'Дата';
  const currencyHeader = document.createElement('th');
  currencyHeader.textContent = 'Валюта';
  const purchaseHeader = document.createElement('th');
  purchaseHeader.textContent = 'Курс покупки';
  const saleHeader = document.createElement('th');
  saleHeader.textContent = 'Курс продажи';

  headerRow.appendChild(dateHeader);
  headerRow.appendChild(currencyHeader);
  headerRow.appendChild(purchaseHeader);
  headerRow.appendChild(saleHeader);
  table.appendChild(headerRow);

  // Создаем строки с данными для каждой валюты
  let isFirstRow = true; // Флаг для первой строки таблицы
  for (const currency in tableData) {
    const currencyData = tableData[currency];

    const dataRow = document.createElement('tr');
    const dateCell = document.createElement('td');
    const currencyCell = document.createElement('td');
    const purchaseCell = document.createElement('td');
    const saleCell = document.createElement('td');

    currencyCell.textContent = currency;
    purchaseCell.textContent = currencyData.purchase;
    saleCell.textContent = currencyData.sale;

    if (isFirstRow) {
      dateCell.textContent = date;
      dateCell.rowSpan = Object.keys(tableData).length; // Устанавливаем высоту столбца с датой
      dateCell.style.textAlign = 'center'; // Центрируем текст по горизонтали
      dateCell.style.verticalAlign = 'middle'; // Центрируем текст по вертикали
      dataRow.appendChild(dateCell);
      isFirstRow = false;
    }

    dataRow.appendChild(currencyCell);
    dataRow.appendChild(purchaseCell);
    dataRow.appendChild(saleCell);
    table.appendChild(dataRow);
  }

  // Применяем стили к таблице
  table.style.borderCollapse = 'collapse'; // Схлопываем границы ячеек
  table.style.width = '100%'; // Устанавливаем ширину таблицы
  table.style.marginTop = '30px'; // Добавляем отступ сверху

  const cells = table.querySelectorAll('th, td');
  cells.forEach((cell) => {
    cell.style.border = '1px solid lightgray'; // Устанавливаем границы ячеек
    cell.style.padding = '8px'; // Устанавливаем отступ внутри ячеек
  });

  const headerCells = table.querySelectorAll('th');
  headerCells.forEach((headerCell) => {
    headerCell.style.backgroundColor = 'lightgray'; // Задаем фон заголовка таблицы
    headerCell.style.fontWeight = 'bold'; // Устанавливаем жирный шрифт для заголовка
  });

  return table;
}






function createTextElement(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div;
}