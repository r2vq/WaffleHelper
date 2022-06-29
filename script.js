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
  console.log("loading... don't refresh!");
  let api = "https://us-central1-waffle-helper.cloudfunctions.net/waffle";
  loadXMLDoc(api)
    .then((data) => {
      loadBoard(data);
    })
    .catch((error) => {
      console.log(error);
    });
}

function loadBoard(data) {
  if (data.length) {
    let maxRow = 5;
    let currentRow = 5;
    let body = document.querySelector("body");
    let board = document.createElement("div");
    board.classList.add("board");
    let minimap = document.createElement("div");
    minimap.classList.add("minimap");
    let row;
    let minirow;
    for (let i = 0; i < data.length; i++) {
      if (currentRow >= maxRow) {
        row = document.createElement("div");
        row.classList.add("row");
        board.appendChild(row);

        minirow = document.createElement("div");
        minirow.classList.add("row");
        minimap.appendChild(minirow);

        currentRow = 0;
      }
      switch (i) {
        case 6:
        case 7:
        case 14:
        case 15:
          let space = document.createElement("div");
          space.innerHTML = "&nbsp;";
          space.classList.add("cell");
          space.classList.add("space");
          row.appendChild(space);

          let minispace = document.createElement("div");
          minispace.innerHTML = "&nbsp;";
          minispace.classList.add("cell");
          minispace.classList.add("space");
          minirow.appendChild(minispace);

          currentRow += 1;
          break;
      }
      let item = data[i];
      let cell = document.createElement("div");
      cell.innerText = item.letter;
      cell.classList.add("cell");
      cell.classList.add("letter");
      let minicell = document.createElement("div");
      minicell.innerText = item.letter;
      minicell.classList.add("cell");
      minicell.classList.add("letter");
      if (item.green) {
        cell.classList.add("green");
        minicell.classList.add("green");
      } else if (item.yellow) {
        cell.classList.add("yellow");
        minicell.classList.add("yellow");
      }
      if (!item.green) {
        cell.addEventListener("click", onItemClick);
      }
      row.appendChild(cell);
      minirow.appendChild(minicell);
      currentRow += 1;
    }
    body.innerHTML = "";
    body.appendChild(minimap);
    body.appendChild(board);
  } else {
    body.innerHTML = "Something went wrong. Try refreshing.";
  }
}

let selected;

function onItemClick(e) {
  let cell = e.target;
  if (!selected) {
    cell.classList.add("selected");
    selected = cell;
  } else if (selected === cell) {
    selected.classList.remove("selected");
    selected = undefined;
  } else {
    selected.classList.remove("selected");
    cell.classList.remove("yellow");
    selected.classList.remove("yellow");
    let storage = selected.innerText;
    selected.innerText = cell.innerText;
    cell.innerText = storage;
    selected = undefined;
  }
}

loadData();
