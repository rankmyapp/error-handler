# error-handler

Technologies
 - Node.js, Sentry
 
This lib was made to handle errors and log them somewhere
Currently you can use as a Node.js middleware 
As a middleware it will log the error and call next(err);

```
const errorHandler = require('error-handler');
app.use(errorHandler().middleware);
```

or

use just a function to log something
logError accepts a string origin(from where the error comes) and err object or message
```
const errorHandler = require('error-handler');
errorHandler.logError(origin, err);
```