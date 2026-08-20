// === API CONFIGURATION ===
// Uses localhost in development and your live Render backend in production
const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : 'https://contact-manager-10y9.onrender.com';

let editingId = null;

function maskEmail(email) {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const maskedUser = user.length > 2 ? user[0] + '*'.repeat(user.length - 2) + user.slice(-1) : user;
  const [domainName, tld] = domain.split(".");
  const maskedDomain = domainName.length > 2 ? domainName[0] + '*'.repeat(domainName.length - 1) : domainName;
  return `${maskedUser}@${maskedDomain}.${tld}`;
}

function maskPhone(phone) {
  if (!phone || phone.length < 4) return "";
  return '*'.repeat(phone.length - 4) + phone.slice(-4);
}

async function fetchContacts() {
  const searchInput = document.getElementById("search");
  const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
  
  try {
    const res = await fetch(`${API}/contacts`);
    if (!res.ok) throw new Error("Failed to load contacts from API");
    
    const data = await res.json();
    const tbody = document.querySelector("#contactsTable tbody");
    tbody.innerHTML = "";
    
    data.filter(c => {
      if (!q) return true;
      return (c.name || "").toLowerCase().includes(q) ||
             (c.phone || "").toLowerCase().includes(q) ||
             (c.email || "").toLowerCase().includes(q);
    }).forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.name || ""}</td>
        <td class="masked" data-full="${c.phone || ""}">${maskPhone(c.phone)}</td>
        <td class="masked" data-full="${c.email || ""}">${maskEmail(c.email)}</td>
        <td>${c.address || ""}</td>
        <td>
          <div class="actions-cell">
              <button data-id="${c.id}" class="show" title="Show/Hide Details" type="button">
                  <svg class="icon-show" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  <svg class="icon-hide" style="display:none;" viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
              </button>
              <button data-id="${c.id}" class="edit" title="Edit Contact" type="button">
                  <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              <button data-id="${c.id}" class="del" title="Delete Contact" type="button">
                  <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
    attachRowHandlers();
  } catch (err) {
    console.error("Network or API Error:", err);
  }
}

function attachRowHandlers() {
  document.querySelectorAll("button.show").forEach(b => {
    b.onclick = () => {
      const tr = b.closest("tr");
      const phoneCell = tr.querySelector("td:nth-child(3)");
      const emailCell = tr.querySelector("td:nth-child(4)");
      const showIcon = b.querySelector('.icon-show');
      const hideIcon = b.querySelector('.icon-hide');
      const isCurrentlyMasked = showIcon.style.display !== 'none';
      
      phoneCell.textContent = isCurrentlyMasked ? phoneCell.dataset.full : maskPhone(phoneCell.dataset.full);
      emailCell.textContent = isCurrentlyMasked ? emailCell.dataset.full : maskEmail(emailCell.dataset.full);
      phoneCell.classList.toggle("masked", !isCurrentlyMasked);
      emailCell.classList.toggle("masked", !isCurrentlyMasked);
      showIcon.style.display = isCurrentlyMasked ? 'none' : 'block';
      hideIcon.style.display = isCurrentlyMasked ? 'block' : 'none';
    };
  });

  document.querySelectorAll("button.edit").forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      try {
        const res = await fetch(`${API}/contacts/${id}`);
        if (!res.ok) return alert("Failed to load contact details");
        const c = await res.json();
        editingId = id;
        document.getElementById("name").value = c.name || "";
        document.getElementById("phone").value = c.phone || "";
        document.getElementById("email").value = c.email || "";
        document.getElementById("address").value = c.address || "";
        const saveBtn = document.getElementById("saveBtn");
        saveBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Update';
      } catch (err) {
        alert("Error connecting to server to load contact.");
      }
    };
  });

  document.querySelectorAll("button.del").forEach(b => {
    b.onclick = async () => {
      if (!confirm("Delete this contact?")) return;
      const id = b.dataset.id;
      try {
        const res = await fetch(`${API}/contacts/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchContacts();
        } else {
          const errorData = await res.json().catch(() => ({}));
          alert(errorData.error || "Failed to delete contact");
        }
      } catch (err) {
        alert("Error connecting to server.");
      }
    };
  });
}

document.getElementById("saveBtn").onclick = async (e) => {
  if (e) e.preventDefault();

  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const emailInput = document.getElementById("email");
  const addressInput = document.getElementById("address");

  const payload = {
    name: nameInput ? nameInput.value.trim() : "",
    phone: phoneInput ? phoneInput.value.trim() : "",
    email: emailInput ? emailInput.value.trim() : "",
    address: addressInput ? addressInput.value.trim() : "",
  };

  if (!payload.name) { 
    alert("Name is required"); 
    return; 
  }

  const phoneRegex = /^\d{10}$/;
  if (payload.phone && !phoneRegex.test(payload.phone)) {
    alert("Phone number must be exactly 10 digits and contain only numbers.");
    return;
  }

  try {
    if (editingId) {
      const res = await fetch(`${API}/contacts/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Contact updated successfully!");
        clearForm();
        fetchContacts();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Update failed");
      }
    } else {
      const res = await fetch(`${API}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Contact saved successfully!");
        clearForm();
        fetchContacts();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Save failed");
      }
    }
  } catch (err) {
    console.error("Network or API Error:", err);
    alert("Cannot reach server. Please ensure your backend is awake!");
  }
};

document.getElementById("clearBtn").onclick = clearForm;

const searchInput = document.getElementById("search");
if (searchInput) searchInput.oninput = fetchContacts;

function clearForm() {
  editingId = null;
  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("email").value = "";
  document.getElementById("address").value = "";
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Save';
}

const phoneInput = document.getElementById("phone");
if (phoneInput) {
  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '');
  });
}

// Initial load
fetchContacts();