$(function () {
	$.each($('[id]'), (i,v) => {
		var name = '$' + $(v).attr('id');
		window[name] = $(v);
		$.each($(v).find('[data-id]'), (i2, v2) => {
			var subname = $(v2).attr('data-id');
			window[name][subname] = $(v2);
		});
	});
});

function growl(message, type) {
	$.bootstrapGrowl(message, {
		type: type,
		offset: { from: 'top', amount: 20 },
		align: 'right'
	});
}

function skel(name) {
	var $skel = $('#skeleton_' + name).clone();
	if (!$skel.length) return false;
	console.log($skel);
	$skel.removeAttr('id');
	$.each($skel.find('[data-id]'), (i,v) => {
		var name = $(v).attr('data-id');
		$skel[name] = $(v);
	});
	return $skel;
}
