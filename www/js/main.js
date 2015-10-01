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

$.fn.serializeObject = function () {
   var o = {};
   var a = this.serializeArray();
   $.each(a, function () {
       if (o[this.name]) {
           if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
           }
           o[this.name].push(this.value || '');
       } else {
           o[this.name] = this.value || '';
       }
   });
   return o;
};

function init (ip) {
  socket = window.io(ip);
  socket.on('login_required', function (salt_hex) {
    $.get('template/login.html', function(c) {
      $('#main-content').html(c);
      $('#login').click(function () {
        var salt = CryptoJS.enc.Hex.parse(salt_hex);
        var pass = CryptoJS.SHA512($('#inputPassword').val());
        var key512Bits = CryptoJS.PBKDF2(pass, salt, { hasher:CryptoJS.algo.SHA512, keySize: 512 / 32, iterations: 1000 });
        var webauth = {};
        webauth.username = $('#inputUser').val();
        webauth.token = WebJWT.sign({'user':$('#inputUser').val(),'socket':socket.id}, key512Bits.toString(CryptoJS.enc.Hex));
        socket.emit('login', JSON.stringify(webauth));
      });
    });
  });
  socket.on('authenticated', function () {
    console.log(socket.id);
    $.get('template/home.html', function (c) {
      $('#main-content').html(c);
      $('#pirate').show();
    });
    socket.emit('get_plugin_list');
    socket.emit('get_ip_status');
  });
  socket.on('plugin_list', function (arr) {
    $.get('template/plugin_item.mst', function (template) {
      var rendered = Mustache.render(template, {'plugins': arr});
      $('.plugin-list').html(rendered);
      $('a.plugin').click(function() {
        plugin = $(this).data('plugin');
        $.get('template/console.mst', function (template) {
          var rendered = Mustache.render(template, {'name': plugin});
          $('#main-content').html(rendered);
          socket.emit('start_plugin', plugin);
          $('#back').click(function () {
            $.get('template/home.html', function (c) {
              $('#main-content').html(c);
            });
            socket.emit('get_plugin_list');
          });
        });
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
  socket.on('console', function (msg) {
    var lines = msg.split('\n');
    for (var i = 0; i < lines.length; i++) {
      if(lines[i] != '') {
        var line = null;
        if (lines[i].substr(0, 2) == '> ') {
          line = $('<li class="input">' + lines[i].substr(2,lines[i].length) + '</li>');
        } else {
          line = $('<li>' + lines[i] + '</li>');
        }
        $('ul.console').append(line);
      }
    }
  });
  socket.on('request_io', function (object) {
    var io = JSON.parse(object);
    $.get('template/request_io.mst', function (template) {
      var rendered = Mustache.render(template, {'plugin': plugin, 'io': io});
      $('#main-content').append(rendered);
      $('#ioModal').modal('show');
      $('#send_io').click(function() {
        var io_response = $('#ioForm').serializeObject();
        socket.emit('io',JSON.stringify(io_response));
        $('#ioModal').modal('hide');
      });
      $('#command_text').keyup(function(event) {
        if (event.which == 13) {
          socket.emit('command',$(this).val());
        }
      });
    });
  });
  socket.on('status', function (msg) {
    if (parseInt(msg) == 1) {
      $('#back').attr('disabled', true);
      $('#stop').attr('disabled', false);
      $('#command_text').attr('disabled', false);
    } else if (parseInt(msg) == 2) {
      $('#back').attr('disabled', false);
      $('#stop').attr('disabled', true);
      $('#command_text').attr('disabled', true);
    }
    console.log('status ' + msg);
  });
  socket.on('fail', function (msg) { alert('fail ' + msg); });
  socket.on('disconnect', function () { console.log('disconnected'); });
}

if (typeof io !== 'undefined') {
  var socket = null;
  var plugin = null;
  init('http://localhost:13370');
} else {
  alert('Socket.io Server not found! \nHave you changed the port?');
}

$(window).on('hashchange', function () {
  getHash(window.location.hash);
});

$(window).bind('beforeunload', function(){
  return 'Are you sure you want to leave?';
});

if (window.location.hash !== '') {
  getHash(window.location.hash);
}
