

// CLICK ON SEND BTN
$('#btn_send').click(function(event)
{
	send_message();
});


// CLICK ON CLOSE RANKING
$('#close_ranking').click(function(event)
{
	unselect_all_stat_div();
	$('#ranking').hide();
	$('#close_ranking').hide();
	$('#message_list').show();
	$('.body_inner').removeClass('white');
	scroll_bottom_message();
});


// CLICK ON STAT PSEUDO
$('#nb_pseudo').click(function(event)
{
	show_ranking('#nb_pseudo');
});


// CLICK ON STAT MESSAGE
$('#nb_message').click(function(event)
{
	show_ranking('#nb_message');
});


// CLICK ON STAT CHAR
$('#nb_char').click(function(event)
{
	show_ranking('#nb_char');
});


// CATCH KEYDOWN IN TEXTAREA
$('#input_message').keydown(function(event)
{
	if(isSend(event))
	{
		send_message();
	}
});


// CATCH KEYUP IN TEXTAREA
$('#input_message').keyup(function(event)
{
	if(isSend(event))
	{
		$('#input_message').val('');
	}
	adapt_textarea_height();
});


// CATCH SCROLL TO TOP
catching = false;
top_message = false;
scroll_before = 0;
$(window).scroll(function (event)
{
	var scroll = $(window).scrollTop();
	if (scroll < scroll_before)
	{
		if (scroll < 200 && !catching && !top_message && !is_stat_open())
		{
			catching = true;
			get_more_messages();
		}
	}
	scroll_before = scroll;
	
});

