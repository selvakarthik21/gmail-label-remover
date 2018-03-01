<META HTTP-EQUIV="PRAGMA" CONTENT="NO-CACHE">  
<meta http-equiv="Expires" content="Mon, 01 Jan 1990 12:00:00 GMT">
<!doctype html>
<html>
  <head>
    <title>Gmail API List Messages</title>
    <meta charset="UTF-8">

    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/bootstrap-theme.min.css">
    <style>
      iframe {
        width: 100%;
        border: 0;
        min-height: 80%;
        height: 600px;
        display: flex;
      }
      .loader {
		  border: 4px solid #f3f3f3;
		  border-radius: 50%;
		  border-top: 4px solid #3498db;
		  width: 30px;
		  height: 30px;
		  -webkit-animation: spin 2s linear infinite; /* Safari */
		  animation: spin 2s linear infinite;
		}
		
		/* Safari */
		@-webkit-keyframes spin {
		  0% { -webkit-transform: rotate(0deg); }
		  100% { -webkit-transform: rotate(360deg); }
		}
		
		@keyframes spin {
		  0% { transform: rotate(0deg); }
		  100% { transform: rotate(360deg); }
		}
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Gmail API</h1>

      <button id="authorize-button" class="btn btn-primary hidden">Authorize</button>
			
      <table class="table table-striped table-inbox hidden">
      	<caption>
	      	<div class="row">
	  			<div class="col-lg-6">
			      	<div class="input-group">
			      	  <input type="text" class="form-control" placeholder="Enter your Search Query" id="query">			      	  
				      <span class="input-group-btn">
				        <button class="btn btn-secondary" type="button" id="RemoveLabels">Remove Labels</button>
				      </span>
				      <div class="loader" style="display:none;"></div>	
				    </div>
				</div>	
				<div class="col-lg-6">
					<div class="pull-right">
				      		Repeat at every <input id="interval" style="width:70px;" type="number" value="5" min="1" placeholder="Interval" /> Minute(s)
				    </div>
				</div>			
	      	</div>
	      	<div class="row">
	      		<div class="col-lg-12">
			      	<div class="labelsToBeRemoved" title="These Labels will be removed from your messages">
				    </div>
				</div>
	      	</div>
      	</caption>
        <thead>
          <tr>
            <th>From</th>
            <th>Subject</th>
            <th>Tagged Labels</th>
            <th>Removed Labels</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>

    <div class="modal fade" id="reply-modal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">Reply</h4>
          </div>
          <form onsubmit="return sendReply();">
            <input type="hidden" id="reply-message-id" />

            <div class="modal-body">
              <div class="form-group">
                <input type="text" class="form-control" id="reply-to" disabled />
              </div>

              <div class="form-group">
                <input type="text" class="form-control disabled" id="reply-subject" disabled />
              </div>

              <div class="form-group">
                <textarea class="form-control" id="reply-message" placeholder="Message" rows="10" required></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
              <button type="submit" id="reply-button" class="btn btn-primary">Send</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <script src="js/jquery-2.2.4.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/options.js"></script>
    <script src="https://apis.google.com/js/client.js?onload=handleClientLoad"></script>
  </body>
</html>