# :facepunch: Ez Geo Query

This is the official plugin SDK for the EZ Geo Query API. 

Ez Geo Query is an API service to provide autoresult suggestions for City, State, ZIP search string combinations. It returns data in a consistent format and is currently being developed to provide more data, such as population, median income, and latitude longitude coordinates. Using this typeahead plugin with the API allows for rapid setup and deployment of geographical autocomplete search fields. 


## Ez Geo Typeahead

Ez Geo Typeahead is a typeahead library build on top of [typeahead.js](https://github.com/corejavascript/typeahead.js) using the [Ez Geo Query API](https://ezgeoquery.us/). It was designed to be a drop in, turn-key autocomplete solution for querying Zip Codes, Cities and States in the US. Under the hood it also uses the [Bloodhound engine](https://github.com/corejavascript/typeahead.js/blob/master/doc/bloodhound.md) to query the API.

**NOTE** This is using a *more recently maintained* fork of the original [Twitter typeahead & Bloodhound](https://github.com/twitter/typeahead.js) repo.

### Getting Started

Ez Geo Typeahead has dependencies on:

- jQuery (not slim)
- [typeahead.js](https://github.com/corejavascript/typeahead.js) ( bundle w/ Bloodhound)

The typeahead is built around Bootstrap styles, but does not require Bootstrap css or js. Bootstrap's recommended jQuery lib  is the `slim` version. This will not work, as slim does not contain the `ajax` module.

If you have the required libraries loaded, include [ezgeoquery-typeahead.js](https://github.com/nickrstan/ezgeoquery-typeahead/blob/master/dist/ezgeoquery-typeahead.js).

##### By Script

`<script type="text/javascript" src="ezgeoquery-typeahead.js"></script>`

##### NPM

`npm install ezgeoquery-typeahead`

### Get an API key

Head over to [Ez Geo Query](https://ezgeoquery.us) and sign up for a *free or paid plan* to get an API key.

### Init the library

In your script file, initialize the library with your new API key.

```javascript
var apikey = "YOUR-API-KEY";

// Init the library with your key
var ezgeo = EzGeoTypeahead.init(apikey);
```

### Make your inputs into a typeahead

Take the input field you want to make a typeahead and pass it into the `make` method. Optionally you can provide [options](#options) for this specific typeahead.

```javascript
/** @see options */
var options = {
    selectFirstOnClose: true,
    setPreviousValueOnEmpty: true,
}
  
// You could pass in a string or a jQuery object
var $input = ezgeo.make('#ezgeo', options);
```

And thats it. Ez. :boom:	



## Typeahead Options

Under the hood, we configure most of the options for you. We feel these are opinionated, however we still have the following default options from [typeahead.js options](https://github.com/corejavascript/typeahead.js/blob/master/doc/jquery_typeahead.md#options) and our own custom ones. 

### [Options](https://ezgeoquery.us/#options)



## Typeahead Events

We pass the default events from [typeahead.js events](https://github.com/corejavascript/typeahead.js/blob/master/doc/jquery_typeahead.md#events) so you can still access them. All events will be accessed as:

```javascript
$input.typeahead.on('eventName', function() {});
```

**NOTE** Every event does not supply the same arguments. See the event descriptions above for details on each event's argument list.

### [Events](https://ezgeoquery.us/#events)



## Get the current value

There are a couple ways to get the current value. You can still rely on the current html input value, which would be the formatted select; ex `Seattle, Wa, 98118`. If you want to get the value as an object, to send or trigger other events, you can access the current value of the input by an event, or directly.

```javascript
// To access directly from the getter
var value = $input.currentValue;
console.log(value);

// To access by the valueUpdated event
$input.typeahead.on('typeahead:valueUpdated', function(ev, value) {
    console.log(value);
});

// both would output from Searcy, AR, 72143
// { zip_code: "72143", city: "Searcy", state: "AR" }
```

## Typeahead Styles

There is minimal style provided. You can override these easily to match your current/desired style.

### [Default Style](https://github.com/nickrstan/ezgeoquery-typeahead/blob/master/src/style.css)

## Ez Geo API

Behind the typeahead library is the [Ez Geo API] (https://ezgeoquery.us/). We've written algorithms to interact with our data in order to return city, state, zip results reliably and consistently, making building anything (such as registration forms with user's geographical data, address, etc.) that requires this data a breeze.

Below you can see the various combinations that the plugin accepts and will return results for. The plugin also searches by partial match and allows you to enter a portion of any part of the combination, such as "Sea, WA 981" for Seattle, Washington locations whose zip start with 981XX.

Check out all the formats below:

`City, State, Zip`

`City, Zip`

`State, Zip`

`City, State`

`City,`

`Zip`

`City`

`City State Zip`

`City Zip`

`State Zip`

`City State`

`City,State,Zip`

`City,Zip`

`City,State`

`City ,`

`City , zip`

`City city, zip`
