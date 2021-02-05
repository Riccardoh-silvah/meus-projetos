const Modal = {
    open() {
        document.querySelector('.modal-overlay')
            .classList.add('active')

    },
    close() {
        document.querySelector('.modal-overlay')
            .classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.financer")) || []


    },
    set(transactions) {
        localStorage.setItem("dev.financer", JSON.stringify(transactions))

    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;
        //para todas as transações
        //para cada transação
        Transaction.all.forEach(transaction => {
            //se ela for maior que zero
            if (transaction.amount > 0) {
                //somar a variavel e retorna a variavel
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;
        //para todas as transações
        //para cada transação
        Transaction.all.forEach(transaction => {
            //se ela for menor que zero
            if (transaction.amount < 0) {
                //soma a uma variavel e retorna a variavel
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        //soma das entradas menos as saídas
        return Transaction.incomes() + Transaction.expenses();

    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = ` 
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
              <img onclick="Transaction.remove(${index})"src="assets/minus.svg" alt="Remover transação">
            </td>
      `
        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())

    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {

    formatAmount(value) {
        value = value * 100;

        return Math.round(value);
    },

    //formatação da data
    formatDate(date) {
        const splitteDate = date.split("-");
        return `${splitteDate[2]}/${splitteDate[1]}/${splitteDate[0]}`
    },

    //formatação dos numeros
    formatCurrency(value) {
        //adição do sinal negativo se o valor for menor < que 0.
        const signal = Number(value) < 0 ? "-" : "";
        //transformando o valor em string.
        value = String(value).replace(/\D/g, "");
        //adicção das  casas decimais.
        value = Number(value) / 100;
        //adição do valor em real Br.
        value = value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"

            })
            //retorno do valor com o sinal.
        return signal + value
    }

}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const {
            description,
            amount,
            date
        } = Form.getValues()

        if (
            description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let {
            description,
            amount,
            date
        } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)
        return {
            description,
            amount,
            date
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {

        event.preventDefault()

        try {
            //verificar se os campos são válidos
            Form.validateFields()
                //pegar transação formatada
            const transaction = Form.formatValues()
                //salvar
            Form.saveTransaction(transaction)
                //limpar o form
            Form.clearFields()
                //fechar modal
            Modal.close()

        } catch (error) {
            alert(error.message)
        }
    }
}


const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)

    },
    reload() {
        DOM.clearTransactions()

        App.init()
    },
}

App.init()