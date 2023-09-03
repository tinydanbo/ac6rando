let parts_data = {};
let total_weight = 0;
let load_limit = 0;
let total_en_load = 0;
let en_limit = 0;

function generateRandomBuild() {
	return {
		head: _.sample(parts_data.heads),
		core: _.sample(parts_data.cores),
		arms: _.sample(parts_data.arms),
		legs: _.sample(parts_data.legs),
		booster: _.sample(parts_data.boosters),
		fcs: _.sample(parts_data.fcs),
		generator: _.sample(parts_data.generators),
	};
}

function isBuildValid(build) {
	let weight = 0;
	weight += build.head.weight;
	weight += build.core.weight;
	weight += build.arms.weight;
	weight += build.booster.weight;
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
	total_en += build.booster.en_load;
	total_en += build.fcs.en_load;
	let adjusted_en_output = build.generator.en_output * (build.core.output_adj / 100);
	if (total_en > adjusted_en_output) {
		return false;
	}
	total_weight = weight;
	load_limit = build.legs.load_limit;
	total_en_load = total_en;
	en_limit = adjusted_en_output; 
	return true;
}

fetch("./data.json")
	.then((res) => res.json())
	.then((data) => {
		parts_data = data;
		console.log(parts_data);
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
	document.querySelector("#booster-name").innerHTML = build.booster.name;
	document.querySelector("#fcs-name").innerHTML = build.fcs.name;
	document.querySelector("#generator-name").innerHTML = build.generator.name;
	let weight_pct = (total_weight / load_limit) * 100;
	weight_pct = Math.round(weight_pct * 100) / 100;
	let energy_pct = (total_en_load / en_limit) * 100;
	energy_pct = Math.round(energy_pct * 100) / 100;
	document.querySelector("#weight-info").innerHTML = total_weight + " / " + load_limit + " (" + weight_pct + "%)"
	document.querySelector("#energy-info").innerHTML = total_en_load + " / " + Math.round(en_limit) + " (" + energy_pct + "%)"
	console.log(build);
});