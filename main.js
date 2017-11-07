'use strict';
$(() => {

  let prev;
  let socket = io();
  let ready = false;
  let room;

  $('#login').show();
  $("#login").submit((event) => {
    event.preventDefault();
  });

  $('#usersubmit').click(() => {
    let nick = cleanInput($('#user').val().trim());  
    room = $('#room').val()
    if(nick){
      socket.emit("join", nick,room);
      ready = true;
      $(".mainwrapper").css('display','flex');
      $('#login').hide();
    }
  });

  $("#sendform").submit( () => {
    let message = cleanInput($('#m').val());
    
    if(message){
      socket.emit('chat message', $('#m').val(),room);
      $('#m').val('');
    }
    
    return false;
  });
  

  socket.on("add-person", (nick) => {
    if(ready){
      $('#online').append('<li>'+nick);
    }
      
    })  

  socket.on("remove-person", (nick) => {
    console.log(nick);
    $('#'+nick).remove();
  });

  socket.on("update", (msg) => {
    $('#messages').append('<li id="update" >' + msg);
  })

  socket.on("people-list", (people) => {
    let x;
    for (x in people) {
      $('#online').append('<li id="' + people[x].id + '">' + people[x].nick);
    }
  });

  socket.on("disconnect", () => {
    $('#messages').append("<li id=\"update\">You have lost connection to server. Refresh Page to restore connection.");
    $('#sendform').hide();
  });
  socket.on('chat message', (nick, msg) => {
    if (prev == nick) {
      $('#messages li:last-child > div').append("<div>" + msg + "</div>");
    } else {
      $('#messages').append("<li> <strong>" + nick + "</strong> : " + "<div id=\"innermsg\">" + msg + "</div></li>");
    }

    prev = nick;
    $("#messages").animate({
      scrollTop: $('#messages').prop("scrollHeight")
    }, 100);
  });

  function cleanInput (input) {
    return $('<div/>').text(input).html();
  }

});