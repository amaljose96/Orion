
let {registerNodeAction,completeNodeAction,errorNodeAction} = require('./register');
const heraInterceptor = (req, res, next) => {
    let hTId=registerNodeAction(req);
    req.hTId=hTId;
    let oldResponseSender=res.send;
    res.send=function(data){
      if(!data){
        data={}
      }
      if(res.statusCode===200){
        completeNodeAction(hTId,req,res.statusCode,data);
      }
      else{
        errorNodeAction(hTId,req,res.statusCode,data);
      }
      res.send=oldResponseSender;
      oldResponseSender.apply(res,arguments);
    }
    next();
  };
  
  module.exports = heraInterceptor;
  