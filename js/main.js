
var doc, model, root, id, token,
  realtimeUtils = new utils.RealtimeUtils({
    clientId: '667993139297-somqjqbgk43klgugl6tlpf4b4ppbpjm6.apps.googleusercontent.com',
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
  id = realtimeUtils.getParam('id');
  if (id && id != 'undefined') {
    realtimeUtils.load(id.replace('/', ''), onFileLoaded, onFileInitialize);
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
}

function executeGetModel() {
  var path = document.querySelector('#path').value;
  var depth = document.querySelector('#depth').value;
  var revision = document.querySelector('#revision').value;

  function callback () {
    document.querySelector('.response textarea').textContent = request.responseText;
    document.querySelector('.response').classList.add('active');
  }

  var request = new XMLHttpRequest();
  request.onload = callback;
  request.open('get', 'https://realtime.googleapis.com/v1/files/' + id + '/model/' + revision + '/' + path + '?depth=' + depth);
  request.setRequestHeader('Authorization', 'Bearer ' + token);
  request.send();
}
