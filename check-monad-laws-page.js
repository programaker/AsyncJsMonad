//Page modules can be auto-exec, or else no one will execute them
(function CheckMonadLawsPage() {
	var async = Async(); //<= 1st way to get an Async instance: direct constructor function call
	var number = 456;
	function plusOne(n){ return async.unit(n + 1) }
	function toString(n){ return async.unit('' + n) }


	//1. Left Identity: unit(a).flatMap(f) === f(a)
	(function leftIdentity(async, a, f) {
		var l = async.unit(a).flatMap(f);
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
	}(async, number, plusOne));

	
	//2. Right Identity: m.flatMap(unit) === m
	(function rightIdentity(async, a) {
		var m = async.unit(a);
		var l = m.flatMap(async.unit);
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
	}(async, number));
	

	//3. Associativity: m.flatMap(f).flatMap(g) === m.flatMap(function(x){ return f(x).flatMap(g) })
	(function associativity(async, a, f, g) {
		var m = async.unit(a);
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
	}(async, number, plusOne, toString));
}());
