


// ON START
$( window ).load(function()
{
	if (on_desktop())
	{
		$('#input_message').focus();
	}

	// SET PSEUDO COOKIE
	$('#input_pseudo').val(getCookie('pseudo'));


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
function show_ranking(stat_div)
{
	if (stat_div == '#nb_pseudo')
	{
		var order = 'asc';
		var field = 'pseudo_user';
	}
	else
	{
		var order = 'desc';
		var field = stat_div.substr(1);
	}
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
	var pseudo = $('#input_pseudo').val();
	var text = $('#input_message').val();
	$('#input_message').val('');
	if (on_desktop())
	{
		$('#input_message').focus();
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

// GET MORE MESSAGES
function get_more_messages()
{
	more_messages = true;
	Session.set('messages_limit', Session.get('messages_limit') + 30);
}


function set_new_messages_number(nb_message)
{
	if (first_load && nb_message > 0)
	{
		total_messages_number_first = nb_message;
		first_load = false;
	}

	else if (nb_message > 0 && typeof total_messages_number_first != 'undefined')
	{
		Session.set('new_messages_number', nb_message - total_messages_number_first);
	}

	else if (nb_message > 0 && typeof total_messages_number_first == 'undefined')
	{
		total_messages_number_first = nb_message;
		first_load = false;
	}
}


function scroll_or_fixe()
{
	if (Session.get('new_messages_number') == new_messages_number_before && more_messages)
	{
		var old_height = $(document).height();
		var old_scroll = $(window).scrollTop();
		setTimeout(function()
		{	
			var scroll_to = old_scroll + $(document).height() - old_height;
			$(document).scrollTop(scroll_to);
			more_messages = false;
			catching = false;

			if (total_messages_number_first < Session.get('messages_limit'))
			{
				top_message = true;
			}
		}, 5);
	}

	else if (Session.get('new_messages_number') != new_messages_number_before)
	{
		setTimeout(function()
		{	
			new_messages_number_before = Session.get('new_messages_number');
			scroll_bottom_message();
		}, 50);
	}
	else if (first_load)
	{
		setTimeout(function()
		{	
			scroll_bottom_message();
		}, 50);
		
	}
}



