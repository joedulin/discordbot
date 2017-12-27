$(function () {
	$('#submit').click(auth);
});



function auth() {
	var username = $('#username').val();
	var password = $('#password').val();

	$.ajax({
		url: '/auth',
		type: 'POST',
		data: {
			username: username,
			password: password
		},
		success: function (resp) {
			if (resp.code != 200) {
				return growl('No good', 'danger');
			}
			location.href = '/';
		}
	});
}
