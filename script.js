HTMLElement.prototype.addClass = function(className) {
  this.classList.add(className);
  return this;
}

HTMLElement.prototype.removeClass = function(className) {
  this.classList.remove(className);
  return this;
}

HTMLElement.prototype.setInnerText = function(text) {
  this.innerText = text;
  return this;
}

HTMLElement.prototype.setInnerHtml = function(html) {
  this.innerHTML = html;
  return this;
}

function createElement(type) {
  return document.createElement(type);
}

function findElement(selector) {
  return document.querySelector(selector);
}

function loadXMLDoc(url) {
  return new Promise((resolve, reject) => {

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE) { // XMLHttpRequest.DONE == 4
        if (xmlhttp.status == 200) {
          resolve(JSON.parse(xmlhttp.responseText));
        } else if (xmlhttp.status == 400) {
          reject('There was an error 400');
        } else {
          reject('something else other than 200 was returned');
        }
      }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  });
}

function loadData() {
  let api = "https://us-central1-waffle-helper.cloudfunctions.net/waffle";
  loadXMLDoc(api)
    .then((data) => {
      loadBoard(data);
      localStorage.setItem("data", JSON.stringify(data));
    })
    .catch((error) => {
      console.log(error);
    });
}

function loadBoard(data) {
  let body = findElement("body");
  if (data.length) {
    let maxRow = 5;
    let currentRow = 5;
    let board = createElement("div");
    board.addClass("board");
    let minimap = createElement("div");
    minimap.addClass("minimap");
    let row;
    let minirow;
    for (let i = 0; i < data.length; i++) {
      if (currentRow >= maxRow) {
        row = createElement("div");
        row.addClass("row");
        board.appendChild(row);

        minirow = createElement("div");
        minirow.addClass("row");
        minimap.appendChild(minirow);

        currentRow = 0;
      }
      switch (i) {
        case 6:
        case 7:
        case 14:
        case 15:
          let space = createElement("div");
          space.setInnerHtml("&nbsp;");
          space.addClass("cell");
          space.addClass("space");
          row.appendChild(space);

          let minispace = createElement("div");
          minispace.setInnerHtml("&nbsp;");
          minispace.addClass("cell");
          minispace.addClass("space");
          minirow.appendChild(minispace);

          currentRow += 1;
          break;
      }
      let item = data[i];
      let cell = createElement("div");
      cell.setInnerText(item.letter);
      cell.addClass("cell");
      cell.addClass("letter");
      let minicell = createElement("div");
      minicell.setInnerText(item.letter);
      minicell.addClass("cell");
      minicell.addClass("letter");
      if (item.green) {
        cell.addClass("green");
        minicell.addClass("green");
      } else if (item.yellow) {
        cell.addClass("yellow");
        minicell.addClass("yellow");
      }
      if (!item.green) {
        cell.addEventListener("click", onItemClick);
      }
      row.appendChild(cell);
      minirow.appendChild(minicell);
      currentRow += 1;
    }
    minimap.addEventListener("click", loadDataOrCache);
    body.setInnerHtml("");
    body.appendChild(minimap);
    body.appendChild(board);
  } else {
    body.setInnerHtml("Something went wrong. Try refreshing.");
  }
  let refreshButton = createElement("div");
  refreshButton.setInnerText("Force Refresh");
  refreshButton.addClass("refresh");
  refreshButton.addEventListener("click", onRefreshClick);
  body.appendChild(refreshButton);
}

let selected;

function onItemClick(e) {
  let cell = e.target;
  if (!selected) {
    cell.addClass("selected");
    selected = cell;
  } else if (selected === cell) {
    selected.removeClass("selected");
    selected = undefined;
  } else {
    selected.removeClass("selected");
    cell.removeClass("yellow");
    cell.addClass("blue");
    selected.removeClass("yellow");
    selected.addClass("blue");
    let storage = selected.innerText;
    selected.setInnerText(cell.innerText);
    cell.setInnerText(storage);
    selected = undefined;
  }
}

function onRefreshClick(e) {
  let refresh = confirm("Refresh data from server? Don't do this too often.");
  if (refresh) {
    localStorage.removeItem("data");
    loadDataOrCache();
  }
}

function loadDataOrCache() {
  let data = localStorage.getItem("data");

  if (!data) {
    let body = findElement("body");
    body.setInnerHtml("Loading... do not refresh");
    loadData();
  } else {
    loadBoard(JSON.parse(data));
  }
}

loadDataOrCache();
