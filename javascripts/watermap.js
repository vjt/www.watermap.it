// (C) 2009 vjt@openssl.it
// http://sindro.me/
//
// CHANGELOG
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
// 2009-07-06 - Reposition banner on the left on facebook and suggestions pages
// 2009-07-06 - Fixed a nasty bug of Ajax History with Firefox 3.5
//
var Watermap = {
  URI: '',
  tracker : null,
  addthis : null,

  // Initialize the application.
  // - Initialize Facebook
  // - Install event handlers on the menu links
  // - Saves the base URI on which we're called
  // - If the URI has an #anchor component, load the corresponding page
  // - If no link is active on the left menu, the first one is activated.
  //
  initialize: function() {
    // Initialize Facebook if not running on Opera
    if (!$.browser.opera) {
      Watermap.initFB(true);
    }

    // Set event handlers: left menu clicks
    // load via AJAX the content pointed by
    // the HREF attribute.
    //
    $('#menu .left a').click(function() {
      return Watermap.menuClick(this, '#info');
    });

    // Right menu clicks as well except for
    // the last one, that opens the Addthis
    // widget lightbox.
    //
    $('#menu .right a[href*=.html]').click(function() {
      if (!$.browser.opera) {
        Watermap.repositionBanner(this);
      }

      return Watermap.menuClick(this, '#action');
    });

    $('#menu .right a[href*=http://www.addthis.com/]').click(function() {
      return Watermap.shareClick();
    });

    // Save base URI
    Watermap.URI = document.location.href.replace(/#.*/, '');

    // Load first items
    var m;
    if (m = document.location.href.match(/#\/([\w-]+)/)) {
      $('#menu a[href^=' + m[1] + ']').click();
    }

    if ($('#menu .left a.current').length == 0) {
      $('#menu .left a:first').click();
    }

    if ($.browser.opera) {
      if ($('#menu .right a[href=facebook.html]').hasClass('current')) {
        $('#menu a[href=consigli.html]').click();
      }

      $('#banner-container').removeClass('column').addClass('page');
    }

    $.ajaxHistory.initialize();

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

    // Embed SWF only if flash player is installed, do not annoy the user
    // by asking him/her to update/install it etc. Degrade gracefully :-)
    //
    if (swfobject.hasFlashPlayerVersion('9.0.0')) {
      $('#banner').show();
      swfobject.embedSWF('flash/watermap.swf', 'banner', '450', '232', '9.0.0');
    } else {
      $('#banner-container').remove();
    }

  },

  // This function is called when a menu link is clicked.
  // It updates the container specified with the second parameter
  // with the contents of the page referenced by the link, loaded
  // via AJAX.
  //
  // @param link      jQuery - the receiver link
  // @param container jQuery - the container to update
  // 
  menuClick: function(link, container) {
    var page = $(link).attr('href');
    if ($(link).hasClass('current')) {
      return false;
    }

    $(link).siblings().removeClass('current');
    $(link).addClass('current');

    if (Watermap.tracker) {
      Watermap.tracker._trackPageview('/' + page);
      // if (console && console.log) console.log('pageview: ' + page);
    }
    
    $(container).fadeTo(0.01, {duration: 'fast', complete: function() {
      $.ajax({
        url: page,
        success: function(html) {
          Watermap.href(page);

          $(container).html(html);
          $(container).fadeTo(1.0, {duration: 'fast'});
        }
      });
    }});
    return false;
  },

  // Calls the addthis_sendto() function
  //
  shareClick: function() {
    return addthis_sendto();
  },

  // Reposition the banner: when facebook is loaded, align it to the left,
  // because the right facebook wall is longer than the left column. When
  // other pages are loaded, align it to the center of the page, making the
  // container div full width. Add a nifty fade effect for coolness ;).
  //
  repositionBanner: function(link) {
    var page = $(link).attr('href');
    var container = $('#banner-container');
    var transition = null;
    var long_pages = ['facebook.html', 'consigli.html'];

    if ($(link).hasClass('current')) { // XXX FIXME NOT DRY trigger event instead
      return false;
    }

    if (long_pages.include(page) && container.hasClass('page')) {
      transition = function() { container.removeClass('page').addClass('column'); };
    } else if (!long_pages.include(page) && container.hasClass('column')) {
      transition = function() { container.removeClass('column').addClass('page'); };
    }

    if (transition != null) {
      container.fadeTo(0.01, {duration: 'fast', complete: function() { 
        transition();
        container.fadeTo(1.0, {duration: 'fast'});
      }});
    }

  },

  // Check whether the users has got the 9.0.0 flash player, and embed it if he/she does.
  // If we're being rendered on the iPhone, remove the #video object, and show the other
  // one (#iphone-video) that contains an <embed> that MobileSafari replaces with an YT
  // poster image, making it viewable from the iPhone too.
  // If no flash player neither iPhone is available, show an error message into the box.
  //
  videoTest: function(options) {

    if (swfobject.hasFlashPlayerVersion('9.0.0')) {
      $('#iphone-video').remove();
    } else if (/iPhone/.test(navigator.userAgent)) {
      $('#video').remove();
      $('#iphone-video').show();
    } else {
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
        FB.init('c4c9f3f526ac6853492f3abf894f7d20', 'xd_receiver.html');
      } else {
        FB.init();
      }
    } catch (err) {
      $('#action').html('<p class="fberror">Errore durante l\'inizializzazione di Facebook Connect :-(</p>' +
        '<p class="fberror">Prova a <a href="' + Watermap.URI + '">ricaricare</a> la pagina.</p>');
    }

  },

  // Constructs and updates the document location by concatenating
  // the base URI with an "#/" and the page name passed as the 2nd
  // parameter.
  //
  // @param page String
  //
  href: function(page) {
    document.location.href = Watermap.URI + '#/' + page;
  }
};

// Fade an HTML element to the specified amount. All the $.fn.animate()
// options are passable via the second optional argument.
//
$.fn.fadeTo = function(amount) {
  var options = $.extend({duration: 'slow'}, arguments[1] || {});

  return this.each(function() {
    $(this).animate({opacity: amount}, options);
  });
};

Array.prototype.include = function(item) {
  return $.inArray(item, this) >= 0;
};
