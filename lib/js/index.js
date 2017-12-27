$(function () {
	load_prompts();
	
	$add_prompt_button.click(add_prompt);
	$add_prompt.keypress((e) => {if (e.which == 13) $add_prompt_button.click();});
	$add_message_button.click(add_message);
	$add_message.keypress((e) => {if (e.which == 13) $add_message_button.click();});

	$remove_prompt_modal.submit.click(remove_prompt);
	$remove_message_modal.submit.click(remove_message);
});

function load_prompts(prompt_id) {
	prompt_id = prompt_id || false;
	$prompts_list.empty();
	$.ajax({
		url: '/prompts/list',
		type: 'POST',
		success: function (resp) {
			if (resp.code != 200) {
				if (typeof resp.data != 'undefined') growl(resp.data, 'danger');
				return false;
			}
			console.log(resp);
			var i=0,len=resp.data.length;
			for (i; i < len; i++) {
				var row = resp.data[i];
				var $row = skel('prompt_row');
				$row.data('prompt', row);
				$row.attr('data-pid', row.id);
				$row.prompt.text(row.prompt);
				$row.badge.click(remove_prompt_modal);
				$row.badge.data('prompt', row);
				$row.click(load_messages);
				$prompts_list.append($row);
			}
			if (!prompt_id) return $prompts_list.find('.list-group-item:first').click();
			$prompts_list.find('[data-pid="' + prompt_id + '"]').click();
		}
	});
}

function load_messages() {
	$('.list-group-item').removeClass('active');
	$(this).addClass('active');
	var p = $(this).data('prompt');
	$add_message_button.data('prompt', p);
	$messages_list.empty();
	var i=0,len=p.messages.length;
	for (i; i<len; i++) {
		var message = p.messages[i];
		var $row = skel('message_row');
		$row.data('prompt', p);
		$row.data('message', message);
		$row.message.text(message.message);
		$row.remove.click(remove_message_modal);
		$row.remove.data('prompt', p);
		$row.remove.data('message', message);
		$messages_list.append($row);
	}
}

function add_prompt() {
	var text = $add_prompt.val();
	if (!text) return false;
	$.ajax({
		url: '/prompts/add',
		type: 'POST',
		data: { ptext: text },
		success: function (resp) {
			if (resp.code != 200) {
				if (typeof resp.data != 'undefined') growl(resp.data, 'danger');
				return false;
			}
			growl(resp.data, 'success');
			var cur_id = $prompts_list.find('.active').data('pid');
			load_prompts(cur_id);
			$add_message.val('');
		}
	});
}

function add_message() {
	var pid = $prompts_list.find('.active').data('pid');
	var text = $add_message.val();
	if (!text) return false;
	$.ajax({
		url: '/prompts/message/add',
		type: 'POST',
		data: { prompt_id: pid, message: text },
		success: function (resp) {
			if (resp.code != 200) {
				if (typeof resp.data != 'undefined') growl(resp.data, 'danger');
				return false;
			}
			growl(resp.data, 'success');
			load_prompts(pid);
			$add_message.val('');
		}
	});
}

function remove_message_modal() {
	var $this = $(this);
	var $modal = $remove_message_modal;
	$modal.data('prompt', $this.data('prompt'));
	$modal.data('message', $this.data('message'));
	$modal.modal('show');
}

function remove_message() {
	var $modal = $remove_message_modal;
	var message = $modal.data('message');
	$.ajax({
		url: '/prompts/message/remove',
		type: 'POST',
		data: { message_id: message.id },
		success: function (resp) {
			if (resp.code != 200) {
				if (typeof resp.data != 'undefined') growl(resp.data, 'danger');
				return false;
			}
			growl(resp.data, 'success');
			load_prompts(message.prompt_id);
			$modal.modal('hide');
		}
	});
}

function remove_prompt_modal() {
	var $this = $(this);
	var $modal = $remove_prompt_modal;
	$modal.data('prompt', $this.data('prompt'));
	$modal.label.text('Remove Prompt: ' + $this.data('prompt').prompt);
	$modal.modal('show');
}

function remove_prompt() {
	var $modal = $remove_prompt_modal;
	var p = $modal.data('prompt');
	$.ajax({
		url: '/prompts/remove',
		type: 'POST',
		data: { prompt_id: p.id },
		success: function (resp) {
			if (resp.code != 200) {
				if (typeof resp.data != 'undefined') growl(resp.data, 'danger');
				return false;
			}
			growl(resp.data, 'danger');
			load_prompts();
			$modal.modal('hide');
		}
	});
}
