/*
 * jQuery hashchange event - v1.3 - 7/21/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,e,b){
  var c="hashchange",h=document,f,g=$.event.special,i=h.documentMode,d="on"+c in e&&(i===b||i>7);
  function a(j){
    j=j||location.href;
    return"#"+j.replace(/^[^#]*#?(.*)$/,"$1")
  }
  $.fn[c]=function(j){
    return j?this.bind(c,j):this.trigger(c)
  };

  $.fn[c].delay=50;
  g[c]=$.extend(g[c],{
    setup:function(){
      if(d){
        return false
      }
      $(f.start)
    },
    teardown:function(){
      if(d){
        return false
      }
      $(f.stop)
    }
  });
  f=(function(){
    var j={},p,m=a(),k=function(q){
      return q
    },l=k,o=k;
    j.start=function(){
      p||n()
    };

    j.stop=function(){
      p&&clearTimeout(p);
      p=b
    };

    function n(){
      var r=a(),q=o(m);
      if(r!==m){
        l(m=r,q);
        $(e).trigger(c)
      }else{
        if(q!==m){
          location.href=location.href.replace(/#.*/,"")+q
        }
      }
      p=setTimeout(n,$.fn[c].delay)
    }
    $.browser.msie&&!d&&(function(){
      var q,r;
      j.start=function(){
        if(!q){
          r=$.fn[c].src;
          r=r&&r+a();
          q=$('<iframe tabindex="-1" title="empty"/>').hide().one("load",function(){
            r||l(a());
            n()
            }).attr("src",r||"javascript:0").insertAfter("body")[0].contentWindow;
          h.onpropertychange=function(){
            try{
              if(event.propertyName==="title"){
                q.document.title=h.title
              }
            }catch(s){}
          }
        }
      };

      j.stop=k;
      o=function(){
        return a(q.location.href)
      };

      l=function(v,s){
        var u=q.document,t=$.fn[c].domain;
        if(v!==s){
          u.title=h.title;
          u.open();
          t&&u.write('<script>document.domain="'+t+'"<\/script>');
          u.close();
          q.location.hash=v
        }
      }
    })();
    return j
  })()
})(jQuery,this);


/* jquery.pjax.js with hash navigation fallback + form pjax + get forms parameters in address
 * https://github.com/imsamurai/jquery-pjax
*/

/* jquery.pjax.js with hash-navigation fallback
 * copyright andrew magalich
 * https://github.com/ckald/jquery-pjax
*/

// jquery.pjax.js
// copyright chris wanstrath
// https://github.com/defunkt/jquery-pjax

(function($){
  if (!$.hash) $.hash = '#!/';
  if (!$.siteurl) $.siteurl = document.location.protocol+'//'+document.location.host; // your site url
  if (!$.container) $.container = '#content'; // container SELECTOR to use for hash navigation

  // Is pjax supported by this browser?
  $.support.pjax =
  window.history && window.history.pushState && window.history.replaceState
  // pushState isn't reliable on iOS yet.
  && !navigator.userAgent.match(/(iPod|iPhone|iPad|WebApps\/.+CFNetwork)/);

  // When called on a link, fetches the href with ajax into the
  // container specified as the first parameter or with the data-pjax
  // attribute on the link itself.
  //
  // Tries to make sure the back button and ctrl+click work the way
  // you'd expect.
  //
  // Accepts a jQuery ajax options object that may include these
  // pjax specific options:
  //
  // container - Where to stick the response body. Usually a String selector.
  //             $(container).html(xhr.responseBody)
  //      push - Whether to pushState the URL. Defaults to true (of course).
  //   replace - Want to use replaceState instead? That's cool.
  //
  // For convenience the first parameter can be either the container or
  // the options object.
  //
  // Returns the jQuery object
  $.fn.pjax = function( container, options ) {
    if ( options )
      options.container = container;
    else
      options = $.isPlainObject(container) ? container : {
        container:container
      }

    // We can't persist $objects using the history API so we must use
    // a String selector. Bail if we got anything else.
    if ( options.container && typeof options.container !== 'string' ) {
      throw "pjax container must be a string selector!";
      return false;
    }

    return this.live('click', function(event){
      // Middle click, cmd click, and ctrl click should open
      // links in a new tab as normal.
      if ( event.which > 1 || event.metaKey )
        return true;

      var defaults = {
        url: this.href,
        container: $(this).attr('data-pjax'),
        clickedElement: $(this),
        fragment: null,
        isform: false
      }

      $.pjax($.extend({}, defaults, options));

      event.preventDefault();
    })
  }

  // Same as pjax but for forms, also will shows query in address

  $.fn.pjaxform = function( container, options ) {
    if ( options )
      options.container = container;
    else
      options = $.isPlainObject(container) ? container : {
        container:container
      };

    // We can't persist $objects using the history API so we must use
    // a String selector. Bail if we got anything else.
    if ( typeof options.container !== 'string' ) {
      throw "pjax container must be a string selector!";
      return false;
    }

    return this.live('submit', function(event){
      $(options.container).trigger('form-submit.pjax', $(this));
      if (typeof options.serialize !=='undefined') {
        var data = options.serialize(this);
      }
      else {
        var data = $(this).serialize();
      }
      options.type = $(this).attr('method');

      var defaults = {
        url: (options.type && options.type.toUpperCase()=='GET')?this.action+'?'+data:this.action,
        push: (options.type && options.type.toUpperCase()=='GET')?true:false,
        data: data,
        isform: true,
        container: $(this).attr('data-pjax'),
        clickedElement: $(this)
      }

      $.pjax($.extend({}, defaults, options));

      event.preventDefault();
    })
  }


  // Loads a URL with ajax, puts the response body inside a container,
  // then pushState()'s the loaded URL.
  //
  // Works just like $.ajax in that it accepts a jQuery ajax
  // settings object (with keys like url, type, data, etc).
  //
  // Accepts these extra keys:
  //
  // container - Where to stick the response body. Must be a String.
  //             $(container).html(xhr.responseBody)
  //      push - Whether to pushState the URL. Defaults to true (of course).
  //   replace - Want to use replaceState instead? That's cool.
  //
  // Use it just like $.ajax:
  //
  //   var xhr = $.pjax({ url: this.href, container: '#main' })
  //   console.log( xhr.readyState )
  //
  // Returns whatever $.ajax returns.
  var pjax = $.pjax = function( options ) {
    var $container = $(options.container),
    success = options.success || $.noop,
  $settings = [];

    // We don't want to let anyone override our success handler.
    delete options.success;

    // We can't persist $objects using the history API so we must use
    // a String selector. Bail if we got anything else.
    if ( typeof options.container !== 'string' )
      throw "pjax container must be a string selector!";

    options = $.extend(true, {}, pjax.defaults, options);

    if ( $.isFunction(options.url) ) {
      options.url = options.url();
    }

    options.context = $container

    options.success = function(data, textStatus, jqXHR){
      if ( options.fragment ) {
        // If they specified a fragment, look for it in the response
        // and pull it out.
        var $fragment = $(data).find(options.fragment);
        if ( $fragment.length )
          data = $fragment.children();
        else
          return window.location = options.url;
      } else {
        // If we got no data or an entire web page, go directly
        // to the page and let normal error handling happen.
        if ( !$.trim(data) || /<html/i.test(data) )
          return window.location = options.url;
      }

      // Make it happen.
      this.html(data);

      // If there's a <title> tag in the response, use it as
      // the page's title.
      var oldTitle = document.title,
      title = $.trim( this.find('title').remove().text() );
      if ( title ) document.title = title;

      var state = {
        pjax: options.container,
        fragment: options.fragment,
        timeout: options.timeout
      }

      if( $.support.pjax )
      {
        // If there are extra params, save the complete URL in the state object
        var query = $.param(options.data)
        if ( query != "_pjax=true" )
          state.url = options.url + (/\?/.test(options.url) ? "&" : "?") + query;

        if ( options.replace ) {
          window.history.replaceState(state, document.title, options.url);
        } else if ( options.push ) {
          // this extra replaceState before first push ensures good back
          // button behavior
          if ( !pjax.active ) {
            window.history.replaceState($.extend({}, state, {
              url:null
            }), oldTitle);
            pjax.active = true;
          }

          window.history.pushState(state, document.title, options.url);
        }

        // Google Analytics support
        if ( (options.replace || options.push) && window._gaq )
          _gaq.push(['_trackPageview']);

        // If the URL has a hash in it, make sure the browser
        // knows to navigate to the hash.
        var hash = window.location.hash.toString()
        if ( hash !== '' ) {
          window.location.hash = hash;
        }

      }
      else {
        // change address if it is not form or GET form
        if (!options.isform || options.type.toUpperCase()=='GET') {
          window.location.hash = "!"+options.url.replace(options.siteurl,"");
          $.hash = window.location.hash;
        }
      }

      // Invoke their success handler if they gave us one.
      success.apply(this, arguments);
      this.trigger('success.pjax', [data, textStatus, jqXHR, $settings]);
    }

    options.beforeSend = function(jqXHR, settings){
      jqXHR.setRequestHeader('X-PJAX', 'true');
      jqXHR.setRequestHeader('X-PJAX-SUPPORT', $.support.pjax?true:false);
      jqXHR.setRequestHeader('X-Referer', ($.support.pjax)?window.location.href:window.location.href.replace('/#!', ''));
	  $settings = settings;
      this.trigger('start.pjax', [jqXHR, $settings]);
    }
    options.error = function(jqXHR, textStatus, errorThrown){
      this.trigger('error.pjax', [jqXHR, textStatus, errorThrown, $settings]);
      if ( textStatus !== 'abort' )
        window.location = options.url;
    }
    options.complete = function(jqXHR, textStatus){
      this.trigger('complete.pjax', [jqXHR, textStatus, $settings]);
    }

    // Cancel the current request if we're already pjaxing
    var xhr = pjax.xhr;
    if ( xhr && xhr.readyState < 4) {
      xhr.onreadystatechange = $.noop;
      xhr.abort();
    }

    pjax.xhr = $.ajax(options);
    $(document).trigger('pjax', [pjax.xhr, options]);

    return pjax.xhr;
  }


  pjax.defaults = {
    timeout: 650,
    push: true,
    replace: false,
    url: $.support.pjax ? window.location.href : window.location.hash.substr(2),
    // We want the browser to maintain two separate internal caches: one for
    // pjax'd partial page loads and one for normal page loads. Without
    // adding this secret parameter, some browsers will often confuse the two.
    data: {
      _pjax: true
    },
    cache:false,
    type: 'GET',
    dataType: 'html',
    siteurl : $.siteurl
  }


  // Used to detect initial (useless) popstate.
  // If history.state exists, assume browser isn't going to fire initial popstate.
  var popped = ('state' in window.history), initialURL = location.href;

  // popstate handler takes care of the back and forward buttons
  //
  // You probably shouldn't use pjax on pages with other pushState
  // stuff yet.
  $(window).bind('popstate', function(event){
    // Ignore inital popstate that some browsers fire on page load
    var initialPop = !popped && location.href == initialURL;
    popped = true;
    if ( initialPop ) return;

    var state = event.state;

    if ( state && state.pjax ) {
      var container = state.pjax;
      if ( $(container+'').length )
        $.pjax({
          url: state.url || location.href,
          fragment: state.fragment,
          container: container,
          push: false,
          timeout: state.timeout
        })
      else
        window.location = location.href;
    }
  });

  // Add the state property to jQuery's event object so we can use it in
  // $(window).bind('popstate')
  if ( $.inArray('state', $.event.props) < 0 )
    $.event.props.push('state');


  // While page is loading, we should handle different URL types
  var hash = window.location.hash.toString();

  if( hash.length > 0 )
  {
    if( $.support.pjax && hash.match(/^#!\/.*/))
      location = $.siteurl+hash.substr(2);

  }
  else if( location.pathname.length > 1 || location.search.length > 1 )
  {
    if( !$.support.pjax )
      window.location = $.siteurl+'/#!'+window.location.pathname+window.location.search;
  }

  // If there is no pjax support, we should handle hash changes
  if( !$.support.pjax )
  {
    $(window).hashchange(function(){
      hash = window.location.hash;

      if ( (hash.substr(0,2) == '#!' || hash=='') && hash != $.hash) {
        $.ajax({
          type: "GET",
          cache:false,
          url: $.siteurl+hash.replace('#!',''),
          beforeSend : function(jqXHR, settings) {
            jqXHR.setRequestHeader('X-PJAX','true');
            jqXHR.setRequestHeader('X-PJAX-SUPPORT', $.support.pjax?true:false);
            jqXHR.setRequestHeader('X-Referer', $.hash.replace('#!',''));
			$settings = settings;
            $($.container).trigger('start.pjax', [jqXHR, $settings]);
          },
          success: function(data, textStatus, jqXHR){
            $($.container).html(data);
            $($.container).trigger('success.pjax', [data, textStatus, jqXHR, $settings]);
          },
          complete: function(jqXHR, textStatus){
            $($.container).trigger('complete.pjax', [jqXHR, textStatus, $settings]);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            $($.container).trigger('error.pjax', [jqXHR, textStatus, errorThrown, $settings]);
          }
        });

      }
    });
    $(window).hashchange();
  }

})(jQuery);
