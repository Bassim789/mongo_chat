

// CONNECT TO DATABASE COLLECTIONS
Message = new Mongo.Collection('message');
User = new Mongo.Collection('user');


// SET ID INPUT HTML
id_pseudo = '#input_pseudo';
id_textarea = '#input_message';

// SET TOTAL MESSAGE NUMBER INIT
first_load = true;


// ON CLIENT SIDE
if (Meteor.isClient)
{

	// GET DATABASE UPDATE
	Meteor.subscribe('message');
	Meteor.subscribe('user');


	// SET DEFAULT SESSION VAR
	Session.set('ranking_field', 'nb_message');
	Session.set('ranking_order', 'desc');


	// HELPERS
	Template.body.helpers
	({

		// GET MESSAGES
		messages: function()
		{
			setTimeout(function()
			{
				scroll_bottom_message();
			}, 50);
			return Message.find
			(
				{}, 
				{ 
					sort: [['timestamp_message', 'desc']], 
					limit: 30 + Session.get('new_messages_number')
				}
			).fetch().reverse(); 
		},


		// GET RANKING
		ranks: function()
		{
			// SORT BY VARIABLE FIELD AND ORDER
			return User.find
			(
				{}, { sort: [[Session.get('ranking_field'), Session.get('ranking_order')]] }
			)


			// ADD INDEX START FROM 1
			.map(function(rank_message, index)
			{
				return _.extend(rank_message, {index: index + 1});
			});
		},


		// GET NB USER
		nb_pseudo: function()
		{
			return User.find().count();
		},


		// GET NB MESSAGE
		nb_message: function()
		{
			var total = 0;
			User.find().map(function(doc)
			{
				total += doc.nb_message;
			});
			if (first_load && total > 0)
			{
				Session.set('new_messages_number', 0);
				total_messages_number_first = total;
				first_load = false;
			}
			else if (total > 0)
			{
				var new_messages_number = total - total_messages_number_first;
				Session.set('new_messages_number', new_messages_number);
			}
			return total;

		},


		// GET NB CHAR
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


	// FORMATE DATE
	Template.registerHelper('formatDate', function(date)
	{	
		var date = moment(date).format('YYYY-MM-DD HH:mm:ss');
		var date_two_lines = date.substring(0,10) + '\n' + date.substring(10,19);
		return htmlEntities_br(date_two_lines);
	});



	// FORMATE MESSAGE TEXTE
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
			unselect_all_stat_div();
			$('#ranking').hide();
			$('#close_ranking').hide();
			$('#message_list').show();
			$('.body_inner').removeClass('white');
			scroll_bottom_message();

		},


		// CLICK ON STAT PSEUDO
		'click #nb_pseudo': function()
		{
			updateRanking('#nb_pseudo', 'pseudo_user', 'asc');
		},


		// CLICK ON STAT MESSAGE
		'click #nb_message': function()
		{
			updateRanking('#nb_message', 'nb_message');
		},


		// CLICK ON STAT CHAR
		'click #nb_char': function()
		{
			updateRanking('#nb_char', 'nb_char');
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
			adapt_textarea_height();
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


		adapt_textarea_height();

	});


	// HTML ENTITIES
	function htmlEntities_br(str)
	{
		str = String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&quot;');
		var breakTag = '<br>';
		str = (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
		return str;
	}


	// UPDATE RANKING
	function updateRanking(stat_div, field, order)
	{
		order = order || 'desc';
		Session.set('ranking_field', field);
		Session.set('ranking_order', order);
		unselect_all_stat_div();
		$(stat_div).addClass('stat_div_select');
		$('#ranking').show();
		$('#close_ranking').show();
		$('#message_list').hide();
		$('.body_inner').addClass('white');
		$('body,html').animate({scrollTop: 0}, 500);
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
		adapt_textarea_height();
		document.cookie = 'pseudo=' + pseudo + '; expires=Sun, 01 Feb 2019 00:00:00 UTC; path=/';
		send_message_call(pseudo, text);
	}


	// SEND MESSAGE CALL
	function send_message_call(pseudo, text)
	{
		Meteor.call('mongo_send_message', pseudo, text);
	}

}



// SERVER SIDE
if (Meteor.isServer)
{

	// NEW MESSAGE UPDATE
	Meteor.publish('message', function()
	{
		return Message.find
		(
			{}, 
			{
				sort: [['timestamp_message','desc']],
				limit: 30 + Session.get('new_messages_number')
			}
		).fetch().reverse();
	});


	// NEW RANKING UPDATE
	Meteor.publish('user', function()
	{
		return User.find
		(
			{}, { sort: [['nb_message','desc']] }
		);
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

