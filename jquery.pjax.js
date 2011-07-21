/*
 * jQuery hashchange event - v1.3 - 7/21/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,e,b){var c="hashchange",h=document,f,g=$.event.special,i=h.documentMode,d="on"+c in e&&(i===b||i>7);function a(j){j=j||location.href;return"#"+j.replace(/^[^#]*#?(.*)$/,"$1")}$.fn[c]=function(j){return j?this.bind(c,j):this.trigger(c)};$.fn[c].delay=50;g[c]=$.extend(g[c],{setup:function(){if(d){return false}$(f.start)},teardown:function(){if(d){return false}$(f.stop)}});f=(function(){var j={},p,m=a(),k=function(q){return q},l=k,o=k;j.start=function(){p||n()};j.stop=function(){p&&clearTimeout(p);p=b};function n(){var r=a(),q=o(m);if(r!==m){l(m=r,q);$(e).trigger(c)}else{if(q!==m){location.href=location.href.replace(/#.*/,"")+q}}p=setTimeout(n,$.fn[c].delay)}$.browser.msie&&!d&&(function(){var q,r;j.start=function(){if(!q){r=$.fn[c].src;r=r&&r+a();q=$('<iframe tabindex="-1" title="empty"/>').hide().one("load",function(){r||l(a());n()}).attr("src",r||"javascript:0").insertAfter("body")[0].contentWindow;h.onpropertychange=function(){try{if(event.propertyName==="title"){q.document.title=h.title}}catch(s){}}}};j.stop=k;o=function(){return a(q.location.href)};l=function(v,s){var u=q.document,t=$.fn[c].domain;if(v!==s){u.title=h.title;u.open();t&&u.write('<script>document.domain="'+t+'"<\/script>');u.close();q.location.hash=v}}})();return j})()})(jQuery,this);


/* jquery.pjax.js with hash-navigation fallback
 * copyright andrew magalich
 * https://github.com/ckald/jquery-pjax
*/

// jquery.pjax.js
// copyright chris wanstrath
// https://github.com/defunkt/jquery-pjax

(function($){
   if (!$.hash) $.hash = '#!/';
   if (!$.siteurl) $.siteurl = 'http://yoursite.com'; // your site url
   if (!$.container) $.container = '#pjaxcontainer'; // container SELECTOR to use for hash navigation

/* When called on a link, fetches the href with ajax into the
   container specified as the first parameter or with the data-pjax
   attribute on the link itself.

   Tries to make sure the back button and ctrl+click work the way
   you'd expect.

   Accepts a jQuery ajax options object that may include these
   pjax specific options:

   container - Where to stick the response body. Usually a String selector.
               $(container).html(xhr.responseBody)
        push - Whether to pushState the URL. Defaults to true (of course).
     replace - Want to use replaceState instead? That's cool.

   For convenience the first parameter can be either the container or
   the options object.

   Returns the jQuery object*/
$.fn.pjax = function( container, options ) {
  if ( options )
    options.container = container;
  else
    options = $.isPlainObject(container) ? container : {container:container};

  // We can't persist $objects using the history API so we must use
  // a String selector. Bail if we got anything else.
  if ( typeof options.container !== 'string' ) {
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
    options = $.isPlainObject(container) ? container : {container:container};

  // We can't persist $objects using the history API so we must use
  // a String selector. Bail if we got anything else.
  if ( typeof options.container !== 'string' ) {
    throw "pjax container must be a string selector!";
    return false;
  }

  return this.live('submit', function(event){
    data = $(this).serialize();
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
$.pjax = function( options ) {
  var $container = $(options.container),
      success = options.success || $.noop;

  // We don't want to let anyone override our success handler.
  delete options.success;

  // We can't persist $objects using the history API so we must use
  // a String selector. Bail if we got anything else.
  if ( typeof options.container !== 'string' )
    throw "pjax container must be a string selector!";

  var defaults = {
    timeout: 650,
    push: true,
    replace: false,
    // We want the browser to maintain two separate internal caches: one for
    // pjax'd partial page loads and one for normal page loads. Without
    // adding this secret parameter, some browsers will often confuse the two.
    data: { _pjax: true },
    type: 'POST',
    dataType: 'html',
    siteurl : $.siteurl,
    beforeSend: function(xhr){
      $container.trigger('start.pjax',this.clickedElement)
      xhr.setRequestHeader('X-PJAX', 'true')
    },
    error: function(data){
      this.success(data.responseText);
      $container.trigger('error.pjax',this.clickedElement);
      $container.trigger('end.pjax',this.clickedElement);
    },
    complete: function(jqXHR){
      $container.trigger('complete.pjax', jqXHR, this.clickedElement);
    },
    success: function(data){
      // If we got no data or an entire web page, go directly
      // to the page and let normal error handling happen.

      if ( !$.trim(data) || /<html/i.test(data) )
      {
         return window.location = options.url;
      }

      // Make it happen.
      $container.html(data);

      // If there's a <title> tag in the response, use it as
      // the page's title.
      var oldTitle = document.title,
          title = $.trim( $container.find('title').remove().text() );
      if ( title ) document.title = title;

         var state = {
           pjax: options.container,
           timeout: options.timeout,
           clickedElement: options.clickedElement, 
         };

      if( $.support.pjax )
      {
         // If there are extra params, save the complete URL in the state object
         var query = $.param(options.data);
         if ( query != "_pjax=true" )
           state.url = options.url + (/\?/.test(options.url) ? "&" : "?") + query;

         if ( options.replace ) {
           window.history.replaceState(state, document.title, options.url);
         } else if ( options.push ) {
           // this extra replaceState before first push ensures good back
           // button behavior
           if ( !$.pjax.active ) {
             window.history.replaceState($.extend({}, state, {url:null}), oldTitle);
             $.pjax.active = true;
           }

           window.history.pushState(state, document.title, options.url);
         }

         // Google Analytics support
         if ( (options.replace || options.push) && window._gaq )
           _gaq.push(['_trackPageview']);

         // If the URL has a hash in it, make sure the browser
         // knows to navigate to the hash.
         var hash = window.location.hash.toString();
         if ( hash !== '' ) {
            window.location.hash = '';
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
      $container.trigger('success.pjax', this.clickedElement);
      $container.trigger('end.pjax', this.clickedElement);
    }
  }

  options = $.extend(true, {}, defaults, options);

  if ( $.isFunction(options.url) ) {
    options.url = options.url();
  }

  // Cancel the current request if we're already pjaxing
  var xhr = $.pjax.xhr;
  if ( xhr && xhr.readyState < 4) {
    xhr.onreadystatechange = $.noop;
    xhr.abort();
  }

  $.pjax.xhr = $.ajax(options);
  $(document).trigger('pjax', $.pjax.xhr, options);

  return $.pjax.xhr;
}

// Is pjax supported by this browser?
$.support.pjax = window.history && window.history.pushState;

// While page is loading, we should handle different URL types
var hash = window.location.hash.toString();

if( hash.length > 0 )
{
   if( $.support.pjax )
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
               type: "POST",
               url: $.siteurl+hash.replace('#!',''),
               beforeSend : function(xhr) {
                  $($.container).trigger('start.pjax');
                  return xhr.setRequestHeader('X-PJAX','true');
               },
               success: function(msg){
                  $($.container).html(msg);
                  $($.container).trigger('success.pjax');
               },
               complete: function(jqXHR){
                  $($.container).trigger('complete.pjax', jqXHR);
               },
               error: function(a,b,c) {
                  $($.container).trigger('error.pjax');
               }
            });

      }
   });
   $(window).hashchange();
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
        container: container,
        push: false,
        timeout: state.timeout,
        clickedElement: state.clickedElement,
      });
    else
      window.location = location.href;
  }
})

// Add the state property to jQuery's event object so we can use it in
// $(window).bind('popstate')
if ( $.inArray('state', $.event.props) < 0 )
  $.event.props.push('state');

})(jQuery);