$(document).ready(function() {
    $('.matches-list').on("click", ".match_winner_btn", update_match);
    $('#container').on("click", "#new_match_btn", match_form_show)
        .on('click', '#match_cancel_btn', match_form_hide)
        .on('submit', '#match-dialog-form', send_match_form)
        .on('keyup', 'input#match_search', search_match)
        .on('click', '.remove_match_player', remove_match_player)
        .on('click', '.add_match_player', add_player_click_listener)
        .on('click', '#add_new_player_button', match_player_form_show)
        .on('click', '#edit_match_name_button', edit_match_name_popup_show)
        .on('submit', '#edit_match_name_form', send_edit_match_name_form);
    $('body').on('click', '.player_picker_entry', player_picker_entry_click_listener)
        .on('keyup', '#match_player_picker_search', player_picker_search);
});

function update_match(event) {
    event.preventDefault();
    var el = $(event.currentTarget);
    var this_button = $(this);
    $.ajax({
        type: "POST",
        data: { 'match-id': el.data('match-id'), 'player-id': el.data('player-id'), 'round-id': el.data('round-id')},
        url: '/matches/' + el.data('match-id') + '/verdict',
        dataType: "JSON",
        success: (function(data) {
            var li = this_button.closest('li');
            li.append('<img alt="' + data.winner_name + '" class="gravatar" src="' + li.find('button').find('img').attr('src') +
                '">' + data.winner_name);
            li.addClass('match-winner');
            var temp;

            if(el.data('player-number') == 1) {
                temp = li.next();
                temp.append('<img alt="' + data.loser_name + '" class="gravatar" src="' + temp.find('button').find('img').attr('src') +
                    '">' + data.loser_name);
                temp.addClass('match-loser');
            }
            else {
                temp = li.prev();
                temp.append('<img alt="' + data.loser_name + '" class="gravatar" src="' + temp.find('button').find('img').attr('src') +
                    '">' + data.loser_name);
                temp.addClass('match-loser');
            }
            $('#match-' + el.data('match-id')).find('button').remove();
            $('#match-winner').html('Winner: <a href="/players/' + data.player.id + '">' + data.winner_name + '</a>');

        })
    });
}

function match_form_show(event) {
    event.preventDefault();
    event.stopPropagation();

    $('#new_match_btn').fadeToggle("fast", function() {
        $('.create_form').fadeToggle("fast");
        $('input#match_name').focus();
    })

}

function send_match_form(event){
    event.preventDefault();
    event.stopPropagation();
    $.ajax({
        type: "POST",
        url: 'matches/add_new_match',
        data: { name: $('input#match_name').val() },
        dataType: "JSON",
        success: function(data) {
            $.pjax({url: '/matches?page=1', container: '#container'});
//            $("#match-dialog-form").dialog('close');
            $('table tbody tr').first().effect('highlight', {color: 'green', duration: 6000});
        },
        error: function(xhr, textStatus, errorThrown){
            var errors = "ERRORS -> \n";
            $.each(xhr.responseJSON, function(key, value) {
                errors += key.toString().toLocaleUpperCase() + " " + value + "\n";
            });
            $('#new_match_btn').click();
        }
    });
}

function search_match(event) {
    event.preventDefault();
    event.stopPropagation();
    $.ajax({
        type: "GET",
        url: 'matches/search_matches',
        dataType: "JSON",
        data: { search_term: $('input#match_search').val() },
        beforeSend: function() {
            $('#ajax_spinner').show();
        },
        success: function(data) {
            var el= $('#matches_table');
            el.html("");
            var temp;
            for(var i = 0; i < data.search_result.length; i++){
                temp = data.search_result[i];
                el.append("<tr>" +
                    "<td><a href='/matches/" + temp.id + "'>" + temp.name + "</a></td>" +
                    "<td>" + (temp.player1_id == 0 ? "" : "<a href='/matches/" + temp.id + "/players/" + temp.player1_id +
                    "'>" + temp.player1_name + "</a>") + "</td>" +
                    "<td>" + (temp.player2_id == 0 ? "" : "<a href='/matches/" + temp.id + "/players/" + temp.player2_id +
                    "'>" + temp.player2_name + "</a>") + "</td>" +
                    "<td>" + (temp.winner_id == 0 ? "" : "<a href='/matches/" + temp.id + "/players/" + temp.winner_id +
                    "'>" + temp.winner_name + "</a>") + "</td>" +
                    "</tr>");
            }
        },
        complete: function(){
            $('#ajax_spinner').hide();
        }
    })
}

function remove_match_player(event) {
    event.preventDefault();
    event.stopPropagation();
    var el = $(event.currentTarget);
    var player_id = el.data('player-id');
    var player_row = el.data('player-number');
    var match_id = el.data('match-id');
    var button = $(this);
    $.ajax({
        type: "POST",
        url: '/matches/' + el.data('match-id') + '/remove_match_player',
        dataType: "JSON",
        data: {
            match_id: match_id,
            player_id: player_id
        },
        success: function(data) {
            if(player_row == 1){
                $('table:first tbody').find(button).closest('tr').html("<td></td><td></td><td></td><td></td>" + 
                    "<td><button class='matches_btn add_match_player' " +
                    "data-player-number='1' data-match-id='" + match_id + "'>Add Existing Player</button></td>");
            }
            else {
                $('table:first tbody').find(button).closest('tr').html("<td></td><td></td><td></td><td></td>" + 
                    "<td><button class='matches_btn add_match_player' " +
                    "data-player-number='2' data-match-id='" + match_id + "'>Add Existing Player</button></td>");
            }
            if(!$('#add_new_player_button').is(":visible"))
                $('#add_new_player_button').show();

            $('#start_match_button a').attr('href', '#');
        }
    });
}

function add_player_click_listener(event){
    event.preventDefault();
    event.stopPropagation();
    var el = $(event.currentTarget);
    var match_id = el.data('match-id');
    $.ajax({
        type: "GET",
        url: '/matches/' + el.data('match-id') + '/non_match_players',
        beforeSend: function() {
            $('#ajax_spinner').show();
        },
        success:function(data){
            var players_div = $('#match_player_picker_body');
            for(var i = 0; i < data.players.length; i++){
                var temp = data.players[i];
                players_div.append('<tr class="player_picker_entry" data-player-id="' + temp.id + '" data-match-id="' + match_id + '"><td>' + temp.full_name + '</td><td>' + temp.skill + '</td></tr>');
            }
        },
        complete: function() {
            $('#ajax_spinner').hide();
        }
    });
    var form = $("#match_player_picker_wrapper").dialog({
        title: 'Add Existing Players',
        autoOpen: false,
        modal: true,
        width: 400,
        height: 400,
        draggable: false,
        buttons: {
            "Add Player": function() {
                if($('#match_player_picker tr').hasClass('highlightEntry')){
                    send_match_player_picker_form(event);
                    $(this).dialog('close');
                }
                else{
                    alert('No Player selected');
                }
            },
            Cancel: function() {
                $(this).dialog('close');
            }
        },

        close: function() {
            form.dialog('destroy');
            $('#match_player_picker .highlightEntry').removeClass('highlightEntry');
            $('#match_player_picker_body').empty();
            $('#match_player_picker_search').val("");
        }
    });
    form.dialog('open').dialog("widget").find(".ui-dialog-titlebar-close").hide();
    $('.ui-dialog-buttonset').append('<input type="text" id="match_player_picker_search" data-match-id="' + el.data('match-id')  + '" placeholder="Search for player..." class="search" autofocus="true">')
}

function player_picker_entry_click_listener(event){
    event.preventDefault();
    event.stopPropagation();
    var hasClass = $(this).hasClass('highlightEntry');
    $('#match_player_picker .highlightEntry').removeClass('highlightEntry');
    if(!hasClass)
        $(this).addClass('highlightEntry');
}

function send_match_player_picker_form(event){
    event.preventDefault();
    event.stopPropagation();
    var el = $('#match_player_picker .highlightEntry');
    var match_id = el.data('match-id');
    var player_id = el.data('player-id');
    $.ajax({
        type: "POST",
        data: {
            match_id: match_id,
            player_id: player_id
        },
        url: '/matches/' + el.data('match-id') + '/add_player_from_player_picker',
        dataType: "JSON",
        success: function(data){
            if(data.row == 1){
                $('table:first tbody tr:first').html("<td><a href='/matches/" + match_id +
                    "/players/" + player_id + "'>" + data.player.full_name + "</a></td><td>" + data.player.email + "</td>" +
                    "<td>" + data.player.skill + "</td><td>" + data.player.matches_won + "</td>" +
                    "<td>" + "<button class='matches_btn matches_remove_btn remove_match_player' data-player-number='1' data-match-id='" + match_id + "' " +
                    "data-player-id='" + player_id + "'>Remove Player</button>" + "</td>");
            }
            else{
                $('table:first tbody tr:last').html("<td><a href='/matches/" + match_id +
                    "/players/" + player_id + "'>" + data.player.full_name + "</a></td><td>" + data.player.email + "</td>" +
                    "<td>" + data.player.skill + "</td><td>" + data.player.matches_won + "</td>" +
                    "<td>" + "<button class='matches_btn matches_remove_btn remove_match_player' data-player-number='2' data-match-id='" + match_id + "' " +
                    "data-player-id='" + player_id + "'>Remove Player</button>" + "</td>");
            }
            if(data.player_count == 2){
                $('#add_new_player_button').hide();
                $('#start_match_button a').attr('href', '/matches/' + data.match.id + '/start_match');
            }
        }
    });
}

function player_picker_search(event){
    event.preventDefault();
    event.stopPropagation();
    var match_id = $(this).data('match-id');
    var search = $('#match_player_picker_search').val();

    $.ajax({
        type: "GET",
        data: {
            match_id: match_id,
            search: search
        },
        url: '/matches/' + match_id + '/player_picker_search',
        dataType: "JSON",
        beforeSend: function(){
            $('#ajax_spinner').show();
        },
        success: function(data){
            $('#match_player_picker_body').html("");
            for(var i = 0; i < data.search_result.length; i++){
                temp = data.search_result[i];
                $('#match_player_picker_body').append('<tr class="player_picker_entry" ' +
                    'data-player-id="' + temp.id + '" data-match-id="' + match_id + '">' +
                    '<td>' + temp.full_name + '</td><td>' + temp.skill + '</td>' +
                    '</tr>');
            }
        },
        complete: function(){
            $('#ajax_spinner').hide();
        }
    });
}

function send_match_player_form(event){
    event.preventDefault();
    event.stopPropagation();

    $.ajax({
        type: "POST",
        url: '/players/add_new_player',
        data: {
            first_name: $('input#player_first_name').val(),
            last_name: $('input#player_last_name').val(),
            email: $('input#player_email').val(),
            skill: $('select#player_skill').val(),
            match_id: $('#add_new_player_button').data('match-id')
        },
        dataType: "JSON",
        success: function(data){
            $("#player-dialog-form").dialog('close');
            var new_html = '<td><a href="/matches/' + data.match.id + '/players/' + data.player.id  + '">' + data.player.full_name + '</a></td>' +
                '<td>' + data.player.email  + '</td><td>' + data.player.skill + '</td>' +
                '<td>'+ data.player.matches_won + '</td><td>' + '<button class="matches_btn matches_remove_btn remove_match_player" data-player-number="' + data.row +
                '" data-match-id="' + data.match.id + '" data-player-id="' + data.player.id + '">Remove Player</button>' + '</td>';


            if(data.row == 1){
                $('table:first tbody tr:first').html(new_html);
            }
            else{
                $('table:first tbody tr:last').html(new_html);
            }
            if(data.player_count == 2){
                $("#add_new_player_button").hide();
                $('#start_match_button a').attr('href', '/matches/' + data.match.id + '/start_match');
            }

        },
        error: function(xhr, textStatus, errorThrown){
            var errors = "ERRORS -> \n";
            $.each(xhr.responseJSON, function(key, value) {
                errors += key.toString().toLocaleUpperCase() + " " + value + "\n";
            });
            alert(errors);
            $('#add_new_player_button').click();
        }
    });
}

function match_player_form_show(event){
    event.preventDefault();
    event.stopPropagation();
    var form = $("#player-dialog-form").dialog({
        autoOpen: false,
        modal: true,
        width: 400,
        height: 400,
        width: 350,
        buttons: {
            "Create Player": function() {
                send_match_player_form(event);
            },
            Cancel: function() {
                $(this).dialog('close');
            }
        },
        close: function() {
            $('#player-dialog-form').find('input[type=text], input[type=email]').val("");
            form.dialog('destroy');
        }
    });
    form.dialog('open').dialog("widget").find(".ui-dialog-titlebar-close").hide();
}

function edit_match_name_popup_show(event){
    event.preventDefault();
    event.stopPropagation();

    var form = $("#edit_match_name_form").dialog({
        autoOpen: false,
        modal: true,
        height: 400,
        width: 350,
        title: "Edit Match Name",
        buttons: {
            "Update Match Name": function() {
                send_edit_match_name_form(event);
                $(this).remove();
            },
            Cancel: function() {
                $(this).dialog('close');
            }
        },
        close: function() {
            form.dialog('close');
        }
    });
    form.dialog('open').dialog("widget").find(".ui-dialog-titlebar-close").hide();   // hide the close button
}

function send_edit_match_name_form(event){
    event.preventDefault();
    var value = $('#match_name').val();
    var match_id = $('#edit_match_name_button').data('match-id');

    $.ajax({
        type: "PUT",
        data: {
            name: value,
            match_id: match_id
        },
        url: '/matches/' + match_id,
        dataType: "JSON",
        success: function(){
            $.pjax({url: '/matches/' + match_id, container: '#container'});
        },
        error: function(xhr, textStatus, errorThrown){
            var errors = "ERRORS -> \n";
            $.each(xhr.responseJSON, function(key, value) {
                errors += key.toString().toLocaleUpperCase() + " " + value + "\n";
            });
            alert(errors);
            $('#edit_match_name_button').click();
        }
    });
}

function match_form_hide(event){
    event.preventDefault();
    event.stopPropagation();
    $('.create_form').fadeToggle("fast", function() {
        $("input[type=text]").val("");
        $('#new_match_btn').fadeToggle("fast");
    });
}
