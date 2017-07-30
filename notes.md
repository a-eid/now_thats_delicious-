package `dotenv` for managing environmental variables . 
```js 
require('dotenv').config({path: './variables.env'}) 
```
this is all you have to do now all what you have defined in `variables.env` are avaiable on process.env
make a helper file and put it on locals import the libs you need and stuff . 

when using cookie-parser it will add cookie property on the request and on the responst objs 
  then you can use it to set and get cookies . 

when you are starting a new project and you are using pug , 
  make heavy use of mixins . 
  you invoke the mixin with a + 

enctype="multipart/form-data" use that when you are make a form that accepts uploads . 

error handling with async await or promises 
```js 
// wrap your route handlers in the following function 
function catchErrors = (fn) => {
  return function (req , res , next) { // this is what is being exposed to the route 
    return fn(req , res).catch(next) // if there was an error it will pass it to next 
  }
}
```
set the flash message before the redirect . 
set flash + render = same request 
set flash then redirect are two requests . 

request x 
-> set headers   -> redirect 

```js 
const dump = (obj) => JSON.stringify(obj , null , 2) 
```

if you don't know what to know res.json(..) to get a sense of where you are . 

