// BUDGET CONTROLLER
const budgetController = (function() {
  
  
})();

// UI CONTROLLER
const UIController = (function() {

  // Some code

})();

// GLOBAL APP CONTROLLER
const controller = (function(budgetCtrl, UICtrl) {

  const ctrlAddItem = function () {
    console.log('ENTER was pressed')
    // Get the field input data

    // Add the item to the budget

    // Add the item to the UI

    // Calculate the budget

    // Display the budget on the UI
  }

  // ADD ACTION AND USE OR REMOVE FORM FROM HTML
  // document.querySelector('#budgetForm').addEventListener('submit', (e) => {
  //   e.preventDefault();
    
  document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);
  
  document.addEventListener('keypress', (event) => {
    if(event.keyCode === 13 || event.which === 13) {
      ctrlAddItem();
    }
  })

})(budgetController, UIController);
