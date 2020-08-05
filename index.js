function makeId(length) {
	var randId = "";
	var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
	for (var i = 0; i < length; i++)
		randId += chars.charAt(Math.floor(Math.random() * chars.length));
	return randId;
}

function neuron() {
	this.id = makeId(5);
	
	this.bias = Math.random() * 2 - 1;
	
	this.in = {
		targets: {},
		weights: {} 
	}
	this.out = {
		targets: {}, 
		weights: {}
	}
	
	this._output;
	this.output;
	this.error;
	
	this.connect = function(neuron, weight) {

		this.out.targets[neuron.id] = neuron;
		neuron.in.targets[this.id] = this;
		this.out.weights[neuron.id] = neuron.in.weights[this.id] = weight == Math.random() * 2 - 1;
	}
	
	this.activate = function(input) {
		const self = this;
		
		function sigmoid(x) { 
			return 1 / (1 + Math.exp(-x)) 
		}
		function thresh(x) { 
			return sigmoid(x) * (1 - sigmoid(x)) 
		}

		if(input != undefined) {
			this._output = 1; 
			this.output = input;
		} 
		else {
			const sum = Object.keys(this.in.targets).reduce(function(total, target, index) {
				return total += self.in.targets[target].output * self.in.weights[target];
			}, this.bias);
			
			this._output = thresh(sum); 
			this.output = sigmoid(sum); 
		}
		
		return this.output;
	}
	
	this.propagate = function(target, rate=0.5) {
		const self = this;
		
		const sum = target == undefined ? Object.keys(this.out.targets).reduce(function(total, target, index) {
			
			self.out.targets[target].in.weights[self.id] = self.out.weights[target] -= rate * self.out.targets[target].error * self.output;
			
			return total += self.out.targets[target].error * self.out.weights[target];
		}, 0) : this.output - target;
		
		this.error = sum * this._output
		
		this.bias -= rate * this.error;
		
		return this.error;
	}
}
function activate(input){
	inputs.forEach((neuron, i) => neuron.activate(input[i]));
	hiddenLayer.forEach(neuron => neuron.activate());
	return outputs.map(neuron => neuron.activate());
};
function propagate(target) {
	outputs.forEach((neuron, t) => neuron.propagate(target[t]));
	hiddenLayer.forEach(neuron => neuron.propagate());
	return inputs.forEach(neuron => neuron.propagate());
};

const dataset = [
	{ inputs: [0,0,0], outputs: [0] },
	{ inputs: [0,0,1], outputs: [1] },
	{ inputs: [0,1,0], outputs: [1] },
	{ inputs: [1,0,0], outputs: [1] },
	{ inputs: [1,0,1], outputs: [0] },
	{ inputs: [0,1,1], outputs: [0] },
	{ inputs: [1,1,0], outputs: [0] },
	{ inputs: [1,1,1], outputs: [1] },
];
var accuracy = new Array;
function train(iterations, logging) {
	console.log("New Training Session")
	for(let move = 0; move <= iterations; move++) {
		dataset.map(data => {
			activate(data.inputs);
			propagate(data.outputs);
		});
		var chosen = Math.floor(Math.random()*dataset.length),
			realInput = dataset[chosen]["inputs"],
			realOutput = dataset[chosen]["outputs"],
			testOutput = activate(realInput),
			difference = Math.abs(realOutput - testOutput);
		if(!isNaN(difference)) 
			accuracy.push(difference);
		if(move % logging == 0 && logging && !isNaN(getAccuracy(accuracy))){
			console.log("Accuracy "+move+": " + getAccuracy(accuracy));
		}
	}
	if (logging) {
		console.log("Training Complete.")
		console.log('-'.repeat(process.stdout.columns))
	}
};

function getAccuracy(array){
	var total = 0;
	for(var i in array) { total += array[i]; }
	return Math.abs(1 - total/array.length)
}

var inputs = new Array, hiddenLayer = new Array, outputs = new Array;

function setup(inputL, hiddenL, outputL){
	for (let x = 0; x < inputL; x++){
		inputs.push(new neuron());
	}
	for (let x = 0; x < hiddenL; x++){
		hiddenLayer.push(new neuron());
	}
	for (let x = 0; x < outputL; x++){
		outputs.push(new neuron());
	}
	
	for (let x = 0; x < inputL; x++){
		for(let y = 0; y < hiddenL; y++){
			inputs[x].connect(hiddenLayer[y]);
		}
	}
	for (let x = 0; x < hiddenL; x++){
		hiddenLayer[x].connect(outputs[0]);
	}
}
function brain(inputs, hiddens, outputs, iterations, logging){
	setup(inputs, hiddens, outputs);
	train(iterations, logging);
}
function report(data){
	console.log("Report")
	console.log('-'.repeat(process.stdout.columns))
	var number = accuracy.length - 1;
	console.log("Iterations: " + number);
	console.log('-'.repeat(process.stdout.columns))

	console.log("AVG Accuracy: " + getAccuracy(accuracy));
	var final = 1 - accuracy[number];
	console.log("Recorded Accuracy: " + final);
	console.log("Input: " + data.toString());
	var result = activate(data);
	console.log("Output: " + result);
	console.log('-'.repeat(process.stdout.columns))

	console.log("Rounded Output: " + Math.round(result));
	var output;
	for (input in dataset){
		var real = dataset[input]["inputs"];
		output = dataset[input]["outputs"];
		if (data == real) return output;
	}
	console.log("Expected Output: " + output);
	if(Math.round(result) != output)
		console.log("Conclusion: this thing is dumb as hell.")
	else
		console.log("Conclusion: we're getting somewhere.")
}
brain(3, 50, 1, 20000, 100);
report([0,1,0]);
//for just getting result, console.log(activate([data]))