//BUDGET CONTROLLER
let budgetController = (function () {

    let Expense = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
        this.percentage = -1
    }

    Expense.prototype.calculatePercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage
    }

    let Income = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
    }

    let calculateTotal = function (type) {
        let sum = 0
        data.allItems[type].forEach(function (current) {
            sum += current.value
        })
        data.totals[type] = sum
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1
    }
    return {
        addItem: function (type, des, val) {
            let newItem, ID

            //Create new ID (ID = last item ID + 1)
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0
            }
            //Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }

            //Add new item to data structure 
            data.allItems[type].push(newItem)

            //return the new element
            return newItem
        },

        deleteItem: function (type, id) {
            let ids, index

            ids = data.allItems[type].map(function (current) {
                return current.id
            })

            index = ids.indexOf(id)

            if (index != -1) {
                data.allItems[type].splice(index, 1)
            }

        },

        calculateBudget: function () {

            // 1. Calculate total income and expenses
            calculateTotal('exp')
            calculateTotal('inc')

            // 2. Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp

            // 3. Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            } else {
                data.percentage = -1
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calculatePercentage(data.totals.inc)
            })
        },

        getPercentages: function () {
            let allPercentages = data.allItems.exp.map(function (cur) {
                return cur.getPercentage()
            })
            return allPercentages
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data)

        }
    }
})()


// UI CONTROLLER
let UIController = (function () {

    let DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    var formatNumber = function (num, type) {
        var numSplit, int, dec, decPoints, intArray, newInt;
     
        newInt = '';
    
        num = Math.abs(num);
        num = num.toFixed(2); 
    
        numSplit = num.split('.')
     
        int = numSplit[0];
        dec = numSplit[1];
     
        var intArray = int.split('');
    
        decPoints = (int.length - 1) / 3; 
        decPoints = Math.floor(decPoints); 
      
        for (i = 1; i <= decPoints; i ++) {
            intArray.splice(intArray.length - (3 * i) - (i - 1), 0, ',');
        }
     
        intArray.forEach( function (el) {
            newInt = newInt.concat('', el)
        })
     
        int = newInt;
        num = int.concat('.' + dec);
     
        return type === 'exp' ? num = '- ' + num : num = '+ ' + num;
    }
    let nodeListForEach = function (list, callback) {
        for (i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value, //will be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
            }
        },

        addListItem: function (obj, type) { //obj = newItem //type = 'exp' or 'inc'
            let html, newHtml, element
            // Create HTML string with placehold text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%description%', obj.description)
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))
            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        deleteListItem: function (selectorID) {
            let el = document.getElementById(selectorID)
            el.parentNode.removeChild(el)
        },

        clearFields: function () {
            let fields, fieldsArr
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue)

            fieldsArr = Array.prototype.slice.call(fields)

            fieldsArr.forEach(function (current, index, array) {
                current.value = ""
            })
            fieldsArr[0].focus()
        },

        displayBudget: function (obj) {
            obj.budget > 0 ? type = 'inc' : type = 'exp'
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type)
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc')
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp')
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%'
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---'
            }
        },

        displayPercentages: function (percentages) {
            let fields = document.querySelectorAll(DOMStrings.expensesPercLabel)

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%'

                } else {
                    current.textContent = '---'
                }
            })
        },

        displayMonth: function () {
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
            let now, year, month
            now = new Date()
            month = monthNames[now.getMonth()]
            year = now.getFullYear()
            document.querySelector(DOMStrings.dateLabel).textContent = month + ' ' + year
        },

        changeType: function () {
            let fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue)

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus')
            })
            document.querySelector(DOMStrings.inputButton).classList.toggle('red')
        },

        getDOMStrings: function () {
            return DOMStrings
        }
    }
})()

//  GLOBAL APP CONTROLLER
let controller = (function (budgetCtrl, UICtrl) {

    let setupEventListeners = function () {
        let DOM = UICtrl.getDOMStrings()

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem)

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem()
            }
        })

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)
    }

    let updateBudget = function () {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget()

        // 2. Return the budget
        let budget = budgetCtrl.getBudget()

        // 3. Display the budget
        UICtrl.displayBudget(budget)
    }

    let updatePercentages = function () {

        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages()

        // 2. Read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages()

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages)
    }

    let ctrlAddItem = function () {
        let input, newItem

        // 1. Get the filled input data
        input = UICtrl.getInput()

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the Budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value)

            // 3. Add the item to the UI controller
            UICtrl.addListItem(newItem, input.type)

            // 4. Clear the fields
            UICtrl.clearFields()

            // 5. Calculate and update budget
            updateBudget()

            // 6. Calculate and update percentages
            updatePercentages()

        } else {
            window.alert('Please insert description and value')
        }
    }

    let ctrlDeleteItem = function (event) {
        let itemID, splitID, type, ID

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

        if (itemID) {
            splitID = itemID.split('-')
            type = splitID[0]
            ID = parseInt(splitID[1])

            // 1. Delete item from the data structure
            budgetCtrl.deleteItem(type, ID)

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID)

            // 3. Update and show the new budget
            updateBudget()

            // 4. Calculate and update percentages
            updatePercentages()

        }
    }

    return {
        init: function () {
            console.log('Application has started')
            UICtrl.displayMonth()
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventListeners()
            //UICtrl.clearFields()
        }
    }
})(budgetController, UIController)

controller.init()
