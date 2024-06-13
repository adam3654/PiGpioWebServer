


/************PROCESS DATA TO/FROM Client****************************/

const ioPorts = ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];
var socket = io(); //load socket.io-client and connect to the host that serves the page
window.addEventListener("load", function(){ //when page loads
  if( isMobile.any() ) {
//    alert('Mobile');  
    document.addEventListener("touchstart", ReportTouchStart, false);
    document.addEventListener("touchend", ReportTouchEnd, false);
    document.addEventListener("touchmove", TouchMove, false);
  } else {
//    alert('Desktop');  
    document.addEventListener("mouseup", ReportMouseUp, false);
    document.addEventListener("mousedown", ReportMouseDown, false);
  }
  disableAllButtons();

});

function enableAllButtons(){
  const btns = document.querySelectorAll('button');
  for (const btn of btns) {
    btn.disabled = false;
  }
}

function disableAllButtons(){
  const btns = document.querySelectorAll('button');
  for (const btn of btns) {
    if (btn.name !== "Enable") {
      btn.disabled = true;
    }    
  }
}

// for (const pin of ioPorts) {
//   let gpioPin = `GPIO${pin}`;
//   //Update gpio feedback when server changes GPIO state
//     socket.on(gpioPin, function (data) {  
//       var myJSON = JSON.stringify(data);
//       document.getElementById(gpioPin).checked = data;
//     });
// }

socket.on("EnableFireOK", enableAllButtons());
socket.on("DisableButtons", disableAllButtons());

class eventPayload {
  Name;
  Id;
  Value;
  constructor (name, id, value) {
    this.Name = name;
    this.Id = id;
    this.Value = value;
  }
}

function ReportTouchStart(e) {

}

function ReportTouchEnd(e) {
  let payload = new eventPayload(e.target.name, e.target.id, e.target.value);
  if (payload.Name !== null) {
    if (payload.Name === "Sequential") {
      var ddObj = document.getElementById("Time");
    payload.Value = ddObj.value;
    socket.emit(eventName, ...payload);
    } else {
      socket.emit(eventName, ...payload);
    }    
  }
}


function ReportMouseDown(e) {

}



function ReportMouseUp(e) {
  let payload = new eventPayload(e.target.name, e.target.id, e.target.value);
  if (payload.Name !== null) {
    if (payload.Name === "Sequential") {
      var ddObj = document.getElementById("Time");
    payload.Value = ddObj.value;
    socket.emit(eventName, ...payload);
    } else {
      socket.emit(eventName, ...payload);
    }    
  }
}

function TouchMove(e) {

}



/** function to sense if device is a mobile device ***/
// Reference: https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser

var isMobile = {
  Android: function() {
      return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
      return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
      return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function() {
      return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
  },
  any: function() {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  }
};


