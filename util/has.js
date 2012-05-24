define([
	'dojo/has'
], function(has){

	var d = document;
	var el = document.createElement('bv');
	var test_style = el.style;
	var cap = function(word){
		return word.charAt(0).toUpperCase() + word.substr(1);
	}
	var testcss = function(prop){
		var uc = cap(prop);
		var props = [
			prop,
			'Webkit' + uc,
			'Moz' + uc,
			'O' + uc,
			'ms' + uc,
			'Khtml' + uc
		];
		for(var nm in props){
			if(test_style[props[nm]] !== undefined) return props[nm];
		}
		return false;
	}


	has.add('transform', function(){

		return testcss('transform');

	});

	return has;

});
