const API = "http://localhost:5000";
let editingId = null;

async function fetchContacts() {
  const q = document.getElementById("search").value.trim().toLowerCase();
  const res = await fetch(`${API}/contacts`);
  const data = await res.json();
  const tbody = document.querySelector("#contactsTable tbody");
  tbody.innerHTML = "";
  data.filter(c => {
    if(!q) return true;
    return (c.name||"").toLowerCase().includes(q) ||
           (c.phone||"").toLowerCase().includes(q) ||
           (c.email||"").toLowerCase().includes(q);
  }).forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.name || ""}</td>
      <td>${c.phone || ""}</td>
      <td>${c.email || ""}</td>
      <td>${c.address || ""}</td>
      <td>
        <button data-id="${c.id}" class="edit">Edit</button>
        <button data-id="${c.id}" class="del">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  attachRowHandlers();
}

function attachRowHandlers(){
  document.querySelectorAll("button.edit").forEach(b=>{
    b.onclick = async ()=> {
      const id = b.dataset.id;
      const res = await fetch(`${API}/contacts/${id}`);
      if(!res.ok) return alert("Failed to load");
      const c = await res.json();
      editingId = id;
      document.getElementById("name").value = c.name || "";
      document.getElementById("phone").value = c.phone || "";
      document.getElementById("email").value = c.email || "";
      document.getElementById("address").value = c.address || "";
      document.getElementById("saveBtn").textContent = "Update";
    };
  });
  document.querySelectorAll("button.del").forEach(b=>{
    b.onclick = async ()=> {
      if(!confirm("Delete this contact?")) return;
      const id = b.dataset.id;
      const res = await fetch(`${API}/contacts/${id}`, { method: "DELETE" });
      if(res.ok) fetchContacts();
      else alert("Failed to delete");
    };
  });
}

document.getElementById("saveBtn").onclick = async ()=>{
  const payload = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    address: document.getElementById("address").value.trim(),
  };
  if(!payload.name){ alert("Name required"); return; }
  if(editingId){
    const res = await fetch(`${API}/contacts/${editingId}`, {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    if(res.ok){
      editingId = null;
      document.getElementById("saveBtn").textContent = "Save";
      clearForm();
      fetchContacts();
    } else {
      alert("Update failed");
    }
  } else {
    const res = await fetch(`${API}/contacts`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    if(res.ok){
      clearForm();
      fetchContacts();
    } else {
      alert("Save failed");
    }
  }
};

document.getElementById("clearBtn").onclick = clearForm;
document.getElementById("search").oninput = fetchContacts;

function clearForm(){
  editingId = null;
  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("email").value = "";
  document.getElementById("address").value = "";
  document.getElementById("saveBtn").textContent = "Save";
}

// initial load
fetchContacts();
