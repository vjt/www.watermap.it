// (C) 2009 vjt@openssl.it - http://sindro.me/
//    http://github.com/vjt/www.watermap.it
//
// CHANGELOG
//
// * Prelaunch phase:
//
// 2009-06-23 - Initial release
// 2009-06-24 - Refactored, wrote documentation
// 2009-06-24 - Added Google Analytics pageview tracking
// 2009-06-25 - Added Addthis services (http://addthis.com)
// 2009-06-25 - Added SWFObject to load the new flash header
// 2009-06-25 - Implemented safer Facebook initialization
// 2009-06-25 - Improved interaction with Google Translate
// 2009-07-01 - Added photos banner with dynamic positioning
// 2009-07-01 - Removed facebook flickering
// 2009-07-01 - Removed flash header
// 2009-07-02 - Added a videoTest that checks for iPhone
// 2009-07-02 - Fixed IE incongruencies
// 2009-07-02 - Added Opera support, by disabling FB features
// 2009-07-02 - Implemented contacts page highlighting
// 2009-07-06 - Removed contacts page highlighting due to new layout
// 2009-07-06 - Added Array.include() that mimics Ruby's one, using $.inArray
// 2009-07-06 - Reposition banner on the left when browsing facebook and
//              suggestions pages
// 2009-07-06 - Fixed a nasty bug of Ajax History with Firefox 3.5 that caused
//              continuous ajax page loads
// 2009-07-07 - Fixed a FB connect bug with IE7+, by adding a / in front of
//              xd_receiver.html. Nasty!
// 2009-07-09 - When clicking on "Chi siamo", the right pane automagically
//              shows the "Contatti" page.
// 2009-07-12 - Added iPhone banner
//
// * Launch phase:
//
// 2009-08-31 - Removed the CMS functions, because most of the content is now
//              on the blog, removed banners handling
// 2009-08-31 - Implemented the new buttons behaviour
// 2009-08-31 - Added facebox (http://famspam.com/facebox)
// 2009-08-31 - Added jqzoom
// 2009-09-01 - See the commit log on GitHub ;)
//
var Watermap = {
  URI: '',
  tracker : null,
  addthis : null,

  // Initialize the application.
  //
  // - Initialize Facebook
  // - Install event handlers on the buttons
  // - Initialize facebox
  // - Save the base URI on which we're called
  // - Configure addthis services
  // - Setup video playing for iPhone
  //
  initialize: function() {
    // Initialize Facebook if not running on Opera
    if (!$.browser.opera) {
      Watermap.initFB(true);
    }

    // Add buttons behaviour
    Watermap.buttons();

    // Initialize faceboxes
    Watermap.faceboxes();

    // Save base URI
    Watermap.URI = document.location.href.replace(/#.*/, '');

    // Configure addthis services
    Watermap.addthis = {
      username: 'watermap',
      services_expanded: 'email,facebook,myspace,twitter,blogger,' +
        'delicious,friendfeed,stumbleupon,digg,linkedin,reddit,live',
      ui_click: true,
      ui_language: 'it',
      ui_cobrand: 'WATERMAP',
      ui_hide_embed: false,
      data_track_linkbacks: true,
      data_use_flash: false
    };

    // Show youtube video for the iPhone, remove it if no flash player is available
    //
    Watermap.videoTest();
  },

  // TODO: documentation
  //
  buttons: function() {
    // Add buttons behaviour
    var action_link = $('#homeprint .action .name');
    var all_buttons = $('#homeprint .button');

    all_buttons.mouseover(function() {
      action_link.stop();
      action_link.fadeTo(10, 1);

      var link = $(this).find('a');
      var href = link.attr('href');
      var text = $.trim(link.text()) + ' WATERMAP';

      if (action_link.text() == text)
        return;

      $(all_buttons).removeClass('highlighted');
      $(this).addClass('highlighted');
      action_link.fadeOut(150, function() {
        action_link.text(text);
        action_link.attr('href', href);
        action_link.fadeIn(150);
      });
    });

    $('a[href=download.php]').live('click', function() {
      try { Watermap.tracker._trackPageview('/download.php') } catch(err) { };
    });

    $('#homeprint .button.inspect a').click(function() {
      try { Watermap.tracker._trackPageview('/browse.php') } catch(err) { };
    });

    $('#homeprint .button.share a').click(function() {
      try { Watermap.tracker._trackPageview('/share.php') } catch(err) { };
    });

    $('#homeprint [href*=http://www.addthis.com]').live('click', function() {
      return addthis_sendto();
    });
  },

  faceboxes: function() {
    // Initialize facebox gallery
    $('a[href=#gallery]').click(function() {
      $('#gallery').attr('src', 'http://flickr.com/photos/watermap/show');
      $.facebox({div: '#gallery'});
      return false;
    });

    // Initialize facebox browsing
    $('a[href=#browse]').click(function() {
      if ($.browser.msie) { // IE, I HATE YOU!
        $('#browse-ie').attr('src', 'browse.php');
        $.facebox({div: '#browse-ie'});
      } else {
        $.facebox({div: '#browse'});
        $('#facebox #browse > a').jqzoom({zoomWidth: 740, zoomHeight: 310, position: 'relative', title: false, xOffset: -248, yOffset: 185, alwaysOn: true});
      }
      return false;
    });
    $(document).bind('close.facebox', function() { $('.jqZoomWindow, .preload').remove() });
  },

  // Check whether the users has got the 9.0.0 flash player, and embed it if he/she does.
  // If we're being rendered on the iPhone, remove the #video object, and show the other
  // one (#iphone-video) that contains an <embed> that MobileSafari replaces with an YT
  // poster image, making it viewable from the iPhone too.
  // If no flash player neither iPhone is available, show an error message into the box.
  //
  videoTest: function() {

    if (swfobject.hasFlashPlayerVersion('9.0.0')) {
      $('#iphone-video').remove();
    } else if (/iPhone/.test(navigator.userAgent)) {
      $('#video').remove();
      $('#iphone-video').show();
    } else {
      $('#iphone-video').remove();
      $('#video').html(
        '<p class="fberror">Hai bisogno di flash player per visualizzare il video</p>'
      );
    }
  },
  
  // Initialize Facebook Connect. If the first parameter is true
  // then passes the API key and the cross-domain commmunication
  // channel path.
  //
  // @param full Boolean
  //
  initFB: function(full) {
    if ($.browser.opera) {
      $('#action').html('<p class="fberror" style="text-align:left;">Caro utente Opera,</p>' +
        '<p class="fberror">ci dispiace, ma questa bacheca &egrave; realizzata con facebook connect, il quale non funziona, attualmente, con il tuo browser.</p>' +
        '<p class="fberror">Per leggere e scrivere commenti in questa sezione, ti preghiamo di usare un altro browser.</p>' +
        '<p class="fberror">Grazie e... perdonaci per il disagio :-)</p>' +
        '<p class="fberror" style="text-align:right;"><em>Watermap staff</em></p>'
      );
      return;
    }

    try {
      if (full) {
        FB.init('c4c9f3f526ac6853492f3abf894f7d20', '/xd_receiver.html');
      } else {
        FB.init();
      }
    } catch (err) {
      $('#action').html('<p class="fberror">Errore durante l\'inizializzazione di Facebook Connect :-(</p>' +
        '<p class="fberror">Prova a <a href="' + Watermap.URI + '">ricaricare</a> la pagina.</p>');
    }

  }
};

Array.prototype.include = function(item) {
  return $.inArray(item, this) >= 0;
};
