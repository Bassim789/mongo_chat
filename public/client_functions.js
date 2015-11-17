

// GET COOKIE
function getCookie(cname)
{
	var name = cname + '=';
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
	return '';
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


// UNSELECT ALL STAT DIV
function unselect_all_stat_div()
{
	var stats_div = ['#nb_pseudo', '#nb_message', '#nb_char'];
	stats_div.forEach(function(stat_div)
	{
		$(stat_div).removeClass('stat_div_select');
	});
}


// IS STAT OPEN
function is_stat_open()
{
	var is = false;
	$('.stat_div_select').each(function()
	{
		is = true;
	});
	return is;
}


// SCROLL TO BOTTOM
function scroll_bottom_message()
{
	if (!is_stat_open())
	{
		var div = $('body,html');
		var height = div[0].scrollHeight;
		div.animate({scrollTop: height}, 500);
	}
}


// ADAPT TEXTAREA HEIGHT
function adapt_textarea_height()
{
	var rows = $(id_textarea).val().split('\n');
	var len = 30;
	if (on_desktop())
	{
		len = 80;
	}
	var compteur = 0;
	for (var i = rows.length - 1; i >= 0; i--)
	{
		if (rows[i].length > len)
		{
			compteur += Math.round((rows[i].length)/len);
		}
		compteur += 1;
	};
	$(id_textarea).prop('rows', compteur);
}





