

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
		return moment(date).format('YYYY-MM-DD HH:mm:ss');
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



		// ON START
	$( window ).load(function()
	{
		if (on_desktop())
		{
			$(id_textarea).focus();
		}

		// SET PSEUDO COOKIE
		$(id_pseudo).val(getCookie('pseudo'));

	});


	// GET COOKIE
	function getCookie(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i < ca.length; i++)
		{
			var c = ca[i];
			while (c.charAt(0)==' ')
			{
				c = c.substring(1);
			} 
			if (c.indexOf(name) == 0)
			{
				return c.substring(name.length,c.length);
			}
		}
		return "";
	}


	// HTML ENTITIES
	function htmlEntities_br(str)
	{
		str = String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		var breakTag = '<br>';
		str = (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
		return str;
	}


	// CHECK IF MESSAGE IS SEND ON PRESS ENTER
	function isSend(event)
	{
		var is = false;
		// CATCH ENTER WITHOUT SHIFT ON DESKTOP
		if(event.keyCode == 13 && !event.shiftKey && on_desktop())
		{
			is = true;
		}
		return is;
	}


	// CHECK IF DESKTOP OR MOBILE
	function on_desktop()
	{
		return $(window).width() > 800;
	}


	// ADAPT TEXTAREA HEIGHT
	function adapt_textarea_height(id)
	{
		var rows = $(id).val().split("\n");
		var len = 30;
		if (on_desktop()){
			len = 80;
		}
		var compteur = 1;
		for (var i = rows.length - 1; i >= 0; i--)
		{
			if (rows[i].length > len)
			{
				compteur += Math.round((rows[i].length)/len);
			}
			compteur += 1;
		};
		$(id).prop("rows", compteur);
	}


	// SEND MESSAGE
	function send_message()
	{
		var pseudo = $(id_pseudo).val();
		var text = $(id_textarea).val();
		$(id_textarea).val('');
		if (on_desktop())
		{
			$(id_textarea).focus();
		}
		adapt_textarea_height(id_textarea);
		Meteor.call("mongo_send_message", pseudo, text);
		document.cookie = 'pseudo=' + pseudo + '; expires=Sun, 01 Feb 2019 00:00:00 UTC; path=/';
	}




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


