module.exports={
    projectName:"Booking Management",
    endpoints:{
        "googleWebsite":{
            type:"accessor"
        },
        "booking":{
            "create":{
                type:"creator"
            },
            "modify":{
                type:"mutator"
            }
        },
        "just-say-hi":{
            type:"manual",
            method:"get",
            controller:function(req,res){
                res.send("Hey");
            }
        }
       
    },
    incomingInterceptor:function(request){
        console.log("New call coming to ",request.body||request.params);
        return request;
    },
    outgoingInterceptor:function(response){
        console.log("Outgoing ",response)
    },
    port:2532
}