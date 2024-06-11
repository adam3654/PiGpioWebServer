


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
    if (btn.id !== "Enable") {
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
socket.on("eStop", disableAllButtons());

function ReportTouchStart(e) {
  var y = e.target.previousElementSibling;
  if (y !== null) var x = y.id;
  if (x !== null) {
    socket.emit(x)
  }
  // if (x !== null && x.startsWith("GPIO")) { 
  //   // Now we know that x is defined, we are good to go.
  //   if (x.endsWith("M")) {
  //     //momentary
  //     let gpioPin = x.slice(0, -1);
  //     socket.emit(gpioPin, 1); 
  //     document.getElementById(gpioPin).checked = 1;
  //   } else {
  //     //toggle
  //     socket.emit(`${x}T`);  // send GPIO button toggle to node.js server  
  //   }
  // }
}

function ReportTouchEnd(e) {
  let eventID = e.target.id;
  if (eventID !== null) {
    if (eventID === "Sequential") {
      var ddObj = document.getElementById("Time");
    var ddVal = ddObj.value;
    socket.emit(eventID, ddVal);
    } else if (eventID === "Enable") {
      socket.emit(eventID, 1);
    } else {
      socket.emit(eventID, 1);
    }
    
  }
}

  // if (eventID.endsWith("M")) {
  //   let gpioPin = eventID.slice(0, -1);
  //   socket.emit(gpioPin, 0); 
  //   document.getElementById(gpioPin).checked = 0;
  // } 

  // if (eventID === "Sequential") {
  //   var ddObj = document.getElementById("Time");
  //   var ddVal = ddObj.value;
  //   socket.emit("Sequential", ddVal);
  // }
//}

function ReportMouseDown(e) {
  
  var y = e.target.previousElementSibling;
  if (y !== null) var x = y.id;
  if (x !== null && x.startsWith("GPIO")) { 
    // Now we know that x is defined, we are good to go.
    if (x.endsWith("M")) {
      //momentary
      let gpioPin = x.slice(0, -1);
      socket.emit(gpioPin, 1); 
      document.getElementById(gpioPin).checked = 1;
    } else {
      //toggle
      socket.emit(`${x}T`);  // send GPIO button toggle to node.js server  
    }
  }
}


function ReportMouseUp(e) {

  let eventID = e.target.id;

  if (eventID !== null) {
    if (eventID === "Sequential") {
      var ddObj = document.getElementById("Time");
    var ddVal = ddObj.value;
    socket.emit(eventID, ddVal);
    } else if (eventID === "Enable") {
      socket.emit(eventID, 1);
    } else {
      socket.emit(eventID, 1);
    }
    
  }
  // if (eventID.endsWith("M")) {
  //   let gpioPin = eventID.slice(0, -1);
  //   socket.emit(gpioPin, 0); 
  //   document.getElementById(gpioPin).checked = 0;
  // } 
  // if (eventID === "Sequential") {
  //   var ddObj = document.getElementById("Time");
  //   var ddVal = ddObj.value;
  //   socket.emit("Sequential", ddVal);
  // }
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


