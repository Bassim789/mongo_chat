

// CONNECT TO DATABASE
Message = new Mongo.Collection('message');
User = new Mongo.Collection('user');

// SET ID
id_pseudo = "#input_pseudo";
id_textarea = "#input_message";


stat_column = 'nb_char';
ranking_field = "nb_message";
ranking_order = "desc";

// ON CLIENT SIDE
if (Meteor.isClient)
{

	// GET DATABASE UPDATE
	Meteor.subscribe("message");
	Meteor.subscribe("user");


	// HELPERS
	Template.body.helpers
	({

		// GET MESSAGES FROM MONGO
		messages: function()
		{
			return Message.find({}, {sort: [["timestamp_message", "desc"]]});
		},

		ranks: function() {
			return User.find({}, {sort: [[Session.get("ranking_field"), Session.get("ranking_order")]]}).map(function(rank_message, index) {
			  return _.extend(rank_message, {index: index + 1});
			});
		},

		// GET STAT FROM MONGO
		nb_pseudo: function()
		{
			return User.find().count();
		},

		// GET STAT FROM MONGO
		nb_message: function()
		{

			var total = 0;
			User.find().map(function(doc)
			{
				total += doc.nb_message;
			});
			return total;

		},

		// GET STAT FROM MONGO
		nb_char: function()
		{
			var total = 0;
			User.find().map(function(doc)
			{
				total += doc.nb_char;
			});
			return total;
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


		// CLICK ON CLOSE RANKING
		'click #close_ranking': function()
		{
			hide_all_stat();
			$('#close_ranking').hide();

		},


		// CLICK ON STAT PSEUDO
		'click #nb_pseudo': function()
		{
			updateRanking("pseudo_user", "asc");
		},


		// CLICK ON STAT MESSAGE
		'click #nb_message': function()
		{
			updateRanking("nb_message");
		},


		// CLICK ON STAT CHAR
		'click #nb_char': function()
		{
			updateRanking("nb_char");
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

	function updateRanking(field, order) {
		order = order || "desc";
		Session.set("ranking_field", field);
		Session.set("ranking_order", order);
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



	function hide_all_stat()
	{
		var stats = ['#ranking_pseudo', '#ranking_message', '#ranking_char'];
		stats.forEach(function(stat) {
			$(stat).hide();
		});
	}







}



// SERVER SIDE
if (Meteor.isServer)
{
	Meteor.startup(function ()
	{

	});


	// NEW MESSAGE UPDATE
	Meteor.publish("message", function()
	{
		return Message.find({}, {sort: [["timestamp_message","desc"]]});
	});


	// NEW RANKING UPDATE
	Meteor.publish("user", function()
	{
		return User.find({}, {sort: [[stat_column,"desc"]]});
	});

}


// METHODE
Meteor.methods
({

	// INSERT NEW MESSAGE
	mongo_send_message: function(pseudo, text)
	{

		// INSERT MESSAGE
		Message.insert
		({
			pseudo_message: pseudo,
			timestamp_message: new Date(),
			text_message: text
		});


		// UPDATE USER
		User.update
		(
			{pseudo_user: pseudo},
			{
				$inc:
				{
					nb_message: +1,
					nb_char: +text.length
				}
			}, {upsert: true}
		)

	}


});


