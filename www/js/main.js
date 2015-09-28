function getHash(lhash){
  if(lhash==""){
    $('#extra-content').hide();
    $('#main-content').show();
    $('#extra-content').html('');
    $('a[href="#"]').click(function(){
        $("li.active").removeClass("active");
        $(this).parent().addClass("active");
    });
  }else{
    var hash = lhash.replace(/\#/g,'');
    $.get('template/'+hash+'.html', function(c) {
      $('#extra-content').html(c);
      $('#main-content').hide();
      $('#extra-content').show();
      $('a[href="#'+hash+'"]').click(function(){
          $("li.active").removeClass("active");
          $(this).parent().addClass("active");
      });
    });
  }
}

if(typeof io !== 'undefined'){
  var socket = io("http://localhost:13370");
  socket.on('login_required', function(){
    if(window.sessionStorage && sessionStorage.token!=undefined && sessionStorage.remember_me==1){
      socket.emit('login', sessionStorage.token);
      $('#logout').show();
      $('#logout-button').click(function(){
        sessionStorage.token=null;
        sessionStorage.remember_me=0;
        window.history.go(0);
      });
    }else{
      $.get('template/login.html', function(c) {
        $('#main-content').html(c);
        $('#login').click(function(){
          var token = WebJWT.sign({"user":$("#inputUser").val()},$("#inputPassword").val());
          if(window.sessionStorage){
            sessionStorage.token=token;
            sessionStorage.remember_me=($('#remember-me').is(':checked')?1:0);
          }
          socket.emit('login', token);
        });
        $('#remember-me').click(function() {
            // Was false, become true with this click
            if ($(this).is(':checked')) {
              if(window.sessionStorage){
                sessionStorage.remember_me=1;
                return true; // Remain true
              }else{
                alert("sessionStorage is not supported!");
                return false; // Become false
              }
            }
        });
      });
    }
  });
  socket.on('authenticated', function(){
    $.get('template/home.html', function(c) {
      $('#main-content').html(c);
    });
    socket.emit('get_command_list');
    socket.emit('ip_status');
  });
  socket.on('command_list',function(arr){
    $.get('template/command_item.mst', function(template) {
      var rendered = Mustache.render(template, {'commands':arr});
      $('.command-list').html(rendered);
      $('a.command').click(function() {
        alert($(this).data('command'));
      });
    });
  });
  socket.on('ip_status',function(ip_status){
    $("#ip_status").html("<b>Penmode IP:</b> "+ip_status.ip+", <b>Tor:</b> "+(ip_status.tor?"<span class='green'>Enabled":"<span class='red'>Disabled")+"</span>");
    $(".footer").show();
  });
  socket.on('disconnect', function(){});
}

$(window).on('hashchange', function() {
  getHash(location.hash);
});

if(location.hash!=""){
  getHash(location.hash);
}

/*$.get('template/no-home.mst', function(template) {
  var rendered = Mustache.render(template, {});
  $('#content').html(rendered);
});*/
