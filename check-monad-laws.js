(function defMonadLaws($, Async) {
	'use strict';

	var number = 456;
	function plusOne(n){ return Async.unit(n + 1) }
	function toString(n){ return Async.unit('' + n) }


	//1. Left Identity: unit(a).flatMap(f) === f(a)
	(function leftIdentity(a, f) {
		var l = Async.unit(a).flatMap(f);
		var r = f(a);

		var message;
		if (l.value === r.value) {
			message = '>>> Left Identity law OK';
			console.log(message);
		} else {
			message = '>>> Left Identity law FAILED';
			console.error(message, [l, r]);
		}

		$('#first-law').text(message);
	}(number, plusOne));

	
	//2. Right Identity: m.flatMap(unit) === m
	(function rightIdentity(a) {
		var m = Async.unit(a);
		var l = m.flatMap(Async.unit);
		var r = m;

		var message;
		if (l.value === r.value) {
			message = '>>> Right Identity law OK';
			console.log(message);
		} else {
			message = '>>> Right Identity law FAILED';
			console.error(message, [l, r]);
		}

		$('#second-law').text(message);
	}(number));
	

	//3. Associativity: m.flatMap(f).flatMap(g) === m.flatMap(function(x){ return f(x).flatMap(g) })
	(function associativity(a, f, g) {
		var m = Async.unit(a);
		var l = m.flatMap(f).flatMap(g);
		var r = m.flatMap(function(x){ return f(x).flatMap(g) });

		var message;
		if (l.value === r.value) {
			message = '>>> Associativity law OK';
			console.log(message);
		} else {
			message = '>>> Associativity law FAILED';
			console.error(message, [l, r]);
		}

		$('#third-law').text(message);
	}(number, plusOne, toString));

}(window.jQuery, window.Async));
