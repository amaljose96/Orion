function controllerVerifier(url, controller) {
  if (controller.allowedFields) {
    if (controller.excludedFields) {
      throw "Error in initiating controllers.\nPlease check controller for " +
        url +
        ". It seems both allowedFields and excludedFields are together.";
    }
    if (controller.type === "creator") {
      throw "Error in initiating controllers.\nPlease check controller for " +
        url +
        ". It seems the creator controller has allowedFields. Creator controllers do no support allowedFields.";
    }
  }
  if (controller.excludedFields) {
    if (controller.allowedFields) {
      throw "Error in initiating controllers.\nPlease check controller for " +
        url +
        ". It seems both allowedFields and excludedFields are together.";
    }
    if (controller.type === "creator") {
      throw "Error in initiating controllers.\nPlease check controller for " +
        url +
        ". It seems the creator controller has excludedFields. Creator controllers do no support excludedFields.";
    }
  }
  return true;
}
/**
 * This function checks for mutations and manuals.
 * only these fields would be patched. If any fieldName does not match, it would throw 400
 */
function allowedFieldsRequestCheck(request, config) {
  if (!config.allowedFields) {
    return request;
  }
  let requestFields = Object.keys(request);
  let allowedFields = config.allowedFields;
  let extraFields = requestFields.filter(requestField => {
    return !allowedFields.includes(requestField);
  });
  if (extraFields.length) {
    if (config.strict) {
      sendError("Required Fields Check Failed", {
        message: "An extra field is passed on. Extra fields are " + extraFields
      });
      return false;
    } else {
      let formattedRequest = {};
      allowedFields.forEach(allowedField => {
        formattedRequest[allowedField] = request[allowedField];
      });
      return formattedRequest;
    }
  }
}
function allowedFieldsResponseFilter(response, config) {
    if (!config.allowedFields) {
      return response;
    }
  let formattedResponse = {};
  config.allowedFields.forEach(allowedField => {
    formattedResponse[allowedField] = response[allowedField];
  });
  return formattedResponse;
}
/**
 * End of allowed fields
 */

const allowedMethods = ["get", "post", "patch"];
function manualControllerVerifier(url, controller) {
  controllerVerifier(url, controller);
  if (!controller.method) {
    throw "Error in initiating manual controller.\nPlease check controller for " +
      url +
      ". It seems the method for the endpoint is missing.";
  }
  if (!allowedMethods.includes(controller.method)) {
    throw "Error in initiating manual controller.\nPlease check controller for " +
      url +
      ". It seems the method for the endpoint is wrong. Please choose one of the following : get, post, patch\nController method : " +
      controller.method;
  }
  if (!controller.controller) {
    throw "Error in initiating manual controller.\nPlease check controller for " +
      url +
      ". It seems the controller for the endpoint is missing.";
  }
  return true;
}
function createManualController(app, url, config) {
  manualControllerVerifier(url, config);
  app[config.method](url, (request, response) => {
    config.controller(request, response);
  });
}

module.exports = {
  createManualController
};
