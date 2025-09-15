(function(){
  'use strict';

  var video = null;
  var canvas = null;
  var ctx = null;
  var scanner = null;
  var currentStream = null;
  var logBody = null;
  var cameraSelect = null;
  var permPill = null;
  var rowCount = 0;

  document.addEventListener('DOMContentLoaded', function(){
    video = document.getElementById('video');
    canvas = document.getElementById('captureCanvas');
    ctx = canvas.getContext('2d');
    logBody = document.getElementById('logBody');
    cameraSelect = document.getElementById('cameraSelect');
    permPill = document.getElementById('permPill');

    document.getElementById('permBtn').addEventListener('click', requestPermission);
    document.getElementById('startBtn').addEventListener('click', startCamera);
    document.getElementById('stopBtn').addEventListener('click', stopCamera);

    updatePermissionPill('unknown');
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      enumerateCameras();
    }
  });

  function updatePermissionPill(state){
    permPill.textContent = 'Permission: ' + state;
  }

  function requestPermission(){
    navigator.mediaDevices.getUserMedia({video:true,audio:false}).then(function(stream){
      stream.getTracks().forEach(function(t){ t.stop(); });
      updatePermissionPill('granted');
      return enumerateCameras();
    }).catch(function(err){
      console.warn('getUserMedia error:', err);
      updatePermissionPill('denied');
      alert('Camera permission denied or unavailable.');
    });
  }

  function enumerateCameras(){
    return navigator.mediaDevices.enumerateDevices().then(function(devs){
      var cams = devs.filter(function(d){ return d.kind === 'videoinput'; });
      cameraSelect.innerHTML = '';
      cams.forEach(function(cam, i){
        var opt = document.createElement('option');
        opt.value = cam.deviceId || (''+i);
        opt.textContent = cam.label || ('Camera ' + (i+1));
        cameraSelect.appendChild(opt);
      });
    });
  }

  function startCamera(){
    stopCamera();
    var deviceId = cameraSelect.value;
    var constraints = { video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' }, audio:false };
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream){
      currentStream = stream;
      video.srcObject = stream;
      video.play();
      initScanner();
    }).catch(function(err){
      console.error('startCamera error:', err);
      alert('Unable to start camera: ' + err.message);
    });
  }

  function stopCamera(){
    if (scanner) {
      scanner.stop();
      scanner.destroy();
      scanner = null;
    }
    if (video) {
      video.pause();
      video.srcObject = null;
    }
    if (currentStream) {
      currentStream.getTracks().forEach(function(t){ t.stop(); });
      currentStream = null;
    }
  }

  function initScanner(){
    if (!window.QrScanner) {
      console.error('QrScanner not available.');
      return;
    }
    scanner = new QrScanner(video, function(result){
      onDecode(result);
    }, {
    });
    scanner.start().catch(function(err){
      console.error('scanner.start() failed:', err);
    });
  }

  function onDecode(result){
    var text = (result && result.data) ? result.data : (''+result);
    var fmt = 'QR';
    var photo = capturePhoto();
    appendRow({
      content: text,
      format: fmt,
      photo: photo
    });
  }

  function capturePhoto(){
    if (!video || video.readyState < 2) {
      return '';
    }
    var w = video.videoWidth || video.clientWidth || 640;
    var h = video.videoHeight || video.clientHeight || 480;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);
    try {
      return canvas.toDataURL('image/jpeg', 0.85);
    } catch(e) {
      try {
        return canvas.toDataURL('image/png');
      } catch(e2){
        return '';
      }
    }
  }

  function appendRow(obj){
    rowCount += 1;
    var now = new Date();
    var dateStr = now.toLocaleDateString();
    var timeStr = now.toLocaleTimeString();
    var tr = document.createElement('tr');

    var tdIdx = document.createElement('td'); tdIdx.textContent = rowCount;
    var tdContent = document.createElement('td'); tdContent.textContent = obj.content || '';
    var tdFmt = document.createElement('td'); tdFmt.textContent = obj.format || '';
    var tdDate = document.createElement('td'); tdDate.textContent = dateStr;
    var tdTime = document.createElement('td'); tdTime.textContent = timeStr;
    var tdPhoto = document.createElement('td');
    if (obj.photo) { var img = new Image(); img.src = obj.photo; img.alt='Snapshot'; img.loading='lazy'; tdPhoto.appendChild(img); }
    else { tdPhoto.textContent = '(no photo)'; }

    tr.appendChild(tdIdx);
    tr.appendChild(tdContent);
    tr.appendChild(tdFmt);
    tr.appendChild(tdDate);
    tr.appendChild(tdTime);
    tr.appendChild(tdPhoto);
    logBody.insertBefore(tr, logBody.firstChild);
  }

})();