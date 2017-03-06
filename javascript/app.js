'use strict';
var desktop_sharing = false;
var local_stream = null;
var getScreen = document.getElementById("btn_getscreen");
var video_local = document.getElementById("video_screen");
var btn_play = document.getElementById("play");
var btn_record = document.getElementById("record");
var btn_download = document.getElementById("download");
var chunks;
var mediaRecorder;


//
var sourceBuffer;
var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
function handleSourceOpen(event) {
    console.log('MediaSource opened');
    sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
    console.log('Source buffer: ', sourceBuffer);
}





//disable button until startgetscreen
btn_play.disabled = true;
btn_record.disabled = true;
btn_download.disabled = true;

getScreen.addEventListener('click', function (e) {
    toggle();
});
btn_record.addEventListener('click', function (e) {
    togleRecord();
});



btn_play.addEventListener('click', function (e) {
    play();
});
btn_download.addEventListener('click', function (e) {
    download();
});


function toggle() {
    if (!desktop_sharing) {
        chrome.desktopCapture.chooseDesktopMedia(["screen", "window","tab","audio"], onAccessApproved);
        getScreen.disabled = true;
        btn_record.disabled = false;
    } else {
        desktop_sharing = false;

        if (local_stream)
            local_stream.stop();
        local_stream = null;
        getScreen.disabled = false;
        btn_play.disabled = true;
        btn_record.disabled = true;
        btn_download.disabled = true;

    }
}

function onAccessApproved(desktop_id) {
    if (!desktop_id) {
        console.log('Desktop Capture access rejected.');
        return;
    }
    desktop_sharing = true;
    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: desktop_id,
                minWidth: 1280,
                maxWidth: 1280,
                minHeight: 720,
                maxHeight: 720
            }
        }
    }, gotStream, errors);

    function gotStream(stream) {
        console.log('getUserMedia() got stream: ', stream);
        window.stream = stream;
        if (window.URL) {
            video_local.src = window.URL.createObjectURL(stream);
        } else {
            video_local.src = stream;
        }
       // video_local.src = URL.createObjectURL(stream);

        stream.onended = function () {
            if (desktop_sharing) {
                toggle();
            }
        };
    }
}

// document.getElementById("btn_connect").addEventListener('click', function (e) {
//     getCamera();
// });

function getCamera() {

    // avigator.getUserMedia  = navigator.getUserMedia ||
    //                       navigator.webkitGetUserMedia ||
    //                       navigator.mozGetUserMedia ||
    //                       navigator.msGetUserMedia;

    // var video = document.querySelector('video');

    // if (navigator.getUserMedia) {
    //   navigator.getUserMedia({audio: true, video: true}, function(stream) {
    //     document.getElementById('video_camera').src = window.URL.createObjectURL(stream);
    //   }, function(e){

    //     console.log(e);
    //   });
    var hdConstraints = {
        video: {
            mandatory: {
                minWidth: 1280,
                minHeight: 720
            }
        }
    };

    navigator.getUserMedia(hdConstraints, function (stream) {
        document.getElementById('video_camera').src = window.URL.createObjectURL(stream);
    }, errors);
}

var errors = function getUserMediaError(e) {
    console.log('getUserMediaError: ' + e);
};


//Record






function togleRecord() {


  //  var options = {mimeType: 'video/webm; codecs=vp9'};
    if (btn_record.textContent === "Start Recording") {
        startRecord();
        //     //mediaRecorder = new MediaStreamRecorder(stream,options);
        // mediaRecorder = new MediaRecorder(stream, options);
        // console.log(stream);
        //    // mediaRecorder.mimeType = 'video/webm';
        //     mediaRecorder.ondataavailable = function (blob) {
        //         chunks.push(blob);
        //     };
        //     mediaRecorder.start(10);
        //     btn_record.textContent = "Stop Recording";
    }else if(btn_record.textContent === "Stop Recording"){
        stopRecording();
        // mediaRecorder.stop();
        // allBlod = new Blob(chunks,{type: 'video/webm;'});
        // var videoURL = window.URL.createObjectURL(allBlod);
        // video_local.src = videoURL;
        // btn_play.disabled = false;
        // btn_download.disabled = false;
        // getScreen.disabled = false;
    }
}

function startRecord() {
    chunks = [];
    var options = {mimeType: 'video/webm;codecs=vp9'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options = {mimeType: 'video/webm;codecs=vp8'};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.log(options.mimeType + ' is not Supported');
            options = {mimeType: 'video/webm'};
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.log(options.mimeType + ' is not Supported');
                options = {mimeType: ''};
            }
        }
    }
    try {
        mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e) {
        console.error('Exception while creating MediaRecorder: ' + e);
        alert('Exception while creating MediaRecorder: '
            + e + '. mimeType: ' + options.mimeType);
        return;
    }



    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    btn_record.textContent = 'Stop Recording';
    mediaRecorder.onstop = handleStop;
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(10); // collect 10ms of data
    console.log('MediaRecorder started', mediaRecorder);
}

function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
        chunks.push(event.data);
    }
}
function handleStop(event) {
    console.log('Recorder stopped: ', event);
    btn_play.disabled = false;
    btn_download.disabled = false;
    getScreen.disabled = false;
}
function stopRecording() {
    mediaRecorder.stop();
    video_local.uri = null;
    console.log('Recorded Blobs: ', chunks);
    video_local.controls = true;
    btn_record.textContent = "Start Recording";
}
function download() {
    console.log("download");
    var blob = new Blob(chunks, {type: 'video/webm'});
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
    //mediaRecorder.save(allBlod,"test.webm");
}

function play() {
    // allBlod = new Blob(chunks,{type: 'video/webm;'});
    // var videoURL = window.URL.createObjectURL(allBlod);
    // video_local.src = videoURL;
    var superBuffer = new Blob(chunks, {type: 'video/webm'});
    video_local.src = window.URL.createObjectURL(superBuffer);
    video_local.play();
}


//=============================================================================================
var getCamera  = document.getElementById("getCamera");
var video_camera = document.getElementById("video_camera");
//getCamera.onclick = getCam();
 getCamera.addEventListener('click', function (e) {
    getCam();
});
function getCam() {
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    })
        .then(function (stream) {

            video_camera.src = URL.createObjectURL(stream);
            //video_camera.play();
        });
};
//https://webrtc.github.io/samples/src/content/getusermedia/record/