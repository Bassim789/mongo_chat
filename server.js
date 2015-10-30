

// CONNECT TO DATABASE
Messages = new Mongo.Collection('messages');


// SET ID
id_pseudo = "#input_pseudo";
id_textarea = "#input_message";


// ON CLIENT SIDE
if (Meteor.isClient)
{

	// GET DATABASE UPDATE
	Meteor.subscribe("messages");


	// HELPERS
	Template.body.helpers
	({

		// GET MESSAGES FROM MONGO
		messages: function()
		{
			return Messages.find({}, {sort: [["timestamp_message","desc"]]});
		}
	
	});

	Template.registerHelper('formatDate', function(date)
	{
		return moment(date).format('YYYY-MM-DD hh:mm:ss');
	});

	Template.registerHelper('formatText', function(str)
	{

		return htmlEntities_br(str);
		
	});


	// EVENT
	Template.body.events
	({

		// CATCH CLICK ON SEND BTN
	    'click #btn_send': function()
	    {
	    	send_message();
	    },

	    // CATCH KEYDOWN IN TEXTAREA
		'keydown #input_message': function(event)
		{
			if(isSend(event))
			{
				send_message();
			}
		},


		// CATCH KEYUP IN TEXTAREA
		'keyup #input_message': function(event)
		{
			if(isSend(event))
			{
				$(id_textarea).val('');
			}
			adapt_textarea_height(id_textarea);
		}

	});



}



// SERVER SIDE
if (Meteor.isServer)
{
	Meteor.startup(function ()
	{

	});


	// NEW MESSAGE UPDATE
	Meteor.publish("messages", function()
	{
		return Messages.find({}, {sort: [["timestamp_message","desc"]]});
	});
}


// METHODE
Meteor.methods
({

	// INSERT NEW MESSAGE
	mongo_send_message: function(pseudo, text)
	{
		Messages.insert
		({
			pseudo_message: pseudo,
			timestamp_message: new Date(),
			text_message: text
		});
	}

});


