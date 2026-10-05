(() => {
    "use strict";
    const STORAGE = Object.freeze({
        users: "projeto_estoque_users",
        products: "projeto_estoque_products",
        history: "projeto_estoque_history",
        orders: "projeto_estoque_orders",
        cart: "projeto_estoque_cart",
        session: "projeto_estoque_logged_user"
    });
    const initialProducts = [
        { code: "PRD001", name: "Mouse Gamer", price: 150, qty: 20 },
        { code: "PRD002", name: "Teclado Mecânico", price: 350, qty: 15 }
    ];
    const permissions = Object.freeze({
        "Auxiliar de estoque": ["consulta", "pedidos"],
        "Almoxarife": ["consulta", "pedidos", "inventario-view"],
        "Coordenador": ["consulta", "pedidos", "inventario"],
        "Comprador/cadastro": ["consulta", "cad_produto", "cad_produto-delete"],
        "Administrador": ["consulta", "inventario", "pedidos", "pedidos-create", "faturamento", "cad_produto", "cad_produto-delete", "cad_acesso"]
    });

    function get(key, fallback) {
        const raw = localStorage.getItem(STORAGE[key] || key);
        return raw === null ? fallback : JSON.parse(raw);
    }
    function set(key, value) {
        localStorage.setItem(STORAGE[key] || key, JSON.stringify(value));
    }
    function escape(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
        })[char]);
    }
    function money(value) {
        return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    function notify(message, isError = false) {
        let toast = document.querySelector(".toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.className = "toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            document.body.append(toast);
        }
        toast.textContent = message;
        toast.classList.toggle("error", isError);
        toast.classList.remove("hidden");
        clearTimeout(notify.timer);
        notify.timer = setTimeout(() => toast.classList.add("hidden"), 3500);
    }
    function initStorage() {
        if (!localStorage.getItem(STORAGE.users)) set("users", []);
        if (!localStorage.getItem(STORAGE.products)) set("products", initialProducts);
        if (!localStorage.getItem(STORAGE.history)) set("history", []);
        if (!localStorage.getItem(STORAGE.orders)) set("orders", []);
        if (!localStorage.getItem(STORAGE.cart)) set("cart", []);
    }
    function emptyRow(columns, message = "Nenhum registro encontrado.") {
        return `<tr><td class="empty-cell" colspan="${columns}">${escape(message)}</td></tr>`;
    }
    function canAccess(role, page) {
        return Boolean(permissions[role] && permissions[role].includes(page));
    }
    function canView(role, page) {
        return canAccess(role, page) || (page === "inventario" && canAccess(role, "inventario-view"));
    }
    function addMovement(code, type, qty, reason) {
        const products = get("products", []);
        const product = products.find(item => item.code === code);
        if (!product) throw new Error("Produto não encontrado.");
        if (!Number.isInteger(qty) || qty < 1) throw new Error("Informe uma quantidade inteira maior que zero.");
        if (type === "Saída" && qty > Number(product.qty)) throw new Error("Estoque insuficiente para essa saída.");
        product.qty += type === "Entrada" ? qty : -qty;
        const history = get("history", []);
        history.push({ code, date: new Date().toLocaleString("pt-BR"), type, qty, reason });
        set("products", products);
        set("history", history);
        return product;
    }
    function saveProduct(product) {
        const products = get("products", []);
        if (products.some(item => item.code.toLowerCase() === product.code.toLowerCase())) {
            throw new Error("Já existe um produto com esse código.");
        }
        products.push(product);
        set("products", products);
        const history = get("history", []);
        history.push({
            code: product.code, date: new Date().toLocaleString("pt-BR"),
            type: "Entrada inicial", qty: product.qty, reason: "Cadastro do produto"
        });
        set("history", history);
        return product;
    }
    function deleteProduct(code, role) {
        if (!canAccess(role, "cad_produto-delete")) {
            throw new Error("Seu perfil não pode apagar produtos.");
        }
        const products = get("products", []);
        const product = products.find(item => item.code === code);
        if (!product) throw new Error("Produto não encontrado.");
        const hasPendingOrder = get("orders", []).some(order =>
            order.status !== "Faturado" && order.items.some(item => item.code === code)
        );
        if (hasPendingOrder) {
            throw new Error("Este produto está em um orçamento pendente e não pode ser apagado.");
        }
        set("products", products.filter(item => item.code !== code));
        return product;
    }
    function saveOrder(customer, items) {
        if (!customer.trim()) throw new Error("Informe o nome do cliente.");
        if (!items.length) throw new Error("Adicione pelo menos um produto ao orçamento.");
        const products = get("products", []);
        for (const item of items) {
            const product = products.find(entry => entry.code === item.code);
            const inCart = items.filter(entry => entry.code === item.code).reduce((total, entry) => total + entry.qty, 0);
            if (!product || inCart > Number(product.qty)) throw new Error(`Estoque insuficiente para ${item.name}.`);
        }
        const order = {
            id: `ORC-${Date.now().toString().slice(-8)}`,
            customer: customer.trim(),
            items: items.map(item => ({ ...item })),
            total: items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0),
            status: "Pendente",
            date: new Date().toISOString()
        };
        set("orders", get("orders", []).concat(order));
        return order;
    }
    function invoiceOrder(orderId) {
        const orders = get("orders", []);
        const order = orders.find(item => item.id === orderId);
        if (!order) throw new Error("Orçamento não encontrado.");
        if (order.status === "Faturado") return order;
        const products = get("products", []);
        for (const item of order.items) {
            const product = products.find(entry => entry.code === item.code);
            if (!product || Number(product.qty) < Number(item.qty)) {
                throw new Error(`Estoque insuficiente para faturar ${item.name}.`);
            }
        }
        const history = get("history", []);
        order.items.forEach(item => {
            const product = products.find(entry => entry.code === item.code);
            product.qty -= Number(item.qty);
            history.push({
                code: item.code, date: new Date().toLocaleString("pt-BR"),
                type: "Saída", qty: Number(item.qty), reason: `Faturamento ${order.id}`
            });
        });
        order.status = "Faturado";
        set("products", products);
        set("history", history);
        set("orders", orders);
        return order;
    }
    function createUser(user, pass, role) {
        const users = get("users", []);
        if (users.some(item => item.user.toLowerCase() === user.toLowerCase())) {
            throw new Error("Esse nome de usuário já está cadastrado.");
        }
        if (!Object.prototype.hasOwnProperty.call(permissions, role)) throw new Error("Perfil de acesso inválido.");
        users.push({ user, pass, role });
        set("users", users);
    }

    window.StockApp = {
        STORAGE, permissions, initStorage, get, set, escape, money, notify,
        emptyRow, canAccess, canView, addMovement, saveProduct, deleteProduct, saveOrder,
        invoiceOrder, createUser
    };
    document.addEventListener("DOMContentLoaded", initStorage);
})();
