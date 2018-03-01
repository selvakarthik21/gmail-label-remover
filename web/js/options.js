var clientId = '118625724860-lf6mgu8bu61npvv9e2a6jp7o3tkars1p.apps.googleusercontent.com';
var apiKey = 'AIzaSyCnvRHxn9BKaUyvREdRJgXtBYZ4Cj4BZjw';
var scopes = 'https://www.googleapis.com/auth/gmail.modify';
var userId = 'me';
var userLabel = {};
var toBeRemovedLabels = [];
var toBeRemovedLabelIds = [];
var lastMessageId;
var repeatInterval = 5 * 60 * 1000;
var repeatProcess = setInterval(listMessages, repeatInterval);


$(document).ready(function(){
	$('#RemoveLabels').click(listMessages);
	$('#interval').change(function(event){
		var val = $(this).val();
		val = (null == val || isNaN(val) || val < 1) ? 5 : val;
		$(this).val(val);
		val *= 60 * 1000;
		clearInterval(repeatProcess);
		repeatProcess = setInterval(listMessages, val);
		
	});
	$('#query').keyup(function(event){
		if(event.keyCode == 13) {
			event.preventDefault();
			listMessages();
			return false;
		}
		var query = $(this).val();
		var textLabels = [];
		$.each(query.split(" "), function(index, element){
			var text = element || "";
			text = $.trim(text).toLowerCase();
			if(text.indexOf('label:') > -1 ){
				var value = text.replace(/label\:/gi,'');
				for(var key in userLabel){
					if(key.toLowerCase().replace(/[^a-z0-9]/gi,'') == value.replace(/[^a-z0-9]/gi,'') && textLabels.indexOf(key) == -1){
						textLabels.push(key);
						break;
					}
				}
			}
		});
		$('.labelsToBeRemoved').empty();
		if(textLabels.length > 0){				
			$.each(textLabels,function(){
				var labelText = '<button disabled class="btn btn-secondary" type="button" style="margin-top: 5px;">'+this+'</button> &nbsp;&nbsp;&nbsp;&nbsp;';
				if(this != ""){
					$('.labelsToBeRemoved').append(labelText);
				}					
			});
		}
	});
})
function handleClientLoad() {
	console.log('hi');
	gapi.client.setApiKey(apiKey);
	window.setTimeout(checkAuth, 1);
}
function checkAuth() {
	gapi.auth.authorize({
		client_id: clientId,
		scope: scopes,
		immediate: true
	}, handleAuthResult);
}
function handleAuthClick() {
	gapi.auth.authorize({
		client_id: clientId,
		scope: scopes,
		immediate: false
	}, handleAuthResult);
	return false;
}
function handleAuthResult(authResult) {
	if(authResult && !authResult.error) {
		loadGmailApi();
		$('#authorize-button').remove();
		$('.table-inbox').removeClass("hidden");
		$('#compose-button').removeClass("hidden");
	} else {
		$('#authorize-button').removeClass("hidden");
		$('#authorize-button').on('click', function(){
			handleAuthClick();
		});
	}
}
function loadGmailApi() {
	gapi.client.load('gmail', 'v1', listLabels);
}
function listLabels() {
	var request = gapi.client.gmail.users.labels.list({
		'userId': userId
	});
	request.execute(function(resp) {
		var labels = resp.labels;
		$.each(labels, function(index, label){
			if('user' == label.type){
				userLabel[label.name] = label.id;
			}
		})
	});
}
function listMessages( ) {
	lastMessageId = null;
	var callback = loadAllMessages;
	handleClientLoad();
	$('.table-inbox tbody').empty();
	toBeRemovedLabels = [];
	toBeRemovedLabelIds = [];
	var query = $.trim($('#query').val());
	if(query.length  < 1){
		alert('Please enter the Search query');
		return;
	}
	$('.loader').show();
	$.each(query.split(" "), function(index, element){
		var text = element || "";
		text = $.trim(text).toLowerCase();
		if(text.indexOf('label:') > -1 ){
			var value = text.replace(/label\:/gi,'');
			for(var key in userLabel){
				if(key.toLowerCase().replace(/[^a-z0-9]/gi,'') == value.replace(/[^a-z0-9]/gi,'') && toBeRemovedLabels.indexOf(key) == -1){
					toBeRemovedLabels.push(key);
					toBeRemovedLabelIds.push(userLabel[key]);
					break;
				}
			}		
		}
	});
	var getPageOfMessages = function(request, result) {
		request.execute(function(resp) {
			result = resp.messages;
			var nextPageToken = resp.nextPageToken;
			callback(result);
			if (nextPageToken) {
				request = gapi.client.gmail.users.messages.list({
					'userId': userId,
					'pageToken': nextPageToken,
					'q': query
				});
				getPageOfMessages(request, result);
			} else {
				lastMessageId = result[result.length-1].id;
			}
		});
	};
	var initialRequest = gapi.client.gmail.users.messages.list({
		'userId': userId,
		'q': query
	});
	getPageOfMessages(initialRequest, []);
}
function loadAllMessages(result){
	$.each(result,function(index, message){
		var messageRequest = gapi.client.gmail.users.messages.get({
			'userId': 'me',
			'id': this.id
		});
		if(toBeRemovedLabelIds.length > 0){
			messageRequest.execute(function(message){
				removeLabel(message, message.payload);
			});
		} else {
			messageRequest.execute(function(message){
				appendMessageRow(message, message.payload);
			});
		}
		
	});
	if(null == result || result.length == 0){
		appendNoData();
	}
}
function removeLabel(message, payload) {
	var request = gapi.client.gmail.users.messages.modify({
		'userId': userId,
		'id': message.id,
		'removeLabelIds': toBeRemovedLabelIds
	});
	request.execute(function(message){
		appendMessageRow(message, payload);
	});
}
function appendNoData(){
	$('.table-inbox tbody').empty();
	var colLength = $('.table-inbox thead th').length;
	$('.table-inbox tbody').append(
			'<tr>\
			<td colspan="'+colLength+'" style="text-align:center;"> No Data Available</td>\
			</tr>'
	);
	$('.loader').hide();
}
function appendMessageRow(message, payload) {
	var  taggedLabels = [];
	$.each(message.labelIds, function(index, availableLabelId){
		//console.log(availableLabelId);
		//console.log(userLabel.getKeyByValue(availableLabelId));
		var labelName = userLabel.getKeyByValue(availableLabelId) || availableLabelId;
		//console.log(labelName);
		taggedLabels.push(labelName);
	})
	$('.table-inbox tbody').append(
			'<tr>\
			<td>'+getHeader(payload.headers, 'From')+'</td>\
			<td>'+getHeader(payload.headers, 'Subject') +'</td>\
			<td>'+taggedLabels.toString()+'</td>\
			<td>'+toBeRemovedLabels.toString()+'</td>\
			</tr>'
	);
	if(lastMessageId == message.id){
		$('.loader').hide();
		lastMessageId = null;
	}
}

function getHeader(headers, index) {
	var header = '';
	$.each(headers, function(){
		if(this.name.toLowerCase() === index.toLowerCase()){
			header = this.value;
		}
	});
	return header;
}
function getBody(message) {
	var encodedBody = '';
	if(typeof message.parts === 'undefined')
	{
		encodedBody = message.body.data;
	}
	else
	{
		encodedBody = getHTMLPart(message.parts);
	}
	encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
	return decodeURIComponent(escape(window.atob(encodedBody)));
}
function getHTMLPart(arr) {
	for(var x = 0; x <= arr.length; x++)
	{
		if(typeof arr[x].parts === 'undefined')
		{
			if(arr[x].mimeType === 'text/html')
			{
				return arr[x].body.data;
			}
		}
		else
		{
			return getHTMLPart(arr[x].parts);
		}
	}
	return '';
}
/**
 * Get Key By Value
 */
Object.defineProperty(Object.prototype, 'getKeyByValue',{
	value : function( value ) {
	    for( var prop in this ) {
	        if( this.hasOwnProperty( prop ) ) {
	             if( this[ prop ] === value )
	                 return prop;
	        }
	    }
	},
	enumerable : false
});