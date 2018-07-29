// IIFE returns object 
//BUDGET CONTROLLER
var budgetController = (function(){

  var Expense = function(id, description, value){
  	this.id = id;
  	this.description = description;
  	this.value = value;
  }
  var Income = function(id, description, value){
  	this.id = id;
  	this.description = description;
  	this.value = value;
  }

  var calculateTotal = function(type){
    var sum = data.allItems[type].reduce(function(prev, curr){
      return prev + curr.value;
    },0)
    data.totals[type] = sum;
  };
  
  var data = {
      allItems:{
      	exp: [],
      	inc: []
      },
      totals: {
      	exp: 0,
      	inc: 0
      },
      budget: 0,
      percentage: -1
  };
  
  return {
  	addItem: function(type, des, val){
        var newItem, ID;
       
        // Create new ID
        if (data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

        } else{
            ID = 0;
        }
        // Create new Item baseed on 'inc' or 'exp'
        if(type === 'exp'){
          newItem = new Expense(ID, des, val)
        } else if (type === 'inc'){
            newItem = new Income(ID, des, val)
        }
        //Push it into data structure
        data.allItems[type].push(newItem);

        // return the new Item
        return newItem;
  	},
    deleteItem: function(type, id){
      var ids, index
      ids = data.allItems[type].map(function(current){
        return current.id; 
      })
      index = ids.indexOf(id);

      if (index !== -1){
        data.allItems[type].splice(index, 1)
      }

    },
    calculateBudget: function(){
      // calculate total income and expenses
    calculateTotal('exp');
    calculateTotal('inc');
      // Calculate the budget: income - expenses
    data.budget = data.totals.inc - data.totals.exp;
      // Calculate the percentage of income that we spent
    if(data.totals.inc > 0){
      data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
    } else{
      data.percentage = -1
    }
    
    },
    

    getBudget: function(){
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

  	testing: function(){
  		console.log(data);
  	}

  };

})();

//Module to take care user interface
//UI CONTROLLER
var UIController = (function(){

var DOMstrings = {
	inputType: '.add__type',
	inputDescription: '.add__description',
	inputValue: '.add__value',
	inputBtn: '.add__btn',
	incomeContainer: '.income__list',
	expensesContainer: '.expenses__list',
  budgetLabel: '.budget__value',
  incomeLabel: '.budget__income--value',
  expensesLabel: '.budget__expenses--value',
  percentageLabel: '.budget__expenses--percentage',
  container: '.container'
}

return {
	getInput: function(){
		return {
			type: document.querySelector(DOMstrings.inputType).value, // either inc or exp
		    description: document.querySelector(DOMstrings.inputDescription).value,
		    value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
	    }
    },
    addListItem: function(obj, type){
    	var html, newHtml, element;
    	//Create HTML string with placeholder text
    	  if(type === 'inc'){
    	  	element = DOMstrings.incomeContainer;
    	  html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
    	
    } else if(type === 'exp'){
    	  element = DOMstrings.expensesContainer;
    	  html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
    }
    // Replace the placeholder text with actual data 
    newHtml = html.replace('%id%', obj.id);
    newHtml = newHtml.replace('%description%', obj.description);
    newHtml = newHtml.replace('%value%', obj.value);
    // Insert HTML to the DOM
    document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
    },
    deleteListItem: function(selectorID){
      var el = document.getElementById(selectorID)
      el.parentNode.removeChild(el);
    },
    clearFields: function(){
      var fields;
      document.querySelector(DOMstrings.inputDescription).value = "";
      document.querySelector(DOMstrings.inputValue).value = "";
      document.querySelector(DOMstrings.inputDescription).focus();
    },
    displayBudget: function(obj){
      document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget
      document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc
      document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp
      
      if(obj.percentage > 0){
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'
      } else{
        document.querySelector(DOMstrings.percentageLabel).textContent = '---'
      }

    },
    
    getDomStrings: function(){
      return DOMstrings;
    }
		
}

})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
  
  // Event Listeners
  var setupEventListeners = function(){
  var DOM = UICtrl.getDomStrings();
  
  document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
  
  document.addEventListener('keypress', function(event){
  if(event.keyCode === 13 || event.which === 13){
    ctrlAddItem();
  }
 
 });
  document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
};
  var updateBudget = function(){
// 1. Calculate budget
  budgetCtrl.calculateBudget();
// 2. Return the budget
  var budget = budgetCtrl.getBudget();
// 5. Display budget in UI
  UICtrl.displayBudget(budget)
  };


  var ctrlAddItem = function(){
// 1. Get the field input data when button is clicked
  var input = UICtrl.getInput();
  var DOM = UICtrl.getDomStrings();
  if(input.description === ""){
    alert('Description is missing!');
    document.querySelector(DOM.inputDescription).focus();
    return;
  } else if(isNaN(input.value) || !(input.value > 0)){
    alert('Enter a number greater than zero in the value field');
    document.querySelector(DOM.inputValue).focus();
    return;
  }
  var newItem = budgetCtrl.addItem(input.type, input.description, input.value)

  UICtrl.addListItem(newItem, input.type);


  UICtrl.clearFields();

  updateBudget()
  };

  var ctrlDeleteItem = function(event){
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if(itemID){
      // inc - 1
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1. Delete item from data structure
      budgetCtrl.deleteItem(type, ID)

      //2. Delete the item from UI
      UICtrl.deleteListItem(itemID);
      //3. Update and show the new budget
      updateBudget()

    }
  };

 
return {
	init: function(){
		console.log("Started")
    UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
		setupEventListeners();
	  }
  }
})(budgetController, UIController)

controller.init();

