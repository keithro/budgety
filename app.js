// =============================
//       BUDGET CONTROLLER
// =============================
const budgetController = (function() {
  // Function Constructors
  const Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // Adding method to prototype so that all objects created will inherit the method
  Expense.prototype.calcPercentage = function(totalIncome) {
    if(totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
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

    deleteItem: function(type, id) {
      /* // first create an array of ids
      const ids = data.allItems[type].map(current => {
        return current.id;
      });
      
      // then find index of item to delete
      const index = ids.indexOf(id);
      
      if(index !== -1) {
        data.allItems[type].splice(index, 1)
      } */

      // my version
      data.allItems[type] = data.allItems[type].filter(current => {
        return current.id !== id;
      })
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

    calculatePercentages: function() {
      data.allItems.exp.forEach(cur => {
        cur.calcPercentage(data.totals.inc);
      })
    },

    getPercentages: function() {
      // Return an array with all the percentages in it
      return data.allItems.exp.map(cur => {
        return cur.getPercentage()
      });
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

// =========================
//       UI CONTROLLER
// =========================
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
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  const formatNumber = function(num, type) {
    // absolute value of number
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    // numSplit = Math.abs(num).toFixed(2).split('.')

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  // Not sure why he didn't use forEach method below
  const nodeListForEach = function (list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  }

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
          <div class="item clearfix" id="inc-${obj.id}">
            <div class="item__description">${obj.description}</div>
            <div class="right clearfix">
              <div class="item__value">${formatNumber(obj.value, type)}</div>
              <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
            </div>
          </div>`;
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;

        html = `
          <div class="item clearfix" id="exp-${obj.id}">
            <div class="item__description">${obj.description}</div>
            <div class="right clearfix">
              <div class="item__value">${formatNumber(obj.value, type)}</div>
              <div class="item__percentage">21%</div>
              <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
            </div>
          </div>`;
      }

      // Replace placeholder text with actual data...I'm using template strings

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', html)
    },

    deleteListItem: function(selectorID) {
      const el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      const fields = document.querySelectorAll(`${DOMstrings.inputDescription}, ${DOMstrings.inputValue }`);

      // Have to use .call to use the array method slice on a node list
      let fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach((field, index, array) => {
        field.value = '';
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      let type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
      
      if(obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    // takes in our array of percentages we made in the Budget Controller
    displayPercentages: function(percentages) {
      // returns a node list
      const fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      /* 
      nodeListForEach(fields, function(current, index) {
        if(percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
       */

      // Node lists have a forEach method though...so I'll use it
      fields.forEach((current, index) => {
        percentages[index] > 0 ? current.textContent = percentages[index] + '%' : current.textContent = '---';
      });
    },

    displayDate: function() {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();

      document.querySelector(DOMstrings.dateLabel).textContent = `${months[month]} ${year}`;
    },

    changeType: function() {
      const fields = document.querySelectorAll(`
        ${DOMstrings.inputType},
        ${DOMstrings.inputDescription},
        ${DOMstrings.inputValue}
      `);

      /* 
      // his approach w/o .forEach
      nodeListForEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
      })
       */

      fields.forEach(cur => cur.classList.toggle('red-focus'));

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },
    
    getDOMstrings: function() {
      return DOMstrings;
    }
  };

})();

// =============================
//     GLOBAL APP CONTROLLER
// =============================
const controller = (function(budgetCtrl, UICtrl) {

  const setupEventListeners = function () {
    const DOM = UICtrl.getDOMstrings();

    // form inputs
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', (event) => {
      if (event.keyCode === 13 || event.which === 13) {
        event.preventDefault();
        // event.stopPropagation(); // Sould we add this?
        ctrlAddItem();
      }
    });

    // delete button
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    // input type selector
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
  };

  const updateBudget = function () {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget (Get rev/exp data object from budgetCtrl)
    const budget = budgetCtrl.getBudget();
    // 3. Pass in the budget data object and Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  const updatePercentages = function() {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();
    // 2. Read percentages from the budget controller
    const percentages = budgetCtrl.getPercentages();
    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  }

  const ctrlAddItem = function() {
    // Get the field input data
    let input = UICtrl.getInput();

    if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 1. Add the item to the budget
      let newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 2. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      // 3. Clear the fields
      UICtrl.clearFields();
      // 4. Calculate and update budget
      updateBudget();
      // 5. Calculate and update percentages
      updatePercentages();
    }
  };

  const ctrlDeleteItem = function(event) {
    let splitID, type, ID;
    const itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete item from data structure
      budgetCtrl.deleteItem(type, ID);
      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);
      // 3. Update and show the new budget totals
      updateBudget();
      // 4. Calculate and update percentages
      updatePercentages();
    }
  }

  return {
    init: function() {
      console.log('Application has started.');
      UICtrl.displayDate();
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
