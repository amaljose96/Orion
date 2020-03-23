/**
 * This shall format the errors so that it can be displayed (even in production).
 */
function errorFormatter(context, err) {
    let errorStuff = `Context : ${context}
      Error Message : ${err.message}
      Stack Trace : ${err.stack}
      Error Body : ${JSON.stringify(err.response ? err.response.data : "")}`;

//   if(env== "prod" || env == "prod"){
//     let encodedString = new Buffer(errorStuff).toString("base64");
//     let chunks = encodedString.match(/.{1,100}/g);
//     errorStuff=chunks.reduce((acc,chunk)=>{
//         return acc+chunk+"\n";
//     },"");
//   }

  return {
    body: `<html>
        <body>
        <h1 style="padding:20px; color:#fff; background-color:#666">Orion Error Handler</h1>
                <pre>${errorStuff}</pre>
        <br>
        </body>
    </html>`,
    code: err.code || 500
  };
}

function sendError(context, err) {
  let { body, code } = errorFormatter(context, err);
  res.status(code).send(body);
}

module.exports = sendError;
