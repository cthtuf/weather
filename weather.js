// Generated by CoffeeScript 1.8.0
(function() {
  var URL, Weather, extend, http, isModule, merge;

  isModule = typeof module !== "undefined" && module.exports;

  if (isModule) {
    require('sugar');
    http = require("http");
    URL = require('url');
  }

  extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      object[key] = val;
    }
    return object;
  };

  merge = function(options, overrides) {
    return extend(extend({}, options), overrides);
  };

  Weather = (function() {
    function Weather() {}

    Weather.VERSION = "0.1.0";

    Weather.apiUrl = "http://api.openweathermap.org/data/2.5/";

    Weather.imgUrl = "http://openweathermap.org/img/w/";

    Weather.options = {};

    Weather.kelvinToFahrenheit = function(value) {
      return ((this.kelvinToCelsius(value) * 1.8) + 32).toFixed(2);
    };

    Weather.kelvinToCelsius = function(value) {
      return (value - 273.15).toFixed(2);
    };

    Weather.iconUrl = function(icon) {
      return this.imgUrl + icon + ".png";
    };

    Weather.byCity = function(city) {
      return new Weather.Request({
        q: city
      });
    };

    Weather.byCityId = function(cityId) {
      return new Weather.Request({
        id: cityId
      });
    };

    Weather.byLatLng = function(latitude, longitude) {
      return new Weather.Request({
        lat: latitude,
        lon: longitude
      });
    };

    return Weather;

  })();

  Weather.Request = (function() {
    var getJSON;

    function Request(options) {
      this.options = options;
    }

    Request.prototype.getCurrent = function(options, callback) {
      if (options == null) {
        options = {};
      }
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      options = merge({
        cnt: 1
      }, this.options, options);
      return getJSON("weather", options, (function(_this) {
        return function(data) {
          if (typeof callback === 'function') {
            return callback(new Weather.Current(data));
          }
        };
      })(this));
    };

    Request.prototype.getForecast = function(options, callback) {
      if (options == null) {
        options = {};
      }
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      options = merge(this.options, options);
      return getJSON("forecast", options, (function(_this) {
        return function(data) {
          if (typeof callback === 'function') {
            return callback(new Weather.Forecast(data));
          }
        };
      })(this));
    };

    getJSON = function(uri, options, callback) {
      var option, optionValue, url, xhr;
      if (options == null) {
        options = {};
      }
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      options = merge(Weather.options, options);
      url = Weather.apiUrl + uri;
      for (option in options) {
        optionValue = options[option];
        url += (url.split('?')[1] ? "&" : "?") + option + "=" + encodeURIComponent(optionValue);
      }
      if (isModule) {
        return http.get(URL.parse(url), function(response) {
          return callback(response.body);
        });
      } else {
        xhr = $.ajax({
          url: url,
          dataType: "jsonp"
        });
        xhr.done(callback);
        return xhr.fail(function(jqXHR) {
          if (console) {
            return console.error(jqXHR);
          }
        });
      }
    };

    return Request;

  })();

  Weather.Forecast = (function() {
    function Forecast(data) {
      this.data = data;
    }

    Forecast.prototype.startAt = function() {
      return new Date(this.data.list.min('dt').dt * 1000);
    };

    Forecast.prototype.endAt = function() {
      return new Date(this.data.list.max('dt').dt * 1000);
    };

    Forecast.prototype.day = function(date) {
      return new Weather.Forecast(this._filter(date));
    };

    Forecast.prototype.low = function() {
      var output;
      if (!(this.data.list.length > 0)) {
        return void 0;
      }
      output = this.data.list.min(function(item) {
        return item.main.temp_min;
      });
      return output.main.temp_min;
    };

    Forecast.prototype.high = function() {
      var output;
      if (!(this.data.list.length > 0)) {
        return void 0;
      }
      output = this.data.list.max(function(item) {
        return item.main.temp_max;
      });
      return output.main.temp_max;
    };

    Forecast.prototype._filter = function(date) {
      var beginningOfDay, clone, endOfDay;
      if (date instanceof Date) {
        date = date.getTime();
      }
      clone = Object.clone(this.data);
      beginningOfDay = Date.create(date).beginningOfDay();
      endOfDay = Date.create(date).endOfDay();
      clone.list = clone.list.findAll(function(range) {
        var dateTimestamp;
        dateTimestamp = range.dt * 1000;
        if (dateTimestamp >= beginningOfDay.getTime() && dateTimestamp <= endOfDay.getTime()) {
          return range;
        }
      });
      return clone;
    };

    return Forecast;

  })();

  Weather.Current = (function() {
    function Current(data) {
      this.data = data;
    }

    Current.prototype.getSunrise = function() {
      return new Date(this.data.sys.sunrise * 1000);
    };

    Current.prototype.getSunset = function() {
      return new Date(this.data.sys.sunset * 1000);
    };

    Current.prototype.getLocation = function() {
      return this.data.name + ", " + this.data.sys.country;
    };

    Current.prototype.getMapLink = function() {
      return "http://openweathermap.org/Maps?zoom=12&lat=" + this.data.coord.lat + "&lon=" + this.data.coord.lon + "&layers=B0FTTFF";
    };

    Current.prototype.getConditions = function() {
      return this.data.weather[0].description;
    };

    Current.prototype.getIcon = function() {
      return Weather.iconUrl(this.data.weather[0].icon);
    };

    return Current;

  })();

  if (isModule) {
    module.exports = Weather;
  } else {
    window.Weather = Weather;
  }

}).call(this);
