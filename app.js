// =====================
//   BUDGET CONTROLLER
// =====================
const budgetController = (function() {
  // Function Constructors
  const Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  }

  // Data Object
  const data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1 // to identify that it has not been calculated yet
  };

  return {
    addItem: function(type, des, val) {
      let newItem;
      let ID;

      // Create new ID equal to the last ID + 1
      if (data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create Income or Expense based on the input
      if(type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if(type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      // Add data to appropriate array
      data.allItems[type].push(newItem);
      return newItem;
    },

    calculateBudget: function() {
      // Calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate percentage of income spent if there is income
      if(data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    
    // make our data available outside the function
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  }
  
})();

// =================
//   UI CONTROLLER
// =================
const UIController = (function() {
  const DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage'
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // dropdown selector "inc" or "exp"
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      let html, element;

      // Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;

        html = `
          <div class="item clearfix" id="income-${obj.id}">
            <div class="item__description">${obj.description}</div>
            <div class="right clearfix">
              <div class="item__value">${obj.value}</div>
              <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
            </div>
          </div>`;
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;

        html = `
          <div class="item clearfix" id="expense-${obj.id}">
            <div class="item__description">${obj.description}</div>
            <div class="right clearfix">
              <div class="item__value">${obj.value}</div>
              <div class="item__percentage">21%</div>
              <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
            </div>
          </div>`;
      }

      // Replace placeholder text with actual data

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', html)
    },

    clearFields: function() {
      let fields = document.querySelectorAll(`${DOMstrings.inputDescription}, ${DOMstrings.inputValue }`);

      // Have to use .call to use the array method slice on a node list
      let fieldsArr = Array.prototype.slice.call(fields);

      // fieldsArr.forEach(function(field, index, array) {
      //   field.value = '';
      // })
      fieldsArr.forEach((field, index, array) => {
        field.value = '';
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
      
      if(obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },
    
    getDOMstrings: function() {
      return DOMstrings;
    }
  };

})();

// =========================
//   GLOBAL APP CONTROLLER
// =========================
const controller = (function(budgetCtrl, UICtrl) {

  const setupEventListeners = function () {
    const DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', (event) => {
      if (event.keyCode === 13 || event.which === 13) {
        event.preventDefault();
        // event.stopPropagation(); // Sould we add this?
        ctrlAddItem();
      }
    });

    // document.querySelector('#budgetForm').addEventListener('submit', (e) => {
    //   e.preventDefault();
    //   ctrlAddItem();
    // });
  };

  const updateBudget = function () {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget (Get rev/exp data object from budgetCtrl)
    const budget = budgetCtrl.getBudget();
    // 3. Pass in the budget data object and Display the budget on the UI
    UICtrl.displayBudget(budget);

  };

  const ctrlAddItem = function() {
    // Get the field input data
    let input = UICtrl.getInput();

    if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // Add the item to the budget
      let newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // Add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      // Clear the fields
      UICtrl.clearFields();
      // Calculate and update budget
      updateBudget();
    }
  };

  return {
    init: function() {
      console.log('Application has started.');
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
      setupEventListeners();
    }
  };

})(budgetController, UIController);

controller.init();
