'use strict';
$(() => {

  let prev;
  let ready = false;
  let room;
  const cleanInput = input => $('<div/>').text(input).html();
  const socket = io();

  $('#login').show();
  $("#login").submit((event) => {
    event.preventDefault();
  });

  $('#usersubmit').click(() => {
    const nick = cleanInput($('#user').val().trim());  
    room = $('#room').val()
    if(nick){
      socket.emit("join", nick,room);
      ready = true;
      $(".mainwrapper").css('display','flex');
      $('#login').hide();
    }
  });

  $("#sendform").submit( () => {
    const message = cleanInput($('#m').val());
    
    if(message){
      socket.emit('chat message', $('#m').val(),room);
      $('#m').val('');
    }
    
    return false;
  });
  

  socket.on("add-person", (nick,id) => {
    console.log(nick)
    if(ready){
      $('#online').append('<li id="' + id + '">' + nick);
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
      if(people[x].room == room){
        $('#online').append('<li id="' + people[x].id + '">' + people[x].nick);
      }
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
});