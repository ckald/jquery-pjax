## pushState + ajax / hash navigation + ajax / hash navigation + ajax + form ajax + get forms parameters in address = pjax with normal fallback!

            .--.
           /    \
          ## a  a
          (   '._)
           |'-- |
         _.\___/_   ___pjax___
       ."\> \Y/|<'.  '._.-'
      /  \ \_\/ /  '-' /
      | --'\_/|/ |   _/
      |___.-' |  |`'`
        |     |  |
        |    / './
       /__./` | |
          \   | |
           \  | |
           ;  | |
           /  | |
     jgs  |___\_.\_
          `-"--'---'

## What is it now? 
It'a a fork of defunkt's pjax library: https://github.com/defunkt/jquery-pjax .
That was completely awesome, but my project needed old IEs support. So I modified it a bit.
I hope, you'll enjoy mix of pushState and regular #!/hash navigation.

Some features and changes:

*    IE 7,8 support (maybe some others)
*    mix of html5-like navigation and old-school #!/hashes
*    i added most of ';' in lines of code for you :]. for some reason, defunkt didn't use them, but it was strange for me
*    links from both kinds of browsers are interchangable

Some bad news:

*    you HAVE to put some settings before using: 

```js
$.siteurl = 'http://yousite.com';
$.container = '#pjaxcontainer';
```

## What was it?

Pjax loads HTML from your server into the current page
without a full reload. It's ajax with real permalinks,
page titles, and a working back button that fully degrades.

Pjax enhances the browsing experience - nothing more.

You can find a demo on <http://pjax.heroku.com/>


## three ways to pjax on the client side:

One. Functionally obtrusive, loading the href with ajax into data-pjax:

```html
<a href='/explore' data-pjax='#main'>Explore</a>
```

```js
$('a[data-pjax]').pjax()
```


Two. Slightly obtrusive, passing a container and jQuery ajax options:

```html
<a href='/explore' class='js-pjax'>Explore</a>
```

```js
$('.js-pjax').pjax('#main', { timeout: null, error: function(xhr, err){
  $('.error').text('Something went wrong: ' + err)
}})
```


Three. Unobtrusive, showing a 'loading' spinner:

```html
<div id='main'>
  <div class='loader' style='display:none'><img src='spin.gif'></div>
  <div class='tabs'>
    <a href='/explore'>Explore</a>
    <a href='/help'>Help</a>
  </div>
</div>
```

```js
$('a').pjax('#main').live('click', function(){
  $(this).showLoader()
})
```


## $(link).pjax( container, options )

The `$(link).pjax()` function accepts a container, an options object,
or both. The container MUST be a string selector - this is because we
cannot persist jQuery objects using the History API between page loads.

The options are the same as jQuery's `$.ajax` options with the
following additions:

* `container`      - The String selector of the container to load the
                     reponse body. Must be a String.
* `clickedElement` - The element that was clicked to start the pjax call.
* `push`           - Whether to pushState the URL. Default: true (of course)
* `replace`        - Whether to replaceState the URL. Default: false
* `error`          - By default this callback reloads the target page once
                    `timeout` ms elapses.
* `timeout`        - pjax sets this low, <1s. Set this higher if using a
                     custom error handler. It's ms, so something like
                     `timeout: 2000`
* `fragment`       - A String selector that specifies a sub-element to
                     be pulled out of the response HTML and inserted
                     into the `container`. Useful if the server always returns
                     full HTML pages.

## $(form).pjaxform( container, options )

Same as `$(link).pjax()` but for forms. For GET forms will change address string

## $.pjax( options )

You can also just call `$.pjax` directly. It acts much like `$.ajax`, even
returning the same thing and accepting the same options.

The pjax-specific keys listed in the `$(link).pjax()` section work here
as well.

This pjax call:

```js
$.pjax({
  url: '/authors',
  container: '#main'
})
```

Roughly translates into this ajax call:

```js
$.ajax({
  url: '/authors',
  dataType: 'html',
  beforeSend: function(xhr){
    xhr.setRequestHeader('X-PJAX', 'true')
  },
  success: function(data){
    $('#main').html(data)
    history.pushState(null, $(data).filter('title').text(), '/authors')
  })
})
```


## pjax on the server side

You'll want to give pjax requests a 'chrome-less' version of your page.
That is, the page without any layout.

As you can see in the "ajax call" example above, pjax sets a custom 'X-PJAX'
header to 'true' when it makes an ajax request to make detecting it easy.

This is for PHP:

```php
if (!isset($_SERVER['HTTP_X_PJAX'])
{
   // here is regular-kind load
}
else
{
   // here you don't print page layout — just the page
}
```

In Rails, check for `request.headers['X-PJAX']`:

```ruby
def my_page
  if request.headers['X-PJAX']
    render :layout => false
  end
end
```

Django: <https://github.com/jacobian/django-pjax>

Asp.Net MVC3: <http://biasecurities.com/blog/2011/using-pjax-with-asp-net-mvc3/>


## page titles

Your HTML should also include a `<title>` tag if you want page titles to work.


## events

pjax will fire four events on the container you've asked it to load your
reponse body into:

* `start.pjax` - Fired when a pjax ajax request begins.
* `success.pjax`   - Fired on pjax ajax request success.
* `complete.pjax`   - Fired on pjax ajax request complete, one parameter is jqXHR.
* `error.pjax`   - Fired on pjax ajax request fail.

This allows you to, say, display a loading indicator upon pjaxing:

```js
$('a.pjax').pjax('#main')
$('#main')
  .bind('start.pjax', function() { $('#loading').show() })
  .bind('success.pjax',   function() { $('#loading').hide() })
  .live('complete.pjax',   function(event, jqXHR) {  })
  .bind('error.pjax',   function() { })
```

Because these events bubble, you can also set them on the body:

```js
$('a.pjax').pjax()
$('body')
  .bind('start.pjax', function() { $('#loading').show() })
  .bind('end.pjax',   function() { $('#loading').hide() })
```

## browser support

Pjax works with browses that support the history.pushState API and old-ones, that don't. For the lasts we use hashes.

For a history API's table of supported browsers see: <http://caniuse.com/#search=pushstate>

To check if pjax is supported, use the `$.support.pjax` boolean.

When history API is not supported, `$('a').pjax()` calls will do use $.ajax to load page and `window.location.hash` to identify itself. On page load without history API script loads page due to hash.


## install it

Download 

Then, in your HTML:

```html
<script src="path/to/js/jquery.pjax.js"></script>
```

Replace `path/to/js` with the path to your JavaScript directory,
e.g. `public/javascripts`.
