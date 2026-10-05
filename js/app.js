(() => {
    "use strict";
    const tabs = Array.from(document.querySelectorAll("#system-navigation [data-page]")).map(button => ({
        id: button.dataset.page,
        label: button.dataset.label,
        file: button.dataset.file
    }));
    const localTabContent = {
        consulta: `<section class="panel">
            <div class="toolbar"><label class="field" for="product-search">Buscar produto por nome ou código
                <input class="control" id="product-search" type="search" placeholder="Ex.: Mouse ou PRD001">
            </label></div>
            <div class="table-wrap"><table><thead><tr><th>Código</th><th>Produto</th><th>Preço</th><th>Estoque</th><th>Histórico</th></tr></thead><tbody id="products-table"></tbody></table></div>
        </section><section class="panel history-section hidden" id="history-panel">
            <h2 id="history-title">Histórico do produto</h2>
            <div class="table-wrap"><table><thead><tr><th>Data</th><th>Tipo</th><th>Quantidade</th><th>Motivo</th></tr></thead><tbody id="history-table"></tbody></table></div>
        </section>`,
        inventario: `<div id="inventory-content"></div>`,
        pedidos: `<section class="panel">
            <h2>Novo orçamento</h2><p class="notice hidden" id="orders-read-only">Seu perfil pode consultar orçamentos, mas não criá-los.</p>
            <div class="field"><label for="order-customer">Cliente</label><input class="control" id="order-customer" maxlength="120"></div>
            <form id="item-form" class="inline-form" style="margin-top:16px">
                <div class="field"><label for="order-product">Produto</label><select class="control" id="order-product"></select></div>
                <div class="field"><label for="order-qty">Quantidade</label><input class="control" id="order-qty" type="number" min="1" step="1" value="1"></div>
                <button class="button secondary" type="submit">Adicionar item</button>
            </form>
            <div class="table-wrap" style="margin-top:18px"><table><thead><tr><th>Produto</th><th>Qtd.</th><th>Unitário</th><th>Subtotal</th><th></th></tr></thead><tbody id="cart-items"></tbody></table></div>
            <div class="summary-row"><span>Total</span><span id="cart-total">R$ 0,00</span></div>
            <div class="form-actions"><button class="button" type="button" data-action="save-order">Salvar orçamento</button></div>
        </section><section class="panel">
            <h2>Orçamentos registrados</h2>
            <div class="table-wrap"><table><thead><tr><th>Número</th><th>Cliente</th><th>Total</th><th>Status</th><th>Data</th></tr></thead><tbody id="orders-table"></tbody></table></div>
        </section>`,
        faturamento: `<p class="notice warning">Simulação acadêmica: este recurso não emite nota fiscal válida nem transmite dados à SEFAZ.</p>
            <section class="panel"><h2>Orçamentos disponíveis</h2>
                <div class="table-wrap"><table><thead><tr><th>Número</th><th>Cliente</th><th>Total</th><th>Status</th><th>Documento</th></tr></thead><tbody id="billing-table"></tbody></table></div>
            </section><section class="panel invoice hidden" id="invoice-preview">
                <h2>Documento demonstrativo</h2><div id="invoice-content"></div>
                <div class="form-actions no-print"><button class="button" type="button" data-action="print">Imprimir / Salvar PDF</button></div>
            </section>`,
        cad_produto: `<section class="panel"><h2>Novo produto</h2><form id="product-form">
            <div class="form-grid">
                <div class="field"><label for="product-code">Código</label><input class="control" id="product-code" maxlength="40" required></div>
                <div class="field"><label for="product-name">Nome do produto</label><input class="control" id="product-name" maxlength="120" required></div>
                <div class="field"><label for="product-price">Preço unitário (R$)</label><input class="control" id="product-price" type="number" min="0" step="0.01" required></div>
                <div class="field"><label for="product-qty">Quantidade inicial</label><input class="control" id="product-qty" type="number" min="0" step="1" required></div>
            </div><div class="form-actions"><button class="button" type="submit">Cadastrar produto</button></div>
        </form></section><section class="panel">
            <h2>Produtos cadastrados</h2><p class="muted">Apagar remove o produto do catálogo. O histórico de movimentações é preservado.</p>
            <div class="table-wrap"><table><thead><tr><th>Código</th><th>Produto</th><th>Estoque</th><th>Ação</th></tr></thead><tbody id="product-admin-table"></tbody></table></div>
        </section>`,
        cad_acesso: `<section class="panel"><h2>Cadastrar usuário e perfil</h2>
            <p class="notice">Cada perfil recebe acesso somente às abas e operações permitidas para seu cargo.</p>
            <form id="user-form"><div class="form-grid">
                <div class="field"><label for="new-user-name">Usuário</label><input class="control" id="new-user-name" minlength="3" autocomplete="off" required></div>
                <div class="field"><label for="new-user-password">Senha (mínimo de 6 caracteres)</label><input class="control" id="new-user-password" type="password" minlength="6" autocomplete="new-password" required></div>
                <div class="field"><label for="new-user-role">Cargo / perfil</label><select class="control" id="new-user-role" required></select></div>
            </div><div class="form-actions"><button class="button" type="submit">Cadastrar usuário</button></div></form>
        </section><section class="panel"><h2>Usuários cadastrados</h2>
            <div class="table-wrap"><table><thead><tr><th>Usuário</th><th>Perfil</th></tr></thead><tbody id="users-table"></tbody></table></div>
        </section><section class="panel"><h2>Permissões por perfil</h2>
            <div class="table-wrap"><table><thead><tr><th>Perfil</th><th>Acessos</th></tr></thead><tbody>
                <tr><td>Auxiliar de estoque</td><td>Consulta; pedidos somente para visualização.</td></tr>
                <tr><td>Almoxarife</td><td>Consulta; pedidos somente para visualização; inventário somente para visualização.</td></tr>
                <tr><td>Coordenador</td><td>Consulta; pedidos somente para visualização; inventário completo.</td></tr>
                <tr><td>Comprador/cadastro</td><td>Consulta; cadastro e exclusão de produtos.</td></tr>
                <tr><td>Administrador</td><td>Acesso completo, incluindo cadastro e exclusão de produtos e gestão de usuários.</td></tr>
            </tbody></table></div>
        </section>`
    };
    let activePage = "inicio";
    const openPages = ["inicio"];
    const loadedPages = new Set(["inicio"]);
    const loadingPages = new Set();
    const loadGeneration = new Map();
    let cart = [];

    function currentUser() { return StockApp.get("session", null); }
    function availableTabs() { return tabs.filter(tab => StockApp.canView(currentUser().role, tab.id)); }
    function renderNavigation() {
        document.querySelectorAll("#system-navigation [data-page]").forEach(button => {
            const visible = StockApp.canView(currentUser().role, button.dataset.page);
            button.classList.toggle("hidden", !visible);
            if (visible) button.setAttribute("aria-current", button.dataset.page === activePage ? "page" : "false");
            else button.removeAttribute("aria-current");
        });
    }
    function renderBrowserTabs() {
        const nav = document.getElementById("system-tabs");
        nav.innerHTML = openPages.map(page => {
            const label = page === "inicio" ? "Visão geral" : tabs.find(tab => tab.id === page).label;
            return `<div class="browser-tab${page === activePage ? " active" : ""}" role="presentation">
                <button type="button" class="browser-tab-label" role="tab" data-page="${page}" aria-selected="${page === activePage}">${StockApp.escape(label)}</button>
                ${page === "inicio" ? "" : `<button type="button" class="browser-tab-close" data-close-page="${page}" aria-label="Fechar ${StockApp.escape(label)}" title="Fechar aba">&times;</button>`}
            </div>`;
        }).join("");
    }
    function activateTab(page) {
        if (page !== "inicio" && !StockApp.canView(currentUser().role, page)) {
            StockApp.notify("Seu perfil não tem permissão para acessar essa aba.", true);
            return;
        }
        activePage = page;
        renderNavigation();
        renderBrowserTabs();
        document.getElementById("page-title").textContent = pageTitle();
        document.querySelectorAll("#tab-content [data-page-panel]").forEach(panel => {
            const isActive = panel.dataset.pagePanel === activePage;
            panel.classList.toggle("hidden", !isActive);
            panel.setAttribute("aria-hidden", String(!isActive));
        });
        if (activePage === "inicio") {
            const dashboard = document.querySelector('#tab-content [data-page-panel="inicio"]');
            if (dashboard) renderDashboard(dashboard);
        }
    }
    function closeTab(page) {
        const index = openPages.indexOf(page);
        if (index < 0 || page === "inicio") return;
        openPages.splice(index, 1);
        loadGeneration.set(page, (loadGeneration.get(page) || 0) + 1);
        loadingPages.delete(page);
        const panel = document.querySelector(`#tab-content [data-page-panel="${page}"]`);
        if (panel) panel.remove();
        loadedPages.delete(page);
        if (activePage === page) {
            activateTab(openPages[Math.max(0, index - 1)] || "inicio");
        } else {
            renderBrowserTabs();
        }
    }
    function pageTitle() {
        return activePage === "inicio" ? "Visão geral" : tabs.find(tab => tab.id === activePage).label;
    }
    function renderDashboard(host) {
        const products = StockApp.get("products", []);
        const orders = StockApp.get("orders", []);
        host.innerHTML = `
            <section class="stats-grid">
                <article class="stat-card"><span>Produtos cadastrados</span><strong>${products.length}</strong></article>
                <article class="stat-card"><span>Orçamentos registrados</span><strong>${orders.length}</strong></article>
                <article class="stat-card"><span>Produtos com estoque baixo (até 5)</span><strong>${products.filter(item => Number(item.qty) <= 5).length}</strong></article>
            </section>
            <section class="panel"><h2>Estoque atual</h2><div class="table-wrap"><table><thead><tr><th>Código</th><th>Produto</th><th>Preço</th><th>Quantidade</th></tr></thead>
            <tbody>${products.length ? products.slice(0, 8).map(item => `<tr><td>${StockApp.escape(item.code)}</td><td>${StockApp.escape(item.name)}</td><td>${StockApp.money(item.price)}</td><td>${Number(item.qty)}</td></tr>`).join("") : StockApp.emptyRow(4)}</tbody></table></div></section>`;
    }
    function renderProducts(query = "") {
        const products = StockApp.get("products", []).filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase()) || item.code.toLowerCase().includes(query.toLowerCase())
        );
        document.getElementById("products-table").innerHTML = products.length ? products.map(item => `<tr>
            <td>${StockApp.escape(item.code)}</td><td>${StockApp.escape(item.name)}</td><td>${StockApp.money(item.price)}</td>
            <td>${Number(item.qty)}</td><td><button class="button secondary small" data-action="history" data-code="${StockApp.escape(item.code)}">Movimentações</button></td>
        </tr>`).join("") : StockApp.emptyRow(5);
    }
    function renderProductAdminTable() {
        const tbody = document.getElementById("product-admin-table");
        if (!tbody) return;
        const products = StockApp.get("products", []);
        tbody.innerHTML = products.length ? products.map(item => `<tr>
            <td>${StockApp.escape(item.code)}</td><td>${StockApp.escape(item.name)}</td><td>${Number(item.qty)}</td>
            <td>${StockApp.canAccess(currentUser().role, "cad_produto-delete")
                ? `<button class="button danger small" type="button" data-action="delete-product" data-code="${StockApp.escape(item.code)}">Apagar</button>`
                : `<span class="muted">Sem permissão</span>`}</td>
        </tr>`).join("") : StockApp.emptyRow(4, "Nenhum produto cadastrado.");
    }
    function renderHistory(code) {
        const panel = document.getElementById("history-panel");
        const history = StockApp.get("history", []).filter(item => item.code === code).reverse();
        document.getElementById("history-title").textContent = `Movimentações: ${code}`;
        document.getElementById("history-table").innerHTML = history.length ? history.map(item => `<tr>
            <td>${StockApp.escape(item.date)}</td><td>${StockApp.escape(item.type)}</td>
            <td>${Number(item.qty)}</td><td>${StockApp.escape(item.reason)}</td>
        </tr>`).join("") : StockApp.emptyRow(4, "Nenhuma movimentação registrada.");
        panel.classList.remove("hidden");
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    function renderInventory() {
        const editable = StockApp.canAccess(currentUser().role, "inventario");
        const products = StockApp.get("products", []);
        const host = document.getElementById("inventory-content");
        host.innerHTML = `
            ${editable ? `<form id="inventory-form" class="panel">
                <h2>Nova movimentação</h2><div class="form-grid">
                    <div class="field"><label for="inventory-product">Produto</label><select class="control" id="inventory-product" required>${products.map(item => `<option value="${StockApp.escape(item.code)}">${StockApp.escape(item.name)} (${StockApp.escape(item.code)})</option>`).join("")}</select></div>
                    <div class="field"><label for="inventory-type">Tipo</label><select class="control" id="inventory-type"><option>Entrada</option><option>Saída</option></select></div>
                    <div class="field"><label for="inventory-qty">Quantidade</label><input class="control" id="inventory-qty" type="number" min="1" step="1" required></div>
                    <div class="field"><label for="inventory-reason">Motivo</label><input class="control" id="inventory-reason" maxlength="120" required></div>
                </div><div class="form-actions"><button class="button" type="submit">Registrar movimentação</button></div>
            </form>` : `<p class="notice">Seu perfil pode consultar as movimentações, mas não alterá-las.</p>`}
            <section class="panel"><h2>Histórico geral</h2><div class="table-wrap"><table><thead><tr><th>Código</th><th>Data</th><th>Tipo</th><th>Quantidade</th><th>Motivo</th></tr></thead><tbody id="inventory-history"></tbody></table></div></section>`;
        const history = StockApp.get("history", []).slice().reverse();
        document.getElementById("inventory-history").innerHTML = history.length ? history.map(item => `<tr>
            <td>${StockApp.escape(item.code)}</td><td>${StockApp.escape(item.date)}</td><td>${StockApp.escape(item.type)}</td>
            <td>${Number(item.qty)}</td><td>${StockApp.escape(item.reason)}</td></tr>`).join("") : StockApp.emptyRow(5);
    }
    function renderOrders() {
        const orders = StockApp.get("orders", []).slice().reverse();
        document.getElementById("orders-table").innerHTML = orders.length ? orders.map(order => `<tr>
            <td>${StockApp.escape(order.id)}</td><td>${StockApp.escape(order.customer)}</td>
            <td>${StockApp.money(order.total)}</td><td><span class="badge">${StockApp.escape(order.status)}</span></td>
            <td>${order.date ? new Date(order.date).toLocaleDateString("pt-BR") : "—"}</td></tr>`).join("") : StockApp.emptyRow(5);
    }
    function renderCart() {
        const body = document.getElementById("cart-items");
        body.innerHTML = cart.length ? cart.map(item => `<tr><td>${StockApp.escape(item.name)}</td><td>${item.qty}</td>
            <td>${StockApp.money(item.price)}</td><td>${StockApp.money(item.qty * item.price)}</td>
            <td><button class="text-button" data-action="remove-cart" data-code="${StockApp.escape(item.code)}">Remover</button></td></tr>`).join("") : StockApp.emptyRow(5, "Adicione produtos ao orçamento.");
        document.getElementById("cart-total").textContent = StockApp.money(cart.reduce((sum, item) => sum + item.qty * item.price, 0));
    }
    function renderBilling() {
        const orders = StockApp.get("orders", []).slice().reverse();
        document.getElementById("billing-table").innerHTML = orders.length ? orders.map(order => `<tr>
            <td>${StockApp.escape(order.id)}</td><td>${StockApp.escape(order.customer)}</td><td>${StockApp.money(order.total)}</td>
            <td><span class="badge">${StockApp.escape(order.status)}</span></td><td><button class="button small" data-action="invoice" data-id="${StockApp.escape(order.id)}">Visualizar</button></td></tr>`).join("") : StockApp.emptyRow(5);
    }
    function renderUsers() {
        const users = StockApp.get("users", []);
        document.getElementById("users-table").innerHTML = users.length ? users.map(user => `<tr>
            <td>${StockApp.escape(user.user)}</td><td>${StockApp.escape(user.role)}</td>
        </tr>`).join("") : StockApp.emptyRow(2);
    }
    async function openTab(page) {
        if (page !== "inicio" && !StockApp.canView(currentUser().role, page)) {
            StockApp.notify("Seu perfil não tem permissão para acessar essa aba.", true);
            return;
        }
        if (!openPages.includes(page)) openPages.push(page);
        activateTab(page);
        if (loadedPages.has(page) || loadingPages.has(page)) return;
        loadingPages.add(page);
        const generation = (loadGeneration.get(page) || 0) + 1;
        loadGeneration.set(page, generation);
        const host = document.getElementById("tab-content");
        const tab = tabs.find(item => item.id === page);
        const panel = document.createElement("section");
        panel.className = "page-panel hidden";
        panel.dataset.pagePanel = page;
        panel.setAttribute("aria-hidden", "true");
        host.append(panel);
        let content;
        try {
            const response = await fetch(tab.file);
            if (!response.ok) throw new Error(`Não foi possível carregar a aba (${response.status}).`);
            content = await response.text();
        } catch (error) {
            content = localTabContent[page];
            if (!content) {
                panel.innerHTML = `<section class="panel"><p class="notice warning">${StockApp.escape(error.message)}</p></section>`;
                if (loadGeneration.get(page) === generation) {
                    loadedPages.add(page);
                    loadingPages.delete(page);
                }
                return;
            }
            StockApp.notify("Aba carregada em modo local. Para carregar os arquivos HTML externos, inicie o projeto pelo Live Server.");
        }
        if (loadGeneration.get(page) !== generation || !panel.isConnected || !openPages.includes(page)) return;
        loadingPages.delete(page);
        panel.innerHTML = content;
        loadedPages.add(page);
        if (page === "consulta") renderProducts();
        if (page === "inventario") renderInventory();
        if (page === "pedidos") {
            const select = document.getElementById("order-product");
            select.innerHTML = StockApp.get("products", []).map(item => `<option value="${StockApp.escape(item.code)}">${StockApp.escape(item.name)} — ${StockApp.money(item.price)} (estoque: ${item.qty})</option>`).join("");
            cart = [];
            renderCart();
            renderOrders();
            const canCreateOrders = StockApp.canAccess(currentUser().role, "pedidos-create");
            document.getElementById("item-form").classList.toggle("hidden", !canCreateOrders);
            document.getElementById("order-customer").disabled = !canCreateOrders;
            document.getElementById("order-customer").closest(".field").classList.toggle("hidden", !canCreateOrders);
            document.querySelector('[data-action="save-order"]').classList.toggle("hidden", !canCreateOrders);
            document.getElementById("orders-read-only").classList.toggle("hidden", canCreateOrders);
        }
        if (page === "faturamento") renderBilling();
        if (page === "cad_produto") renderProductAdminTable();
        if (page === "cad_acesso") {
            document.getElementById("new-user-role").innerHTML = StockAuth.roles.filter(role => role !== "Administrador").map(role => `<option>${StockApp.escape(role)}</option>`).join("");
            renderUsers();
        }
        activateTab(activePage);
    }
    function showInvoice(order) {
        document.getElementById("invoice-content").innerHTML = `
            <p><strong>Documento demonstrativo:</strong> SIM-${StockApp.escape(order.id)}</p>
            <p><strong>Cliente:</strong> ${StockApp.escape(order.customer)}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString("pt-BR")}</p>
            <div class="table-wrap"><table><thead><tr><th>Produto</th><th>Qtd.</th><th>Unitário</th><th>Subtotal</th></tr></thead><tbody>
                ${order.items.map(item => `<tr><td>${StockApp.escape(item.name)}</td><td>${item.qty}</td><td>${StockApp.money(item.price)}</td><td>${StockApp.money(item.price * item.qty)}</td></tr>`).join("")}
            </tbody></table></div><p><strong>Total:</strong> ${StockApp.money(order.total)}</p>`;
        document.getElementById("invoice-preview").classList.remove("hidden");
    }
    function bindContentEvents() {
        const host = document.getElementById("tab-content");
        host.addEventListener("input", event => {
            if (event.target.id === "product-search") renderProducts(event.target.value);
        });
        host.addEventListener("submit", event => {
            event.preventDefault();
            try {
                if (event.target.id === "inventory-form") {
                    if (!StockApp.canAccess(currentUser().role, "inventario")) throw new Error("Seu perfil não pode alterar o inventário.");
                    StockApp.addMovement(
                        document.getElementById("inventory-product").value,
                        document.getElementById("inventory-type").value,
                        Number(document.getElementById("inventory-qty").value),
                        document.getElementById("inventory-reason").value.trim()
                    );
                    StockApp.notify("Movimentação registrada.");
                    renderInventory();
                }
                if (event.target.id === "item-form") {
                    if (!StockApp.canAccess(currentUser().role, "pedidos-create")) {
                        throw new Error("Seu perfil pode apenas visualizar pedidos.");
                    }
                    const code = document.getElementById("order-product").value;
                    const qty = Number(document.getElementById("order-qty").value);
                    const product = StockApp.get("products", []).find(item => item.code === code);
                    if (!product || !Number.isInteger(qty) || qty < 1) throw new Error("Informe produto e quantidade válidos.");
                    const inCart = cart.filter(item => item.code === code).reduce((sum, item) => sum + item.qty, 0);
                    if (inCart + qty > Number(product.qty)) throw new Error(`Estoque insuficiente. Disponível: ${product.qty}.`);
                    const line = cart.find(item => item.code === code);
                    if (line) line.qty += qty;
                    else cart.push({ code, name: product.name, price: Number(product.price), qty });
                    renderCart();
                }
                if (event.target.id === "product-form") {
                    if (!StockApp.canAccess(currentUser().role, "cad_produto")) throw new Error("Seu perfil não pode cadastrar produtos.");
                    StockApp.saveProduct({
                        code: document.getElementById("product-code").value.trim(),
                        name: document.getElementById("product-name").value.trim(),
                        price: Number(document.getElementById("product-price").value),
                        qty: Number(document.getElementById("product-qty").value)
                    });
                    event.target.reset();
                    StockApp.notify("Produto cadastrado com sucesso.");
                }
                if (event.target.id === "user-form") {
                    if (!StockApp.canAccess(currentUser().role, "cad_acesso")) throw new Error("Apenas o administrador pode cadastrar usuários.");
                    StockApp.createUser(
                        document.getElementById("new-user-name").value.trim(),
                        document.getElementById("new-user-password").value,
                        document.getElementById("new-user-role").value
                    );
                    event.target.reset();
                    document.getElementById("new-user-role").innerHTML = StockAuth.roles.filter(role => role !== "Administrador").map(role => `<option>${StockApp.escape(role)}</option>`).join("");
                    renderUsers();
                    StockApp.notify("Usuário cadastrado.");
                }
            } catch (error) {
                StockApp.notify(error.message, true);
            }
        });
        host.addEventListener("click", event => {
            const button = event.target.closest("[data-action]");
            if (!button) return;
            try {
                if (button.dataset.action === "history") renderHistory(button.dataset.code);
                if (button.dataset.action === "remove-cart") {
                    cart = cart.filter(item => item.code !== button.dataset.code);
                    renderCart();
                }
                if (button.dataset.action === "save-order") {
                    if (!StockApp.canAccess(currentUser().role, "pedidos-create")) throw new Error("Seu perfil pode apenas visualizar pedidos.");
                    const order = StockApp.saveOrder(document.getElementById("order-customer").value, cart);
                    cart = [];
                    document.getElementById("order-customer").value = "";
                    renderCart();
                    renderOrders();
                    StockApp.notify(`Orçamento ${order.id} salvo.`);
                }
                if (button.dataset.action === "invoice") {
                    if (!StockApp.canAccess(currentUser().role, "faturamento")) throw new Error("Seu perfil não pode faturar pedidos.");
                    const order = StockApp.invoiceOrder(button.dataset.id);
                    renderBilling();
                    showInvoice(order);
                }
                if (button.dataset.action === "delete-product") {
                    const role = currentUser().role;
                    if (!StockApp.canAccess(role, "cad_produto-delete")) {
                        throw new Error("Seu perfil não pode apagar produtos.");
                    }
                    const product = StockApp.get("products", []).find(item => item.code === button.dataset.code);
                    if (!product) throw new Error("Produto não encontrado.");
                    if (!window.confirm(`Deseja apagar "${product.name}" (${product.code}) do catálogo?`)) return;
                    StockApp.deleteProduct(product.code, role);
                    renderProductAdminTable();
                    StockApp.notify(`Produto ${product.code} apagado. O histórico foi preservado.`);
                }
                if (button.dataset.action === "print") window.print();
            } catch (error) {
                StockApp.notify(error.message, true);
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        if (!StockAuth.requireSession()) return;
        const user = currentUser();
        document.getElementById("user-name").textContent = user.user;
        document.getElementById("user-role").textContent = user.role;
        document.getElementById("logout-button").addEventListener("click", StockAuth.signOut);
        document.getElementById("system-navigation").addEventListener("click", event => {
            const button = event.target.closest("[data-page]");
            if (button) openTab(button.dataset.page);
        });
        document.getElementById("system-tabs").addEventListener("click", event => {
            const closeButton = event.target.closest("[data-close-page]");
            if (closeButton) {
                closeTab(closeButton.dataset.closePage);
                return;
            }
            const button = event.target.closest("[data-page]");
            if (button) activateTab(button.dataset.page);
        });
        bindContentEvents();
        const dashboard = document.createElement("section");
        dashboard.className = "page-panel";
        dashboard.dataset.pagePanel = "inicio";
        dashboard.setAttribute("aria-hidden", "false");
        document.getElementById("tab-content").append(dashboard);
        renderDashboard(dashboard);
        activateTab("inicio");
    });
})();
