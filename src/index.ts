import './style.css';
import { InitTypeahead } from './EzGeoTypeahead';

export function init(apikey: string) {
    return new InitTypeahead(apikey);
}