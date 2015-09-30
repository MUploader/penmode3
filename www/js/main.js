function getHash (lhash) {
  if(lhash === '') {
    $('#extra-content').hide();
    $('#main-content').show();
    $('#extra-content').html('');
    $('a[href="#"]').click(function () {
        $('li.active').removeClass('active');
        $(this).parent().addClass('active');
    });
  } else {
    var hash = lhash.replace(/\#/g, '');
    $.get('template/'+hash+'.html', function(c) {
      $('#extra-content').html(c);
      $('#main-content').hide();
      $('#extra-content').show();
      $('a[href="#' + hash + '"]').click(function () {
          $('li.active').removeClass('active');
          $(this).parent().addClass('active');
      });
    });
  }
}

function loadScript (url, callback) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.onload = function () {
    callback();
  };
  script.src = url;
  document.getElementsByTagName('body')[0].appendChild(script);
}

function init (ip) {
  var socket = window.io(ip);
  socket.on('login_required', function () {
    if(window.sessionStorage && sessionStorage.webauth !== undefined) {
      socket.emit('login', sessionStorage.webauth);
      $('#logout').show();
      $('#logout-button').click(function () {
        sessionStorage.removeItem('webauth');
        window.history.go(0);
      });
    } else {
      $.get('template/login.html', function(c) {
        $('#main-content').html(c);
        $('#login').click(function () {
          var salt = CryptoJS.lib.WordArray.random(128 / 8);
          var pass = CryptoJS.SHA512($('#inputPassword').val());
          var key512Bits = CryptoJS.PBKDF2(pass, salt, { hasher:CryptoJS.algo.SHA512, keySize: 512 / 32, iterations: 1000 });
          var webauth = {};
          webauth.username = $('#inputUser').val();
          webauth.salt = salt.toString(CryptoJS.enc.Hex);
          webauth.token = WebJWT.sign({'user':$('#inputUser').val()}, key512Bits.toString(CryptoJS.enc.Hex));
          if(window.sessionStorage && $('#remember-me').is(':checked')) {
            sessionStorage.webauth = JSON.stringify(webauth);
          }
          socket.emit('login', JSON.stringify(webauth));
        });
        $('#remember-me').click(function () {
            // Was false, become true with this click
            if ($(this).is(':checked')) {
              if (!window.sessionStorage) {
                alert('sessionStorage is not supported!');
                return false; // Become false
              }
            }
        });
      });
    }
  });
  socket.on('authenticated', function () {
    $.get('template/home.html', function (c) {
      $('#main-content').html(c);
    });
    socket.emit('get_command_list');
    socket.emit('get_ip_status');
  });
  socket.on('command_list', function (arr) {
    $.get('template/command_item.mst', function (template) {
      var rendered = Mustache.render(template, {'commands': arr});
      $('.command-list').html(rendered);
      $('a.command').click(function() {
        alert($(this).data('command'));
      });
    });
  });
  socket.on('ip_status', function (ip_status) {
    $('#ip_status').html(
      '<b>Penmode IP:</b> ' + ip_status.ip +
      ', <b>Tor:</b> ' + (ip_status.tor ? '<span class="green">Enabled' : '<span class="red">Disabled') +
      '</span>');
    $('.footer').show();
  });
  socket.on('disconnect', function(){});
}

if (typeof io !== 'undefined') {
  init('http://localhost:13370');
} else {
  alert('Socket.io Server not found! \nHave you changed the port?');
}

$(window).on('hashchange', function () {
  getHash(window.location.hash);
});

if (window.location.hash !== '') {
  getHash(window.location.hash);
}
