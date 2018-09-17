/**
 * EzGeoTypeahead
 */

declare const jQuery: any;
declare const Bloodhound: any;

// Possible ezgeo respose
// #TODO these names have changed, && for now its just returns the state, city and zip
export interface EzGeoQuery {
  id?:            number;
  city?:          string;
  county?:        string;
  state_code?:    string;
  state?:         string;
  zip_code?:      number;
  type?:          string;
  latitude?:      string;
  longitude?:     string;
  area_code?:     string;
  population?:    number;
  households?:    number;
  median_income?: number;
  land_area?:     number;
  water_area?:    number;
  time_zone?:     string;
  updated_at?:    string;
  created_at?:    string;
}

interface EzGeoOptions {
  selectFirstOnClose?: boolean;
  setPreviousValueOnEmpty?: boolean;
}

interface EzGeoBloodhound {
  rateLimitBy?: string;
  rateLimitWait?: number;
  limit?: number;
  cache?: boolean;
  ttl?: number;
  prefetch?: boolean;
}

/** @see https://github.com/corejavascript/typeahead.js/blob/master/doc/jquery_typeahead.md#options */
interface ClassNames {
  input?: string;
  hint?: string;
  menu?: string;
  dataset?: string;
  suggestion?: string;
  empty?: string;
  open?: string;
  cursor?: string;
  highlight?: string;
}

interface TypeaheadOptions {
  minLength?: number;
  highlight?: boolean;
  hint?: boolean;
  autoselect?: boolean;
  classNames?: ClassNames;
}

interface EzGeoTypeaheadOptions extends TypeaheadOptions, EzGeoOptions, EzGeoBloodhound {}

interface RemoteOptionsRequest {
  dataType?: string;
  headers?: any;
  type?: string;
  url?: string;
}

/**
 * Available Options
 * Custom + Typeahead
 * 
 * We only allow options we think we should allow
 * If we wanted to configure more, see the below
 * @see https://github.com/corejavascript/typeahead.js/blob/master/doc/jquery_typeahead.md#options
 */
const defaultEzGeoOptions: EzGeoTypeaheadOptions = {
  // default typahead
  minLength: 3,
  highlight: true,
  hint: false,
  autoselect: true,
  classNames: null,
  // default bloodhound
  rateLimitBy: 'throttle',
  rateLimitWait: 200,
  limit: 5,
  cache: true,
  ttl: 7776000000, // 3 months in ms
  prefetch: true,
  // default ezgeo
  selectFirstOnClose: true,
  setPreviousValueOnEmpty: false,
}

class BloodhoundTypeahead {

  private _apikey: string;
  private _input: any;
  private _apiurl: string = 'https://ezgeoquery.us/api';
  private _prefetchUrl: string = 'https://ezgeoquery.us/api/popular';
  private _urlDirectory: string = '/query/';

  private _resultsName = 'geodata';
  get resultsName() {
    return this._resultsName;
  }
  set resultsName(name: string) {
    this._resultsName = name;
  }
  
  private _typeahead: any;
  get typeahead() {
    return this._typeahead;
  }

  private _geodata: any;
  get geodata() {
    return this._geodata;
  }

  private _options: EzGeoTypeaheadOptions = defaultEzGeoOptions;

  private _currentValue: EzGeoQuery = {};
  set currentValue(value: EzGeoQuery) {
    this._currentValue = value;
    this._typeahead.typeahead('val', this._inputDisplay(this.currentValue));
    this._triggerValueChangeEvent();
  }
  
  get currentValue() {
    return this._currentValue;
  }

  private _currentSuggestions: EzGeoQuery[] = [];
  set currentSuggestions(value: EzGeoQuery[]) {
    this._currentSuggestions = value;
  }
  
  get currentSuggestions() {
    return this._currentSuggestions;
  }

  private _typeaheadOptions: Twitter.Typeahead.Options = {};
  private _ezGeoOptions: EzGeoOptions = {};

  // has this input been initilized
  activated: boolean = false;

  constructor(
    public apikey: string,
    public input: any,
    public options: EzGeoTypeaheadOptions
  ) {
    this._apikey = apikey;
    this._input = input;

    // Merge options with default
    if (options) {
      this._options = { ...this._options, ...options }
    }

    // make options
    this._typeaheadOptions = {
      minLength: this._options.minLength,
      hint: this._options.hint,
      highlight: this._options.highlight,
      autoselect: this._options.autoselect,
      classNames: this._options.classNames,
    }

    this._ezGeoOptions = {
      selectFirstOnClose: this._options.selectFirstOnClose,
      setPreviousValueOnEmpty: this._options.setPreviousValueOnEmpty
    }

    this._setGeoData();
    this._startTypeahead();
   
  }

  /**
   * Update the input value, not the currentValue.
   *  DO not trigger and update event
   */
  private _updateInputValue(value: EzGeoQuery): void {
    this._typeahead.typeahead('val', this._inputDisplay(value));
  }

  /**
   * Build a string to display in the input field, and suggestion typeahead result lists
   * 
   * @param geo | ezgeoquery object 
   */
  private _inputDisplay(geo: EzGeoQuery) {
    return geo.city + ', ' + geo.state + ', ' + geo.zip_code;
  }
  
  /**
   * Pipe the query into the url
   * Attach the x-authorization header to the ezgeo request
   * 
   * @param query
   * @param settings 
   */
  private _prepare(query: string, settings: any) {
    settings.url = settings.url + this._urlDirectory + query;
    settings.headers = {
      "x-authorization": this._apikey
    };
    
    return settings;
  }

  /** Check the options and return the prefetch object if true */
  private _prefetch(): any {
    if (this._options.prefetch) {
      return {
        url: this._prefetchUrl,
        cache: this._options.cache,
        ttl: this._options.ttl,
        cacheKey: 'ezgeoquery_popular',
        prepare: (settings: any) => {
          settings.url = settings.url;
          settings.headers = {
            "x-authorization": this._apikey
          };

          return settings;
        }
      }
    } else {
      return null;
    }
  }

  private _setGeoData(): void {
    this._geodata = new Bloodhound({
      datumTokenizer: (obj: EzGeoQuery) => {
        return [ obj.zip_code, obj.state, obj.city ];
      },
      queryTokenizer: Bloodhound.tokenizers.nonword,
      local: [],
      identify: (obj) => obj.zip_code,
      sufficient: 2,
      prefetch: this._prefetch(),
      remote: {
        url: this._apiurl,
        prepare: (query: string, settings: any) => this._prepare(query, settings),
        rateLimitBy: this._options.rateLimitBy,
        rateLimitWait: this._options.rateLimitWait,
        limit: this._options.limit,
        transport: (options, onSuccess, onError) => {

          // check here for the _preventQueryOnFocus
          if (this._preventQueryOnFocus(options)) {
            return false;
          }

          $.ajax(options).done( data => onSuccess(data) )
          .fail( (request: any) => {

            // check for error
            if (request.responseJSON && (request.responseJSON.error || request.responseJSON.code)) {

              let code;

              if (request.responseJSON.code) {
                code = request.responseJSON.code
                  ? request.responseJSON.code : 'hippty-hop';
              } else {
                code = request.responseJSON.error.code
                  ? request.responseJSON.error.code : 'hippty-hop';
              }

              switch (code) {

                case 'quota_monthly':
                  console.error('Ez Geo Query: You have hit your monthly Ez Geo Query api limit. Head over to https://www.ezgeoquery.us to increase your limit'); 
                break;

                case '401':
                  console.error('Ez Geo Query: No Api key'); 
                break;

                case 'invalid_zip':
                  console.error('Ez Geo Query: Invalid zip code'); 
                break;

                default:
                  console.error('Ez Geo Query: Something bad happened');
                break;

              }
            }
          });
        }
      }
    })
  }

  /**
   * Initialize a typeahead method in the input
   * start the watch events
   */
  private _startTypeahead(): void {
    this._typeahead = this._input.typeahead(this._typeaheadOptions, {
      name: this.resultsName,
      source: this._geodata,
      display: (geo: any) => {
        return this._inputDisplay(geo);
      }
    });

    // this needs to wait for init
    this._watchEvents();
  }

  private _watchEvents(): void {
    this._active();
    this._select();
    this._render();

    if (this._ezGeoOptions.selectFirstOnClose) {
      this._selectFirst();
    }

    if (this._ezGeoOptions.setPreviousValueOnEmpty) {
      this._setPreviousValue();
    } else {
      this._defaultPreviousInput();
    }
  }

  private _active(): void {
    this._typeahead.on('typeahead:active', (ev) => {
      if (!this.activated) {
        this.activated = true;
      };
    });
  }

  /**
   * On select
   * Cancel the next async
   * Set the current value
   * Empty out suggestions
   */
  private _select(): void {
    this._typeahead.on('typeahead:select', (ev, selection) => {
      // tap into the raw property here
      this._currentValue = selection;
      // which means we should trigger an update event
      this._triggerValueChangeEvent();
      this.currentSuggestions = [];
    });
  }

  /**
   * When a suggestion(s) are rendered
   */
  private _render(): void {
    this._typeahead.on('typeahead:render', (event, suggestions, async, datasetName) => {
      this.currentSuggestions = suggestions;
    });
  }

  /**
   * When there is a value, and its string matches the current
   * Cancel the async request
   * 
   */
  private _preventQueryOnFocus(options: RemoteOptionsRequest): boolean {
    if (this._currentValue) {
      const outGoing = options.url;
      const apiUrl = this._apiurl + this._urlDirectory;
      const query = outGoing.replace(apiUrl, '');
      const currentDisplay = this._inputDisplay(this.currentValue);
      if (currentDisplay == query) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  private _defaultPreviousInput() {
    this._typeahead.bind('typeahead:change', (e) => {
      const inputValue = this._typeahead.typeahead('val');
      if (inputValue == '') {
        // tap into the raw property here
        this._currentValue = {};
      }
    })
  }

  private _triggerValueChangeEvent() {
    this._typeahead.trigger('typeahead:valueUpdated', this.currentValue);
  }

  /* Optional Methods */

  /**
   * selectFirstOnClose
   * 
   * On change if the user has a previous value
   * And there is current suggestions that match what they have typed
   * But do not select 
   * If the first suggestion.id != current.id
   * Select the first in the list and update input value
   * 
   * This only works for clicking off, tabbing off is handled internally with the autoselect typeahead option
   */
  private _selectFirst(): void {
    this._typeahead.on('typeahead:close', () => {
      if (this.currentSuggestions.length > 0) {
        const firstSuggestion: EzGeoQuery = this.currentSuggestions[0];

        if (Object.keys(this.currentValue).length !== 0 && (this.currentValue.zip_code == firstSuggestion.zip_code)) {
          // reset the input value, dotn trigger event as it is the same.
          this._updateInputValue(this.currentValue);
        } else {
          // update the value
          this.currentValue = firstSuggestion;
          this.currentSuggestions = [];
        }
      }
    })
  }
  
  /**
   * setPreviousValueOnEmpty
   * 
   * If the user has a current value
   * Searches for something and no results come up
   * && the current does not equal the input value
   * They leave (click or tab)
   * Set the input value to the (current)
   */
  private _setPreviousValue(): void {
    this._typeahead.bind('typeahead:close', (e) => {
      // check if..
      // 1) the actual value doesnt equal the current value formatted
      if (Object.keys(this.currentValue).length !== 0) {
        const inputValue = this._typeahead.typeahead('val');
        const inputDisplay = this._inputDisplay(this.currentValue);

        if ( this.currentSuggestions.length == 0 || inputValue !== inputDisplay) {
          // reset the input value, dotn trigger event as it is the same.
          this._updateInputValue(this.currentValue);
        }
      }
    })
  }
}

export class InitTypeahead {

  public apikey: string;

  constructor(apikey: string) {
    this.apikey = apikey;
    if (!this.apikey) {
      console.error('Ez Geo Query: We need your api key. Get one here: https://www.ezgeoquery.us');
      return;
    }
  }

  make(input: any, options?: EzGeoTypeaheadOptions) {
    if (typeof input == 'string') {
      input = jQuery(input);
    }

    return new BloodhoundTypeahead(this.apikey, input, options);
  }

}