# Hera

This analytical tool mainly helps in tracking API performance.

## Features
1. User actions : Check when a user has logged in; The actions he has performed; Time taken for each action; And the complete time taken for that action.

2. API Performance : Checking API response times and error rates.

## Design
1. Injection : A trace id is formed when the Node layer recieves a request from UI. This is used till the call is made to API. Data is entered to a file asynchronously with each call.

Data with each entry:
Time    TraceId Type    UserIdentifier  Url Request ResponseCode(-) Response(-)

Events are thrown are:
    1. Node Call Initiated : As of now I'm thinking of adding this to an incoming interceptor. Otherwise, all handlers need to register this.
    eg. XXXXXXX,trace:XXXX,NODE_INITIATED,mpp.uuid,/promo/api/promotion/search,-,-
    2. API Call Initiated : This can be added to the API Wrapper.
    eg. XXXXXXX,trace:XXXX  API_INITIATED  mpp.uuid    projection-service.api/promotion/search - -
    3. API Call Completed : This can be added to the API Wrapper.
    eg. XXXXXXX,trace:XXXX  API_COMPLETE  mpp.uuid    /promo/api/promotion/search 200 -
    4. API Call Failed : This can be added to the API Wrapper.
    eg. XXXXXXX,trace:XXXX  API_FAILED  mpp.uuid    /promo/api/promotion/search - -
    5. Node Call Completed : This has to be added before every res.send() (Need to check if there is any interceptor way of doing this)
    eg. XXXXXXX,trace:XXXX  NODE_COMPLETE  mpp.uuid    /promo/api/promotion/search - -
    6. Node Call Failed : Same as Node Call Completed
    eg. XXXXXXX,trace:XXXX  NODE_FAILED  mpp.uuid    /promo/api/promotion/search - -

2. Action Retrieval : An action is defined as every call that comes from UI to Node. This involves a NODE_INITIATED, several API_INITIATED, API_COMPLETEs and a NODE_COMPLETE. A trace id is unique for an action.
Important fields of an action:
    1. Trace Id : Unique Id
    2. User : Owner of the action
    3. Node Url : Node URL Being hit
    4. Total Time Taken
    5. Status : Success/Node Error/API Error
    6. API Breakdown:{
        1. API Endpoint
        2. Time Taken
        3. Status : Success/Failure
    }
3. User Story : A User story is basiaclly, actions grouped by userId.
    1. User Id : Unique Id
    2. Dummy Name
    3. Actions : []

4. API Endpoint : Just an overview of an endpoint, gathering all calls to that endpoint.