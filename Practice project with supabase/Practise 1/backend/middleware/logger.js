// Middleware = a function that runs BETWEEN the request coming in
// and the route handler sending a response.
// It receives (req, res, next) and MUST call next() to let the
// request continue — otherwise the request just hangs forever.

function logger(req, res, next) {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${req.method} ${req.url}`);

  next(); // pass control to the next middleware / route handler
}

module.exports = logger;
