document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("subscription-form");
  const fullnameInput = document.getElementById("fullname");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const passwordRepeatInput = document.getElementById("password-repeat");
  const ageInput = document.getElementById("age");
  const phoneInput = document.getElementById("phone");
  const addressInput = document.getElementById("address");
  const cityInput = document.getElementById("city");
  const postalCodeInput = document.getElementById("postal-code");
  const dniInput = document.getElementById("dni");
  const formTitle = document.getElementById("form-title");
  const greeting = document.getElementById("greeting");

  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const modalCloseButton = document.getElementById("modal-close");

  const resultsList = document.getElementById("results-list");

  function validateFullname(value) {
    if (!value || value.trim().length <= 6)
      return "El nombre completo debe tener más de 6 letras.";
    if (!value.trim().includes(" "))
      return "El nombre completo debe contener al menos un espacio entre nombres.";
    return "";
  }

  function validateEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim()))
      return "El formato del email no es válido.";
    return "";
  }

  function validatePassword(value) {
    if (value.length < 8)
      return "La contraseña debe tener al menos 8 caracteres.";
    if (!(/[a-zA-Z]/.test(value) && /\d/.test(value)))
      return "La contraseña debe contener letras y números.";
    return "";
  }

  function validatePasswordRepeat(value) {
    if (value !== passwordInput.value) return "Las contraseñas no coinciden.";
    return "";
  }

  function validateAge(value) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 18)
      return "Debe ser un número entero mayor o igual a 18.";
    return "";
  }

  function validatePhone(value) {
    if (!/^\d{7,}$/.test(value))
      return "El teléfono debe tener al menos 7 dígitos y solo números.";
    return "";
  }

  function validateAddress(value) {
    const trimmed = value.trim();
    if (trimmed.length < 5)
      return "La dirección debe tener al menos 5 caracteres.";
    if (!/\w+ \w+/.test(trimmed))
      return "La dirección debe contener letras, números y un espacio en el medio.";
    return "";
  }

  function validateCity(value) {
    if (value.trim().length < 3)
      return "La ciudad debe tener al menos 3 caracteres.";
    return "";
  }

  function validatePostalCode(value) {
    if (value.trim().length < 3)
      return "El código postal debe tener al menos 3 caracteres.";
    return "";
  }

  function validateDni(value) {
    if (!/^\d{7,8}$/.test(value))
      return "El DNI debe ser un número de 7 u 8 dígitos.";
    return "";
  }

  function showError(input, message) {
    const errorDiv = input.parentElement.querySelector(".error-message");
    errorDiv.textContent = message;
    input.setAttribute("aria-invalid", "true");
  }

  function clearError(input) {
    const errorDiv = input.parentElement.querySelector(".error-message");
    errorDiv.textContent = "";
    input.removeAttribute("aria-invalid");
  }

  const validators = {
    fullname: validateFullname,
    email: validateEmail,
    password: validatePassword,
    "password-repeat": validatePasswordRepeat,
    age: validateAge,
    phone: validatePhone,
    address: validateAddress,
    city: validateCity,
    "postal-code": validatePostalCode,
    dni: validateDni,
  };

  Object.keys(validators).forEach((field) => {
    const input = document.getElementById(field);
    if (!input) return;

    input.addEventListener("blur", (e) => {
      const error = validators[field](e.target.value);
      if (error) showError(input, error);
      else clearError(input);
    });

    input.addEventListener("focus", () => clearError(input));
  });

  fullnameInput.addEventListener("input", () => {
    const val = fullnameInput.value.trim();
    if (val) {
      greeting.textContent = `Hello, ${val}`;
    } else {
      greeting.textContent = "Hello, ";
    }
  });

  modalCloseButton.addEventListener("click", () => {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    modalCloseButton.blur();
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
      modalCloseButton.blur();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
      modalCloseButton.blur();
    }
  });

  form.addEventListener("reset", () => {
    greeting.textContent = "Hello, ";
    resultsList.innerHTML = "";
    Object.keys(validators).forEach((field) => {
      const input = document.getElementById(field);
      clearError(input);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let errors = [];

    Object.keys(validators).forEach((field) => {
      const input = document.getElementById(field);
      const error = validators[field](input.value);
      if (error) {
        showError(input, error);
        errors.push(`${input.previousElementSibling.textContent}: ${error}`);
      } else {
        clearError(input);
      }
    });

    if (errors.length) {
      alert("Hay errores en el formulario:\n\n" + errors.join("\n"));
      return;
    }

    const data = {
      name: fullnameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value,
      age: ageInput.value.trim(),
      telephone: phoneInput.value.trim(),
      address: addressInput.value.trim(),
      city: cityInput.value.trim(),
      postalcode: postalCodeInput.value.trim(),
      dni: dniInput.value.trim(),
    };

    resultsList.innerHTML = "";
    Object.entries(data).forEach(([key, val]) => {
      const li = document.createElement("li");
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
      li.textContent = `${label}: ${val}`;
      resultsList.appendChild(li);
    });

    fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw {
              status: response.status,
              message: text || response.statusText,
            };
          });
        }
        return response.json();
      })
      .then((json) => {
        modalTitle.textContent = "Successfull Subscription! :)";
        modalMessage.textContent = JSON.stringify(data, null, 2);
        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
        modalCloseButton.focus();
        localStorage.setItem(
          "subscriptionData",
          JSON.stringify({
            fullname: fullnameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value,
            age: ageInput.value.trim(),
            phone: phoneInput.value.trim(),
            address: addressInput.value.trim(),
            city: cityInput.value.trim(),
            "postal-code": postalCodeInput.value.trim(),
            dni: dniInput.value.trim(),
          })
        );

        form.reset();
        greeting.textContent = "Hello, ";
        resultsList.innerHTML = "";
      })
      .catch((error) => {
        modalTitle.textContent = "Error en la Suscripción";
        const detail =
          typeof error === "object" && error.message ? error.message : error;
        modalMessage.textContent = `Código: ${
          error.status || "Desconocido"
        }\nDetalles: ${detail}`;
        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
        modalCloseButton.focus();
      });
  });

  window.addEventListener("load", () => {
    const stored = localStorage.getItem("subscriptionData");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data && typeof data === "object") {
          Object.entries(data).forEach(([key, value]) => {
            let keyToUse = key === "postal-code" ? "postal-code" : key;
            if (keyToUse === "fullname") keyToUse = "fullname";
            const input = document.getElementById(keyToUse);
            if (input) input.value = value;
          });
          if (data.fullname) {
            greeting.textContent = `Hello, ${data.fullname}`;
          }
        }
      } catch {}
    }
  });
});
