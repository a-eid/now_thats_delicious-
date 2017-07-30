import "../sass/style.scss";

import { $, $$ } from "./modules/bling";
import autoComplete from "./modules/autoComplete";
// google lat long x mongo lng lat
import typeAhead from "./modules/typeAhead";
import makeMap from "./modules/map";
import ajaxHeart from "./modules/heart";

$$("form.heart").on("submit", ajaxHeart);
// bling.js you can listen on multiples like jquery

autoComplete($("#address"), $("#lat"), $("#lng"));
typeAhead($(".search"));
makeMap($("#map"));
