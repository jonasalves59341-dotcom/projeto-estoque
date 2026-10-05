(() => {
    "use strict";
    const roles = Object.keys(StockApp.permissions);

    function hasSession() {
        return Boolean(StockApp.get("session", null));
    }
    function requireSession() {
        if (!hasSession()) {
            location.replace("index.html");
            return false;
        }
        return true;
    }
    function signOut() {
        localStorage.removeItem(StockApp.STORAGE.session);
        location.href = "index.html";
    }
    function authenticate(userName, password) {
        const user = StockApp.get("users", []).find(item =>
            item.user.toLowerCase() === userName.trim().toLowerCase() && item.pass === password
        );
        if (!user) throw new Error("Usuário ou senha inválidos.");
        if (!roles.includes(user.role)) throw new Error("O perfil desta conta não é válido.");
        const session = { user: user.user, role: user.role };
        StockApp.set("session", session);
        return session;
    }
    function registerInitialAdmin(userName, password) {
        if (StockApp.get("users", []).length) {
            throw new Error("O cadastro inicial já foi concluído. Peça ao administrador para criar sua conta.");
        }
        StockApp.createUser(userName.trim(), password, "Administrador");
    }

    window.StockAuth = { roles, hasSession, requireSession, signOut, authenticate, registerInitialAdmin };

    document.addEventListener("DOMContentLoaded", () => {
        const loginForm = document.getElementById("login-form");
        if (!loginForm) return;
        if (hasSession()) {
            location.replace("sistema.html");
            return;
        }
        const loginPanel = document.getElementById("login-panel");
        const registerPanel = document.getElementById("register-panel");
        document.getElementById("show-register").addEventListener("click", event => {
            event.preventDefault();
            loginPanel.classList.add("hidden");
            registerPanel.classList.remove("hidden");
        });
        document.getElementById("show-login").addEventListener("click", event => {
            event.preventDefault();
            registerPanel.classList.add("hidden");
            loginPanel.classList.remove("hidden");
        });
        loginForm.addEventListener("submit", event => {
            event.preventDefault();
            try {
                authenticate(document.getElementById("login-user").value, document.getElementById("login-password").value);
                location.href = "sistema.html";
            } catch (error) {
                StockApp.notify(error.message, true);
            }
        });
        document.getElementById("register-form").addEventListener("submit", event => {
            event.preventDefault();
            const userName = document.getElementById("register-user").value.trim();
            const password = document.getElementById("register-password").value;
            try {
                registerInitialAdmin(userName, password);
                event.currentTarget.reset();
                registerPanel.classList.add("hidden");
                loginPanel.classList.remove("hidden");
                StockApp.notify("Administrador cadastrado. Faça login para continuar.");
            } catch (error) {
                StockApp.notify(error.message, true);
            }
        });
    });
})();
