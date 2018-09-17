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

export interface EzGeoOptions {
  selectFirstOnClose?: boolean;
  setPreviousValueOnEmpty?: boolean;
}

export interface EzGeoBloodhound {
  rateLimitBy?: string;
  rateLimitWait?: number;
  limit?: number;
  cache?: boolean;
  ttl?: number;
  prefetch?: boolean;
}

/** @see https://github.com/corejavascript/typeahead.js/blob/master/doc/jquery_typeahead.md#options */
export interface ClassNames {
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

export interface TypeaheadOptions {
  minLength?: number;
  highlight?: boolean;
  hint?: boolean;
  autoselect?: boolean;
  classNames?: ClassNames;
}

export interface EzGeoTypeaheadOptions extends TypeaheadOptions, EzGeoOptions, EzGeoBloodhound {}

export interface RemoteOptionsRequest {
  dataType?: string;
  headers?: any;
  type?: string;
  url?: string;
}