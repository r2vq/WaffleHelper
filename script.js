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

HTMLElement.prototype.addChild = function(child) {
  this.appendChild(child);
  return this;
}

HTMLElement.prototype.addToParent = function(parent) {
  parent.appendChild(this);
  return this;
}

HTMLElement.prototype.on = function(eventName, callback) {
  this.addEventListener(eventName, callback);
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
    let board = createElement("div")
      .addClass("board");
    let minimap = createElement("div")
      .addClass("minimap");
    let row;
    let minirow;
    for (let i = 0; i < data.length; i++) {
      if (currentRow >= maxRow) {
        row = createElement("div")
          .addClass("row")
          .addToParent(board);

        minirow = createElement("div")
          .addClass("row")
          .addToParent(minimap);

        currentRow = 0;
      }
      switch (i) {
        case 6:
        case 7:
        case 14:
        case 15:
          createElement("div")
            .setInnerHtml("&nbsp;")
            .addClass("cell")
            .addClass("space")
            .addToParent(row);

          createElement("div")
            .setInnerHtml("&nbsp;")
            .addClass("cell")
            .addClass("space")
            .addToParent(minirow);

          currentRow += 1;
          break;
      }
      let item = data[i];
      let cell = createElement("div")
        .setInnerText(item.letter)
        .addClass("cell")
        .addClass("letter");
      let minicell = createElement("div")
        .setInnerText(item.letter)
        .addClass("cell")
        .addClass("letter");
      if (item.green) {
        cell.addClass("green");
        minicell.addClass("green");
      } else if (item.yellow) {
        cell.addClass("yellow");
        minicell.addClass("yellow");
      }
      if (!item.green) {
        cell.on("click", onItemClick);
      }
      cell.addToParent(row);
      minicell.addToParent(minirow);
      currentRow += 1;
    }
    minimap.on("click", loadDataOrCache);
    body.setInnerHtml("")
      .addChild(minimap)
      .addChild(board);
  } else {
    body.setInnerHtml("Something went wrong. Try refreshing.");
  }

  let buttons = createElement("div")
    .addClass("buttons")
    .addToParent(body);

  createElement("div")
    .setInnerText("New Game")
    .addClass("refresh")
    .addClass("button")
    .on("click", onRefreshClick)
    .addToParent(buttons);

  createElement("div")
    .setInnerText("Reset")
    .addClass("reset")
    .addClass("button")
    .on("click", loadDataOrCache)
    .addToParent(buttons);
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
    cell.removeClass("yellow")
      .addClass("blue");
    selected.removeClass("yellow")
      .addClass("blue");
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
