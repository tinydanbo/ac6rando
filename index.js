let parts_data = {};
let total_weight = 0;
let load_limit = 0;
let total_en_load = 0;
let en_limit = 0;
let total_price = 0;

let price_limit = 1000000;

let should_randomize_weapons = false;
let use_price_limit = false;

function generateRandomBuild() {
	let new_build = {
		head: _.sample(parts_data.heads),
		core: _.sample(parts_data.cores),
		arms: _.sample(parts_data.arms),
		legs: _.sample(parts_data.legs),
		fcs: _.sample(parts_data.fcs),
		generator: _.sample(parts_data.generators),
		expansion: _.sample(parts_data.expansions),
	};
	if (! new_build.legs.is_tank) {
		new_build.booster = _.sample(parts_data.boosters);
	}
	if (should_randomize_weapons) {

	}
	return new_build
}

function isBuildValid(build) {
	let weight = 0;
	weight += build.head.weight;
	weight += build.core.weight;
	weight += build.arms.weight;
	if (build.booster) {
		weight += build.booster.weight;
	}
	weight += build.fcs.weight;
	weight += build.generator.weight;
	if (weight > build.legs.load_limit) {
		return false;
	}
	let total_en = 0;
	total_en += build.head.en_load;
	total_en += build.core.en_load;
	total_en += build.arms.en_load;
	total_en += build.legs.en_load;
	if (build.booster) {
		total_en += build.booster.en_load;
	}
	total_en += build.fcs.en_load;
	let adjusted_en_output = build.generator.en_output * (build.core.output_adj / 100);
	if (total_en > adjusted_en_output) {
		return false;
	}
	let price = 0;
	Object.values(build).forEach(function(part) {
		price += part.price;
	});
	total_price = price;
	if (use_price_limit && total_price > price_limit) {
		return false;
	}
	total_weight = weight;
	load_limit = build.legs.load_limit;
	total_en_load = total_en;
	en_limit = adjusted_en_output; 
	return true;
}

function ready(fn) {
	if (document.readyState !== 'loading') {
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

ready(function() {
	fetch("./data.json").then(function(response) {
		response.json().then(function(data) {
			parts_data = data;
		});
	});

	document.querySelector("#toggle-price-option").addEventListener("click", function() {
		const price_slider = document.querySelector("#price-option");
		use_price_limit = document.querySelector("#toggle-price-option").checked;
		price_slider.disabled = !use_price_limit;
		document.querySelector("#price-value").innerHTML = parseInt(document.querySelector("#price-option").value).toLocaleString("en-US");
		if (use_price_limit) {
			document.querySelector("#price-value").style.display = "inline";
		} else {
			document.querySelector("#price-value").style.display = "none";
		}
	});

	document.querySelector("#price-option").addEventListener("input", function() {
		price_limit = document.querySelector("#price-option").value;
		document.querySelector("#price-value").innerHTML = parseInt(document.querySelector("#price-option").value).toLocaleString("en-US");
	});

	const btn = document.querySelector("#reroll");

	btn.addEventListener("click", function() {
		let build = generateRandomBuild();
		while (!isBuildValid(build)) {
			build = generateRandomBuild();
		}
		document.querySelector("#head-name").innerHTML = build.head.name;
		document.querySelector("#core-name").innerHTML = build.core.name;
		document.querySelector("#arms-name").innerHTML = build.arms.name;
		document.querySelector("#legs-name").innerHTML = build.legs.name;
		if (build.booster) {
			document.querySelector("#booster-name").innerHTML = build.booster.name;
		} else {
			document.querySelector("#booster-name").innerHTML = "(N/A)";
		}
		document.querySelector("#fcs-name").innerHTML = build.fcs.name;
		document.querySelector("#generator-name").innerHTML = build.generator.name;
		document.querySelector("#expansion-name").innerHTML = build.expansion.name;
		let weight_pct = (total_weight / load_limit) * 100;
		weight_pct = Math.round(weight_pct * 100) / 100;
		let energy_pct = (total_en_load / en_limit) * 100;
		energy_pct = Math.round(energy_pct * 100) / 100;
		document.querySelector("#weight-info").innerHTML = total_weight + " / " + load_limit + " (" + weight_pct + "%)"
		document.querySelector("#energy-info").innerHTML = total_en_load + " / " + Math.round(en_limit) + " (" + energy_pct + "%)"
		document.querySelector("#price-info").innerHTML = total_price.toLocaleString("en-US");
	});
});