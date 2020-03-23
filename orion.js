let {
  registerNodeAction,
  completeNodeAction,
  errorNodeAction
} = require("./Hera/register");
let {
    createManualController
} = require("./controllerCreators");

const heraInterceptor = function(incomingInterceptor, outgoingInterceptor) {
  return (req, res, next) => {
    req = incomingInterceptor(req);
    let hTId = registerNodeAction(req);
    req.hTId = hTId;
    let oldResponseSender = res.send;
    res.send = function(data) {
      if (res.statusCode === 200) {
        completeNodeAction(hTId, req, res.statusCode, data);
      } else {
        errorNodeAction(hTId, req, res.statusCode, data);
      }
      res.send = oldResponseSender;
      outgoingInterceptor(data);
      oldResponseSender.apply(res, arguments);
    };
    next();
  };
};

function parseEndpoints(app, endpoints, parentRoute) {
  Object.keys(endpoints).forEach(endpoint => {
    if (!endpoints[endpoint].type) {
      //Mane, its just a subtree
      parseEndpoints(app, endpoints[endpoint], parentRoute + endpoint + "/");
    } else {
      let controller = endpoints[endpoint];
      let url = parentRoute+endpoint;
      switch (controller.type) {
        case "manual":
            createManualController(app,url,controller)
          console.log("Processing manual",url);
          break;
        case "accessor":
          console.log("Processing accessor",url);
          break;
        case "mutator":
          console.log("Processing mutator",url);
          break;
        case "creator":
          console.log("Processing creator",url);
          break;
      }
    }
  });
}
function createOrionServer(config) {
  var express = require("express");
  var app = express();

  app.use(
    heraInterceptor(config.incomingInterceptor, config.outgoingInterceptor)
  );
  parseEndpoints(app, config.endpoints, config.appRoute || "/");
  app.get("/orion-health-check", function(req, res) {
    res.send("Orion works!");
  });
  app.listen(config.port);
  return app;
}

module.exports = createOrionServer;
