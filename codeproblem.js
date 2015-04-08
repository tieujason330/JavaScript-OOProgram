//Handles interactions with Classes and Objects
var OO = {};

//Class Table
OO.CT = [];

////////////////////////////////////////////////////

//Class Table Item stores Class and List of Objects
function CT_item(_Class, Obj) {
  this._Class = _Class;
  if (Obj === undefined)
    this.Objs = [];
  else
    this.Objs = [Obj];
}

////////////////////////////////////////////////////

//Class
var Class = function(name ,vars, superClass) {
  this.name = name;
  this.superClass = superClass;
  this.vars = vars;
};

var Class_proto = {};
Class.prototype = Class_proto;

//Prints contents of the Class
Class.prototype.toString = function() {
	console.log("");
	console.log("**************************");
	console.log("Class name = " + this.name);
	console.log("SuperClass name = " + this.superClass);
	console.log("Class variables = " + this.vars);
	console.log("**************************");
	console.log(" ");
}
/////////////////////////////////////////////////////////////
//Obj - Instance of class
var Obj = function(name, _class) {
	this.name = name;
	this._class = _class;
}

var Obj_proto = {};
Obj.prototype = Obj_proto;

//Prints contents of the Object
Obj.prototype.toString = function() {
	console.log(" ");
	console.log("	^^^^^^^^^^^^^^^^^^^^^^^^^^");
	console.log("	Object name = " + this.name);
	console.log("	Class name = " + this._class.name);
	console.log("	SuperClass name = " + this._class.superClass);
	console.log("	Instantiated variables = ");
	this.VarsPrint();
	console.log("	^^^^^^^^^^^^^^^^^^^^^^^^^^");
	console.log(" ");
};

//GET *
Obj.prototype.VarsPrint = function () {
	for ( i in this._class.vars) {
		console.log("	(" + i + ": " + this._class.vars[i] + ")");
	}
};

//GET propertyname
Obj.prototype.get = function(propName) {
	var val = this._class.vars[propName];
	
	if (val === undefined) {
		throw new Error(propName + " doesn't exist");
	}
	
	console.log("	(Name: " + propName + ", Value: " + val + ")");
};

//SET propertyname=newvalue
Obj.prototype.set = function(propName, newVal) {
	
	var val = this._class.vars[propName];
	
	if (val === undefined) {
		throw new Error(propName + " doesn't exist");
	}

	this._class.vars[propName] = newVal;
};

/////////////////////////////////////////////////////////////

//OO function to add CT_item
//If item exists, add name to Name array
//Else add new CT_item
OO.add_CT_item = function(CT_i) {
  for (var i = 0; i < this.CT.length ; i++) {
    if ( this.CT[i]._Class.name === CT_i._Class.name && CT_i.Objs !== undefined) {
      this.CT[i].Objs = this.CT[i].Objs.concat(CT_i.Objs);
      return;
    }
  }
  this.CT.push(CT_i);
};

//Checks if class exists
OO.containsClass = function(name) {
  for (var i = 0; i < this.CT.length; i++) {
    if ( this.CT[i]._Class.name === name ) {
      return true;
    }
  }
  return false;
};

//Checks if object exists
OO.containsObject = function(name) {
	for (var i = 0; i < this.CT.length; i++) {
	  for (var j = 0; j < this.CT[i].Objs.length; j++) {
		if ( this.CT[i].Objs[j].name === name ) {
			return true;
		}
	  }
	}
	return false;
};

//retrieves class
OO.getClass = function(name) {
  for (var i = 0; i < this.CT.length; i++) {
    if ( this.CT[i]._Class.name === name ) {
      return this.CT[i]._Class;
    }
  }
  //throw new Error("Class: " + name + " does not exist.");
  return null;
};

//retrieves object
OO.getObject = function(name) {
  for (var i = 0; i < this.CT.length; i++) {
	  for (var j = 0; j < this.CT[i].Objs.length; j++) {
		if ( this.CT[i].Objs[j].name === name ) {
			return this.CT[i].Objs[j];
		}
	  }
	}
	throw new Error("Object does not exist");
};

//Helper function to see if arrays share elements
function shareElements(a1, a2) {
  for (var i = 0; i < a1.length; i++) {
    for (var j = 0; j < a2.length; j++) {
      if (a1[i] === a2[i])
        return true;
    }
  }
  return false;
}

//Initializes the Class Table
//Added some default examples
OO.initializeCT = function() {
  //initialize Class Table
  this.CT = [];

  //Object class - default class that is always included
  var obj = new Class("Object",[], undefined);
  this.CT.push(new CT_item(obj, undefined));
  
  var p = new Class("Point", ["x", "y"], "Object");
  this.CT.push(new CT_item(p, undefined));
  
  var p3 = new Class("3DPoint", ["z"], "Point");
  this.CT.push(new CT_item(p3, undefined));
  
  var ob1 = this.instantiate("p", "Point", [1,2]);
};

//helper function checks if all are unique
function varNamesUnique(instVarNames) {
  var curr;
  for ( var i = 0; i < instVarNames.length ; i++ ) {
    curr = instVarNames[i];

    for (var j = 0 ; j < instVarNames.length ; j++ ) {
      if ( curr === instVarNames[j] && (j !== i )) {
        return false;
      }
    }
  }
  return true;
}

//Creates a new class and adds it to Class Table 
OO.declareClass = function(name, superClassName, instVarNames) {
  
  if (varNamesUnique(instVarNames) === false) {
    throw new Error("Cannot declare variables with same name.");
  }

  var c = new Class(name, instVarNames, superClassName);
  var ct_item = new CT_item(c, undefined);

  if(this.containsClass(name)) {
    throw new Error("Duplicate class declaration");
  }

  if(this.containsClass(superClassName) === false) {
    throw new Error("Undeclared class");
  }
  
  var supClass = this.getClass(superClassName);
  if(shareElements(instVarNames, supClass.vars)) {
    throw new Error("Duplicate instance variable declaration");
  }

  this.add_CT_item(ct_item);
};

//create a dictionary and add key value pairs dynamically
//keys are var names from class
//values are from arguments
OO.instantiate = function(objName ,className, vs) { 
  var c = this.getClass(className);
  var d =  Object.create(c);
  var newVars = c.vars;

  if (this.getClass(d.superClass) !== null)
  {
    d.superClass = this.getClass(c.superClass);
	if (d.superClass.vars !== undefined && d.superClass.vars !== [] ) {
		newVars = d.superClass.vars.concat(c.vars);
	}
  }

  d.vars = {};

  for ( var i = 0 ; i < newVars.length; i++ ) {
    d.vars[ newVars[i] ] = vs[i];
  }
  
  var cl = new Class(d.name, d.vars, c.superClass);
  newObj = new Obj(objName, cl);
  
  var test = this.containsObject(objName); 
  if ( test === false )
	this.add_CT_item(new CT_item(c, newObj));
	
};

//Displays all classes in Class Table
function showClasses() {
	for (var i = 0; i < OO.CT.length; i++) {
		OO.CT[i]._Class.toString();
	}
}

//Creates a new class
function createClass() {
	var creating = true;
	
	while(creating) {
		var className = prompt("new Class name (Type $back to go back to Main Menu):");
		if (className === "$back")
			break;
		
		if ( OO.containsClass(className) ) {
			console.log("Class name already exists. Try again.");
			continue;
		}
		var superClass = prompt("super Class name (enter none for default):");
		if (superClass === "none") {
			superClass = "Object";
		}
		if ( OO.containsClass(superClass) === false ) {
			console.log("Super class does not exist. Try again.");
			continue;
		}
		var vars = [];
		var v = true;
		while(v) {
			var v = prompt("Enter variable name (enter '$finish' when done) :");
			if ( vars.length === 0 && v === "$finish" ) {
				console.log("Must have at least one variable. Try again.");
				continue;
			}
			if ( v !== "$finish") {
				vars.push(v);
				continue;				
			}
			else {
				break;
			}
		}
		
		try {
			OO.declareClass(className, superClass, vars);
		} catch (e) {
			console.log("Error: duplicate instance variable declaration");
			continue;
		}
		
		break;
	}
}

//Creates an object from an existing class
function createObject() {
	var creating = true;
	
	while(creating) {
		var className = prompt("What class do you want to use (case sensitive / Type $back to go back to Main Menu)");
		if (className === "$back") {
			break;
		}
		
		if (OO.containsClass(className) === false) {
			console.log("That class does not exist. Try again.");
			continue;
		}

		var c = OO.getClass(className);
		var d =  Object.create(c);
		var newVars = c.vars;
		if (OO.getClass(d.superClass) !== null)
		{
			d.superClass = OO.getClass(c.superClass);
			newVars = d.superClass.vars.concat(c.vars);
		}

		var instvars = [];
		
		for (var i = 0; i < newVars.length; i++) {
			var x = prompt("Enter value for " + newVars[i]);
			instvars.push(x);
		}
		var namingObj = true;
		var objName;
		while(namingObj){
			objName = prompt("Name the object:");
			if (OO.containsObject(objName) === true) {
				console.log("Object name already exists. Try again.");
				continue;
			}
			break;
		}

		OO.instantiate(objName, className, instvars);
		break;
	}
}

//Prints out all existing objects
function showObjects() {
	for (var i = 0 ; i < OO.CT.length ; i++) {
		var currCT_item = OO.CT[i];
		for ( var j = 0 ; j < currCT_item.Objs.length ; j++) {
			currCT_item.Objs[j].toString();
		}
	}
}

//Use commands: 
//  SET propertyname=newvalue
//  GET *
//  GET propertyname
function changeObject() {
	
	var menu = true;
	
	while (menu) {
		console.log(" ");
		console.log("		&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
		console.log("		Valid commands:");
		console.log("		SET propertyname=newvalue ");
		console.log("		GET propertyname");
		console.log("		GET *");
		console.log("		Please follow syntax structure.");
		console.log("		&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
		console.log(" ");
		var objName = prompt("Pick target object. (Type $back to go back to Object Menu)");
		
		var obj;
		
		if (objName === "$back") {
			break;
		}
		else {
			try {
				obj = OO.getObject(objName);
				obj.toString();
			} catch (E) {
				console.log("");
				console.log("Object " + objName + " does not exist.");
				console.log("");
				continue;
			}
		}
		
		var action = prompt("Enter a valid command. (Type $back to go back to Object Menu)");
		
		if (action === "$back") {
			break;
		}
		
		//break up action
		action = action.split(" ");
		
		if ( action[0] === "SET") {
			var prop = action[1].split("=");
			try {
				console.log("+++++++++++++++++++++++++++");
				console.log("Before: ");
				obj.get(prop[0]);
				obj.set(prop[0], prop[1]); //propertyname and newvalue
				console.log("After: ");
				obj.get(prop[0]);
				console.log("+++++++++++++++++++++++++++");
			} catch(E) {
				console.log("");
				console.log("Property " + prop[0] + " of " + objName + " does not exist.");
				console.log("");
				continue;
			}
		}
		else if (action[0] === "GET") {
			if(action[1] === "*"){
				console.log("+++++++++++++++++++++++++++");
				console.log("GET *");
				obj.VarsPrint();
				console.log("+++++++++++++++++++++++++++");
			}
			else {
				try {
					console.log("+++++++++++++++++++++++++++");
					console.log("GET " + action[1] + ":");
					obj.get(action[1]);
					console.log("+++++++++++++++++++++++++++");
				} catch (E) {
					console.log("");
					console.log("Property " + action[1] + " of " + objName + " does not exist.");
					console.log("");
					continue;
				}
			}
		}
		else {
			console.log("Invalid command.");
			continue;
		}
		break;
	}
}

//Object menu to display/alter existing objects
function objectMenu() {
	var menu = true;
	
	while(menu) {
		console.log(" ");
		console.log("	@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
		console.log("	Object Menu:");
		console.log("	1: Show Objects");
		console.log("	2: Change Settings on an Object");
		console.log("	@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
		console.log(" ");
		//needs parseInt since prompt returns string
		var select = prompt("Choose an option (Type $back to go back to Main Menu): ");
		if (select === "$back")
			break;
		
		select = parseInt(select);
		
		switch (select) {
			case 1:
				showObjects();
				break;
			case 2:
				changeObject();
				break;
			default:
				console.log("Choose only between 1 to 2.");
				continue;
		}
	}
	console.log("===== Exited Object Menu =====");
}
//Menu to helper use navigate actions
function MenuScreen() {
	
	var menu = true;
	
	while(menu) {
		console.log(" ");
		console.log("-----------------------------------");
		console.log("Main Menu:");
		console.log("1: Show Classes");
		console.log("2: Create a Class");
		console.log("3: Create an object");
		console.log("4: Change settings on target object");
		console.log("-----------------------------------");
		console.log(" ");
		//needs parseInt since prompt returns string
		var select = prompt("Choose an option (Type $exit to exit program): ");
		
		if ( select === "$exit") 
			break;
		
		select = parseInt(select);
		switch (select) {
			case 1:
				showClasses();
				break;
			case 2:
				createClass();
				break;
			case 3: 
				createObject();
				break;
			case 4:
				objectMenu();
				break;
			default:
				console.log("Choose only between 1 to 4.");
				continue;
		}
	}
	console.log("***** Exited Menu *****");
}

function main() {
	OO.initializeCT();
	MenuScreen();	
}

main();
