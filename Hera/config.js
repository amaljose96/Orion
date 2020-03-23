module.exports = {
  requestAdapter: function(request) {
    let requestData = { body: request.body, query: request.query };
    return {
      method: request.method,
      url: request.originalUrl,
      request: requestData,
      headers: request.headers
    };
  }
};
