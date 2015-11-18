

// CONNECT TO DATABASE COLLECTIONS
Message = new Mongo.Collection('message');
User = new Mongo.Collection('user');


// SET GLOBAL VARIABLES
first_load = true;
more_messages = false;
new_messages_number_before = 0;


// ON CLIENT SIDE
if (Meteor.isClient)
{

	// GET DATABASE UPDATE
	Meteor.subscribe('message');
	Meteor.subscribe('user');


	// SET DEFAULT SESSION VAR
	Session.set('ranking_field', 'nb_message');
	Session.set('ranking_order', 'desc');
	Session.set('new_messages_number', 0);
	Session.set('messages_limit', 30);


	// HELPERS
	Template.body.helpers
	({

		// GET MESSAGES
		messages: function()
		{	

			scroll_or_fixe();

			return Message.find
			(
				{}, 
				{ 
					sort: [['timestamp_message', 'desc']], 
					limit: Session.get('messages_limit') + Session.get('new_messages_number')
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


		// GET STAT
		stat: function()
		{
			var stat = [];
			stat['nb_pseudo'] = 0;
			stat['nb_message'] = 0;
			stat['nb_char'] = 0;

			User.find().map(function(doc)
			{
				stat['nb_pseudo'] += 1;
				stat['nb_message'] += doc.nb_message;
				stat['nb_char'] += doc.nb_char;
			});

			set_new_messages_number(stat['nb_message']);

			return stat;
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
				limit: Session.get('messages_limit') + Session.get('new_messages_number')
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

