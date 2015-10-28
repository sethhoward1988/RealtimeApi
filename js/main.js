var clientId = 'YOUR CLIENT ID HERE';

var doc, model, root, id, token,
  realtimeUtils = new utils.RealtimeUtils({
    clientId: clientId,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

realtimeUtils.authorize(function(response) {
  if (response.error) {
    document.body.classList.add('unauthenticated');
    var button = document.querySelector('#auth_button');
    button.addEventListener('click', function() {
      realtimeUtils.authorize(function(response){
        startApp();
      }, true);
    });
  } else {
    startApp();
  }
});

function startApp() {
  id = realtimeUtils.getParam('id').replace('/', '');
  if (id && id != 'undefined') {
    realtimeUtils.load(id, onFileLoaded, onFileInitialize);
  } else {
    realtimeUtils.createRealtimeFile('Realtime API Test File', function(createResponse) {
      id = createResponse.id;
      window.history.pushState(null, null, '?id=' + id);
      realtimeUtils.load(id, onFileLoaded, onFileInitialize);
    });
  }
}

function onFileLoaded(doc) {
  doc = doc;
  model = doc.getModel();
  root = model.getRoot();
  token = gapi.auth.getToken().access_token;
  loadMetadata();
  setBindings();

  document.body.classList.add('authenticated');
  document.body.classList.remove('unauthenticated');
  document.querySelector('#doc_id').value = id;
  document.querySelector('#oauth_token').value = token;

  // Set bindings
  gapi.drive.realtime.databinding.bindString(root.get('demo_string'), document.querySelector('#string'));

}

function onFileInitialize(model) {
  model.getRoot().set('demo_string', model.createString('Hello World!'));
}

function loadMetadata() {
  gapi.client.load('drive', 'v2', function() {
    gapi.client.drive.files.get({
      'fileId' : id
    }).execute(function(file) {
      document.querySelector('#doc_name').value = file.title;
    });
  });
}

function setBindings() {
  document.querySelector('#get_model').addEventListener('click', executeGetModel);
  document.querySelector('#get_model_curl').addEventListener('click', showGetCurl);
  document.querySelector('#patch_model').addEventListener('click', executePatchModel);
  document.querySelector('#patch_model_curl').addEventListener('click', showPatchCurl);
}

function executeGetModel() {
  var path = document.querySelector('#path').value;
  var depth = document.querySelector('#depth').value;

  function callback () {
    document.querySelector('.response textarea').textContent = request.responseText;
    document.querySelector('.response').classList.add('active');
  }

  var request = new XMLHttpRequest();
  request.onload = callback;
  request.open('get', 'https://realtime.googleapis.com/v1/files/' + id + '/model/0/' + path + '?depth=' + depth + '&access_token=' + token);
  request.send();
}

function showGetCurl() {
  var path = document.querySelector('#path').value;
  var depth = document.querySelector('#depth').value;

  var command = 'curl -H "Authorization: Bearer ' + token +
    '" https://realtime.googleapis.com/v1/files/' + id + '/model/0/' + path + '?depth=' + depth;
  document.querySelector('.response textarea').textContent = command;
  document.querySelector('.response').classList.add('active');
}

function executePatchModel() {
  var index = document.querySelector('#index').value;
  var text = document.querySelector('#text').value;

  function callback () {
    document.querySelectorAll('.response textarea')[1].textContent = request.responseText;
    document.querySelectorAll('.response')[1].classList.add('active');
  }

  var request = new XMLHttpRequest();
  request.onload = callback;
  request.open('PATCH', 'https://realtime.googleapis.com/v1/files/' + id + '/model/0', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.setRequestHeader('Authorization', 'Bearer ' + token);
  request.send(JSON.stringify({
    path: 'root/demo_string',
    insert: {
      index: index,
      stringValue: text
    }
  }));
}

function showPatchCurl() {
  var command = 'curl -X PATCH -H "Content-Type: application/json" ' +
    '-H "Authorization: Bearer ' + token +
    '" -s https://realtime.googleapis.com/v1/files/' + id +
    '/model/0 -d \'' + JSON.stringify({
      path: 'root/demo_string',
      insert: {
        index: document.querySelector('#index').value,
        stringValue: document.querySelector('#text').value
      }
    }) + '\'';
  document.querySelectorAll('.response textarea')[1].textContent = command;
  document.querySelectorAll('.response')[1].classList.add('active');
}
