 ![CI](https://github.com/rankmyapp/error-handler/workflows/CI/badge.svg)


# error-handler

Technologies
 - Node.js;
 - Sentry.
 
This lib was made to handle errors and log them somewhere
Currently you can use it as a Node.js middleware.
The `errorHandler` function accepts a list of error codes it should filter from being sent to sentry according to `err` status code.
 As a middleware it will log the error and call `next(err)`:

```javascript
const errorHandler = require('error-handler');
app.use(errorHandler({ blockEvents: [404, 403, 401] }).middleware);
```

or

Use it just as a function to log something
`logError` accepts a string `origin` (from where the error comes) and `err` object or message:
```javascript
const errorHandler = require('error-handler');
errorHandler().logError(origin, err);
```

## Testing

Jest was used to test this lib, run it with:
```
yarn test
```