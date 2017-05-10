var defaultScreen = localStorage.getItem('defaultscreen');
var server = 'http://corsica.mozilla.io/';

function sendCommand(command, nolog) {

  if (command.indexOf('screen=') === -1 && defaultScreen) {
    command += ' screen=' + defaultScreen;
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', server + 'api/command', true);

  xhr.send(
    new Blob(
      [JSON.stringify({
        raw:command
      })],
      {'type': 'application/json'}
    )
  );
}

var sendButton = document.querySelector('.send');
var argsEl = document.querySelector('.args');

sendButton.addEventListener('click', submit);

function submit() {
  var args = argsEl.value;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    sendCommand(tabs[0].url + ' ' + args);
  });
}

argsEl.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    submit();
  }
});

var select = document.querySelector('.screen');

function getCensus(cb) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', server + 'api/census.clients', true);
  xhr.onload = function () {
    cb(JSON.parse(xhr.response));
  };
  xhr.send();
}

var select = document.querySelector('.screen');

function updateSelect(census) {
  var clients = census.clients;
  while (select.childNodes.length) {
    select.firstChild.remove();
  }
  clients.sort();
  clients.unshift('');
  clients.forEach(function (c) {
    var o = document.createElement('option');
    if (c === defaultScreen) {
      o.setAttribute('selected', true);
    }
    o.value = c;
    o.innerHTML = c;
    select.appendChild(o);
  });
  setTimeout(function () {
    getCensus(updateSelect);
  }, 30 * 1000);
}

select.addEventListener('change', function (e) {
  defaultScreen = select.value;
  localStorage.setItem('defaultscreen', defaultScreen);
});

function queryParams (url) {
  // Isolate the querystring.
  if (url.indexOf('?') >= 0) {
    url = url.split('?')[1];
  }
  var obj = {};
  var pairs = url.split('&');

  pairs.forEach(function(p) {
    p = p.split('=');
    obj[p[0]] = typeof p[1] === 'undefined' ? true: p[1];
  });

  return obj;
}

document.querySelector('.reset').addEventListener('click', function (e) {
  e.preventDefault();
  sendCommand('reset');
});

getCensus(updateSelect);
